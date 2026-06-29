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
          <p class="muted">${item.replies} reponses · score ${item.score}</p>
        </article>
      `;
    })
    .join("");
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
    const response = await fetch("http://localhost:8080/api/dashboard");
    if (!response.ok) {
      throw new Error(`Gateway returned ${response.status}`);
    }
    const payload = await response.json();
    renderDashboard(payload.data);
  } catch (error) {
    console.warn("Using fallback dashboard data", error);
    renderDashboard(fallbackDashboard);
  }
}

loadDashboard();
