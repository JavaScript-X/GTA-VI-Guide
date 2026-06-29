import { vehicles } from "../data/fallback.ts";
import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function vehiclesPage() {
  const list = vehicles
    .map((vehicle) => `<article class="list-item"><div class="item-title"><span>${vehicle.name}</span><span class="badge">${vehicle.owned ? "owned" : "wishlist"}</span></div><p class="muted">${vehicle.className} - ${vehicle.source}</p></article>`)
    .join("");
  return page(
    "vehicles",
    `
      ${heading("Vehicules", "Garage et wishlist", "Suis tes vehicules, classes, favoris, sources et acquisitions futures.")}
      <div class="content-grid">
        ${panel("Garage", "Collection", `<div class="list">${list}</div>`)}
        ${panel("Stats", "Synthese", `<div class="profile-grid"><div><span class="label">Possedes</span><strong>${vehicles.filter((item) => item.owned).length}</strong></div><div><span class="label">Wishlist</span><strong>${vehicles.filter((item) => !item.owned).length}</strong></div></div>`)}
      </div>
    `
  );
}
