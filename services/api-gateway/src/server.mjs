import { getNumberEnv, getServiceUrls } from "../../../packages/service-kit/src/config.mjs";
import { createJsonService, fetchJson, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { createMemoryRateLimiter } from "../../../packages/service-kit/src/rate-limit.mjs";

const port = getNumberEnv("API_GATEWAY_PORT", "8080");
const services = getServiceUrls();
const rateLimiter = createMemoryRateLimiter({
  windowMs: getNumberEnv("RATE_LIMIT_WINDOW_MS", "60000"),
  maxRequests: getNumberEnv("RATE_LIMIT_MAX_REQUESTS", "120")
});

async function getServiceData(service, path) {
  const payload = await fetchJson(`${services[service]}${path}`);
  return payload.data;
}

async function postServiceData(service, path, body) {
  const payload = await fetchJson(`${services[service]}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return payload.data;
}

async function deleteServiceData(service, path, request) {
  const payload = await fetchJson(`${services[service]}${path}`, {
    method: "DELETE",
    headers: {
      authorization: request.headers.authorization || ""
    }
  });
  return payload.data;
}

createJsonService({
  name: "api-gateway",
  port,
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: () => ({
        status: "ok",
        services
      })
    },
    {
      method: "GET",
      path: "/livez",
      handler: () => ({ status: "alive" })
    },
    {
      method: "GET",
      path: "/readyz",
      handler: async () => {
        const checks = await Promise.all(
          Object.entries(services).map(async ([name, baseUrl]) => {
            try {
              await fetchJson(`${baseUrl}/health`);
              return { name, status: "ready" };
            } catch (error) {
              return { name, status: "unready", error: error.message };
            }
          })
        );
        const unready = checks.filter((check) => check.status !== "ready");
        if (unready.length > 0) {
          const error = new Error("One or more upstream services are not ready");
          error.statusCode = 503;
          error.code = "upstream_unready";
          error.details = checks;
          throw error;
        }
        return { status: "ready", checks };
      }
    },
    {
      method: "GET",
      path: "/api/dashboard",
      handler: async () => {
        const [identity, profile, achievementData, knowledge, community] = await Promise.all([
          getServiceData("identity", "/me"),
          getServiceData("profiles", "/profiles/me"),
          getServiceData("achievements", "/achievements"),
          getServiceData("knowledge", "/guides"),
          getServiceData("community", "/feed")
        ]);

        return {
          identity,
          profile,
          achievements: achievementData,
          knowledge,
          community
        };
      }
    },
    {
      method: "POST",
      path: "/api/auth/login",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("identity", "/auth/login", body);
      }
    },
    {
      method: "POST",
      path: "/api/auth/register",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("identity", "/auth/register", body);
      }
    },
    {
      method: "POST",
      path: "/api/auth/refresh",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("identity", "/auth/refresh", body);
      }
    },
    {
      method: "POST",
      path: "/api/auth/logout",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("identity", "/auth/logout", body);
      }
    },
    {
      method: "DELETE",
      path: "/api/me",
      handler: async ({ request }) => deleteServiceData("identity", "/me", request)
    },
    {
      method: "POST",
      path: "/api/guides",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("knowledge", "/guides", body);
      }
    },
    {
      method: "POST",
      path: "/api/guides/update",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("knowledge", "/guides/update", body);
      }
    },
    {
      method: "POST",
      path: "/api/guides/delete",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("knowledge", "/guides/delete", body);
      }
    },
    {
      method: "POST",
      path: "/api/posts",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("community", "/posts", body);
      }
    },
    {
      method: "POST",
      path: "/api/reports",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("community", "/reports", body);
      }
    },
    {
      method: "GET",
      path: "/api/reports",
      handler: async () => getServiceData("community", "/reports")
    },
    {
      method: "POST",
      path: "/api/reports/resolve",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("community", "/reports/resolve", body);
      }
    },
    {
      method: "POST",
      path: "/api/posts/moderate",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("community", "/posts/moderate", body);
      }
    },
    {
      method: "POST",
      path: "/api/achievements/progress",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("achievements", "/achievements/progress", body);
      }
    },
    {
      method: "POST",
      path: "/api/profiles/me/completion",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return postServiceData("profiles", "/profiles/me/completion", body);
      }
    },
    {
      method: "GET",
      path: "/api/platform",
      handler: async () => {
        const checks = await Promise.all(
          Object.entries(services).map(async ([name, baseUrl]) => {
            try {
              await fetchJson(`${baseUrl}/readyz`);
              return { name, status: "ready", url: baseUrl };
            } catch (error) {
              return { name, status: "unready", url: baseUrl, error: error.message };
            }
          })
        );

        return {
          release: {
            name: "GTA VI Guide Foundation",
            stage: process.env.NODE_ENV || "development",
            version: "0.1.0"
          },
          security: [
            { label: "JWT access tokens", status: "implemented" },
            { label: "Refresh sessions", status: "implemented" },
            { label: "Logout / revocation", status: "implemented" },
            { label: "Strict CORS", status: "configured" },
            { label: "Gateway rate limiting", status: "enabled" }
          ],
          infrastructure: [
            { label: "PostgreSQL schemas", status: "ready", detail: "identity, profiles, achievements, knowledge, community" },
            { label: "Versioned migrations", status: "ready", detail: "V001-V003" },
            { label: "RabbitMQ event bus", status: "compose-ready", detail: "sync and async events" },
            { label: "MinIO object storage", status: "compose-ready", detail: "future media uploads" },
            { label: "Prometheus metrics", status: "enabled", detail: "/metrics per service" },
            { label: "Nginx reverse proxy", status: "configured", detail: "local port 80 / production HTTPS boundary" },
            { label: "Kubernetes manifests", status: "ready", detail: "deployments, services, ingress, HPA" }
          ],
          integrations: [
            { provider: "PSN", mode: "official-oauth-required", dataSource: "manual until approval" },
            { provider: "Xbox", mode: "official-oauth-required", dataSource: "manual until approval" },
            { provider: "Rockstar", mode: "official-oauth-required", dataSource: "manual until approval" }
          ],
          services: checks
        };
      }
    }
  ],
  rateLimiter
});
