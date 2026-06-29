const fallbackDashboard = {
  identity: {
    user: {
      displayName: "Vice Explorer",
      reputation: 420
    },
    linkedAccounts: [
      { provider: "psn", handle: "ViceExplorer", status: "mock-linked" },
      { provider: "rockstar", handle: "ViceExplorerSC", status: "ready-for-oauth" }
    ]
  },
  profile: {
    syncMode: "mock",
    activeCharacter: {
      name: "Mara V.",
      level: 38,
      crew: "Vice Syndicate"
    }
  },
  achievements: {
    achievements: [
      { title: "Welcome To Vice", category: "story", progress: 100 },
      { title: "Collector Instinct", category: "collectibles", progress: 45 },
      { title: "Crew Chemistry", category: "online", progress: 70 }
    ]
  },
  knowledge: {
    guides: [
      {
        title: "Roadmap de demarrage GTA Online",
        status: "verified",
        summary: "Les premieres priorites pour construire un compte stable."
      }
    ]
  },
  community: {
    feed: [
      {
        title: "Quels guides voulez-vous pour le lancement ?",
        channel: "guides",
        replies: 18,
        score: 96
      }
    ]
  }
};

const fallbackPlatform = {
  release: {
    name: "GTA VI Guide Foundation",
    stage: "development",
    version: "0.1.0"
  },
  security: [
    { label: "JWT access tokens", status: "implemented" },
    { label: "Refresh sessions", status: "implemented" },
    { label: "Logout / revocation", status: "implemented" },
    { label: "Strict CORS", status: "configured" },
    { label: "Gateway rate limiting", status: "enabled" }
  ],
  infrastructure: [
    { label: "PostgreSQL schemas", status: "ready", detail: "domain schemas" },
    { label: "Versioned migrations", status: "ready", detail: "V001-V003" },
    { label: "RabbitMQ event bus", status: "compose-ready", detail: "async jobs" },
    { label: "MinIO object storage", status: "compose-ready", detail: "future media" },
    { label: "Prometheus metrics", status: "enabled", detail: "/metrics" },
    { label: "Kubernetes manifests", status: "ready", detail: "HPA included" }
  ],
  integrations: [
    { provider: "PSN", mode: "official-oauth-required", dataSource: "manual until approval" },
    { provider: "Xbox", mode: "official-oauth-required", dataSource: "manual until approval" },
    { provider: "Rockstar", mode: "official-oauth-required", dataSource: "manual until approval" }
  ],
  services: [
    { name: "identity", status: "ready" },
    { name: "profiles", status: "ready" },
    { name: "achievements", status: "ready" },
    { name: "knowledge", status: "ready" },
    { name: "community", status: "ready" }
  ]
};

const sessionState = {
  accessToken: null,
  refreshToken: null,
  user: null
};

const $ = (selector) => document.querySelector(selector);

function setText(selector, value) {
  $(selector).textContent = value;
}

function renderAccounts(accounts) {
  $("#account-list").innerHTML = accounts
    .map((account) => {
      return `
        <article class="account-item">
          <div class="item-title">
            <span>${account.provider.toUpperCase()}</span>
            <span class="badge">${account.status}</span>
          </div>
          <p class="muted">${account.handle || "Connexion a preparer"}</p>
        </article>
      `;
    })
    .join("");
}

function renderGuides(guides) {
  $("#guide-list").innerHTML = guides
    .map((guide) => {
      return `
        <article class="list-item">
          <div class="item-title">
            <span>${guide.title}</span>
            <span class="badge">${guide.status}</span>
          </div>
          <p class="muted">${guide.summary}</p>
        </article>
      `;
    })
    .join("");
}

