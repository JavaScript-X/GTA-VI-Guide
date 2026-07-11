import { fallbackDashboard, fallbackPlatform } from "../data/fallback.ts";

export const store = {
  ui: {
    isBooting: true,
    loading: {}
  },
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
  sourceFilter: "all",
  sourceSearch: "",
  globalSearch: "",
  searchResults: null,
  moderation: {
    reports: [],
    auditEvents: [],
    loaded: false
  },
  authMode: "signin",
  launchChecklist: [
    { id: "link-account", label: "Preparer les comptes PSN/Xbox/Rockstar", done: false },
    { id: "read-sources", label: "Verifier les sources officielles GTA VI", done: false },
    { id: "track-progress", label: "Initialiser le suivi joueur", done: false },
    { id: "join-community", label: "Rejoindre une crew ou discussion", done: false }
  ]
};

export function setBooting(isBooting) {
  store.ui = {
    ...store.ui,
    isBooting
  };
}

export function setLoading(key, value) {
  store.ui = {
    ...store.ui,
    loading: {
      ...store.ui.loading,
      [key]: value
    }
  };
}

export function setLaunchChecklist(items) {
  store.launchChecklist = items;
}

export function toggleLaunchChecklistItem(id) {
  store.launchChecklist = store.launchChecklist.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
}

export function setSources(payload) {
  store.dashboard.knowledge = {
    ...store.dashboard.knowledge,
    sources: payload.sources || []
  };
}

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
