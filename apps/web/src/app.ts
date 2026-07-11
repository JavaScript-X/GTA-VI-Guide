import { shell } from "./components/layout.ts";
import {
  setDashboard,
  setPlatform,
  setSession,
  clearSession,
  setModeration,
  setSearchResults,
  setSources,
  setLaunchChecklist,
  setBooting,
  setLoading,
  toggleLaunchChecklistItem,
  store
} from "./state/store.ts";
import { bootSkeletonPage } from "./components/skeletons.ts";
import {
  createCommunityPost,
  createComment,
  createCrew,
  createEvent,
  createGuide,
  deleteComment,
  deleteCrew,
  deleteEvent,
  deleteGuide,
  deleteAccount,
  loadAuditLog,
  loadDashboard,
  loadPlatform,
  loadReports,
  loadSources,
  login,
  moderatePost,
  reactToPost,
  register,
  reportCommunityPost,
  resolveReport,
  searchPlatform,
  updateComment,
  updateCrew,
  updateEvent,
  updateGuide,
  updateAchievementProgress,
  updateProfileCompletion
} from "./services/api.ts";
import { homePage } from "./pages/home.ts";
import { guidesPage } from "./pages/guides.ts";
import { sourcesPage } from "./pages/sources.ts";
import { trackingPage } from "./pages/tracking.ts";
import { accountPage } from "./pages/account.ts";
import { communityPage } from "./pages/community.ts";
import { platformPage } from "./pages/platform.ts";
import { achievementsPage } from "./pages/achievements.ts";
import { mapPage } from "./pages/map.ts";
import { vehiclesPage } from "./pages/vehicles.ts";
import { crewsPage } from "./pages/crews.ts";
import { eventsPage } from "./pages/events.ts";
import { moderationPage } from "./pages/moderation.ts";
import { settingsPage } from "./pages/settings.ts";

export function renderApp() {
  const app = document.querySelector("#app");
  const content = store.ui.isBooting
    ? bootSkeletonPage()
    : [
        homePage(store),
        guidesPage(store),
        sourcesPage(store),
        trackingPage(store),
        achievementsPage(store),
        mapPage(store),
        vehiclesPage(store),
        crewsPage(store),
        eventsPage(store),
        moderationPage(store),
        communityPage(store),
        accountPage(store),
        settingsPage(store),
        platformPage(store)
      ].join("");
  app.innerHTML = shell(
    content,
    store.ui.isBooting
  );
  bindInteractions();
  navigate(store.ui.isBooting ? "home" : currentRoute());
}

function currentRoute() {
  return window.location.hash.replace("#", "") || "home";
}

function navigate(route) {
  const page = route || "home";
  document.body.classList.remove("menu-open");
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
  setLoading("dashboard", true);
  renderApp();
  navigate(route);
  try {
    const dashboard = await loadDashboard();
    setDashboard(dashboard.data);
  } finally {
    setLoading("dashboard", false);
    renderApp();
    navigate(route);
  }
}

function setFormStatus(name, message, isError = false) {
  const box = document.querySelector(`[data-form-status="${name}"]`);
  if (!box) {
    return;
  }
  box.textContent = message;
  box.classList.toggle("is-error", isError);
}

function localSearch(query) {
  const normalized = String(query || "").trim().toLowerCase();
  const includes = (value) => String(value || "").toLowerCase().includes(normalized);
  const guides = store.dashboard.knowledge.guides.filter((guide) =>
    includes(`${guide.title} ${guide.summary} ${(guide.tags || []).join(" ")}`)
  );
  const posts = store.dashboard.community.feed.filter((post) =>
    includes(`${post.title} ${post.body || ""} ${post.channel}`)
  );
  const crews = (store.dashboard.community.crews || []).filter((crew) =>
    includes(`${crew.name} ${crew.focus} ${crew.status} ${crew.description}`)
  );
  const events = (store.dashboard.community.events || []).filter((event) =>
    includes(`${event.title} ${event.type} ${event.crew} ${event.description}`)
  );
  const sources = (store.dashboard.knowledge.sources || []).filter((source) =>
    includes(`${source.title} ${source.provider} ${source.summary} ${(source.tags || []).join(" ")}`)
  );
  return {
    query,
    guides,
    sources,
    posts,
    crews,
    events,
    total: guides.length + sources.length + posts.length + crews.length + events.length
  };
}

