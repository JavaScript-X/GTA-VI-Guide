import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function settingsPage() {
  return page(
    "settings",
    `
      ${heading("Parametres", "Preferences et confidentialite", "Controle l'affichage, les sources de donnees, les notifications et la suppression de compte.")}
      <div class="ops-grid">
        ${panel("Affichage", "Interface", `<div class="runbook-list"><span>Theme neon</span><span>Compact</span><span>FR</span></div>`)}
        ${panel("Confidentialite", "Compte", `<div class="runbook-list"><span>Export data</span><span>Delete account</span><span>Revoke OAuth</span></div>`)}
        ${panel("Notifications", "Communaute", `<div class="runbook-list"><span>Guides</span><span>Crews</span><span>Events</span></div>`)}
      </div>
    `
  );
}
