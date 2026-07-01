export const routes = [
  { id: "home", label: "Accueil", group: "main" },
  { id: "guides", label: "Guides", group: "main" },
  { id: "tracking", label: "Suivi", group: "main" },
  { id: "community", label: "Communaute", group: "main" },
  { id: "account", label: "Compte", group: "main" },
  { id: "achievements", label: "Achievements", group: "more" },
  { id: "map", label: "Carte", group: "more" },
  { id: "vehicles", label: "Vehicules", group: "more" },
  { id: "crews", label: "Crews", group: "more" },
  { id: "events", label: "Events", group: "more" },
  { id: "settings", label: "Parametres", group: "more" },
  { id: "platform", label: "Plateforme", group: "more" }
];

export function shell(content) {
  const primaryRoutes = routes.filter((route) => route.group === "main");
  const secondaryRoutes = routes.filter((route) => route.group === "more");
  const allRoutes = [...primaryRoutes, ...secondaryRoutes];
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#home" data-route="home"><span>VI</span> Guide</a>
        <button class="menu-toggle" type="button" data-menu-toggle aria-label="Ouvrir le menu">
          <span></span><span></span><span></span>
        </button>
        <nav class="nav" aria-label="Navigation principale">
          ${primaryRoutes.map((route) => `<a href="#${route.id}" data-route="${route.id}">${route.label}</a>`).join("")}
          <details class="nav-more">
            <summary>Plus</summary>
            <div class="nav-menu">
              ${secondaryRoutes.map((route) => `<a href="#${route.id}" data-route="${route.id}">${route.label}</a>`).join("")}
            </div>
          </details>
        </nav>
      </div>
    </header>
    <div class="drawer-backdrop" data-menu-close></div>
    <aside class="mobile-drawer" aria-label="Menu mobile">
      <div class="drawer-head">
        <a class="brand" href="#home" data-route="home"><span>VI</span> Guide</a>
        <button class="drawer-close" type="button" data-menu-close aria-label="Fermer le menu">Fermer</button>
      </div>
      <nav class="drawer-nav">
        ${allRoutes.map((route) => `<a href="#${route.id}" data-route="${route.id}">${route.label}</a>`).join("")}
      </nav>
    </aside>
    <main>${content}</main>
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
