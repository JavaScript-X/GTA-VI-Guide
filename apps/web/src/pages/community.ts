import { panel } from "../components/cards.ts";
import { filterToolbar } from "../components/filters.ts";
import { heading, page } from "../components/layout.ts";

export function communityPage(state) {
  const filters = ["all", ...new Set(state.dashboard.community.feed.map((item) => item.channel))];
  const query = (state.communitySearch || "").trim().toLowerCase();
  const filteredItems = state.dashboard.community.feed.filter((item) => {
    const matchesChannel = state.communityFilter === "all" || item.channel === state.communityFilter;
    const searchable = `${item.title || ""} ${item.body || ""} ${item.channel || ""}`.toLowerCase();
    return matchesChannel && (!query || searchable.includes(query));
  });
  const postOptions = state.dashboard.community.feed
    .map((item) => `<option value="${item.id}">${item.title}</option>`)
    .join("");
  const feed = filteredItems.length
    ? filteredItems
    .map((item) => `
      <article class="list-item">
        <div class="item-title"><span>${item.title}</span><span class="badge">${item.channel}</span></div>
        <p class="muted">${item.replies || item.comments || 0} reponses - score ${item.score} - ${item.reactions || 0} reactions</p>
        <div class="form-actions">
          <button class="button ghost compact" type="button" data-react-post="${item.id}">Reagir</button>
          <button class="button ghost compact" type="button" data-report-post="${item.id}">Signaler</button>
        </div>
      </article>
    `)
    .join("")
    : `<div class="empty-state"><h3>Aucun post trouve</h3><p>Essaie un autre channel ou une recherche plus courte.</p></div>`;
  return page(
    "community",
    `
      ${heading("Communaute", "Discussions, crews et evenements", "Une base pour organiser la communaute autour des guides, crews, sessions et moderation.")}
      <div class="community-layout">
        ${panel(
          "Activite recente",
          "Echanges",
          `${filterToolbar({
            filters,
            active: state.communityFilter,
            filterAttr: "data-community-filter",
            query: state.communitySearch,
            queryName: "community",
            placeholder: "Chercher un post, crew ou event"
          })}<div class="list">${feed}</div>`
        )}
        ${panel("Nouveau post", "Contribution", `<form id="community-post-form" class="stack-form"><label>Titre<input name="title" required placeholder="Ex: Recherche crew exploration"></label><label>Channel<select name="channel"><option value="general">general</option><option value="guides">guides</option><option value="crews">crews</option><option value="events">events</option></select></label><label>Message<textarea name="body" rows="5" placeholder="Detaille ta question ou ton annonce"></textarea></label><button class="button primary" type="submit">Publier</button><p class="form-status" data-form-status="post"></p></form>`)}
        ${panel("Commenter", "Reponses", `<form id="community-comment-form" class="stack-form"><label>Post<select name="postId">${postOptions}</select></label><label>Commentaire<textarea name="body" rows="3" placeholder="Ajoute une reponse utile"></textarea></label><button class="button secondary" type="submit">Commenter</button><p class="form-status" data-form-status="comment"></p></form>`)}
        ${panel("File de securite", "Moderation", `<div class="moderation-grid"><div><span class="metric small">${state.dashboard.community.moderation?.reportsOpen || 0}</span><span>reports ouverts</span></div><div><span class="metric small">on</span><span>${state.dashboard.community.moderation?.mode || "pre-lancement"}</span></div></div><p class="form-status" data-form-status="report"></p>`)}
      </div>
    `
  );
}
