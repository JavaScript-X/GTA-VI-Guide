import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function vehiclesPage(state) {
  const vehicles = state.dashboard.profile.garage || [];
  const list = vehicles
    .map((vehicle) => `<article class="list-item"><div class="item-title"><span>${vehicle.name}</span><span class="badge">${vehicle.owned ? "owned" : "wishlist"}</span></div><p class="muted">${vehicle.className} - ${vehicle.source}</p>${vehicle.notes ? `<p class="comment-preview">${vehicle.notes}</p>` : ""}</article>`)
    .join("");
  return page(
    "vehicles",
    `
      ${heading("Vehicules", "Garage et wishlist", "Suis tes vehicules, classes, favoris, sources et acquisitions futures.")}
      <div class="content-grid">
        ${panel("Garage", "Collection", `<div class="list">${list || `<div class="empty-state"><strong>Garage vide</strong><p>Ajoute ton premier vehicule manuel.</p></div>`}</div>`)}
        ${panel("Ajouter / modifier", "Manuel", `<form id="vehicle-form" class="stack-form"><label>Nom<input name="name" required placeholder="Ex: Oceanic Turbo"></label><label>Classe<input name="className" placeholder="Sport, SUV, Moto..."></label><label>Statut<select name="owned"><option value="true">Possede</option><option value="false">Wishlist</option></select></label><label>Notes<textarea name="notes" rows="3" placeholder="Build, source, priorite..."></textarea></label><button class="button primary" type="submit">Enregistrer</button><p class="form-status" data-form-status="vehicle"></p></form>`)}
        ${panel("Stats", "Synthese", `<div class="profile-grid"><div><span class="label">Possedes</span><strong>${vehicles.filter((item) => item.owned).length}</strong></div><div><span class="label">Wishlist</span><strong>${vehicles.filter((item) => !item.owned).length}</strong></div></div>`)}
      </div>
    `
  );
}
