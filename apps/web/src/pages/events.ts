import { events } from "../data/fallback.ts";
import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function eventsPage() {
  const list = events
    .map((event) => `<article class="list-item"><div class="item-title"><span>${event.title}</span><span class="badge">${event.type}</span></div><p class="muted">${event.date} - ${event.seats} places</p></article>`)
    .join("");
  return page(
    "events",
    `
      ${heading("Events", "Sessions et rendez-vous", "Planifie les sessions crew, routes de lancement, chasse aux objectifs et evenements communautaires.")}
      <div class="content-grid">
        ${panel("Calendrier", "A venir", `<div class="list">${list}</div>`)}
        ${panel("Creation", "Template", `<div class="runbook-list"><span>Type</span><span>Date</span><span>Crew</span><span>Participants</span></div>`)}
      </div>
    `
  );
}
