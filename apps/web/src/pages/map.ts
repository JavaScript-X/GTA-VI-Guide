import { mapDistricts } from "../data/fallback.ts";
import { panel, progressBar } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function mapPage(state) {
  const points = state.dashboard.profile.mapPoints || [];
  const districts = mapDistricts
    .map((district) => `<article class="completion-item"><div class="item-title"><span>${district.name}</span><span class="badge">${district.status}</span></div><p class="muted">${district.type}</p>${progressBar(district.progress)}</article>`)
    .join("");
  const savedPoints = points
    .map((point) => `<article class="list-item"><div class="item-title"><span>${point.name}</span><span class="badge">${point.status}</span></div><p class="muted">${point.district} - ${point.type}</p>${point.notes ? `<p class="comment-preview">${point.notes}</p>` : ""}</article>`)
    .join("");
  return page(
    "map",
    `
      ${heading("Carte", "Exploration de Leonida", "Prepare les quartiers, points d'interet, collectibles, commerces, garages et zones de crew.")}
      <div class="map-layout">
        <div class="map-panel"><div class="map-grid"></div><div class="map-pin pin-a"></div><div class="map-pin pin-b"></div><div class="map-pin pin-c"></div></div>
        ${panel("Points sauvegardes", "Manuel", `<div class="list">${savedPoints || `<div class="empty-state"><strong>Aucun point</strong><p>Ajoute un garage, commerce, collectible ou spot crew.</p></div>`}</div>`)}
        ${panel("Ajouter un point", "Carte", `<form id="map-point-form" class="stack-form"><label>Nom<input name="name" required placeholder="Ex: Vice Port Garage"></label><label>District<input name="district" placeholder="Ocean Beach, Neon Strip..."></label><label>Type<input name="type" placeholder="garage, collectible, safehouse..."></label><label>Status<select name="status"><option value="planned">planned</option><option value="priority">priority</option><option value="done">done</option></select></label><label>Notes<textarea name="notes" rows="3" placeholder="Pourquoi ce point est utile"></textarea></label><button class="button primary" type="submit">Sauvegarder</button><p class="form-status" data-form-status="map-point"></p></form>`)}
        ${panel("Quartiers", "Progression map", `<div class="progress-stack">${districts}</div>`)}
      </div>
    `
  );
}
