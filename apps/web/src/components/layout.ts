export const routes = [
  { id: "home", label: "Accueil" },
  { id: "guides", label: "Guides" },
  { id: "tracking", label: "Suivi" },
  { id: "achievements", label: "Achievements" },
  { id: "map", label: "Carte" },
  { id: "vehicles", label: "Vehicules" },
  { id: "crews", label: "Crews" },
  { id: "events", label: "Events" },
  { id: "community", label: "Communaute" },
  { id: "account", label: "Compte" },
  { id: "settings", label: "Parametres" },
  { id: "platform", label: "Plateforme" }
];

export function shell(content) {
  return `
    <header class="topbar">
      <a class="brand" href="#home" data-route="home">GTA VI Guide</a>
      <nav class="nav" aria-label="Navigation principale">
        ${routes.map((route) => `<a href="#${route.id}" data-route="${route.id}">${route.label}</a>`).join("")}
      </nav>
    </header>
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
