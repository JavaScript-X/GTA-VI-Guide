import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

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

export function createJsonService({ name, port, routes }) {
  const server = createServer(async (request, response) => {
    const requestId = request.headers["x-request-id"] || randomUUID();
    response.setHeader("x-request-id", requestId);
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    response.setHeader("access-control-allow-headers", "content-type,x-request-id");

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const route = routes.find((candidate) => {
      return candidate.method === request.method && candidate.path === url.pathname;
    });

    if (!route) {
      notFound(response, requestId, name);
      return;
    }

    try {
      const payload = await route.handler({ request, url, requestId });
      jsonResponse(response, route.statusCode || 200, {
        service: name,
        requestId,
        data: payload
      });
    } catch (error) {
      jsonResponse(response, error.statusCode || 500, {
        error: error.code || "internal_error",
        message: error.message || "Unexpected service error",
        service: name,
        requestId
      });
    }
  });

  server.listen(port, () => {
    console.log(`${name} listening on http://localhost:${port}`);
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
