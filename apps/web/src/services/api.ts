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

export async function loadDashboard() {
  return fetchJsonWithFallback(["/api/dashboard", "http://localhost:8080/api/dashboard"]);
}

export async function loadPlatform() {
  return fetchJsonWithFallback(["/api/platform", "http://localhost:8080/api/platform"]);
}

export async function login(email, password) {
  const body = JSON.stringify({ email, password });
  return fetchJsonWithFallback(
    ["/api/auth/login", "http://localhost:8080/api/auth/login", "http://localhost:8081/auth/login"].map((url) => {
      return new Request(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body
      });
    })
  );
}
