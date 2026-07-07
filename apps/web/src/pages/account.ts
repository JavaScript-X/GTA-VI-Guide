import { page } from "../components/layout.ts";

export function accountPage(state) {
  const user = state.session.user || state.dashboard.identity.user;
  const session = state.session.user
    ? `<div class="auth-session-pill is-authenticated"><strong>${state.session.user.displayName}</strong><span>${state.session.user.roles.join(", ")}</span></div>`
    : `<div class="auth-session-pill">Session invite</div>`;
  const providers = ["PSN", "Xbox", "Rockstar"]
    .map((provider) => `<button class="provider-button" type="button" data-provider-auth="${provider.toLowerCase()}"><span>${provider[0]}</span>${provider}</button>`)
    .join("");
  const linked = state.dashboard.identity.linkedAccounts
    .map((account) => `<span>${account.provider}: ${account.status}</span>`)
    .join("");
  return page(
    "account",
    `
      <div class="auth-minimal-shell">
        <section class="auth-visual">
          <p class="eyebrow">Vice access</p>
          <h1>${state.authMode === "signup" ? "Creer ton profil." : "Connexion au hub."}</h1>
          <p>Un acces simple pour suivre ton profil, tes guides, tes sources et tes futures synchronisations officielles.</p>
          <a class="asset-credit" href="https://www.rockstargames.com/VI" target="_blank" rel="noreferrer">Assets officiels via Rockstar</a>
        </section>
        <section class="auth-card minimal ${state.authMode === "signup" ? "is-signup" : ""}">
          <div class="auth-topline">
            ${session}
            <div class="auth-tabs" role="tablist">
              <button class="${state.authMode !== "signup" ? "is-active" : ""}" type="button" data-auth-mode="signin">Sign in</button>
              <button class="${state.authMode === "signup" ? "is-active" : ""}" type="button" data-auth-mode="signup">Sign up</button>
            </div>
          </div>
          <form class="auth-form ${state.authMode === "signup" ? "is-hidden" : ""}" id="login-form">
            <div class="provider-row">${providers}</div>
            <span class="auth-divider">ou email</span>
            <label>Email<input name="email" type="email" value="vice@example.com" autocomplete="email" /></label>
            <label>Mot de passe<input name="password" type="password" value="ChangeMe123!" autocomplete="current-password" /></label>
            <button class="button primary wide" type="submit">Se connecter</button>
          </form>
          <form class="auth-form ${state.authMode === "signup" ? "" : "is-hidden"}" id="signup-form">
            <div class="provider-row">${providers}</div>
            <span class="auth-divider">ou nouveau profil</span>
            <label>Pseudo<input name="displayName" required value="Vice Rookie" autocomplete="nickname" /></label>
            <label>Email<input name="email" type="email" required placeholder="player@example.com" autocomplete="email" /></label>
            <label>Mot de passe<input name="password" type="password" required minlength="8" placeholder="8 caracteres minimum" autocomplete="new-password" /></label>
            <button class="button primary wide" type="submit">Creer le compte</button>
          </form>
          <p class="form-status auth-status" data-form-status="auth"></p>
          <div class="auth-meta">
            <strong>${user.displayName || "Vice Player"}</strong>
            <span>${(user.roles || ["player"]).join(", ")}</span>
            <small>${linked}</small>
          </div>
        </section>
      </div>
    `
  );
}
