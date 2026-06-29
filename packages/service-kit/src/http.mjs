import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { getAllowedOrigins } from "./config.mjs";
import { createLogger } from "./logger.mjs";

export function jsonResponse(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers
  });
  response.end(JSON.stringify(payload, null, 2));
}

export function notFound(response, requestId, serviceName) {
  jsonResponse(response, 404, {
    error: "not_found",
    message: "Route not found",
    service: serviceName,
    requestId
  });
}

function setCorsHeaders(request, response, allowedOrigins) {
  const origin = request.headers.origin;
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  response.setHeader("access-control-allow-origin", allowedOrigin);
  response.setHeader("vary", "Origin");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type,x-request-id,authorization");
}

function setSecurityHeaders(response) {
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("x-frame-options", "DENY");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
}

export function createJsonService({ name, port, routes, rateLimiter }) {
  const logger = createLogger(name);
  const allowedOrigins = getAllowedOrigins();
  const metrics = {
    requestsTotal: 0,
    requestsByStatus: new Map()
  };
  const server = createServer(async (request, response) => {
    const requestId = request.headers["x-request-id"] || randomUUID();
    const startedAt = Date.now();
    response.setHeader("x-request-id", requestId);
    setCorsHeaders(request, response, allowedOrigins);
    setSecurityHeaders(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const clientIp = request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown";

    if (request.method === "GET" && url.pathname === "/metrics") {
      response.writeHead(200, { "content-type": "text/plain; version=0.0.4; charset=utf-8" });
      response.end(
        [
          "# HELP service_requests_total Total HTTP requests handled by this service.",
          "# TYPE service_requests_total counter",
          `service_requests_total{service="${name}"} ${metrics.requestsTotal}`,
          "# HELP service_requests_by_status_total Total HTTP requests by status code.",
          "# TYPE service_requests_by_status_total counter",
          ...Array.from(metrics.requestsByStatus.entries()).map(([status, count]) => {
            return `service_requests_by_status_total{service="${name}",status="${status}"} ${count}`;
          })
        ].join("\n")
      );
      return;
    }

    if (rateLimiter) {
      const limit = rateLimiter(String(clientIp));
      response.setHeader("x-ratelimit-remaining", String(limit.remaining));
      response.setHeader("x-ratelimit-reset", String(Math.ceil(limit.resetAt / 1000)));
      if (!limit.allowed) {
        metrics.requestsTotal += 1;
        metrics.requestsByStatus.set(429, (metrics.requestsByStatus.get(429) || 0) + 1);
        jsonResponse(response, 429, {
          error: "rate_limited",
          message: "Too many requests",
          service: name,
          requestId
        });
        return;
      }
    }

    const route = routes.find((candidate) => {
      return candidate.method === request.method && candidate.path === url.pathname;
    });

    if (!route) {
      notFound(response, requestId, name);
      return;
    }

    try {
      const payload = await route.handler({ request, url, requestId });
      const statusCode = route.statusCode || 200;
      jsonResponse(response, route.statusCode || 200, {
        service: name,
        requestId,
        data: payload
      });
      metrics.requestsTotal += 1;
      metrics.requestsByStatus.set(statusCode, (metrics.requestsByStatus.get(statusCode) || 0) + 1);
      logger.info("request_completed", {
        requestId,
        method: request.method,
        path: url.pathname,
        statusCode,
        durationMs: Date.now() - startedAt
      });
    } catch (error) {
      jsonResponse(response, error.statusCode || 500, {
        error: error.code || "internal_error",
        message: error.message || "Unexpected service error",
        service: name,
        requestId
      });
      const statusCode = error.statusCode || 500;
      metrics.requestsTotal += 1;
      metrics.requestsByStatus.set(statusCode, (metrics.requestsByStatus.get(statusCode) || 0) + 1);
      logger.error("request_failed", {
        requestId,
        method: request.method,
        path: url.pathname,
        statusCode,
        durationMs: Date.now() - startedAt,
        error: error.message
      });
    }
  });

  server.listen(port, () => {
    logger.info("service_started", { port });
  });

  return server;
}

export async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Request failed: ${response.status} ${body}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}
