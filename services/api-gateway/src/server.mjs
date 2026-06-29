import { createJsonService, fetchJson } from "../../../packages/service-kit/src/http.mjs";

const port = Number(process.env.API_GATEWAY_PORT || 8080);

const services = {
  identity: process.env.IDENTITY_SERVICE_URL || "http://localhost:8081",
  profiles: process.env.GAME_PROFILE_SERVICE_URL || "http://localhost:8082",
  achievements: process.env.ACHIEVEMENT_SERVICE_URL || "http://localhost:8083",
  knowledge: process.env.KNOWLEDGE_SERVICE_URL || "http://localhost:8084",
  community: process.env.COMMUNITY_SERVICE_URL || "http://localhost:8085"
};

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
  ]
});
