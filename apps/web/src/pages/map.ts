import { mapDistricts } from "../data/fallback.ts";
import { panel, progressBar } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function mapPage() {
  const districts = mapDistricts
    .map((district) => `<article class="completion-item"><div class="item-title"><span>${district.name}</span><span class="badge">${district.status}</span></div><p class="muted">${district.type}</p>${progressBar(district.progress)}</article>`)
    .join("");
  return page(
    "map",
    `
      ${heading("Carte", "Exploration de Leonida", "Prepare les quartiers, points d'interet, collectibles, commerces, garages et zones de crew.")}
      <div class="map-layout">
        <div class="map-panel"><div class="map-grid"></div><div class="map-pin pin-a"></div><div class="map-pin pin-b"></div><div class="map-pin pin-c"></div></div>
        ${panel("Quartiers", "Progression map", `<div class="progress-stack">${districts}</div>`)}
      </div>
    `
  );
}
