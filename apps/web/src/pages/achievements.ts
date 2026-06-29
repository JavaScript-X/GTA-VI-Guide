import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { achievementItem } from "../components/lists.ts";

export function achievementsPage(state) {
  const completed = state.dashboard.achievements.achievements.filter((item) => item.progress === 100).length;
  return page(
    "achievements",
    `
      ${heading("Achievements", "Chasse aux objectifs", "Suis les trophees, succes, objectifs saisonniers et collectibles avec priorites communautaires.")}
      <div class="tracking-grid">
        ${panel("Progression", "Resume", `<div class="profile-grid"><div><span class="label">Total</span><strong>${state.dashboard.achievements.achievements.length}</strong></div><div><span class="label">Completes</span><strong>${completed}</strong></div><div><span class="label">Source</span><strong>manual</strong></div><div><span class="label">Mode</span><strong>pre-launch</strong></div></div>`)}
        ${panel("Liste", "Objectifs", `<div class="list">${state.dashboard.achievements.achievements.map(achievementItem).join("")}</div>`)}
      </div>
    `
  );
}
