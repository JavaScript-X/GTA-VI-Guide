import { shell } from "./components/layout.ts";
import { setDashboard, setPlatform, setSession, clearSession, store } from "./state/store.ts";
import {
  createCommunityPost,
  createGuide,
  loadDashboard,
  loadPlatform,
  login,
  reportCommunityPost,
  updateAchievementProgress,
  updateProfileCompletion
} from "./services/api.ts";
import { homePage } from "./pages/home.ts";
import { guidesPage } from "./pages/guides.ts";
import { trackingPage } from "./pages/tracking.ts";
import { accountPage } from "./pages/account.ts";
import { communityPage } from "./pages/community.ts";
import { platformPage } from "./pages/platform.ts";
import { achievementsPage } from "./pages/achievements.ts";
import { mapPage } from "./pages/map.ts";
import { vehiclesPage } from "./pages/vehicles.ts";
import { crewsPage } from "./pages/crews.ts";
import { eventsPage } from "./pages/events.ts";
import { settingsPage } from "./pages/settings.ts";

export function renderApp() {
  const app = document.querySelector("#app");
  app.innerHTML = shell(
    [
      homePage(store),
      guidesPage(store),
      trackingPage(store),
      achievementsPage(store),
      mapPage(store),
      vehiclesPage(store),
      crewsPage(store),
      eventsPage(store),
      communityPage(store),
      accountPage(store),
      settingsPage(store),
      platformPage(store)
    ].join("")
  );
  bindInteractions();
  navigate(currentRoute());
}

function currentRoute() {
  return window.location.hash.replace("#", "") || "home";
}

function navigate(route) {
  const page = route || "home";
  document.querySelectorAll(".page").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.page === page);
  });
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("is-current", link.dataset.route === page);
  });
  if (window.location.hash !== `#${page}`) {
    window.history.replaceState(null, "", `#${page}`);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

async function refreshDashboard(route) {
  const dashboard = await loadDashboard();
  setDashboard(dashboard.data);
  renderApp();
  navigate(route);
}

function setFormStatus(name, message, isError = false) {
  const box = document.querySelector(`[data-form-status="${name}"]`);
  if (!box) {
    return;
  }
  box.textContent = message;
  box.classList.toggle("is-error", isError);
}

function bindInteractions() {
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.route);
    });
  });

  document.querySelectorAll("[data-guide-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      store.guideFilter = button.dataset.guideFilter;
      renderApp();
      navigate("guides");
    });
  });

  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      try {
        const payload = await login(formData.get("email"), formData.get("password"));
        setSession({
          user: payload.data.user,
          accessToken: payload.data.session.accessToken,
          refreshToken: payload.data.session.refreshToken
        });
        renderApp();
        navigate("account");
      } catch (error) {
        const box = document.querySelector(".session-box");
        box.textContent = `Connexion impossible: ${error.message}`;
      }
    });
  }

  const logoutButton = document.querySelector("#logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearSession();
      renderApp();
      navigate("account");
    });
  }

  const guideForm = document.querySelector("#guide-form");
  if (guideForm) {
    guideForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(guideForm);
      try {
        await createGuide({
          title: formData.get("title"),
          summary: formData.get("summary"),
          tags: String(formData.get("tags") || "")
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean)
        });
        await refreshDashboard("guides");
        setFormStatus("guide", "Guide ajoute en brouillon.");
      } catch (error) {
        setFormStatus("guide", `Erreur: ${error.message}`, true);
      }
    });
  }

  const postForm = document.querySelector("#community-post-form");
  if (postForm) {
    postForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(postForm);
      try {
        await createCommunityPost({
          title: formData.get("title"),
          channel: formData.get("channel"),
          body: formData.get("body")
        });
        await refreshDashboard("community");
        setFormStatus("post", "Post publie dans le feed.");
      } catch (error) {
        setFormStatus("post", `Erreur: ${error.message}`, true);
      }
    });
  }

  document.querySelectorAll("[data-report-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await reportCommunityPost(button.dataset.reportPost, "Signalement utilisateur depuis le frontend");
        await refreshDashboard("community");
        setFormStatus("report", "Signalement envoye a la moderation.");
      } catch (error) {
        setFormStatus("report", `Erreur: ${error.message}`, true);
      }
    });
  });

  const achievementForm = document.querySelector("#achievement-progress-form");
  if (achievementForm) {
    achievementForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(achievementForm);
      try {
        await updateAchievementProgress(formData.get("id"), Number(formData.get("progress")));
        await refreshDashboard("achievements");
        setFormStatus("achievement", "Progression achievement mise a jour.");
      } catch (error) {
        setFormStatus("achievement", `Erreur: ${error.message}`, true);
      }
    });
  }

  const completionForm = document.querySelector("#completion-form");
  if (completionForm) {
    completionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(completionForm);
      try {
        await updateProfileCompletion({
          [formData.get("category")]: Number(formData.get("value"))
        });
        await refreshDashboard("tracking");
        setFormStatus("completion", "Completion joueur mise a jour.");
      } catch (error) {
        setFormStatus("completion", `Erreur: ${error.message}`, true);
      }
    });
  }
}

export async function bootstrap() {
  window.addEventListener("hashchange", () => navigate(currentRoute()));
  renderApp();
  try {
    const dashboard = await loadDashboard();
    setDashboard(dashboard.data);
  } catch (error) {
    console.warn("Using fallback dashboard data", error);
  }
  try {
    const platform = await loadPlatform();
    setPlatform(platform.data);
  } catch (error) {
    console.warn("Using fallback platform data", error);
  }
  renderApp();
}
