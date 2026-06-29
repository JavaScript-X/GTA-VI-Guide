import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getEnv } from "./config.mjs";

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [scheme, salt, expected] = storedHash.split(":");
  if (scheme !== "scrypt" || !salt || !expected) {
    return false;
  }

  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function signJwt(payload, { expiresInSeconds = 900, secret } = {}) {
  const jwtSecret = secret || getEnv("JWT_ACCESS_SECRET", "dev-access-secret-change-me");
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const claims = {
    iat: now,
    exp: now + expiresInSeconds,
    ...payload
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const signature = createHmac("sha256", jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token, { secret } = {}) {
  const jwtSecret = secret || getEnv("JWT_ACCESS_SECRET", "dev-access-secret-change-me");
  const [encodedHeader, encodedPayload, signature] = String(token || "").split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throwAuthError("Invalid token");
  }

  const expected = createHmac("sha256", jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throwAuthError("Invalid token signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throwAuthError("Token expired");
  }

  return payload;
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function getBearerToken(request) {
  const header = request.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export function requireUser(request) {
  const token = getBearerToken(request);
  if (!token) {
    throwAuthError("Missing bearer token");
  }
  return verifyJwt(token);
}

export function requireRole(request, role) {
  const user = requireUser(request);
  if (!Array.isArray(user.roles) || !user.roles.includes(role)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    error.code = "forbidden";
    throw error;
  }
  return user;
}

function throwAuthError(message) {
  const error = new Error(message);
  error.statusCode = 401;
  error.code = "unauthorized";
  throw error;
}
