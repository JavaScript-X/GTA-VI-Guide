export function panel(title, eyebrow, content, className = "") {
  return `
    <article class="panel ${className}">
      <div class="panel-heading">
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
      </div>
      ${content}
    </article>
  `;
}

export function appSection(title, copy, content = "", className = "") {
  return `
    <section class="app-section ${className}">
      <div class="section-title">
        <h2>${title}</h2>
        ${copy ? `<p>${copy}</p>` : ""}
      </div>
      ${content}
    </section>
  `;
}

export function featureCard(icon, title, copy) {
  return `
    <article class="feature-card">
      <span class="feature-icon">${icon}</span>
      <h3>${title}</h3>
      <p>${copy}</p>
    </article>
  `;
}

export function statCard(value, label) {
  return `
    <article class="stat-card">
      <span class="metric">${value}</span>
      <span>${label}</span>
    </article>
  `;
}

export function quickLink(route, title, copy) {
  return `
    <a class="quick-link" href="#${route}" data-route="${route}">
      <strong>${title}</strong>
      <span>${copy}</span>
    </a>
  `;
}

export function emptyState(title, copy) {
  return `<div class="empty-state"><strong>${title}</strong><p>${copy}</p></div>`;
}

export function badge(text) {
  return `<span class="badge">${text}</span>`;
}

export function progressBar(value) {
  return `<div class="progress"><span style="width: ${value}%"></span></div>`;
}
