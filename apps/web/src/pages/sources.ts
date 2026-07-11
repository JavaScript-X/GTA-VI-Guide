import { badge } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { skeletonGrid } from "../components/skeletons.ts";

const trustLabels = {
  official: "Officiel",
  platform: "Plateforme",
  community: "Communaute"
};

export function sourcesPage(state) {
  const sources = state.dashboard.knowledge.sources || [];
  const activeFilter = state.sourceFilter || "all";
  const query = String(state.sourceSearch || "").toLowerCase();
  const visible = sources.filter((source) => {
    const matchesTrust = activeFilter === "all" || source.trustLevel === activeFilter;
    const haystack = `${source.title} ${source.provider} ${source.summary} ${(source.tags || []).join(" ")}`.toLowerCase();
    return matchesTrust && (!query || haystack.includes(query));
  });
  const officialCount = sources.filter((source) => source.trustLevel === "official").length;
  const platformCount = sources.filter((source) => source.trustLevel === "platform").length;
  const communityCount = sources.filter((source) => source.trustLevel === "community").length;

  return page(
    "sources",
    `
      ${heading(
        "Intel hub",
        "Sources GTA VI verifiees, attribuees et pretes a synchroniser.",
        "La plateforme centralise les pages officielles, stores, wikis et medias sans copier les contenus proteges. Chaque source garde son lien canonique, sa politique media et son niveau de confiance."
      )}
      <section class="intel-hero">
        <div>
          <p class="eyebrow">Source registry</p>
          <h2>Un centre d'information fiable avant le lancement.</h2>
          <p>Rockstar et les plateformes restent prioritaires. Les wikis communautaires enrichissent les guides, mais les faits sensibles doivent etre confirmes avant publication.</p>
        </div>
        <div class="intel-metrics">
          <span><strong>${officialCount}</strong> officiels</span>
          <span><strong>${platformCount}</strong> stores</span>
          <span><strong>${communityCount}</strong> wiki</span>
        </div>
      </section>
      <div class="source-toolbar">
        <div class="chip-row">
          ${sourceFilterButton("all", "Tout", activeFilter)}
          ${sourceFilterButton("official", "Officiel", activeFilter)}
          ${sourceFilterButton("platform", "Plateformes", activeFilter)}
          ${sourceFilterButton("community", "Communaute", activeFilter)}
        </div>
        <form class="filter-search" data-filter-search="sources">
          <input name="query" value="${state.sourceSearch || ""}" placeholder="Filtrer Rockstar, Xbox, wiki..." />
          <button class="button secondary" type="submit">Filtrer</button>
        </form>
      </div>
      <section class="source-grid">
        ${state.ui.loading.sources ? skeletonGrid(6, 4) : visible.length ? visible.map(sourceCard).join("") : emptySources()}
      </section>
      <section class="source-policy">
        <div>
          <p class="eyebrow">Politique contenu</p>
          <h2>Pas de scraping aveugle.</h2>
          <p>Les contenus externes sont lies, resumes et attribues. Les images officielles ou wiki ne sont stockees localement qu'apres validation des droits, d'une API officielle, ou d'une autorisation claire.</p>
        </div>
        <ul>
          <li>Sources officielles avant sources communautaires.</li>
          <li>Distinction visible entre donnees confirmees et donnees manuelles.</li>
          <li>Reverification obligatoire pour prix, editions, dates et plateformes.</li>
        </ul>
      </section>
    `
  );
}

function sourceFilterButton(id, label, activeFilter) {
  return `<button class="chip ${activeFilter === id ? "is-active" : ""}" type="button" data-source-filter="${id}">${label}</button>`;
}

function sourceCard(source) {
  const facts = (source.facts || [])
    .slice(0, 3)
    .map((fact) => `<span><strong>${fact.label}</strong>${fact.value}</span>`)
    .join("");
  const tags = (source.tags || []).slice(0, 4).map((tag) => `<span>${tag}</span>`).join("");
  const trust = trustLabels[source.trustLevel] || source.trustLevel;
  return `
    <article class="source-card trust-${source.trustLevel}">
      <div class="source-card-head">
        <span class="source-provider">${source.provider}</span>
        ${badge(trust)}
      </div>
      <h2>${source.title}</h2>
      <p>${source.summary}</p>
      <div class="source-facts">${facts || "<span><strong>Status</strong>A verifier</span>"}</div>
      <div class="tag-row">${tags}</div>
      <div class="source-policy-note">
        <strong>Usage</strong>
        <span>${source.allowedUse}</span>
      </div>
      <div class="source-actions">
        <a class="button primary compact" href="${source.url}" target="_blank" rel="noreferrer">Ouvrir la source</a>
        <span>${source.syncMode}</span>
      </div>
    </article>
  `;
}

function emptySources() {
  return `
    <article class="empty-state">
      <strong>Aucune source pour ce filtre</strong>
      <p>Elargis la recherche ou affiche toutes les sources pour retrouver Rockstar, PlayStation, Xbox et les wikis.</p>
    </article>
  `;
}
