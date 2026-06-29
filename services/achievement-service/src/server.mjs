import { createJsonService } from "../../../packages/service-kit/src/http.mjs";
import { achievements } from "../../../packages/service-kit/src/data.mjs";

const port = Number(process.env.ACHIEVEMENT_SERVICE_PORT || 8083);

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
      path: "/achievements",
      handler: () => ({
        achievements,
        summary: {
          total: achievements.length,
          completed: achievements.filter((achievement) => achievement.progress === 100).length,
          averageProgress: Math.round(
            achievements.reduce((sum, achievement) => sum + achievement.progress, 0) /
              achievements.length
          )
        }
      })
    }
  ]
});
