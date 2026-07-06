export async function fetchJsonWithFallback(paths) {
  let lastError;
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`${path} returned ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function postJsonWithFallback(paths, payload) {
  const body = JSON.stringify(payload);
  return fetchJsonWithFallback(
    paths.map((url) => {
      return new Request(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body
      });
    })
  );
}

export async function requestWithFallback(paths, options = {}) {
  return fetchJsonWithFallback(
    paths.map((url) => {
      return new Request(url, options);
    })
  );
}

export async function loadDashboard() {
  return fetchJsonWithFallback(["/api/dashboard", "http://localhost:8080/api/dashboard"]);
}

export async function loadPlatform() {
  return fetchJsonWithFallback(["/api/platform", "http://localhost:8080/api/platform"]);
}

export async function searchPlatform(query) {
  const encoded = encodeURIComponent(query);
  return fetchJsonWithFallback([`/api/search?q=${encoded}`, `http://localhost:8080/api/search?q=${encoded}`]);
}

export async function loadSources(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJsonWithFallback([`/api/sources${suffix}`, `http://localhost:8080/api/sources${suffix}`]);
}

export async function login(email, password) {
  return postJsonWithFallback(
    ["/api/auth/login", "http://localhost:8080/api/auth/login", "http://localhost:8081/auth/login"],
    { email, password }
  );
}

export async function register(displayName, email, password) {
  return postJsonWithFallback(
    ["/api/auth/register", "http://localhost:8080/api/auth/register", "http://localhost:8081/auth/register"],
    { displayName, email, password }
  );
}

export async function createGuide(input) {
  return postJsonWithFallback(["/api/guides", "http://localhost:8080/api/guides"], input);
}

export async function updateGuide(input) {
  return postJsonWithFallback(["/api/guides/update", "http://localhost:8080/api/guides/update"], input);
}

export async function deleteGuide(id) {
  return postJsonWithFallback(["/api/guides/delete", "http://localhost:8080/api/guides/delete"], { id });
}

export async function createCommunityPost(input) {
  return postJsonWithFallback(["/api/posts", "http://localhost:8080/api/posts"], input);
}

export async function createComment(postId, body) {
  return postJsonWithFallback(["/api/comments", "http://localhost:8080/api/comments"], { postId, body });
}

export async function updateComment(id, body) {
  return postJsonWithFallback(["/api/comments/update", "http://localhost:8080/api/comments/update"], { id, body });
}

export async function deleteComment(id) {
  return postJsonWithFallback(["/api/comments/delete", "http://localhost:8080/api/comments/delete"], { id });
}

export async function reactToPost(postId, type = "like") {
  return postJsonWithFallback(["/api/reactions", "http://localhost:8080/api/reactions"], { postId, type });
}

export async function reportCommunityPost(postId, reason) {
  return postJsonWithFallback(["/api/reports", "http://localhost:8080/api/reports"], { postId, reason });
}

export async function loadReports() {
  return fetchJsonWithFallback(["/api/reports", "http://localhost:8080/api/reports"]);
}

export async function loadAuditLog(accessToken) {
  return requestWithFallback(["/api/audit-log", "http://localhost:8080/api/audit-log"], {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });
}

export async function createCrew(input) {
  return postJsonWithFallback(["/api/crews", "http://localhost:8080/api/crews"], input);
}

export async function updateCrew(input) {
  return postJsonWithFallback(["/api/crews/update", "http://localhost:8080/api/crews/update"], input);
}

export async function deleteCrew(id) {
  return postJsonWithFallback(["/api/crews/delete", "http://localhost:8080/api/crews/delete"], { id });
}

export async function createEvent(input) {
  return postJsonWithFallback(["/api/events", "http://localhost:8080/api/events"], input);
}

export async function updateEvent(input) {
  return postJsonWithFallback(["/api/events/update", "http://localhost:8080/api/events/update"], input);
}

export async function deleteEvent(id) {
  return postJsonWithFallback(["/api/events/delete", "http://localhost:8080/api/events/delete"], { id });
}

export async function resolveReport(reportId, status = "resolved") {
  return postJsonWithFallback(["/api/reports/resolve", "http://localhost:8080/api/reports/resolve"], {
    reportId,
    status
  });
}

export async function moderatePost(postId, status = "hidden") {
  return postJsonWithFallback(["/api/posts/moderate", "http://localhost:8080/api/posts/moderate"], {
    postId,
    status
  });
}

export async function updateAchievementProgress(id, progress) {
  return postJsonWithFallback(["/api/achievements/progress", "http://localhost:8080/api/achievements/progress"], {
    id,
    progress
  });
}

export async function updateProfileCompletion(completion) {
  return postJsonWithFallback(["/api/profiles/me/completion", "http://localhost:8080/api/profiles/me/completion"], {
    completion
  });
}

export async function deleteAccount(accessToken) {
  return requestWithFallback(["/api/me", "http://localhost:8080/api/me", "http://localhost:8081/me"], {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });
}
