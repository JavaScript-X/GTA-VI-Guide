function escapeAttribute(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function filterToolbar({ filters, active, filterAttr, query = "", queryName, placeholder }) {
  const chips = filters
    .map(
      (filter) =>
        `<button class="chip ${active === filter ? "is-active" : ""}" type="button" ${filterAttr}="${filter}">${filter}</button>`
    )
    .join("");

  return `
    <div class="toolbar search-toolbar">
      <div class="chip-row">${chips}</div>
      <form class="filter-search" data-filter-search="${queryName}">
        <input name="query" value="${escapeAttribute(query)}" placeholder="${escapeAttribute(placeholder)}" />
        <button class="button secondary compact" type="submit">Rechercher</button>
      </form>
    </div>
  `;
}
