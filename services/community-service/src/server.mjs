import { createJsonService } from "../../../packages/service-kit/src/http.mjs";
import { communityFeed } from "../../../packages/service-kit/src/data.mjs";

const port = Number(process.env.COMMUNITY_SERVICE_PORT || 8085);

createJsonService({
  name: "community-service",
  port,
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: () => ({ status: "ok" })
    },
    {
      method: "GET",
      path: "/feed",
      handler: () => ({
        feed: communityFeed,
        moderation: {
          reportsOpen: 0,
          mode: "pre-launch-curated"
        }
      })
    }
  ]
});
