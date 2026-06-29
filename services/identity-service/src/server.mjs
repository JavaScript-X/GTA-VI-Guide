import {
  createRefreshToken,
  requireRole,
  requireUser,
  signJwt,
  verifyPassword
} from "../../../packages/service-kit/src/auth.mjs";
import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { createRepositories } from "../../../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../../../packages/service-kit/src/persistence/postgres-adapter.mjs";

const port = Number(process.env.IDENTITY_SERVICE_PORT || 8081);
const repositories = createRepositories();
const identityRepository = repositories.identity;

async function createSession(user, requestId) {
  const accessToken = signJwt({
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles
  });
  const refreshToken = createRefreshToken();
  await identityRepository.createRefreshSession(refreshToken, {
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString(),
    revokedAt: null
  });
  await identityRepository.appendAuditEvent({
    type: "session.created",
    userId: user.id,
    requestId,
    createdAt: new Date().toISOString()
  });
  return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: 900 };
}

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
      path: "/me",
      handler: async ({ request }) => {
        const claims = request.headers.authorization ? requireUser(request) : null;
        const user = claims
          ? await identityRepository.getUserWithLinkedAccounts(claims.sub)
          : await identityRepository.getUserWithLinkedAccounts("user_vice_001");
        return user;
      }
    },
    {
      method: "POST",
      path: "/auth/login",
      handler: async ({ request, requestId }) => {
        const body = await readJsonBody(request);
        const email = String(body.email || "").toLowerCase();
        const password = String(body.password || "");
        const user = await identityRepository.findUserByEmail(email);

        if (!user || !verifyPassword(password, user.passwordHash)) {
          const error = new Error("Invalid email or password");
          error.statusCode = 401;
          error.code = "invalid_credentials";
          throw error;
        }

        return {
          user: (await identityRepository.getUserWithLinkedAccounts(user.id)).user,
          session: await createSession(user, requestId)
        };
      }
    },
    {
      method: "POST",
      path: "/auth/refresh",
      handler: async ({ request, requestId }) => {
        const body = await readJsonBody(request);
        const refreshToken = String(body.refreshToken || "");
        const session = await identityRepository.findRefreshSession(refreshToken);

        if (!session || session.revokedAt) {
          const error = new Error("Invalid refresh token");
          error.statusCode = 401;
          error.code = "invalid_refresh_token";
          throw error;
        }

        const user = await identityRepository.findUserByEmail(session.email);
        return {
          user: (await identityRepository.getUserWithLinkedAccounts(user.id)).user,
          session: await createSession(user, requestId)
        };
      }
    },
    {
      method: "POST",
      path: "/auth/logout",
      handler: async ({ request, requestId }) => {
        const body = await readJsonBody(request);
        const refreshToken = String(body.refreshToken || "");
        const session = await identityRepository.revokeRefreshSession(refreshToken);

        if (session) {
          await identityRepository.appendAuditEvent({
            type: "session.revoked",
            userId: session.userId,
            requestId,
            createdAt: new Date().toISOString()
          });
        }

        return { status: "logged_out" };
      }
    },
    {
      method: "GET",
      path: "/roles",
      handler: async ({ request }) => {
        requireRole(request, "moderator");
        return {
          roles: await identityRepository.listRoles()
        };
      }
    },
    {
      method: "GET",
      path: "/audit-log",
      handler: async ({ request }) => {
        requireRole(request, "moderator");
        return {
          events: await identityRepository.listAuditEvents(50)
        };
      }
    },
    {
      method: "GET",
      path: "/consents",
      handler: async ({ request }) => {
        requireUser(request);
        return {
          consents: await identityRepository.listConsents()
        };
      }
    },
    {
      method: "POST",
      path: "/consents/revoke",
      handler: async ({ request, requestId }) => {
        const claims = requireUser(request);
        const body = await readJsonBody(request);
        const provider = String(body.provider || "").toLowerCase();
        await identityRepository.revokeConsent(claims.sub, provider);
        await identityRepository.appendAuditEvent({
          type: "consent.revoked",
          userId: claims.sub,
          provider,
          requestId
        });
        return {
          provider,
          status: "revocation_recorded"
        };
      }
    },
    {
      method: "GET",
      path: "/linked-accounts",
      handler: async ({ request }) => {
        const claims = requireUser(request);
        return {
          user: claims,
          linkedAccounts: (await identityRepository.getUserWithLinkedAccounts(claims.sub)).linkedAccounts
        };
      }
    },
    {
      method: "POST",
      path: "/link-intents",
      statusCode: 201,
      handler: async ({ request }) => {
        requireUser(request);
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
