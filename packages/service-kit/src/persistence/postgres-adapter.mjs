import { getEnv } from "../config.mjs";
import { createRequire } from "node:module";

export function getDatabaseUrl() {
  return getEnv("DATABASE_URL", "");
}

export function isPostgresConfigured() {
  return getDatabaseUrl().startsWith("postgres://") || getDatabaseUrl().startsWith("postgresql://");
}

export function loadPostgresDriver() {
  try {
    const require = createRequire(import.meta.url);
    return require("pg");
  } catch {
    return null;
  }
}

export function isPostgresAvailable() {
  return isPostgresConfigured() && Boolean(loadPostgresDriver());
}

export function createPostgresReadiness() {
  const configured = isPostgresConfigured();
  const driverAvailable = Boolean(loadPostgresDriver());
  return {
    configured,
    driverAvailable,
    mode: configured && driverAvailable ? "postgres-runtime" : "memory-fallback",
    note: configured && !driverAvailable
      ? "DATABASE_URL is configured, but the pg driver is not installed in this runtime."
      : "PostgreSQL runtime adapter is enabled when DATABASE_URL and the pg driver are available."
  };
}
