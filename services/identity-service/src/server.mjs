import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { linkedAccounts, sampleUser } from "../../../packages/service-kit/src/data.mjs";

const port = Number(process.env.IDENTITY_SERVICE_PORT || 8081);

createJsonService({
  name: "identity-service",
  port,
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: () => ({ status: "ok" })
    },
    {
      method: "GET",
      path: "/me",
      handler: () => ({
        user: sampleUser,
        linkedAccounts
      })
    },
    {
      method: "POST",
      path: "/link-intents",
      statusCode: 201,
      handler: async ({ request }) => {
        const body = await readJsonBody(request);
        const provider = String(body.provider || "").toLowerCase();
        const supported = ["psn", "xbox", "rockstar"];

        if (!supported.includes(provider)) {
          const error = new Error("Unsupported provider");
          error.statusCode = 400;
          error.code = "unsupported_provider";
          throw error;
        }

        return {
          provider,
          status: "created",
          mode: "mock-oauth-boundary",
          consentRequired: true,
          redirectUrl: `/mock-oauth/${provider}`
        };
      }
    }
  ]
});
