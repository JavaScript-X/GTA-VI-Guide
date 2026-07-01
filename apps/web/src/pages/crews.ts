import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function crewsPage(state) {
  const crews = state.dashboard.community.crews || [];
  const list = crews
    .map(
      (crew) =>
        `<article class="list-item"><div class="item-title"><span>${crew.name}</span><span class="badge">${crew.status}</span></div><p class="muted">${crew.members} membres - focus ${crew.focus}</p><p class="muted">${crew.description || "Organisation communautaire."}</p></article>`
    )
    .join("");
  return page(
    "crews",
    `
      ${heading("Crews", "Organisation communautaire", "Recrutement, roles, sessions, specialites et preparation des activites Online.")}
      <div class="content-grid">
        ${panel("Crews actifs", "Annuaire", `<div class="list">${list}</div>`)}
        ${panel("Ajouter un crew", "Recrutement", `<form id="crew-form" class="stack-form"><label>Nom<input name="name" required placeholder="Ex: Neon Cartel"></label><label>Focus<input name="focus" placeholder="heists, races, collectibles"></label><label>Membres<input name="members" type="number" min="1" step="1" value="4"></label><label>Statut<select name="status"><option value="recruiting">recruiting</option><option value="open">open</option><option value="curated">curated</option><option value="private">private</option></select></label><label>Description<textarea name="description" rows="4" placeholder="Style de jeu, horaires, conditions"></textarea></label><button class="button primary" type="submit">Ajouter</button><p class="form-status" data-form-status="crew"></p></form>`)}
      </div>
    `
  );
}
