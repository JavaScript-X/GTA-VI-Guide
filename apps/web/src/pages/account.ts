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
    <div class="auth-stage ${state.authMode === "signup" ? "is-signup" : ""}">
      <div class="auth-forms">
        <form class="auth-form auth-signin" id="login-form">
          <p class="eyebrow">Vice Access</p>
          <h2>Sign in</h2>
          <div class="provider-row">${providers}</div>
          <span class="auth-divider">ou utilise ton compte guide</span>
          <label>Email<input name="email" type="email" value="vice@example.com" autocomplete="email" /></label>
          <label>Mot de passe<input name="password" type="password" value="ChangeMe123!" autocomplete="current-password" /></label>
          <button class="button primary" type="submit">Entrer</button>
          <button class="text-button" type="button" data-auth-mode="signup">Creer un compte</button>
        </form>
        <form class="auth-form auth-signup" id="signup-form">
          <p class="eyebrow">Nouveau joueur</p>
          <h2>Sign up</h2>
          <div class="provider-row">${providers}</div>
          <span class="auth-divider">ou cree ton profil communautaire</span>
          <label>Pseudo<input name="displayName" required value="Vice Rookie" autocomplete="nickname" /></label>
          <label>Email<input name="email" type="email" required placeholder="player@example.com" autocomplete="email" /></label>
          <label>Mot de passe<input name="password" type="password" required minlength="8" placeholder="8 caracteres minimum" autocomplete="new-password" /></label>
          <button class="button primary" type="submit">Creer</button>
          <button class="text-button" type="button" data-auth-mode="signin">J'ai deja un compte</button>
        </form>
      </div>
      <div class="auth-overlay">
        <div class="retro-sun small"></div>
        <p class="eyebrow">GTA VI Guide</p>
        <h2>${state.authMode === "signup" ? "Bienvenue a Vice City" : "Retour sur Ocean Drive"}</h2>
        <p>${state.authMode === "signup" ? "Cree ton profil, prepare tes crews et garde le controle sur tes donnees." : "Connecte-toi pour suivre tes guides, achievements, reports et comptes lies."}</p>
        <button class="button secondary" type="button" data-auth-mode="${state.authMode === "signup" ? "signin" : "signup"}">${state.authMode === "signup" ? "Sign in" : "Sign up"}</button>
      </div>
    </div>
    <p class="form-status auth-status" data-form-status="auth"></p>
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
