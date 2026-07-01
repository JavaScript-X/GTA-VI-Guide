import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMemoryStore } from "../packages/service-kit/src/persistence/memory-store.mjs";
import { createRepositories } from "../packages/service-kit/src/persistence/repositories.mjs";
import { createPostgresReadiness } from "../packages/service-kit/src/persistence/postgres-adapter.mjs";
import { hashRefreshToken } from "../packages/service-kit/src/auth.mjs";

describe("repositories", () => {
  it("authenticates against the identity repository seed user", async () => {
    const repositories = createRepositories(createMemoryStore());
    const user = await repositories.identity.findUserByEmail("vice@example.com");

    assert.equal(user.email, "vice@example.com");
    assert.ok(user.passwordHash.startsWith("scrypt:"));
  });

  it("registers users through the identity repository", async () => {
    const repositories = createRepositories(createMemoryStore());
    const user = await repositories.identity.createUser({
      displayName: "Neon Driver",
      email: "neon@example.com",
      password: "ChangeMe123!"
    });
    const stored = await repositories.identity.findUserByEmail("neon@example.com");

    assert.equal(user.email, "neon@example.com");
    assert.equal(user.roles[0], "player");
    assert.ok(stored.passwordHash.startsWith("scrypt:"));
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

  it("updates and deletes guides through the knowledge repository", async () => {
    const repositories = createRepositories(createMemoryStore());
    await repositories.knowledge.createGuide({
      title: "Editorial Guide",
      tags: ["online"],
      summary: "A guide to update."
    });

    const updated = await repositories.knowledge.updateGuide("editorial-guide", {
      status: "editorial",
      summary: "Updated."
    });
    const deleted = await repositories.knowledge.deleteGuide("editorial-guide");
    const guides = await repositories.knowledge.listGuides();

    assert.equal(updated.status, "editorial");
    assert.equal(deleted.deleted, true);
    assert.equal(guides.guides.some((item) => item.id === "editorial-guide"), false);
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

  it("resolves reports and moderates posts", async () => {
    const repositories = createRepositories(createMemoryStore());
    const post = await repositories.community.createPost({
      title: "Post to moderate",
      channel: "general"
    });
    const report = await repositories.community.reportPost(post.id, "spam");
    const resolved = await repositories.community.resolveReport(report.id, "resolved");
    const moderated = await repositories.community.moderatePost(post.id, "hidden");
    const reports = await repositories.community.listReports();
    const feed = await repositories.community.getFeed();

    assert.equal(resolved.status, "resolved");
    assert.equal(moderated.moderationStatus, "hidden");
    assert.equal(reports.total, 1);
    assert.equal(feed.feed.some((item) => item.id === post.id), false);
  });

  it("falls back to memory repositories when PostgreSQL is not configured", async () => {
    const repositories = createRepositories();
    const user = await repositories.identity.findUserByEmail("vice@example.com");
    const readiness = createPostgresReadiness();

    assert.equal(user.email, "vice@example.com");
    assert.equal(readiness.configured, false);
    assert.equal(readiness.mode, "memory-fallback");
  });

  it("stores refresh sessions by hashed token and deletes account data", async () => {
    const repositories = createRepositories(createMemoryStore());
    const user = await repositories.identity.findUserByEmail("vice@example.com");
    const tokenHash = hashRefreshToken("raw-refresh-token");

    await repositories.identity.createRefreshSession(tokenHash, {
      userId: user.id,
      email: user.email,
      expiresAt: new Date(Date.now() + 60000).toISOString()
    });

    assert.equal(await repositories.identity.findRefreshSession("raw-refresh-token"), null);
    assert.equal((await repositories.identity.findRefreshSession(tokenHash)).userId, user.id);

    await repositories.identity.deleteUserData(user.id, "request_1");

    assert.equal(await repositories.identity.findUserByEmail("vice@example.com"), null);
    assert.ok((await repositories.identity.findRefreshSession(tokenHash)).revokedAt);
  });
});
