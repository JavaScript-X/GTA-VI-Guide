import { badge, progressBar } from "./cards.ts";

export function guideCard(guide) {
  return `
    <article class="guide-card">
      <div class="item-title">
        <span>${guide.title}</span>
        ${badge(guide.status)}
      </div>
      <p class="muted">${guide.summary}</p>
      <div class="tag-row">${(guide.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
      <div class="form-actions">
        <button class="button ghost compact" type="button" data-guide-edit="${guide.id}">Relecture</button>
        <button class="button ghost compact" type="button" data-guide-delete="${guide.id}">Supprimer</button>
      </div>
    </article>
  `;
}

export function achievementItem(achievement) {
  return `
    <article class="list-item">
      <div class="item-title">
        <span>${achievement.title}</span>
        ${badge(achievement.category)}
      </div>
      ${progressBar(achievement.progress)}
    </article>
  `;
}

export function accountItem(account) {
  return `
    <article class="account-item">
      <div class="item-title">
        <span>${account.provider.toUpperCase()}</span>
        ${badge(account.status)}
      </div>
      <p class="muted">${account.handle || "Connexion a preparer"}</p>
    </article>
  `;
}

export function checkItem(item) {
  return `
    <article class="check-item">
      <div>
        <strong>${item.label || item.provider}</strong>
        <p class="muted">${item.detail || item.dataSource || "Pret pour integration production"}</p>
      </div>
      ${badge(item.status || item.mode)}
    </article>
  `;
}
