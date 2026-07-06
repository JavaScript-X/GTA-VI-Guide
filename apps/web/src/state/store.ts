import { fallbackDashboard, fallbackPlatform } from "../data/fallback.ts";

export const store = {
  dashboard: fallbackDashboard,
  platform: fallbackPlatform,
  session: {
    accessToken: null,
    refreshToken: null,
    user: null
  },
  guideFilter: "all",
  communityFilter: "all",
  communitySearch: "",
  globalSearch: "",
  searchResults: null,
  moderation: {
    reports: [],
    auditEvents: [],
    loaded: false
  },
  authMode: "signin"
};

export function setSearchResults(query, results) {
  store.globalSearch = query;
  store.searchResults = results;
}

export function setModeration(data) {
  store.moderation = {
    reports: data.reports || [],
    auditEvents: data.auditEvents || [],
    loaded: true
  };
}

export function setDashboard(dashboard) {
  store.dashboard = dashboard;
}

export function setPlatform(platform) {
  store.platform = platform;
}

export function setSession(session) {
  store.session = session;
}

export function clearSession() {
  store.session = {
    accessToken: null,
    refreshToken: null,
    user: null
  };
}
