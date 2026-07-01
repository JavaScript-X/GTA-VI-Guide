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

function runPsql(args, options = {}) {
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", ...args], options);
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
  return result;
}

function parseMigration(file) {
  const match = /^(V\d{3})__([a-z0-9_]+)\.sql$/.exec(file);
  if (!match) {
    throw new Error(`Invalid migration filename: ${file}`);
  }
  return {
    version: match[1],
    name: match[2]
  };
}

runPsql(
  [
    "-c",
    `
      CREATE SCHEMA IF NOT EXISTS platform;
      CREATE TABLE IF NOT EXISTS platform.schema_migrations (
        version TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  ],
  { stdio: "inherit" }
);

let applied = 0;
let skipped = 0;

for (const file of files) {
  const migration = parseMigration(file);
  const existing = runPsql(
    [
      "-t",
      "-A",
      "-c",
      `SELECT 1 FROM platform.schema_migrations WHERE version = '${migration.version}' LIMIT 1;`
    ],
    { encoding: "utf8" }
  );

  if (existing.stdout.trim() === "1") {
    skipped += 1;
    console.log(`Skipping ${migration.version} ${migration.name}; already applied.`);
    continue;
  }

  const path = join(migrationsDir, file);
  console.log(`Applying ${migration.version} ${migration.name}.`);
  runPsql(["-f", path], { stdio: "inherit" });
  applied += 1;
}

console.log(`Migration run complete. Applied ${applied}, skipped ${skipped}.`);
