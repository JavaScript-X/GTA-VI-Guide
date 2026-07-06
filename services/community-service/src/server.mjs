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
      handler: ({ url }) => {
        const query = url.searchParams.get("q");
        if (query) {
          return communityRepository.searchCommunity(query);
        }
        return communityRepository.getFeed();
      }
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
      path: "/comments",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.postId || !body.body) {
          const error = new Error("postId and body are required");
          error.statusCode = 400;
          error.code = "invalid_comment";
          throw error;
        }
        const comment = await communityRepository.addComment(body.postId, body);
        if (!comment) {
          const error = new Error("Post not found");
          error.statusCode = 404;
          error.code = "post_not_found";
          throw error;
        }
        return comment;
      }
    },
    {
      method: "POST",
      path: "/comments/update",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.id || !body.body) {
          const error = new Error("id and body are required");
          error.statusCode = 400;
          error.code = "invalid_comment_update";
          throw error;
        }
        const comment = await communityRepository.updateComment(body.id, body);
        if (!comment) {
          const error = new Error("Comment not found");
          error.statusCode = 404;
          error.code = "comment_not_found";
          throw error;
        }
        return comment;
      }
    },
    {
      method: "POST",
      path: "/comments/delete",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const comment = await communityRepository.deleteComment(body.id);
        if (!comment) {
          const error = new Error("Comment not found");
          error.statusCode = 404;
          error.code = "comment_not_found";
          throw error;
        }
        return comment;
      }
    },
    {
      method: "POST",
      path: "/reactions",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.postId) {
          const error = new Error("postId is required");
          error.statusCode = 400;
          error.code = "invalid_reaction";
          throw error;
        }
        const reaction = await communityRepository.reactToPost(body.postId, body);
        if (!reaction) {
          const error = new Error("Post not found");
          error.statusCode = 404;
          error.code = "post_not_found";
          throw error;
        }
        return reaction;
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
    },
    {
      method: "POST",
      path: "/crews",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.name) {
          const error = new Error("Crew name is required");
          error.statusCode = 400;
          error.code = "invalid_crew";
          throw error;
        }
        return communityRepository.createCrew(body);
      }
    },
    {
      method: "POST",
      path: "/crews/update",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const crew = await communityRepository.updateCrew(body.id, body);
        if (!crew) {
          const error = new Error("Crew not found");
          error.statusCode = 404;
          error.code = "crew_not_found";
          throw error;
        }
        return crew;
      }
    },
    {
      method: "POST",
      path: "/crews/delete",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const crew = await communityRepository.deleteCrew(body.id);
        if (!crew) {
          const error = new Error("Crew not found");
          error.statusCode = 404;
          error.code = "crew_not_found";
          throw error;
        }
        return crew;
      }
    },
    {
      method: "POST",
      path: "/events",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        if (!body.title) {
          const error = new Error("Event title is required");
          error.statusCode = 400;
          error.code = "invalid_event";
          throw error;
        }
        return communityRepository.createEvent(body);
      }
    },
    {
      method: "POST",
      path: "/events/update",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const event = await communityRepository.updateEvent(body.id, body);
        if (!event) {
          const error = new Error("Event not found");
          error.statusCode = 404;
          error.code = "event_not_found";
          throw error;
        }
        return event;
      }
    },
    {
      method: "POST",
      path: "/events/delete",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const event = await communityRepository.deleteEvent(body.id);
        if (!event) {
          const error = new Error("Event not found");
          error.statusCode = 404;
          error.code = "event_not_found";
          throw error;
        }
        return event;
      }
    },
    {
      method: "GET",
      path: "/reports",
      handler: () => communityRepository.listReports()
    },
    {
      method: "POST",
      path: "/reports/resolve",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const report = await communityRepository.resolveReport(body.reportId, body.status || "resolved");
        if (!report) {
          const error = new Error("Report not found");
          error.statusCode = 404;
          error.code = "report_not_found";
          throw error;
        }
        return report;
      }
    },
    {
      method: "POST",
      path: "/posts/moderate",
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const post = await communityRepository.moderatePost(body.postId, body.status || "hidden");
        if (!post) {
          const error = new Error("Post not found");
          error.statusCode = 404;
          error.code = "post_not_found";
          throw error;
        }
        return post;
      }
    }
  ]
});
