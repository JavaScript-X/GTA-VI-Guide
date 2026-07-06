import { appSection, quickLink, statCard } from "../components/cards.ts";
import { actionBar } from "../components/layout.ts";

export function homePage(state) {
  const dashboard = state.dashboard;
  const ready = state.platform.services.filter((service) => service.status === "ready").length;
  const guides = dashboard.knowledge.guides || [];
  const sources = dashboard.knowledge.sources || [];
  const posts = dashboard.community.feed || [];
  const achievements = dashboard.achievements.achievements || [];
  const profile = dashboard.profile.activeCharacter;
  const checklistDone = state.launchChecklist.filter((item) => item.done).length;
  const checklistProgress = Math.round((checklistDone / Math.max(state.launchChecklist.length, 1)) * 100);
  const results = state.searchResults;
  const searchResults = results
    ? `
      <div class="search-results">
        <div class="item-title"><span>Resultats pour "${state.globalSearch}"</span><span class="badge">${results.total || 0}</span></div>
        <div class="result-grid">
          ${resultColumn("Guides", results.guides, (item) => item.summary)}
          ${resultColumn("Sources", results.sources, (item) => `${item.provider} - ${item.trustLevel}`)}
          ${resultColumn("Posts", results.posts, (item) => item.channel)}
          ${resultColumn("Crews", results.crews, (item) => `${item.members} membres - ${item.focus}`)}
          ${resultColumn("Events", results.events, (item) => `${item.date} - ${item.seats} places`)}
        </div>
      </div>
    `
    : "";
  return `
    <section class="page is-active" data-page="home">
      <div class="home-shell">
        <section class="store-hero">
          <div class="hero-media">
            <div class="capsule-art">
              <span>VI</span>
              <strong>Leonida Hub</strong>
              <small>Community guide platform</small>
            </div>
          </div>
          <div class="hero-copy">
            <p class="eyebrow">GTA VI community wiki</p>
            <h1>Le hub GTA VI qui melange wiki, progression et activite communaute.</h1>
            <p>Explore les sources officielles, prepare ton compte Online, suis les achievements et organise les crews comme une bibliotheque Steam faite pour Vice City.</p>
            <form class="hero-search" id="global-search-form">
              <input name="query" value="${state.globalSearch || ""}" placeholder="Rechercher guides, sources, posts, crews" />
              <button class="button primary" type="submit">Rechercher</button>
            </form>
            ${actionBar(`
              <a class="button primary" href="#sources" data-route="sources">Explorer l'intel</a>
              <a class="button secondary" href="#tracking" data-route="tracking">Ouvrir mon suivi</a>
            `)}
            <div class="hero-tags">
              <span>${guides.length} guides</span><span>${sources.length} sources</span><span>${posts.length} posts</span>
            </div>
          </div>
        </section>
        ${searchResults}
        <section class="discovery-row">
          <div class="shelf-head">
            <p class="eyebrow">Dashboard</p>
            <h2>Essentiel</h2>
          </div>
          <div class="hub-dashboard">
            ${statCard(sources.length, "Sources")}
            ${statCard(guides.length, "Guides")}
            ${statCard(achievements.length, "Objectifs")}
            ${statCard(`${ready}/${state.platform.services.length}`, "Services")}
          </div>
        </section>
        <section class="wiki-front">
          <div class="wiki-main">
            ${appSection(
              "Acces rapide",
              "",
              `<div class="quick-grid wiki-grid">
                ${quickLink("sources", "Sources GTA VI", "Pages officielles, stores, wiki et politiques media.")}
                ${quickLink("guides", "Guides de lancement", "Progression, argent, securite compte et Online.")}
                ${quickLink("tracking", "Suivi joueur", "Profil, achievements et progression personnelle.")}
                ${quickLink("community", "Communaute", "Posts, crews et evenements actifs.")}
              </div>`
            )}
            ${appSection(
              "Activite recente",
              "",
              `<div class="activity-feed">
                ${posts.slice(0, 3).map((post) => `<article><span>${post.channel}</span><strong>${post.title}</strong><small>${post.replies || post.comments || 0} reponses - score ${post.score}</small></article>`).join("")}
              </div>`
            )}
          </div>
          <aside class="wiki-sidebar">
            <div class="sidebar-card">
              <p class="eyebrow">Checklist lancement</p>
              <div class="checklist-progress">
                <strong>${checklistDone}/${state.launchChecklist.length}</strong>
                <span>${checklistProgress}% pret</span>
              </div>
              <div class="launch-checklist">
                ${state.launchChecklist.map(checklistItem).join("")}
              </div>
            </div>
            <div class="sidebar-card">
              <p class="eyebrow">Player snapshot</p>
              <strong>${profile.name}</strong>
              <span>Level ${profile.level} - ${profile.crew}</span>
              <small>${profile.vehicles} vehicules - ${dashboard.profile.syncMode}</small>
            </div>
          </aside>
        </section>
      </div>
    </section>
  `;
}

function checklistItem(item) {
  return `
    <button class="checklist-item ${item.done ? "is-done" : ""}" type="button" data-checklist-toggle="${item.id}">
      <span>${item.done ? "OK" : ""}</span>
      <strong>${item.label}</strong>
    </button>
  `;
}

function resultColumn(title, items = [], subtitle) {
  const content = items.length
    ? items
        .slice(0, 4)
        .map(
          (item) =>
            `<article class="result-item"><strong>${item.title || item.name}</strong><span>${subtitle(item) || "Resultat"}</span></article>`
        )
        .join("")
    : `<article class="result-item muted">Aucun resultat</article>`;
  return `<section class="result-column"><h3>${title}</h3>${content}</section>`;
}
