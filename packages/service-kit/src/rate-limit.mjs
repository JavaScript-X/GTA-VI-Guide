export function createMemoryRateLimiter({ windowMs, maxRequests }) {
  const buckets = new Map();

  return function rateLimit(key) {
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    current.count += 1;
    const remaining = Math.max(maxRequests - current.count, 0);
    return {
      allowed: current.count <= maxRequests,
      remaining,
      resetAt: current.resetAt
    };
  };
}
