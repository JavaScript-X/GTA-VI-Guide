import { panel, progressBar } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { achievementItem } from "../components/lists.ts";

export function trackingPage(state) {
  const profile = state.dashboard.profile;
  const character = profile.activeCharacter;
  const completionLabels = {
    story: "Histoire",
    onlineCareer: "Carriere Online",
    collectibles: "Collectibles",
    sideActivities: "Activites secondaires"
  };
  const profileGrid = `
    <div class="profile-grid">
      <div><span class="label">Personnage</span><strong>${character.name}</strong></div>
      <div><span class="label">Niveau</span><strong>${character.level}</strong></div>
      <div><span class="label">Crew</span><strong>${character.crew}</strong></div>
      <div><span class="label">Reputation</span><strong>${state.dashboard.identity.user.reputation}</strong></div>
      <div><span class="label">Cash</span><strong>$${character.cash}</strong></div>
      <div><span class="label">Banque</span><strong>$${character.bank}</strong></div>
      <div><span class="label">Vehicules</span><strong>${character.vehicles}</strong></div>
      <div><span class="label">Proprietes</span><strong>${character.properties}</strong></div>
    </div>
  `;
  const completion = Object.entries(profile.completion || {})
    .map(([key, value]) => `
      <article class="completion-item">
        <div class="item-title"><span>${completionLabels[key] || key}</span><strong>${value}%</strong></div>
        ${progressBar(value)}
      </article>
    `)
    .join("");
  return page(
    "tracking",
    `
      ${heading("Suivi", "Progression joueur", "Un tableau de bord pour suivre personnage, achievements, completion et origine des donnees.")}
      <div class="workspace">
        ${panel(state.dashboard.identity.user.displayName, "Compte joueur", profileGrid)}
        ${panel("Achievements", "Completion", `<div class="list">${state.dashboard.achievements.achievements.map(achievementItem).join("")}</div>`)}
      </div>
      <div class="tracking-grid">
        ${panel("Categories", "Progression", `<div class="progress-stack">${completion}</div>`)}
        ${panel("Modifier completion", "Manuel", `<form id="completion-form" class="stack-form"><label>Categorie<select name="category"><option value="story">Histoire</option><option value="onlineCareer">Carriere Online</option><option value="collectibles">Collectibles</option><option value="sideActivities">Activites secondaires</option></select></label><label>Progression<input name="value" type="number" min="0" max="100" step="1" value="50"></label><button class="button primary" type="submit">Enregistrer</button><p class="form-status" data-form-status="completion"></p></form>`)}
        ${panel("Source actuelle", "Donnees", `<div class="source-box"><strong>${profile.syncMode}</strong><p class="muted">Les donnees officielles seront activees uniquement via OAuth approuve.</p></div>`)}
      </div>
    `
  );
}
