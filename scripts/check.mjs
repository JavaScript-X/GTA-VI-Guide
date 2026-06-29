import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        files.push(...(await collectJavaScriptFiles(path)));
      }
    } else if (entry.name.endsWith(".mjs") || entry.name.endsWith(".js")) {
      files.push(path);
    }
  }

  return files;
}

const files = await collectJavaScriptFiles(process.cwd());
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

console.log(`Checked ${files.length} JavaScript files.`);
