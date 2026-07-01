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
          <h2>Proposer un guide</h2>
          <form id="guide-form" class="stack-form">
            <label>Titre<input name="title" required placeholder="Ex: Bien demarrer a Vice City Online"></label>
            <label>Resume<textarea name="summary" rows="4" placeholder="Objectif, public cible, points couverts"></textarea></label>
            <label>Tags<input name="tags" placeholder="online, securite, achievements"></label>
            <button class="button primary" type="submit">Envoyer</button>
            <p class="form-status" data-form-status="guide"></p>
          </form>
          <h3>Workflow editorial</h3>
          <div class="timeline">
            <span>Brouillon</span><span>Relecture</span><span>Verifie</span><span>Publie</span>
          </div>
        </aside>
      </div>
    `
  );
}
