export function skeletonBlock(className = "") {
  return `<span class="skeleton ${className}" aria-hidden="true"></span>`;
}

export function skeletonCard(lines = 3) {
  const rows = Array.from({ length: lines }, (_, index) =>
    skeletonBlock(index === 0 ? "skeleton-title" : "skeleton-line")
  ).join("");
  return `<article class="skeleton-card">${rows}</article>`;
}

export function skeletonGrid(count = 4, lines = 3) {
  return `<div class="skeleton-grid">${Array.from({ length: count }, () => skeletonCard(lines)).join("")}</div>`;
}

import { t } from "../i18n.ts";

export function loadingOverlay(isVisible, locale = "fr") {
  return `
    <div class="boot-loader ${isVisible ? "is-visible" : ""}" aria-live="polite" aria-busy="${isVisible}">
      <div class="loader-mark"><span>VI</span></div>
      <strong>Leonida Hub</strong>
      <small>${t(locale, "loader.copy")}</small>
    </div>
  `;
}

export function bootSkeletonPage() {
  return `
    <section class="page page-shell is-active" data-page="home">
      <div class="home-shell">
        <section class="store-hero skeleton-hero">
          <div class="hero-media">${skeletonBlock("skeleton-badge")}</div>
          <div class="hero-copy">
            ${skeletonBlock("skeleton-kicker")}
            ${skeletonBlock("skeleton-heading")}
            ${skeletonBlock("skeleton-line wide")}
            ${skeletonBlock("skeleton-line")}
            <div class="skeleton-actions">
              ${skeletonBlock("skeleton-button")}
              ${skeletonBlock("skeleton-button")}
            </div>
          </div>
        </section>
        ${skeletonGrid(4, 2)}
        ${skeletonGrid(6, 3)}
      </div>
    </section>
  `;
}
