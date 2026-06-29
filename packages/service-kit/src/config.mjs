export function getEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getNumberEnv(name, fallback) {
  const value = Number(getEnv(name, fallback));
  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return value;
}

export function getBooleanEnv(name, fallback = false) {
  const value = getEnv(name, String(fallback)).toLowerCase();
  return ["1", "true", "yes", "on"].includes(value);
}

export function getAllowedOrigins() {
  const raw = getEnv("ALLOWED_ORIGINS", "http://localhost:5173");
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getServiceUrls() {
  return {
    identity: getEnv("IDENTITY_SERVICE_URL", "http://localhost:8081"),
    profiles: getEnv("GAME_PROFILE_SERVICE_URL", "http://localhost:8082"),
    achievements: getEnv("ACHIEVEMENT_SERVICE_URL", "http://localhost:8083"),
    knowledge: getEnv("KNOWLEDGE_SERVICE_URL", "http://localhost:8084"),
    community: getEnv("COMMUNITY_SERVICE_URL", "http://localhost:8085")
  };
}
