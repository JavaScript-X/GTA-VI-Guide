import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { checkItem } from "../components/lists.ts";

export function platformPage(state) {
  const services = state.platform.services
    .map((service) => `<article class="service-item ${service.status === "ready" ? "is-ready" : "is-unready"}"><span>${service.name}</span><strong>${service.status}</strong></article>`)
    .join("");
  return page(
    "platform",
    `
      ${heading("Fondation production", "Etat deployable de la plateforme", "Suivi des services, securite, infrastructure et integrations officielles a venir.")}
      <div class="ops-layout">
        ${panel("Readiness microservices", "Services", `<div class="service-grid">${services}</div>`)}
        ${panel("PSN, Xbox, Rockstar", "Integrations", `<div class="check-list">${state.platform.integrations.map(checkItem).join("")}</div>`)}
      </div>
      <div class="ops-grid">
        ${panel("Controles actifs", "Securite", `<div class="check-list">${state.platform.security.map(checkItem).join("")}</div>`)}
        ${panel("Stack deployable", "Infrastructure", `<div class="check-list">${state.platform.infrastructure.map(checkItem).join("")}</div>`)}
        ${panel("Operations", "Runbook", `<div class="runbook-list"><span>Tests</span><span>Build Docker</span><span>Backups</span><span>Rollback</span><span>Monitoring</span></div>`)}
      </div>
    `
  );
}
