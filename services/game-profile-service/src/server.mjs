import { createJsonService } from "../../../packages/service-kit/src/http.mjs";
import { profileSnapshot } from "../../../packages/service-kit/src/data.mjs";

const port = Number(process.env.GAME_PROFILE_SERVICE_PORT || 8082);

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
      handler: () => ({ status: "ready" })
    },
    {
      method: "GET",
      path: "/profiles/me",
      handler: () => profileSnapshot
    }
  ]
});
