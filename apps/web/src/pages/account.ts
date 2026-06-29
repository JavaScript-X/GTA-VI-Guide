import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { accountItem } from "../components/lists.ts";

export function accountPage(state) {
  const user = state.session.user || state.dashboard.identity.user;
  const session = state.session.user
    ? `<div class="session-box is-authenticated"><strong>${state.session.user.displayName}</strong><span>${state.session.user.roles.join(", ")}</span><small>Access token actif</small></div>`
    : `<div class="session-box">Session non connectee</div>`;
  const form = `
    <form class="login-form" id="login-form">
      <label>Email<input name="email" type="email" value="vice@example.com" autocomplete="email" /></label>
      <label>Mot de passe<input name="password" type="password" value="ChangeMe123!" autocomplete="current-password" /></label>
      <div class="form-actions">
        <button class="button primary" type="submit">Connexion</button>
        <button class="button ghost" id="logout-button" type="button">Logout</button>
      </div>
    </form>
    ${session}
  `;
  return page(
    "account",
    `
      ${heading("Compte", "Connexion et comptes relies", "Connecte-toi, gere ta session, tes roles, tes consentements et les liens PSN, Xbox et Rockstar.")}
      <div class="account-layout">
        ${panel("Session joueur", "Authentification", form, "auth-panel")}
        ${panel("PSN, Xbox, Rockstar", "Liens externes", `<div class="account-list">${state.dashboard.identity.linkedAccounts.map(accountItem).join("")}</div>`)}
        ${panel("Permissions", "Roles", `<div class="role-list">${(user.roles || ["player"]).map((role) => `<span class="role-pill">${role}</span>`).join("")}</div>`)}
      </div>
    `
  );
}
