import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { createRepositories } from "../../../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../../../packages/service-kit/src/persistence/postgres-adapter.mjs";

const port = Number(process.env.ACHIEVEMENT_SERVICE_PORT || 8083);
const achievementRepository = createRepositories().achievements;

createJsonService({
  name: "achievement-service",
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
      path: "/achievements",
      handler: () => achievementRepository.listAchievements()
    },
    {
      method: "POST",
      path: "/achievements/progress",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const progress = Number(body.progress);
        if (!body.id || !Number.isFinite(progress) || progress < 0 || progress > 100) {
          const error = new Error("id and progress 0-100 are required");
          error.statusCode = 400;
          error.code = "invalid_progress";
          throw error;
        }
        const updated = await achievementRepository.updateProgress(body.id, progress);
        if (!updated) {
          const error = new Error("Achievement not found");
          error.statusCode = 404;
          error.code = "achievement_not_found";
          throw error;
        }
        return updated;
      }
    }
  ]
});
