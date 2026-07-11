import { loadingOverlay } from "./skeletons.ts";
import { languageDir, languages, t } from "../i18n.ts";

export const routes = [
  { id: "home", labelKey: "nav.home", group: "main", icon: "V" },
  { id: "guides", labelKey: "nav.guides", group: "main", icon: "G" },
  { id: "sources", labelKey: "nav.sources", group: "main", icon: "I" },
  { id: "tracking", labelKey: "nav.tracking", group: "main", icon: "S" },
  { id: "community", labelKey: "nav.community", group: "main", icon: "C" },
  { id: "account", labelKey: "nav.account", group: "main", icon: "P" },
  { id: "achievements", labelKey: "nav.achievements", group: "more", icon: "A" },
  { id: "map", labelKey: "nav.map", group: "more", icon: "M" },
  { id: "vehicles", labelKey: "nav.vehicles", group: "more", icon: "V" },
  { id: "crews", labelKey: "nav.crews", group: "more", icon: "K" },
  { id: "events", labelKey: "nav.events", group: "more", icon: "E" },
  { id: "moderation", labelKey: "nav.moderation", group: "more", icon: "!" },
  { id: "settings", labelKey: "nav.settings", group: "more", icon: "O" },
  { id: "platform", labelKey: "nav.platform", group: "more", icon: "N" }
];

export function shell(content, isBooting = false, locale = "fr") {
  const primaryRoutes = routes.filter((route) => route.group === "main");
  const secondaryRoutes = routes.filter((route) => ["achievements", "map", "vehicles", "crews", "events", "moderation", "platform"].includes(route.id));
  const allRoutes = [...primaryRoutes, ...secondaryRoutes];
  return `
    <div class="locale-root" dir="${languageDir(locale)}" lang="${locale}">
    <header class="topbar">
      <div class="topbar-inner">
        <button class="menu-toggle" type="button" data-menu-toggle aria-label="${t(locale, "nav.openMenu")}">
          <span></span><span></span><span></span>
        </button>
        <a class="brand" href="#home" data-route="home"><span>VI</span><strong>Leonida Hub</strong></a>
        <nav class="nav" aria-label="Navigation principale">
          ${primaryRoutes.map((route) => topNavLink(route, locale)).join("")}
          <details class="nav-more">
            <summary>${t(locale, "nav.more")}</summary>
            <div class="nav-menu">
              ${secondaryRoutes.map((route) => topNavLink(route, locale)).join("")}
            </div>
          </details>
        </nav>
        ${languageSelect(locale)}
        <a class="topbar-account" href="#account" data-route="account">${t(locale, "nav.account")}</a>
      </div>
    </header>
    <div class="drawer-backdrop" data-menu-close></div>
    <aside class="mobile-drawer" aria-label="Menu mobile">
      <div class="drawer-head">
        <a class="brand" href="#home" data-route="home"><span>VI</span><strong>Leonida Hub</strong></a>
        <button class="drawer-close" type="button" data-menu-close aria-label="${t(locale, "nav.close")}">${t(locale, "nav.close")}</button>
      </div>
      <nav class="drawer-nav">
        ${languageSelect(locale)}
        ${allRoutes.map((route) => drawerLink(route, locale)).join("")}
      </nav>
    </aside>
    <div class="app-frame">
      <aside class="wiki-rail" aria-label="Menu wiki">
        <a class="brand rail-brand" href="#home" data-route="home"><span>VI</span><strong>Leonida Hub</strong></a>
        <div class="rail-block">
          <p class="rail-title">${t(locale, "nav.menu")}</p>
          ${primaryRoutes.map((route) => railLink(route, locale)).join("")}
        </div>
        <div class="rail-block">
          <p class="rail-title">${t(locale, "nav.tools")}</p>
          ${secondaryRoutes.map((route) => railLink(route, locale)).join("")}
        </div>
        <div class="rail-card">
          <span>Release watch</span>
          <strong>19 Nov 2026</strong>
          <small>PS5 / Xbox Series X|S</small>
        </div>
      </aside>
      <main class="content-stage">${content}</main>
    </div>
    ${loadingOverlay(isBooting, locale)}
    </div>
  `;
}

function routeLabel(route, locale) {
  return t(locale, route.labelKey);
}

function topNavLink(route, locale) {
  return `<a href="#${route.id}" data-route="${route.id}">${routeLabel(route, locale)}</a>`;
}

function railLink(route, locale) {
  return `<a class="rail-link" href="#${route.id}" data-route="${route.id}"><span>${route.icon}</span>${routeLabel(route, locale)}</a>`;
}

function drawerLink(route, locale) {
  return `<a href="#${route.id}" data-route="${route.id}"><span>${route.icon}</span>${routeLabel(route, locale)}</a>`;
}

function languageSelect(locale) {
  return `
    <label class="language-select" title="${t(locale, "lang.label")}">
      <span>${t(locale, "lang.label")}</span>
      <select data-locale-select aria-label="${t(locale, "lang.label")}">
        ${languages.map((language) => `<option value="${language.code}" ${language.code === locale ? "selected" : ""}>${language.short}</option>`).join("")}
      </select>
    </label>
  `;
}

export function page(id, content) {
  return `<section class="page page-shell" data-page="${id}">${content}</section>`;
}

export function heading(eyebrow, title, copy) {
  return `
    <div class="page-heading">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${copy}</p>
    </div>
  `;
}

export function appGrid(content, variant = "") {
  return `<div class="app-grid ${variant}">${content}</div>`;
}

export function splitLayout(main, aside = "") {
  return `<div class="split-layout"><div class="main-column">${main}</div><aside class="side-column">${aside}</aside></div>`;
}

export function actionBar(content) {
  return `<div class="action-bar">${content}</div>`;
}
