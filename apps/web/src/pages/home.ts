import { featureCard, statCard } from "../components/cards.ts";

export function homePage(state) {
  const dashboard = state.dashboard;
  const ready = state.platform.services.filter((service) => service.status === "ready").length;
  return `
    <section class="page is-active" data-page="home">
      <div class="hero">
        <div class="hero-content">
          <p class="eyebrow">Vice nights community network</p>
          <h1>Le hub pour suivre, apprendre et jouer ensemble.</h1>
          <p class="hero-copy">
            Guides verifies, progression Online, achievements, crews, comptes relies
            et infrastructure prete pour les futures integrations officielles.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#tracking" data-route="tracking">Voir mon suivi</a>
            <a class="button secondary" href="#guides" data-route="guides">Explorer les guides</a>
          </div>
        </div>
        <div class="retro-sun" aria-hidden="true"></div>
      </div>
      <section class="status-strip">
        ${statCard(dashboard.knowledge.guides.length, "guides")}
        ${statCard(dashboard.achievements.achievements.length, "achievements")}
        ${statCard(dashboard.profile.syncMode, "sync actuelle")}
        ${statCard(`${ready}/${state.platform.services.length}`, "services prets")}
      </section>
      <section class="dashboard-overview">
        <div class="section-heading">
          <p class="eyebrow">Vue d'ensemble</p>
          <h2>Tout ce dont un joueur aura besoin au lancement</h2>
        </div>
        <div class="feature-grid">
          ${featureCard("G", "Guides communautaires", "Roadmaps, astuces, securite, argent, crews et completion.")}
          ${featureCard("S", "Suivi joueur", "Profil, personnage, achievements, collectibles et sources de donnees.")}
          ${featureCard("M", "Carte interactive", "Quartiers, points d'interet, secrets et progression par zone.")}
          ${featureCard("P", "Plateforme deployable", "Microservices, PostgreSQL, monitoring, reverse proxy et Kubernetes.")}
        </div>
      </section>
    </section>
  `;
}