function renderAchievements(achievements) {
  $("#achievement-list").innerHTML = achievements
    .map((achievement) => {
      return `
        <article class="list-item">
          <div class="item-title">
            <span>${achievement.title}</span>
            <span class="badge">${achievement.category}</span>
          </div>
          <div class="progress" aria-label="${achievement.progress}% complete">
            <span style="width: ${achievement.progress}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCommunity(feed) {
  $("#community-list").innerHTML = feed
    .map((item) => {
      return `
        <article class="list-item">
          <div class="item-title">
            <span>${item.title}</span>
            <span class="badge">${item.channel}</span>
          </div>
          <p class="muted">${item.replies} reponses - score ${item.score}</p>
        </article>
      `;
    })
    .join("");
}

function renderPlatform(platform) {
  const readyServices = platform.services.filter((service) => service.status === "ready").length;
  setText("#metric-services", `${readyServices}/${platform.services.length}`);

  $("#service-grid").innerHTML = platform.services
    .map((service) => {
      return `
        <article class="service-item ${service.status === "ready" ? "is-ready" : "is-unready"}">
          <span>${service.name}</span>
          <strong>${service.status}</strong>
        </article>
      `;
    })
    .join("");

  renderChecks("#security-list", platform.security);
  renderChecks("#infrastructure-list", platform.infrastructure);
  $("#integration-list").innerHTML = platform.integrations
    .map((integration) => {
      return `
        <article class="check-item">
          <div>
            <strong>${integration.provider}</strong>
            <p class="muted">${integration.dataSource}</p>
          </div>
          <span class="badge">${integration.mode}</span>
        </article>
      `;
    })
    .join("");
}

function renderChecks(selector, items) {
  $(selector).innerHTML = items
    .map((item) => {
      return `
        <article class="check-item">
          <div>
            <strong>${item.label}</strong>
            <p class="muted">${item.detail || "Pret pour integration production"}</p>
          </div>
          <span class="badge">${item.status}</span>
        </article>
      `;
    })
    .join("");
}

function renderSession() {
  const box = $("#session-box");
  if (!sessionState.user) {
    box.textContent = "Session non connectee";
    box.classList.remove("is-authenticated");
    return;
  }

  box.classList.add("is-authenticated");
  box.innerHTML = `
    <strong>${sessionState.user.displayName}</strong>
    <span>${sessionState.user.roles.join(", ")}</span>
    <small>Access token actif - refresh token stocke en memoire demo</small>
  `;
}

async function fetchJsonWithFallback(paths) {
  let lastError;
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`${path} returned ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function renderDashboard(dashboard) {
  const user = dashboard.identity.user;
  const character = dashboard.profile.activeCharacter;

  setText("#metric-guides", dashboard.knowledge.guides.length);
  setText("#metric-achievements", dashboard.achievements.achievements.length);
  setText("#metric-sync", dashboard.profile.syncMode);
  setText("#player-name", user.displayName);
  setText("#character-name", character.name);
  setText("#character-level", character.level);
  setText("#crew-name", character.crew);
  setText("#reputation", user.reputation);

  renderAccounts(dashboard.identity.linkedAccounts);
  renderGuides(dashboard.knowledge.guides);
  renderAchievements(dashboard.achievements.achievements);
  renderCommunity(dashboard.community.feed);
}

async function loadDashboard() {
  try {
    const payload = await fetchJsonWithFallback(["/api/dashboard", "http://localhost:8080/api/dashboard"]);
    renderDashboard(payload.data);
  } catch (error) {
    console.warn("Using fallback dashboard data", error);
    renderDashboard(fallbackDashboard);
  }
}

async function loadPlatform() {
  try {
    const payload = await fetchJsonWithFallback(["/api/platform", "http://localhost:8080/api/platform"]);
    renderPlatform(payload.data);
  } catch (error) {
    console.warn("Using fallback platform data", error);
    renderPlatform(fallbackPlatform);
  }
}

async function login(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const body = {
    email: formData.get("email"),
    password: formData.get("password")
  };

  try {
    const payload = await fetchJsonWithFallback([
      "/api/auth/login",
      "http://localhost:8080/api/auth/login",
      "http://localhost:8081/auth/login"
    ].map((url) => {
      return new Request(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
    }));
    sessionState.user = payload.data.user;
    sessionState.accessToken = payload.data.session.accessToken;
    sessionState.refreshToken = payload.data.session.refreshToken;
    renderSession();
  } catch (error) {
    $("#session-box").textContent = `Connexion impossible: ${error.message}`;
  }
}

function logout() {
  sessionState.accessToken = null;
  sessionState.refreshToken = null;
  sessionState.user = null;
  renderSession();
}

$("#login-form").addEventListener("submit", login);
$("#logout-button").addEventListener("click", logout);

loadDashboard();
loadPlatform();
renderSession();
