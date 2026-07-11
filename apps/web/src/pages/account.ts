import { page } from "../components/layout.ts";
import { t } from "../i18n.ts";

export function accountPage(state) {
  const locale = state.ui.locale;
  const user = state.session.user || state.dashboard.identity.user;
  const session = state.session.user
    ? `<div class="auth-session-pill is-authenticated"><strong>${state.session.user.displayName}</strong><span>${state.session.user.roles.join(", ")}</span></div>`
    : `<div class="auth-session-pill">${t(locale, "auth.guest")}</div>`;
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
        <section class="auth-card minimal ${state.authMode === "signup" ? "is-signup" : ""}">
          <div class="auth-brand">
            <span>VI</span>
            <div>
              <p class="eyebrow">${t(locale, "auth.brand")}</p>
              <h1>${state.authMode === "signup" ? t(locale, "auth.signup") : t(locale, "auth.signin")}</h1>
            </div>
          </div>
          <div class="auth-topline">
            ${session}
            <div class="auth-tabs" role="tablist">
              <button class="${state.authMode !== "signup" ? "is-active" : ""}" type="button" data-auth-mode="signin">${t(locale, "auth.signin")}</button>
              <button class="${state.authMode === "signup" ? "is-active" : ""}" type="button" data-auth-mode="signup">${t(locale, "auth.signup")}</button>
            </div>
          </div>
          <form class="auth-form ${state.authMode === "signup" ? "is-hidden" : ""}" id="login-form">
            <div class="provider-row">${providers}</div>
            <span class="auth-divider">${t(locale, "auth.orEmail")}</span>
            <label>${t(locale, "auth.email")}<input name="email" type="email" value="vice@example.com" autocomplete="email" /></label>
            <label>${t(locale, "auth.password")}<input name="password" type="password" value="ChangeMe123!" autocomplete="current-password" /></label>
            <button class="button primary wide" type="submit">${t(locale, "auth.submitSignin")}</button>
          </form>
          <form class="auth-form ${state.authMode === "signup" ? "" : "is-hidden"}" id="signup-form">
            <div class="provider-row">${providers}</div>
            <span class="auth-divider">${t(locale, "auth.orProfile")}</span>
            <label>${t(locale, "auth.displayName")}<input name="displayName" required value="Vice Rookie" autocomplete="nickname" /></label>
            <label>${t(locale, "auth.email")}<input name="email" type="email" required placeholder="player@example.com" autocomplete="email" /></label>
            <label>${t(locale, "auth.password")}<input name="password" type="password" required minlength="8" placeholder="8 caracteres minimum" autocomplete="new-password" /></label>
            <button class="button primary wide" type="submit">${t(locale, "auth.submitSignup")}</button>
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
