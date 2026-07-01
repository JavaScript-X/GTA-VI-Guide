import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";
import { accountItem } from "../components/lists.ts";

export function accountPage(state) {
  const user = state.session.user || state.dashboard.identity.user;
  const session = state.session.user
    ? `<div class="session-box is-authenticated"><strong>${state.session.user.displayName}</strong><span>${state.session.user.roles.join(", ")}</span><small>Session securisee active</small></div>`
    : `<div class="session-box">Session non connectee</div>`;
  const providers = ["PSN", "Xbox", "Rockstar"]
    .map((provider) => `<button class="provider-button" type="button" data-provider-auth="${provider.toLowerCase()}">${provider}</button>`)
    .join("");
  const form = `
    <div class="auth-card ${state.authMode === "signup" ? "is-signup" : ""}">
      <div class="auth-tabs" role="tablist">
        <button class="${state.authMode !== "signup" ? "is-active" : ""}" type="button" data-auth-mode="signin">Sign in</button>
        <button class="${state.authMode === "signup" ? "is-active" : ""}" type="button" data-auth-mode="signup">Sign up</button>
      </div>
      <form class="auth-form ${state.authMode === "signup" ? "is-hidden" : ""}" id="login-form">
        <h2>Connexion</h2>
        <div class="provider-row">${providers}</div>
        <span class="auth-divider">ou avec ton compte plateforme</span>
        <label>Email<input name="email" type="email" value="vice@example.com" autocomplete="email" /></label>
        <label>Mot de passe<input name="password" type="password" value="ChangeMe123!" autocomplete="current-password" /></label>
        <button class="button primary" type="submit">Se connecter</button>
      </form>
      <form class="auth-form ${state.authMode === "signup" ? "" : "is-hidden"}" id="signup-form">
        <h2>Creer un compte</h2>
        <div class="provider-row">${providers}</div>
        <span class="auth-divider">ou cree un profil communautaire</span>
        <label>Pseudo<input name="displayName" required value="Vice Rookie" autocomplete="nickname" /></label>
        <label>Email<input name="email" type="email" required placeholder="player@example.com" autocomplete="email" /></label>
        <label>Mot de passe<input name="password" type="password" required minlength="8" placeholder="8 caracteres minimum" autocomplete="new-password" /></label>
        <button class="button primary" type="submit">Creer le compte</button>
      </form>
    </div>
    <p class="form-status auth-status" data-form-status="auth"></p>
    ${session}
  `;
  return page(
    "account",
    `
      ${heading("Compte", "Connexion et comptes relies", "Connecte-toi, gere ta session, tes roles, tes consentements et les liens PSN, Xbox et Rockstar.")}
      <div class="account-layout simple">
        ${panel("Session joueur", "Authentification", form, "auth-panel")}
        ${panel("PSN, Xbox, Rockstar", "Liens externes", `<div class="account-list">${state.dashboard.identity.linkedAccounts.map(accountItem).join("")}</div>`)}
        ${panel("Permissions", "Roles", `<div class="role-list">${(user.roles || ["player"]).map((role) => `<span class="role-pill">${role}</span>`).join("")}</div>`)}
      </div>
    `
  );
}
