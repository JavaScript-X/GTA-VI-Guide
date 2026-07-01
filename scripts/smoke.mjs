import { spawn } from "node:child_process";

const ports = {
  gateway: 18080,
  identity: 18081,
  profiles: 18082,
  achievements: 18083,
  knowledge: 18084,
  community: 18085
};

const baseEnv = {
  ...process.env,
  API_GATEWAY_PORT: String(ports.gateway),
  IDENTITY_SERVICE_PORT: String(ports.identity),
  GAME_PROFILE_SERVICE_PORT: String(ports.profiles),
  ACHIEVEMENT_SERVICE_PORT: String(ports.achievements),
  KNOWLEDGE_SERVICE_PORT: String(ports.knowledge),
  COMMUNITY_SERVICE_PORT: String(ports.community),
  IDENTITY_SERVICE_URL: `http://localhost:${ports.identity}`,
  GAME_PROFILE_SERVICE_URL: `http://localhost:${ports.profiles}`,
  ACHIEVEMENT_SERVICE_URL: `http://localhost:${ports.achievements}`,
  KNOWLEDGE_SERVICE_URL: `http://localhost:${ports.knowledge}`,
  COMMUNITY_SERVICE_URL: `http://localhost:${ports.community}`,
  RATE_LIMIT_MAX_REQUESTS: "1000"
};

