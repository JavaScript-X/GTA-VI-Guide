import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "infra", "database", "migrations");
const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  throw new Error("No migrations found");
}

let previousVersion = 0;
for (const file of files) {
  const match = /^V(\d{3})__[a-z0-9_]+\.sql$/.exec(file);
  if (!match) {
    throw new Error(`Invalid migration filename: ${file}`);
  }

  const version = Number(match[1]);
  if (version !== previousVersion + 1) {
    throw new Error(`Migration ${file} is not sequential after V${String(previousVersion).padStart(3, "0")}`);
  }

  const sql = await readFile(join(migrationsDir, file), "utf8");
  if (!sql.includes("schema_migrations")) {
    throw new Error(`Migration ${file} must record schema_migrations`);
  }

  previousVersion = version;
}

console.log(`Validated ${files.length} database migrations.`);
