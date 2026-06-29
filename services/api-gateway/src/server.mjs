import { getNumberEnv, getServiceUrls } from "../../../packages/service-kit/src/config.mjs";
import { createJsonService, fetchJson } from "../../../packages/service-kit/src/http.mjs";
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
    }
  ],
  rateLimiter
});
