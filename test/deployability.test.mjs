import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAllowedOrigins, getNumberEnv } from "../packages/service-kit/src/config.mjs";
import { createMemoryRateLimiter } from "../packages/service-kit/src/rate-limit.mjs";

describe("deployability helpers", () => {
  it("parses comma-separated allowed origins", () => {
    const previous = process.env.ALLOWED_ORIGINS;
    process.env.ALLOWED_ORIGINS = "https://example.com, https://admin.example.com";

    assert.deepEqual(getAllowedOrigins(), [
      "https://example.com",
      "https://admin.example.com"
    ]);

    if (previous === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = previous;
    }
  });

  it("validates numeric environment variables", () => {
    const previous = process.env.TEST_NUMBER_ENV;
    process.env.TEST_NUMBER_ENV = "42";

    assert.equal(getNumberEnv("TEST_NUMBER_ENV"), 42);

    if (previous === undefined) {
      delete process.env.TEST_NUMBER_ENV;
    } else {
      process.env.TEST_NUMBER_ENV = previous;
    }
  });

  it("limits requests inside a fixed window", () => {
    const limit = createMemoryRateLimiter({ windowMs: 1000, maxRequests: 2 });

    assert.equal(limit("client").allowed, true);
    assert.equal(limit("client").allowed, true);
    assert.equal(limit("client").allowed, false);
  });
});
