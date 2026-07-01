import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { achievementItem } from "../components/lists.ts";

export function achievementsPage(state) {
  const completed = state.dashboard.achievements.achievements.filter((item) => item.progress === 100).length;
  const options = state.dashboard.achievements.achievements
    .map((item) => `<option value="${item.id}">${item.title}</option>`)
    .join("");
  return page(
    "achievements",
    `
      ${heading("Achievements", "Chasse aux objectifs", "Suis les trophees, succes, objectifs saisonniers et collectibles avec priorites communautaires.")}
      <div class="tracking-grid">
        ${panel("Progression", "Resume", `<div class="profile-grid"><div><span class="label">Total</span><strong>${state.dashboard.achievements.achievements.length}</strong></div><div><span class="label">Completes</span><strong>${completed}</strong></div><div><span class="label">Source</span><strong>manual</strong></div><div><span class="label">Mode</span><strong>pre-launch</strong></div></div>`)}
        ${panel("Mettre a jour", "Progression", `<form id="achievement-progress-form" class="stack-form"><label>Objectif<select name="id">${options}</select></label><label>Progression<input name="progress" type="number" min="0" max="100" step="1" value="50"></label><button class="button primary" type="submit">Enregistrer</button><p class="form-status" data-form-status="achievement"></p></form>`)}
        ${panel("Liste", "Objectifs", `<div class="list">${state.dashboard.achievements.achievements.map(achievementItem).join("")}</div>`)}
      </div>
    `
  );
}
