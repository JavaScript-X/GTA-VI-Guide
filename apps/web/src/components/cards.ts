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
    <div>
      <span class="metric">${value}</span>
      <span>${label}</span>
    </div>
  `;
}

export function badge(text) {
  return `<span class="badge">${text}</span>`;
}

export function progressBar(value) {
  return `<div class="progress"><span style="width: ${value}%"></span></div>`;
}
