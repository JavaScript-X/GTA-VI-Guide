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
  authMode: "signin"
};

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
