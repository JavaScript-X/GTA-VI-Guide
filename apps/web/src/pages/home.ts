import { appSection, quickLink, statCard } from "../components/cards.ts";
import { actionBar } from "../components/layout.ts";

export function homePage(state) {
  const dashboard = state.dashboard;
  const ready = state.platform.services.filter((service) => service.status === "ready").length;
  const guides = dashboard.knowledge.guides || [];
  const sources = dashboard.knowledge.sources || [];
  const posts = dashboard.community.feed || [];
  const crews = dashboard.community.crews || [];
  const achievements = dashboard.achievements.achievements || [];
  const profile = dashboard.profile.activeCharacter;
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
              <span>Official-first</span><span>Wiki style</span><span>Online tracker</span><span>Mobile ready</span>
            </div>
          </div>
        </section>
        ${searchResults}
        <section class="store-stats">
          ${statCard(guides.length, "Guides")}
          ${statCard(sources.length, "Sources")}
          ${statCard(achievements.length, "Objectifs")}
          ${statCard(`${profile.level}`, "Level")}
          ${statCard(`${ready}/${state.platform.services.length}`, "Services")}
        </section>
        <section class="discovery-row">
          <div class="shelf-head">
            <p class="eyebrow">Featured library</p>
            <h2>Continue ton parcours</h2>
          </div>
          <div class="library-shelf">
            ${libraryCard("sources", "Intel officiel", `${sources.length} sources`, "Rockstar, PlayStation, Xbox, Wiki")}
            ${libraryCard("guides", "Guides communaute", `${guides.length} guides`, guides[0]?.summary || "Roadmaps et securite")}
            ${libraryCard("tracking", profile.name, `Level ${profile.level}`, `${profile.vehicles} vehicules - ${profile.properties} proprietes`)}
            ${libraryCard("community", "Discussions", `${posts.length} posts`, `${crews.length} crews actifs`)}
          </div>
        </section>
        <section class="wiki-front">
          <div class="wiki-main">
            ${appSection(
              "Pages populaires",
              "Une entree rapide vers les zones que la communaute va consulter le plus souvent.",
              `<div class="quick-grid wiki-grid">
                ${quickLink("sources", "Sources GTA VI", "Pages officielles, stores, wiki et politiques media.")}
                ${quickLink("guides", "Guides de lancement", "Progression, argent, securite compte et Online.")}
                ${quickLink("map", "Carte Leonida", "Districts, points sauvegardes et exploration.")}
                ${quickLink("vehicles", "Garage", "Vehicules, classes, propriete et suivi joueur.")}
              </div>`
            )}
            ${appSection(
              "Activite recente",
              "Un feed compact pour voir ce qui bouge dans la communaute.",
              `<div class="activity-feed">
                ${posts.slice(0, 3).map((post) => `<article><span>${post.channel}</span><strong>${post.title}</strong><small>${post.replies || post.comments || 0} reponses - score ${post.score}</small></article>`).join("")}
              </div>`
            )}
          </div>
          <aside class="wiki-sidebar">
            <div class="sidebar-card">
              <p class="eyebrow">Source mix</p>
              ${sources.slice(0, 4).map((source) => `<a href="#sources" data-route="sources"><strong>${source.provider}</strong><span>${source.trustLevel}</span></a>`).join("")}
            </div>
            <div class="sidebar-card">
              <p class="eyebrow">Player snapshot</p>
              <strong>${profile.name}</strong>
              <span>${profile.crew}</span>
              <small>${dashboard.profile.syncMode}</small>
            </div>
          </aside>
        </section>
        ${appSection(
          "Hub actions",
          "Les actions importantes restent a portee de main, sans noyer la page.",
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

function libraryCard(route, title, meta, copy) {
  return `
    <a class="library-card" href="#${route}" data-route="${route}">
      <span>${meta}</span>
      <strong>${title}</strong>
      <small>${copy}</small>
    </a>
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
