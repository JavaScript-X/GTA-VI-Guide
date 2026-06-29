import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { getEnv } from "../packages/service-kit/src/config.mjs";

const migrationsDir = join(process.cwd(), "infra", "database", "migrations");
const databaseUrl = getEnv("DATABASE_URL", "");

if (!databaseUrl) {
  console.log("DATABASE_URL is not set. Migration runner is ready but has no target database.");
  process.exit(0);
}

const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  throw new Error("No migrations found.");
}

const psqlVersion = spawnSync("psql", ["--version"], { stdio: "ignore" });
if (psqlVersion.status !== 0) {
  console.log("psql is not available. Install PostgreSQL client tools to apply migrations.");
  console.log(`Pending migration files: ${files.join(", ")}`);
  process.exit(0);
}

for (const file of files) {
  const path = join(migrationsDir, file);
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", path], {
    stdio: "inherit"
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`Applied ${files.length} migrations.`);
