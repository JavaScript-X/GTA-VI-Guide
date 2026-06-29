import { heading, page } from "../components/layout.ts";
import { guideCard } from "../components/lists.ts";

export function guidesPage(state) {
  const filters = ["all", "online", "achievements", "securite"];
  const filtered =
    state.guideFilter === "all"
      ? state.dashboard.knowledge.guides
      : state.dashboard.knowledge.guides.filter((guide) => (guide.tags || []).includes(state.guideFilter));
  return page(
    "guides",
    `
      ${heading("Guides", "Bibliotheque communautaire", "Retrouve les contenus verifies, les brouillons de la communaute et les guides de securite compte.")}
      <div class="toolbar">
        ${filters.map((filter) => `<button class="chip ${state.guideFilter === filter ? "is-active" : ""}" data-guide-filter="${filter}">${filter}</button>`).join("")}
      </div>
      <div class="guide-layout">
        <div class="guide-list">${filtered.map(guideCard).join("")}</div>
        <aside class="panel guide-aside">
          <p class="eyebrow">Contribution</p>
          <h2>Workflow editorial</h2>
          <div class="timeline">
            <span>Brouillon</span><span>Relecture</span><span>Verifie</span><span>Publie</span>
          </div>
        </aside>
      </div>
    `
  );
}
