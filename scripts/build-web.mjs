import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const sourceRoot = join(process.cwd(), "apps", "web", "src");
const outputRoot = join(process.cwd(), "apps", "web", "dist");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.name.endsWith(".ts")) {
      files.push(path);
    }
  }
  return files;
}

function transpile(source) {
  return source
    .replace(/import\s+type\s+[^;]+;\n/g, "")
    .replace(/export\s+interface\s+\w+\s+\{[\s\S]*?\}\n/g, "")
    .replace(/export\s+type\s+\w+\s*=\s*[\s\S]*?;\n/g, "")
    .replace(/from\s+"([^"]+)\.ts"/g, 'from "$1.js"')
    .replace(/from\s+'([^']+)\.ts'/g, "from '$1.js'");
}

await rm(outputRoot, { recursive: true, force: true });
const files = await collectFiles(sourceRoot);

for (const file of files) {
  const relativePath = relative(sourceRoot, file).replace(/\.ts$/, ".js");
  const outputFile = join(outputRoot, relativePath);
  await mkdir(dirname(outputFile), { recursive: true });
  const source = await readFile(file, "utf8");
  await writeFile(outputFile, transpile(source));
}

console.log(`Built ${files.length} frontend modules.`);
