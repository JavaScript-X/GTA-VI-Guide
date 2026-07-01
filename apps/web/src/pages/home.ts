import { appSection, quickLink, statCard } from "../components/cards.ts";
import { actionBar } from "../components/layout.ts";

export function homePage(state) {
  const dashboard = state.dashboard;
  const ready = state.platform.services.filter((service) => service.status === "ready").length;
  return `
    <section class="page is-active" data-page="home">
      <div class="home-shell">
        <section class="home-intro">
          <p class="eyebrow">Vice City community app</p>
          <h1>Guides, suivi et communaute GTA VI au meme endroit.</h1>
          <p>Une interface simple pour suivre ta progression, lire les guides utiles, organiser la communaute et preparer les futures integrations officielles.</p>
          ${actionBar(`
            <a class="button primary" href="#tracking" data-route="tracking">Ouvrir mon suivi</a>
            <a class="button secondary" href="#guides" data-route="guides">Voir les guides</a>
          `)}
        </section>
        <section class="stats-grid">
          ${statCard(dashboard.knowledge.guides.length, "Guides")}
          ${statCard(dashboard.achievements.achievements.length, "Objectifs")}
          ${statCard(dashboard.profile.syncMode, "Source")}
          ${statCard(`${ready}/${state.platform.services.length}`, "Services")}
        </section>
        ${appSection(
          "Acces rapide",
          "Les actions les plus utiles restent visibles sans surcharger l'ecran.",
          `<div class="quick-grid">
            ${quickLink("guides", "Guides", "Roadmaps, securite, progression.")}
            ${quickLink("tracking", "Suivi", "Profil, completion, achievements.")}
            ${quickLink("community", "Communaute", "Posts, crews, reports.")}
            ${quickLink("account", "Compte", "Connexion, roles, comptes lies.")}
          </div>`
        )}
      </div>
    </section>
  `;
}
