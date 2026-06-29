import {
  createRefreshToken,
  hashPassword,
  requireRole,
  requireUser,
  signJwt,
  verifyPassword
} from "../../../packages/service-kit/src/auth.mjs";
import { createJsonService, readJsonBody } from "../../../packages/service-kit/src/http.mjs";
import { linkedAccounts, sampleUser } from "../../../packages/service-kit/src/data.mjs";

const port = Number(process.env.IDENTITY_SERVICE_PORT || 8081);
const demoPasswordHash = hashPassword("ChangeMe123!");
const users = new Map([
  [
    "vice@example.com",
    {
      ...sampleUser,
      email: "vice@example.com",
      passwordHash: demoPasswordHash,
      roles: ["player", "contributor", "moderator"]
    }
  ]
]);
const refreshSessions = new Map();
const auditLog = [];

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function createSession(user, requestId) {
  const accessToken = signJwt({
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles
  });
  const refreshToken = createRefreshToken();
  refreshSessions.set(refreshToken, {
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString(),
    revokedAt: null
  });
  auditLog.push({
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
      handler: () => ({ status: "ready" })
    },
    {
      method: "GET",
      path: "/me",
      handler: ({ request }) => {
        const claims = request.headers.authorization ? requireUser(request) : null;
        const user = claims ? users.get(claims.email) : users.get("vice@example.com");
        return {
          user: publicUser(user),
          linkedAccounts
        };
      }
    },
    {
      method: "POST",
      path: "/auth/login",
      handler: async ({ request, requestId }) => {
        const body = await readJsonBody(request);
        const email = String(body.email || "").toLowerCase();
        const password = String(body.password || "");
        const user = users.get(email);

        if (!user || !verifyPassword(password, user.passwordHash)) {
          const error = new Error("Invalid email or password");
          error.statusCode = 401;
          error.code = "invalid_credentials";
          throw error;
        }

        return {
          user: publicUser(user),
          session: createSession(user, requestId)
        };
      }
    },
    {
      method: "POST",
      path: "/auth/refresh",
      handler: async ({ request, requestId }) => {
        const body = await readJsonBody(request);
        const refreshToken = String(body.refreshToken || "");
        const session = refreshSessions.get(refreshToken);

        if (!session || session.revokedAt) {
          const error = new Error("Invalid refresh token");
          error.statusCode = 401;
          error.code = "invalid_refresh_token";
          throw error;
        }

        const user = users.get(session.email);
        return {
          user: publicUser(user),
          session: createSession(user, requestId)
        };
      }
    },
    {
      method: "POST",
      path: "/auth/logout",
      handler: async ({ request, requestId }) => {
        const body = await readJsonBody(request);
        const refreshToken = String(body.refreshToken || "");
        const session = refreshSessions.get(refreshToken);

        if (session) {
          session.revokedAt = new Date().toISOString();
          auditLog.push({
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
      handler: ({ request }) => {
        requireRole(request, "moderator");
        return {
          roles: ["player", "contributor", "moderator", "admin"]
        };
      }
    },
    {
      method: "GET",
      path: "/audit-log",
      handler: ({ request }) => {
        requireRole(request, "moderator");
        return {
          events: auditLog.slice(-50)
        };
      }
    },
    {
      method: "GET",
      path: "/consents",
      handler: ({ request }) => {
        requireUser(request);
        return {
          consents: linkedAccounts.map((account) => ({
            provider: account.provider,
            handle: account.handle,
            status: account.status,
            dataSource: account.status === "mock-linked" ? "manual-preview" : "official-oauth-required"
          }))
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
        auditLog.push({
          type: "consent.revoked",
          userId: claims.sub,
          provider,
          requestId,
          createdAt: new Date().toISOString()
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
      handler: ({ request }) => ({
        user: requireUser(request),
        linkedAccounts
      })
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