function bindInteractions() {
  document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.add("menu-open");
    });
  });

  document.querySelectorAll("[data-menu-close]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
    });
  });

  document.querySelectorAll("[data-route]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.route);
    });
  });

  document.querySelectorAll("[data-checklist-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleLaunchChecklistItem(button.dataset.checklistToggle);
      saveLaunchChecklist();
      renderApp();
      navigate("home");
    });
  });

  document.querySelectorAll("[data-guide-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      store.guideFilter = button.dataset.guideFilter;
      renderApp();
      navigate("guides");
    });
  });

  document.querySelectorAll("[data-community-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      store.communityFilter = button.dataset.communityFilter;
      renderApp();
      navigate("community");
    });
  });

  document.querySelectorAll("[data-source-filter]").forEach((button) => {
    button.addEventListener("click", async () => {
      store.sourceFilter = button.dataset.sourceFilter;
      setLoading("sources", true);
      renderApp();
      navigate("sources");
      try {
        const payload = await loadSources({
          trustLevel: store.sourceFilter === "all" ? "" : store.sourceFilter,
          q: store.sourceSearch
        });
        setSources(payload.data);
      } catch {
        // Keep fallback sources visible if the API is offline.
      } finally {
        setLoading("sources", false);
      }
      renderApp();
      navigate("sources");
    });
  });

  document.querySelectorAll("[data-filter-search='sources']").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      store.sourceSearch = String(formData.get("query") || "");
      setLoading("sources", true);
      renderApp();
      navigate("sources");
      try {
        const payload = await loadSources({
          trustLevel: store.sourceFilter === "all" ? "" : store.sourceFilter,
          q: store.sourceSearch
        });
        setSources(payload.data);
      } catch {
        // Local filtering is handled by the page render.
      } finally {
        setLoading("sources", false);
      }
      renderApp();
      navigate("sources");
    });
  });

  document.querySelectorAll("[data-filter-search='community']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      store.communitySearch = String(formData.get("query") || "");
      renderApp();
      navigate("community");
    });
  });

  const globalSearchForm = document.querySelector("#global-search-form");
  if (globalSearchForm) {
    globalSearchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(globalSearchForm);
      const query = String(formData.get("query") || "").trim();
      if (!query) {
        setSearchResults("", null);
        renderApp();
        navigate("home");
        return;
      }
      setLoading("search", true);
      renderApp();
      navigate("home");
      try {
        const payload = await searchPlatform(query);
        setSearchResults(query, payload.data);
      } catch {
        setSearchResults(query, localSearch(query));
      } finally {
        setLoading("search", false);
      }
      renderApp();
      navigate("home");
    });
  }

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      store.authMode = button.dataset.authMode;
      renderApp();
      navigate("account");
    });
  });

  document.querySelectorAll("[data-provider-auth]").forEach((button) => {
    button.addEventListener("click", () => {
      setFormStatus(
        "auth",
        `${button.dataset.providerAuth.toUpperCase()} sera active uniquement via OAuth officiel approuve.`
      );
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
        setFormStatus("auth", `Connexion impossible: ${error.message}`, true);
      }
    });
  }

  const signupForm = document.querySelector("#signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      try {
        const payload = await register(formData.get("displayName"), formData.get("email"), formData.get("password"));
        setSession({
          user: payload.data.user,
          accessToken: payload.data.session.accessToken,
          refreshToken: payload.data.session.refreshToken
        });
        store.authMode = "signin";
        renderApp();
        navigate("account");
        setFormStatus("auth", "Compte cree et session active.");
      } catch (error) {
        setFormStatus("auth", `Inscription impossible: ${error.message}`, true);
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

  const deleteAccountButton = document.querySelector("#delete-account-button");
  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", async () => {
      const confirmed = window.confirm("Supprimer ce compte et revoquer les sessions ?");
      if (!confirmed) {
        return;
      }
      try {
        await deleteAccount(store.session.accessToken);
        clearSession();
        renderApp();
        navigate("settings");
        setFormStatus("delete-account", "Compte supprime et sessions revoquees.");
      } catch (error) {
        setFormStatus("delete-account", `Erreur: ${error.message}`, true);
      }
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

  document.querySelectorAll("[data-guide-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await updateGuide({ id: button.dataset.guideEdit, status: "editorial" });
        await refreshDashboard("guides");
        setFormStatus("guide", "Guide passe en relecture.");
      } catch (error) {
        setFormStatus("guide", `Erreur: ${error.message}`, true);
      }
    });
  });

  document.querySelectorAll("[data-guide-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await deleteGuide(button.dataset.guideDelete);
        await refreshDashboard("guides");
        setFormStatus("guide", "Guide archive.");
      } catch (error) {
        setFormStatus("guide", `Erreur: ${error.message}`, true);
      }
    });
  });

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

  document.querySelectorAll("[data-react-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await reactToPost(button.dataset.reactPost, "like");
        await refreshDashboard("community");
        setFormStatus("comment", "Reaction ajoutee.");
      } catch (error) {
        setFormStatus("comment", `Erreur: ${error.message}`, true);
      }
    });
  });

  const commentForm = document.querySelector("#community-comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(commentForm);
      try {
        await createComment(formData.get("postId"), formData.get("body"));
        await refreshDashboard("community");
        setFormStatus("comment", "Commentaire ajoute.");
      } catch (error) {
        setFormStatus("comment", `Erreur: ${error.message}`, true);
      }
    });
  }

  const commentManageForm = document.querySelector("#community-comment-manage-form");
  if (commentManageForm) {
    commentManageForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(commentManageForm);
      const action = event.submitter?.value || "update";
      try {
        if (action === "delete") {
          await deleteComment(formData.get("id"));
          await refreshDashboard("community");
          setFormStatus("comment-manage", "Commentaire supprime.");
          return;
        }
        await updateComment(formData.get("id"), formData.get("body"));
        await refreshDashboard("community");
        setFormStatus("comment-manage", "Commentaire mis a jour.");
      } catch (error) {
        setFormStatus("comment-manage", `Erreur: ${error.message}`, true);
      }
    });
  }

  const moderationRefresh = document.querySelector("#moderation-refresh");
  if (moderationRefresh) {
    moderationRefresh.addEventListener("click", async () => {
      try {
        const reports = await loadReports();
        let auditEvents = [];
        if (store.session.accessToken) {
          const audit = await loadAuditLog(store.session.accessToken);
          auditEvents = audit.data.events || [];
        }
        setModeration({
          reports: reports.data.reports || [],
          auditEvents
        });
        renderApp();
        navigate("moderation");
        setFormStatus("moderation", "File de moderation actualisee.");
      } catch (error) {
        setFormStatus("moderation", `Erreur: ${error.message}`, true);
      }
    });
  }

  document.querySelectorAll("[data-report-resolve]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await resolveReport(button.dataset.reportResolve, "resolved");
        const reports = await loadReports();
        setModeration({
          reports: reports.data.reports || [],
          auditEvents: store.moderation.auditEvents
        });
        renderApp();
        navigate("moderation");
        setFormStatus("moderation", "Signalement resolu.");
      } catch (error) {
        setFormStatus("moderation", `Erreur: ${error.message}`, true);
      }
    });
  });

  document.querySelectorAll("[data-report-hide-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await moderatePost(button.dataset.reportHidePost, "hidden");
        await refreshDashboard("moderation");
        setFormStatus("moderation", "Post masque.");
      } catch (error) {
        setFormStatus("moderation", `Erreur: ${error.message}`, true);
      }
    });
  });

  const crewForm = document.querySelector("#crew-form");
  if (crewForm) {
    crewForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(crewForm);
      try {
        await createCrew({
          name: formData.get("name"),
          focus: formData.get("focus"),
          members: Number(formData.get("members")),
          status: formData.get("status"),
          description: formData.get("description")
        });
        await refreshDashboard("crews");
        setFormStatus("crew", "Crew ajoute a l'annuaire.");
      } catch (error) {
        setFormStatus("crew", `Erreur: ${error.message}`, true);
      }
    });
  }

  document.querySelectorAll("[data-crew-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await updateCrew({ id: button.dataset.crewStatus, status: "curated" });
        await refreshDashboard("crews");
        setFormStatus("crew", "Crew mis en avant.");
      } catch (error) {
        setFormStatus("crew", `Erreur: ${error.message}`, true);
      }
    });
  });

  document.querySelectorAll("[data-crew-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await deleteCrew(button.dataset.crewDelete);
        await refreshDashboard("crews");
        setFormStatus("crew", "Crew supprime.");
      } catch (error) {
        setFormStatus("crew", `Erreur: ${error.message}`, true);
      }
    });
  });

  const eventForm = document.querySelector("#event-form");
  if (eventForm) {
    eventForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(eventForm);
      try {
        await createEvent({
          title: formData.get("title"),
          type: formData.get("type"),
          date: formData.get("date"),
          seats: Number(formData.get("seats")),
          crew: formData.get("crew"),
          description: formData.get("description")
        });
        await refreshDashboard("events");
        setFormStatus("event", "Event ajoute au calendrier.");
      } catch (error) {
        setFormStatus("event", `Erreur: ${error.message}`, true);
      }
    });
  }

  document.querySelectorAll("[data-event-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await updateEvent({ id: button.dataset.eventStatus, type: "featured" });
        await refreshDashboard("events");
        setFormStatus("event", "Event mis en avant.");
      } catch (error) {
        setFormStatus("event", `Erreur: ${error.message}`, true);
      }
    });
  });

  document.querySelectorAll("[data-event-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await deleteEvent(button.dataset.eventDelete);
        await refreshDashboard("events");
        setFormStatus("event", "Event supprime.");
      } catch (error) {
        setFormStatus("event", `Erreur: ${error.message}`, true);
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
  loadLaunchChecklist();
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
  setBooting(false);
  renderApp();
}

function loadLaunchChecklist() {
  try {
    const saved = window.localStorage.getItem("gta-vi-guide.launchChecklist");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setLaunchChecklist(
          store.launchChecklist.map((item) => ({
            ...item,
            done: Boolean(parsed.find((savedItem) => savedItem.id === item.id)?.done)
          }))
        );
      }
    }
  } catch {
    // Local storage is optional; the checklist still works in memory.
  }
}

function saveLaunchChecklist() {
  try {
    window.localStorage.setItem("gta-vi-guide.launchChecklist", JSON.stringify(store.launchChecklist));
  } catch {
    // Ignore storage errors in private browsing or restricted environments.
  }
}
