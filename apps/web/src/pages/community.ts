import { panel } from "../components/cards.ts";
import { heading, page } from "../components/layout.ts";

export function communityPage(state) {
  const feed = state.dashboard.community.feed
    .map((item) => `
      <article class="list-item">
        <div class="item-title"><span>${item.title}</span><span class="badge">${item.channel}</span></div>
        <p class="muted">${item.replies} reponses - score ${item.score}</p>
      </article>
    `)
    .join("");
  return page(
    "community",
    `
      ${heading("Communaute", "Discussions, crews et evenements", "Une base pour organiser la communaute autour des guides, crews, sessions et moderation.")}
      <div class="community-layout">
        ${panel("Activite recente", "Echanges", `<div class="list">${feed}</div>`)}
        ${panel("File de securite", "Moderation", `<div class="moderation-grid"><div><span class="metric small">0</span><span>reports ouverts</span></div><div><span class="metric small">on</span><span>mode pre-lancement</span></div></div>`)}
      </div>
    `
  );
}
