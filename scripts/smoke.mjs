import { spawn } from "node:child_process";

const processes = [
  ["identity", "services/identity-service/src/server.mjs", "http://localhost:8081/health"],
  ["profiles", "services/game-profile-service/src/server.mjs", "http://localhost:8082/health"],
  ["achievements", "services/achievement-service/src/server.mjs", "http://localhost:8083/health"],
  ["knowledge", "services/knowledge-service/src/server.mjs", "http://localhost:8084/health"],
  ["community", "services/community-service/src/server.mjs", "http://localhost:8085/health"],
  ["gateway", "services/api-gateway/src/server.mjs", "http://localhost:8080/health"]
];

const children = [];

async function waitFor(url, attempts = 30) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Service is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function start(name, script) {
  const child = spawn(process.execPath, [script], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  children.push(child);
}

async function stopAll() {
  await Promise.all(
    children.map((child) => {
      return new Promise((resolve) => {
        if (child.exitCode !== null || child.killed) {
          resolve();
          return;
        }

        child.once("exit", resolve);
        child.kill("SIGTERM");
        setTimeout(resolve, 1000);
      });
    })
  );
}

try {
  for (const [name, script] of processes) {
    start(name, script);
  }

  for (const [, , healthUrl] of processes) {
    await waitFor(healthUrl);
  }

  const dashboard = await fetch("http://localhost:8080/api/dashboard");
  if (!dashboard.ok) {
    throw new Error(`Dashboard endpoint returned ${dashboard.status}`);
  }

  const payload = await dashboard.json();
  if (!payload.data.identity || !payload.data.profile || !payload.data.knowledge) {
    throw new Error("Dashboard payload is missing required domains");
  }

  console.log("Smoke test passed.");
} finally {
  await stopAll();
}
