import { createJsonService } from "../../../packages/service-kit/src/http.mjs";
import { guides } from "../../../packages/service-kit/src/data.mjs";

const port = Number(process.env.KNOWLEDGE_SERVICE_PORT || 8084);

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
      handler: () => ({ status: "ready" })
    },
    {
      method: "GET",
      path: "/guides",
      handler: ({ url }) => {
        const tag = url.searchParams.get("tag");
        const filtered = tag
          ? guides.filter((guide) => guide.tags.includes(tag.toLowerCase()))
          : guides;

        return {
          guides: filtered,
          total: filtered.length
        };
      }
    }
  ]
});
