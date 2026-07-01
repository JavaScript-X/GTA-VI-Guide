import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMemoryStore } from "../packages/service-kit/src/persistence/memory-store.mjs";
import { createRepositories } from "../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../packages/service-kit/src/persistence/postgres-adapter.mjs";

describe("repositories", () => {
  it("authenticates against the identity repository seed user", async () => {
    const repositories = createRepositories(createMemoryStore());
    const user = await repositories.identity.findUserByEmail("vice@example.com");

    assert.equal(user.email, "vice@example.com");
    assert.ok(user.passwordHash.startsWith("scrypt:"));
  });

  it("creates guides through the knowledge repository", async () => {
    const repositories = createRepositories(createMemoryStore());
    const guide = await repositories.knowledge.createGuide({
      title: "Test Guide",
      tags: ["online"],
      summary: "A test guide."
    });
    const guides = await repositories.knowledge.listGuides({ tag: "online" });

    assert.equal(guide.id, "test-guide");
    assert.ok(guides.guides.some((item) => item.id === "test-guide"));
  });

  it("updates achievement progress", async () => {
    const repositories = createRepositories(createMemoryStore());
    const updated = await repositories.achievements.updateProgress("collector-instinct", 80);
    const list = await repositories.achievements.listAchievements();

    assert.equal(updated.progress, 80);
    assert.equal(
      list.achievements.find((achievement) => achievement.id === "collector-instinct").progress,
      80
    );
  });

  it("creates community posts and reports", async () => {
    const repositories = createRepositories(createMemoryStore());
    const post = await repositories.community.createPost({
      title: "New crew session",
      channel: "events"
    });
    const report = await repositories.community.reportPost(post.id, "spam");
    const feed = await repositories.community.getFeed();

    assert.equal(post.channel, "events");
    assert.equal(report.status, "open");
    assert.equal(feed.moderation.reportsOpen, 1);
  });

  it("falls back to memory repositories when PostgreSQL is not configured", async () => {
    const repositories = createRepositories();
    const user = await repositories.identity.findUserByEmail("vice@example.com");
    const readiness = createPostgresReadiness();

    assert.equal(user.email, "vice@example.com");
    assert.equal(readiness.configured, false);
    assert.equal(readiness.mode, "memory-fallback");
  });
});
