import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function moderationPage(state) {
  const reports = state.moderation.reports.length
    ? state.moderation.reports
        .map(
          (report) => `
            <article class="list-item">
              <div class="item-title"><span>${report.reason}</span><span class="badge">${report.status}</span></div>
              <p class="muted">${report.postId}</p>
              <div class="form-actions">
                <button class="button ghost compact" type="button" data-report-resolve="${report.id}">Resoudre</button>
                <button class="button ghost compact" type="button" data-report-hide-post="${report.postId}">Masquer post</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state"><h3>Aucun report charge</h3><p>Actualise la file ou cree un signalement depuis la communaute.</p></div>`;
  const audit = state.moderation.auditEvents.length
    ? state.moderation.auditEvents
        .map(
          (event) => `
            <article class="list-item">
              <div class="item-title"><span>${event.type}</span><span class="badge">${event.targetType || "audit"}</span></div>
              <p class="muted">${event.createdAt || "date inconnue"} - ${event.userId || "system"}</p>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state"><h3>Audit non charge</h3><p>Connecte-toi avec un role moderateur puis actualise.</p></div>`;
  return page(
    "moderation",
    `
      ${heading("Moderation", "File admin et audit", "Controle les signalements, applique les premieres actions de moderation et verifie l'activite sensible.")}
      <div class="toolbar">
        <button class="button primary" type="button" id="moderation-refresh">Actualiser</button>
        <span class="badge">${state.moderation.loaded ? "charge" : "en attente"}</span>
      </div>
      <div class="content-grid">
        ${panel("Signalements", "Queue", `<div class="list">${reports}</div><p class="form-status" data-form-status="moderation"></p>`)}
        ${panel("Audit logs", "Securite", `<div class="list">${audit}</div><p class="form-status" data-form-status="audit"></p>`)}
      </div>
    `
  );
}
