import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function eventsPage(state) {
  const events = state.dashboard.community.events || [];
  const list = events
    .map(
      (event) =>
        `<article class="list-item"><div class="item-title"><span>${event.title}</span><span class="badge">${event.type}</span></div><p class="muted">${event.date} - ${event.seats} places - ${event.crew || "Community"}</p><p class="muted">${event.description || "Session communautaire."}</p></article>`
    )
    .join("");
  return page(
    "events",
    `
      ${heading("Events", "Sessions et rendez-vous", "Planifie les sessions crew, routes de lancement, chasse aux objectifs et evenements communautaires.")}
      <div class="content-grid">
        ${panel("Calendrier", "A venir", `<div class="list">${list}</div>`)}
        ${panel("Creer un event", "Session", `<form id="event-form" class="stack-form"><label>Titre<input name="title" required placeholder="Ex: Route collectibles Ocean Beach"></label><label>Type<input name="type" placeholder="exploration, online, completion"></label><label>Date<input name="date" placeholder="TBD ou 2026-07-15 21:00"></label><label>Places<input name="seats" type="number" min="1" step="1" value="8"></label><label>Crew<input name="crew" placeholder="Vice Syndicate"></label><label>Description<textarea name="description" rows="4" placeholder="Objectif, prerequis, deroulement"></textarea></label><button class="button primary" type="submit">Planifier</button><p class="form-status" data-form-status="event"></p></form>`)}
      </div>
    `
  );
}
