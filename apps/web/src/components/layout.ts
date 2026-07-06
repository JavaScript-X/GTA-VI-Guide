export const routes = [
  { id: "home", label: "Accueil", group: "main", icon: "V" },
  { id: "guides", label: "Guides", group: "main", icon: "G" },
  { id: "sources", label: "Intel", group: "main", icon: "I" },
  { id: "tracking", label: "Suivi", group: "main", icon: "S" },
  { id: "community", label: "Communaute", group: "main", icon: "C" },
  { id: "account", label: "Compte", group: "main", icon: "P" },
  { id: "achievements", label: "Achievements", group: "more", icon: "A" },
  { id: "map", label: "Carte", group: "more", icon: "M" },
  { id: "vehicles", label: "Vehicules", group: "more", icon: "V" },
  { id: "crews", label: "Crews", group: "more", icon: "K" },
  { id: "events", label: "Events", group: "more", icon: "E" },
  { id: "moderation", label: "Moderation", group: "more", icon: "!" },
  { id: "settings", label: "Parametres", group: "more", icon: "O" },
  { id: "platform", label: "Plateforme", group: "more", icon: "N" }
];

export function shell(content) {
  const primaryRoutes = routes.filter((route) => route.group === "main");
  const secondaryRoutes = routes.filter((route) => ["achievements", "map", "vehicles", "moderation", "platform"].includes(route.id));
  const allRoutes = [...primaryRoutes, ...secondaryRoutes];
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <button class="menu-toggle" type="button" data-menu-toggle aria-label="Ouvrir le menu">
          <span></span><span></span><span></span>
        </button>
        <a class="brand" href="#home" data-route="home"><span>VI</span><strong>Leonida Hub</strong></a>
        <nav class="nav" aria-label="Navigation principale">
          ${primaryRoutes.map(topNavLink).join("")}
          <details class="nav-more">
            <summary>Plus</summary>
            <div class="nav-menu">
              ${secondaryRoutes.map(topNavLink).join("")}
            </div>
          </details>
        </nav>
        <a class="topbar-account" href="#account" data-route="account">Compte</a>
      </div>
    </header>
    <div class="drawer-backdrop" data-menu-close></div>
    <aside class="mobile-drawer" aria-label="Menu mobile">
      <div class="drawer-head">
        <a class="brand" href="#home" data-route="home"><span>VI</span><strong>Leonida Hub</strong></a>
        <button class="drawer-close" type="button" data-menu-close aria-label="Fermer le menu">Fermer</button>
      </div>
      <nav class="drawer-nav">
        ${allRoutes.map(drawerLink).join("")}
      </nav>
    </aside>
    <div class="app-frame">
      <aside class="wiki-rail" aria-label="Menu wiki">
        <a class="brand rail-brand" href="#home" data-route="home"><span>VI</span><strong>Leonida Hub</strong></a>
        <div class="rail-block">
          <p class="rail-title">Menu</p>
          ${primaryRoutes.map(railLink).join("")}
        </div>
        <div class="rail-block">
          <p class="rail-title">Outils</p>
          ${secondaryRoutes.map(railLink).join("")}
        </div>
        <div class="rail-card">
          <span>Release watch</span>
          <strong>19 Nov 2026</strong>
          <small>PS5 / Xbox Series X|S</small>
        </div>
      </aside>
      <main class="content-stage">${content}</main>
    </div>
  `;
}

function topNavLink(route) {
  return `<a href="#${route.id}" data-route="${route.id}">${route.label}</a>`;
}

function railLink(route) {
  return `<a class="rail-link" href="#${route.id}" data-route="${route.id}"><span>${route.icon}</span>${route.label}</a>`;
}

function drawerLink(route) {
  return `<a href="#${route.id}" data-route="${route.id}"><span>${route.icon}</span>${route.label}</a>`;
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
