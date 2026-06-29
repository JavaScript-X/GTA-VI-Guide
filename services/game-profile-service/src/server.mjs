import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { createRepositories } from "../../../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../../../packages/service-kit/src/persistence/postgres-adapter.mjs";

const port = Number(process.env.GAME_PROFILE_SERVICE_PORT || 8082);
const profileRepository = createRepositories().profiles;

createJsonService({
  name: "game-profile-service",
  port,
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: () => ({ status: "ok" })
    },
    {
      method: "GET",
      path: "/livez",
      handler: () => ({ status: "alive" })
    },
    {
      method: "GET",
      path: "/readyz",
      handler: () => ({ status: "ready", persistence: createPostgresReadiness() })
    },
    {
      method: "GET",
      path: "/profiles/me",
      handler: () => profileRepository.getMyProfile()
    },
    {
      method: "POST",
      path: "/profiles/me/completion",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        return profileRepository.updateCompletion(body.completion || body);
      }
    }
  ]
});
