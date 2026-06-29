import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { createRepositories } from "../../../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../../../packages/service-kit/src/persistence/postgres-adapter.mjs";

const port = Number(process.env.COMMUNITY_SERVICE_PORT || 8085);
const communityRepository = createRepositories().community;

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
      path: "/feed",
      handler: () => communityRepository.getFeed()
    },
    {
      method: "POST",
      path: "/posts",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.title) {
          const error = new Error("Post title is required");
          error.statusCode = 400;
          error.code = "invalid_post";
          throw error;
        }
        return communityRepository.createPost(body);
      }
    },
    {
      method: "POST",
      path: "/reports",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.postId || !body.reason) {
          const error = new Error("postId and reason are required");
          error.statusCode = 400;
          error.code = "invalid_report";
          throw error;
        }
        return communityRepository.reportPost(body.postId, body.reason);
      }
    }
  ]
});
