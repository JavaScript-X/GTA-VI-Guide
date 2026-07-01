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

export async function reportCommunityPost(postId, reason) {
  return postJsonWithFallback(["/api/reports", "http://localhost:8080/api/reports"], { postId, reason });
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