const processes = [
  ["identity", "services/identity-service/src/server.mjs", `http://localhost:${ports.identity}/health`],
  ["profiles", "services/game-profile-service/src/server.mjs", `http://localhost:${ports.profiles}/health`],
  ["achievements", "services/achievement-service/src/server.mjs", `http://localhost:${ports.achievements}/health`],
  ["knowledge", "services/knowledge-service/src/server.mjs", `http://localhost:${ports.knowledge}/health`],
  ["community", "services/community-service/src/server.mjs", `http://localhost:${ports.community}/health`],
  ["gateway", "services/api-gateway/src/server.mjs", `http://localhost:${ports.gateway}/health`]
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
    env: baseEnv
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

  const dashboard = await fetch(`http://localhost:${ports.gateway}/api/dashboard`);
  if (!dashboard.ok) {
    throw new Error(`Dashboard endpoint returned ${dashboard.status}`);
  }

  const payload = await dashboard.json();
  if (!payload.data.identity || !payload.data.profile || !payload.data.knowledge) {
    throw new Error("Dashboard payload is missing required domains");
  }

  const platform = await fetch(`http://localhost:${ports.gateway}/api/platform`);
  if (!platform.ok) {
    throw new Error(`Platform endpoint returned ${platform.status}`);
  }

  const platformPayload = await platform.json();
  if (!platformPayload.data.security || !platformPayload.data.infrastructure) {
    throw new Error("Platform payload is missing deployability domains");
  }

  const register = await fetch(`http://localhost:${ports.gateway}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      displayName: "Smoke Runner",
      email: `smoke-${Date.now()}@example.com`,
      password: "ChangeMe123!"
    })
  });
  if (register.status !== 201) {
    throw new Error(`Register endpoint returned ${register.status}`);
  }

  const registerPayload = await register.json();
  if (!registerPayload.data.session?.accessToken || !registerPayload.data.user?.id) {
    throw new Error("Register payload is missing user session");
  }

  const login = await fetch(`http://localhost:${ports.gateway}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "vice@example.com",
      password: "ChangeMe123!"
    })
  });
  if (!login.ok) {
    throw new Error(`Login endpoint returned ${login.status}`);
  }

  const loginPayload = await login.json();
  if (!loginPayload.data.session?.accessToken) {
    throw new Error("Login payload is missing access token");
  }
  if (!loginPayload.data.session?.refreshExpiresAt) {
    throw new Error("Login payload is missing refresh expiration");
  }

  const refresh = await fetch(`http://localhost:${ports.gateway}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      refreshToken: loginPayload.data.session.refreshToken
    })
  });
  if (!refresh.ok) {
    throw new Error(`Refresh endpoint returned ${refresh.status}`);
  }

  const refreshPayload = await refresh.json();
  if (!refreshPayload.data.session?.accessToken || !refreshPayload.data.session?.refreshExpiresAt) {
    throw new Error("Refresh payload is missing hardened session fields");
  }

  const guide = await fetch(`http://localhost:${ports.gateway}/api/guides`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Smoke Route Guide",
      summary: "Created through the gateway smoke test.",
      tags: ["online", "smoke"]
    })
  });
  if (guide.status !== 201) {
    throw new Error(`Guide creation returned ${guide.status}`);
  }
  const guidePayload = await guide.json();

  const guideUpdate = await fetch(`http://localhost:${ports.gateway}/api/guides/update`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: guidePayload.data.id,
      status: "editorial"
    })
  });
  if (!guideUpdate.ok) {
    throw new Error(`Guide update returned ${guideUpdate.status}`);
  }

  const post = await fetch(`http://localhost:${ports.gateway}/api/posts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Smoke Community Post",
      channel: "general",
      body: "Created through the gateway smoke test."
    })
  });
  if (post.status !== 201) {
    throw new Error(`Post creation returned ${post.status}`);
  }

  const postPayload = await post.json();
  const comment = await fetch(`http://localhost:${ports.gateway}/api/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      postId: postPayload.data.id,
      body: "Smoke test comment."
    })
  });
  if (comment.status !== 201) {
    throw new Error(`Comment creation returned ${comment.status}`);
  }

  const reaction = await fetch(`http://localhost:${ports.gateway}/api/reactions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      postId: postPayload.data.id,
      type: "like"
    })
  });
  if (reaction.status !== 201) {
    throw new Error(`Reaction creation returned ${reaction.status}`);
  }

  const report = await fetch(`http://localhost:${ports.gateway}/api/reports`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      postId: postPayload.data.id,
      reason: "smoke-test"
    })
  });
  if (report.status !== 201) {
    throw new Error(`Report creation returned ${report.status}`);
  }
  const reportPayload = await report.json();

  const crew = await fetch(`http://localhost:${ports.gateway}/api/crews`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Crew",
      focus: "testing",
      members: 5,
      description: "Created through the gateway smoke test."
    })
  });
  if (crew.status !== 201) {
    throw new Error(`Crew creation returned ${crew.status}`);
  }
  const crewPayload = await crew.json();

  const event = await fetch(`http://localhost:${ports.gateway}/api/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Smoke Event",
      type: "testing",
      seats: 5,
      crew: crewPayload.data.name,
      description: "Created through the gateway smoke test."
    })
  });
  if (event.status !== 201) {
    throw new Error(`Event creation returned ${event.status}`);
  }
  const eventPayload = await event.json();

  const crewUpdate = await fetch(`http://localhost:${ports.gateway}/api/crews/update`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: crewPayload.data.id,
      status: "curated"
    })
  });
  if (!crewUpdate.ok) {
    throw new Error(`Crew update returned ${crewUpdate.status}`);
  }

  const eventUpdate = await fetch(`http://localhost:${ports.gateway}/api/events/update`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: eventPayload.data.id,
      type: "featured"
    })
  });
  if (!eventUpdate.ok) {
    throw new Error(`Event update returned ${eventUpdate.status}`);
  }

  const eventDelete = await fetch(`http://localhost:${ports.gateway}/api/events/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: eventPayload.data.id
    })
  });
  if (!eventDelete.ok) {
    throw new Error(`Event delete returned ${eventDelete.status}`);
  }

  const crewDelete = await fetch(`http://localhost:${ports.gateway}/api/crews/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: crewPayload.data.id
    })
  });
  if (!crewDelete.ok) {
    throw new Error(`Crew delete returned ${crewDelete.status}`);
  }

  const reports = await fetch(`http://localhost:${ports.gateway}/api/reports`);
  if (!reports.ok) {
    throw new Error(`Reports endpoint returned ${reports.status}`);
  }

  const reportResolve = await fetch(`http://localhost:${ports.gateway}/api/reports/resolve`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      reportId: reportPayload.data.id,
      status: "resolved"
    })
  });
  if (!reportResolve.ok) {
    throw new Error(`Report resolve returned ${reportResolve.status}`);
  }

  const postModerate = await fetch(`http://localhost:${ports.gateway}/api/posts/moderate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      postId: postPayload.data.id,
      status: "hidden"
    })
  });
  if (!postModerate.ok) {
    throw new Error(`Post moderation returned ${postModerate.status}`);
  }

  const progress = await fetch(`http://localhost:${ports.gateway}/api/achievements/progress`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: "collector-instinct",
      progress: 75
    })
  });
  if (!progress.ok) {
    throw new Error(`Achievement progress returned ${progress.status}`);
  }

  const completion = await fetch(`http://localhost:${ports.gateway}/api/profiles/me/completion`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      completion: {
        story: 60
      }
    })
  });
  if (!completion.ok) {
    throw new Error(`Profile completion returned ${completion.status}`);
  }

  const guideDelete = await fetch(`http://localhost:${ports.gateway}/api/guides/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: guidePayload.data.id
    })
  });
  if (!guideDelete.ok) {
    throw new Error(`Guide delete returned ${guideDelete.status}`);
  }

  const logout = await fetch(`http://localhost:${ports.gateway}/api/auth/logout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      refreshToken: refreshPayload.data.session.refreshToken
    })
  });
  if (!logout.ok) {
    throw new Error(`Logout endpoint returned ${logout.status}`);
  }

  const deleteAccount = await fetch(`http://localhost:${ports.gateway}/api/me`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${refreshPayload.data.session.accessToken}`
    }
  });
  if (!deleteAccount.ok) {
    throw new Error(`Delete account endpoint returned ${deleteAccount.status}`);
  }

  console.log("Smoke test passed.");
} finally {
  await stopAll();
}
