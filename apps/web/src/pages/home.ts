import { appSection, quickLink, statCard } from "../components/cards.ts";
import { actionBar } from "../components/layout.ts";
import { skeletonGrid } from "../components/skeletons.ts";
import { t } from "../i18n.ts";

export function homePage(state) {
  const locale = state.ui.locale;
  const dashboard = state.dashboard;
  const guides = dashboard.knowledge.guides || [];
  const sources = dashboard.knowledge.sources || [];
  const posts = dashboard.community.feed || [];
  const profile = dashboard.profile.activeCharacter;
  const checklistDone = state.launchChecklist.filter((item) => item.done).length;
  const checklistProgress = Math.round((checklistDone / Math.max(state.launchChecklist.length, 1)) * 100);
  const results = state.searchResults;
  const searchResults = state.ui.loading.search
    ? `<div class="search-results">${skeletonGrid(5, 2)}</div>`
    : results
    ? `
      <div class="search-results">
        <div class="item-title"><span>${t(locale, "home.resultsFor")} "${state.globalSearch}"</span><span class="badge">${results.total || 0}</span></div>
        <div class="result-grid">
          ${resultColumn(t(locale, "common.guides"), results.guides, (item) => item.summary, locale)}
          ${resultColumn(t(locale, "common.sources"), results.sources, (item) => `${item.provider} - ${item.trustLevel}`, locale)}
          ${resultColumn(t(locale, "common.posts"), results.posts, (item) => item.channel, locale)}
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
              <small>${t(locale, "home.eyebrow")}</small>
            </div>
          </div>
          <div class="hero-copy">
            <p class="eyebrow">${t(locale, "home.eyebrow")}</p>
            <h1>${t(locale, "home.title")}</h1>
            <p>${t(locale, "home.copy")}</p>
            <form class="hero-search" id="global-search-form">
              <input name="query" value="${state.globalSearch || ""}" placeholder="${t(locale, "home.searchPlaceholder")}" />
              <button class="button primary" type="submit">${t(locale, "common.search")}</button>
            </form>
            ${actionBar(`
              <a class="button primary" href="#guides" data-route="guides">${t(locale, "common.guides")}</a>
              <a class="button secondary" href="#tracking" data-route="tracking">${t(locale, "home.tracking")}</a>
            `)}
            <div class="hero-tags">
              <span>${guides.length} ${t(locale, "common.guides").toLowerCase()}</span><span>${sources.length} ${t(locale, "common.sources").toLowerCase()}</span><span>${posts.length} ${t(locale, "common.posts").toLowerCase()}</span>
            </div>
          </div>
        </section>
        ${searchResults}
        ${state.ui.loading.dashboard ? skeletonGrid(4, 2) : ""}
        <section class="discovery-row">
          <div class="shelf-head">
            <p class="eyebrow">${t(locale, "home.today")}</p>
            <h2>${t(locale, "home.summary")}</h2>
          </div>
          <div class="hub-dashboard">
            ${statCard(sources.length, t(locale, "common.sources"))}
            ${statCard(guides.length, t(locale, "common.guides"))}
            ${statCard(checklistProgress + "%", t(locale, "common.ready"))}
            ${statCard(profile.level, t(locale, "common.level"))}
          </div>
        </section>
        <section class="wiki-front">
          <div class="wiki-main">
            ${appSection(
              t(locale, "home.quick"),
              "",
              `<div class="quick-grid wiki-grid">
                ${quickLink("guides", t(locale, "common.guides"), t(locale, "home.quickGuides"))}
                ${quickLink("tracking", t(locale, "nav.tracking"), t(locale, "home.quickTracking"))}
                ${quickLink("sources", t(locale, "common.sources"), t(locale, "home.quickSources"))}
                ${quickLink("community", t(locale, "nav.community"), t(locale, "home.quickCommunity"))}
              </div>`
            )}
            ${appSection(
              t(locale, "home.discussions"),
              "",
              `<div class="activity-feed">
                ${state.ui.loading.dashboard ? skeletonGrid(2, 2) : posts.slice(0, 2).map((post) => `<article><span>${post.channel}</span><strong>${post.title}</strong><small>${post.replies || post.comments || 0} ${t(locale, "home.responses")}</small></article>`).join("")}
              </div>`
            )}
          </div>
          <aside class="wiki-sidebar">
            <div class="sidebar-card">
              <p class="eyebrow">${t(locale, "home.launchChecklist")}</p>
              <div class="checklist-progress">
                <strong>${checklistDone}/${state.launchChecklist.length}</strong>
                <span>${checklistProgress}% pret</span>
              </div>
              <div class="launch-checklist">
                ${state.launchChecklist.map(checklistItem).join("")}
              </div>
            </div>
            <div class="sidebar-card">
              <p class="eyebrow">${t(locale, "home.playerSnapshot")}</p>
              <strong>${profile.name}</strong>
              <span>${t(locale, "common.level")} ${profile.level} - ${profile.crew}</span>
              <small>${profile.vehicles} ${t(locale, "home.vehicles")} - ${dashboard.profile.syncMode}</small>
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

function resultColumn(title, items = [], subtitle, locale = "fr") {
  const content = items.length
    ? items
        .slice(0, 4)
        .map(
          (item) =>
            `<article class="result-item"><strong>${item.title || item.name}</strong><span>${subtitle(item) || "Resultat"}</span></article>`
        )
        .join("")
    : `<article class="result-item muted">${t(locale, "common.noResults")}</article>`;
  return `<section class="result-column"><h3>${title}</h3>${content}</section>`;
}
