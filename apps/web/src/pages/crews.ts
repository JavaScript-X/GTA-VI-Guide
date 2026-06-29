import { crews } from "../data/fallback.ts";
import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function crewsPage() {
  const list = crews
    .map((crew) => `<article class="list-item"><div class="item-title"><span>${crew.name}</span><span class="badge">${crew.status}</span></div><p class="muted">${crew.members} membres - focus ${crew.focus}</p></article>`)
    .join("");
  return page(
    "crews",
    `
      ${heading("Crews", "Organisation communautaire", "Recrutement, roles, sessions, specialites et preparation des activites Online.")}
      <div class="content-grid">
        ${panel("Crews actifs", "Annuaire", `<div class="list">${list}</div>`)}
        ${panel("Outils", "Gestion", `<div class="runbook-list"><span>Invitations</span><span>Roles</span><span>Events</span><span>Moderation</span></div>`)}
      </div>
    `
  );
}
