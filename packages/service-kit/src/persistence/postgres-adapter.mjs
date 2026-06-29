import { getEnv } from "../config.mjs";

export function getDatabaseUrl() {
  return getEnv("DATABASE_URL", "");
}

export function isPostgresConfigured() {
  return getDatabaseUrl().startsWith("postgres://") || getDatabaseUrl().startsWith("postgresql://");
}

export function createPostgresReadiness() {
  return {
    configured: isPostgresConfigured(),
    mode: isPostgresConfigured() ? "postgres-ready" : "memory-fallback",
    note:
      "PostgreSQL schemas and migrations are ready. Runtime SQL adapter will be enabled when a pg driver is available."
  };
}
