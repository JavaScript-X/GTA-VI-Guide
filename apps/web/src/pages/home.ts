import { appSection, quickLink, statCard } from "../components/cards.ts";
import { actionBar } from "../components/layout.ts";

export function homePage(state) {
  const dashboard = state.dashboard;
  const ready = state.platform.services.filter((service) => service.status === "ready").length;
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
        <section class="home-intro">
          <p class="eyebrow">Vice City community app</p>
          <h1>Guides, suivi et communaute GTA VI au meme endroit.</h1>
          <p>Une interface simple pour suivre ta progression, lire les guides utiles, organiser la communaute et preparer les futures integrations officielles.</p>
          <form class="hero-search" id="global-search-form">
            <input name="query" value="${state.globalSearch || ""}" placeholder="Rechercher guides, sources, posts, crews" />
            <button class="button primary" type="submit">Rechercher</button>
          </form>
          ${actionBar(`
            <a class="button primary" href="#tracking" data-route="tracking">Ouvrir mon suivi</a>
            <a class="button secondary" href="#guides" data-route="guides">Voir les guides</a>
          `)}
        </section>
        ${searchResults}
        <section class="stats-grid">
          ${statCard(dashboard.knowledge.guides.length, "Guides")}
          ${statCard((dashboard.knowledge.sources || []).length, "Sources")}
          ${statCard(dashboard.achievements.achievements.length, "Objectifs")}
          ${statCard(dashboard.profile.syncMode, "Source")}
          ${statCard(`${ready}/${state.platform.services.length}`, "Services")}
        </section>
        ${appSection(
          "Acces rapide",
          "Les actions les plus utiles restent visibles sans surcharger l'ecran.",
          `<div class="quick-grid">
            ${quickLink("guides", "Guides", "Roadmaps, securite, progression.")}
            ${quickLink("sources", "Intel", "Rockstar, stores, wikis attribues.")}
            ${quickLink("tracking", "Suivi", "Profil, completion, achievements.")}
            ${quickLink("community", "Communaute", "Posts, crews, reports.")}
            ${quickLink("account", "Compte", "Connexion, roles, comptes lies.")}
          </div>`
        )}
      </div>
    </section>
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
