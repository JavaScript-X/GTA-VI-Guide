import { spawn } from "node:child_process";

const processes = [
  ["identity", "services/identity-service/src/server.mjs"],
  ["profiles", "services/game-profile-service/src/server.mjs"],
  ["achievements", "services/achievement-service/src/server.mjs"],
  ["knowledge", "services/knowledge-service/src/server.mjs"],
  ["community", "services/community-service/src/server.mjs"],
  ["gateway", "services/api-gateway/src/server.mjs"],
  ["sync-worker", "services/sync-worker/src/worker.mjs"],
  ["web", "apps/web/server.mjs"]
];

const children = processes.map(([name, script]) => {
  const child = spawn(process.execPath, [script], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
