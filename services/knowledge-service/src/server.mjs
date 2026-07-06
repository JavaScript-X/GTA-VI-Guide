import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { createRepositories } from "../../../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../../../packages/service-kit/src/persistence/postgres-adapter.mjs";

const port = Number(process.env.KNOWLEDGE_SERVICE_PORT || 8084);
const knowledgeRepository = createRepositories().knowledge;

createJsonService({
  name: "knowledge-service",
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
      path: "/guides",
      handler: async ({ url }) => {
        const tag = url.searchParams.get("tag");
        const query = url.searchParams.get("q");
        if (query) {
          return knowledgeRepository.searchGuides(query);
        }
        return knowledgeRepository.listGuides({ tag });
      }
    },
    {
      method: "GET",
      path: "/sources",
      handler: async ({ url }) => {
        return knowledgeRepository.listContentSources({
          provider: url.searchParams.get("provider"),
          type: url.searchParams.get("type"),
          trustLevel: url.searchParams.get("trustLevel"),
          query: url.searchParams.get("q")
        });
      }
    },
    {
      method: "POST",
      path: "/guides",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.title) {
          const error = new Error("Guide title is required");
          error.statusCode = 400;
          error.code = "invalid_guide";
          throw error;
        }
        return knowledgeRepository.createGuide(body);
      }
    },
    {
      method: "POST",
      path: "/guides/update",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.id) {
          const error = new Error("Guide id is required");
          error.statusCode = 400;
          error.code = "invalid_guide";
          throw error;
        }
        const guide = await knowledgeRepository.updateGuide(body.id, body);
        if (!guide) {
          const error = new Error("Guide not found");
          error.statusCode = 404;
          error.code = "guide_not_found";
          throw error;
        }
        return guide;
      }
    },
    {
      method: "POST",
      path: "/guides/delete",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.id) {
          const error = new Error("Guide id is required");
          error.statusCode = 400;
          error.code = "invalid_guide";
          throw error;
        }
        const guide = await knowledgeRepository.deleteGuide(body.id);
        if (!guide) {
          const error = new Error("Guide not found");
          error.statusCode = 404;
          error.code = "guide_not_found";
          throw error;
        }
        return guide;
      }
    }
  ]
});
