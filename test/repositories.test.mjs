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

  it("stores media upload metadata through the knowledge repository", async () => {
    const repositories = createRepositories(createMemoryStore());
    const upload = await repositories.knowledge.createMediaUpload({
      id: "media_test",
      fileName: "shot.png",
      mimeType: "image/png",
      size: 1200,
      relatedType: "guide",
      relatedId: "test-guide"
    });
    const uploads = await repositories.knowledge.listMediaUploads({ relatedType: "guide", relatedId: "test-guide" });

    assert.equal(upload.id, "media_test");
    assert.equal(uploads.total, 1);
    assert.equal(uploads.uploads[0].fileName, "shot.png");
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

  it("searches guides and community domains", async () => {
    const repositories = createRepositories(createMemoryStore());
    const guides = await repositories.knowledge.searchGuides("securite");
    const community = await repositories.community.searchCommunity("Vice");

    assert.ok(guides.guides.some((guide) => guide.id === "account-linking-safety"));
    assert.ok(community.posts.length > 0 || community.crews.length > 0 || community.events.length > 0);
    assert.equal(community.total, community.posts.length + community.crews.length + community.events.length);
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

  it("upserts player garage vehicles", async () => {
    const repositories = createRepositories(createMemoryStore());
    const created = await repositories.profiles.upsertVehicle({
      name: "Oceanic Turbo",
      className: "Sport",
      owned: true,
      notes: "Launch build"
    });
    const updated = await repositories.profiles.upsertVehicle({
      id: created.id,
      name: "Oceanic Turbo",
      className: "Sport",
      owned: false,
      notes: "Moved to wishlist"
    });
    const vehicles = await repositories.profiles.listVehicles();
    const profile = await repositories.profiles.getMyProfile();

    assert.equal(created.id, "oceanic-turbo");
    assert.equal(updated.owned, false);
    assert.ok(vehicles.vehicles.some((vehicle) => vehicle.id === "oceanic-turbo"));
    assert.ok(profile.garage.length >= vehicles.total);
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

  it("adds comments and reactions to community posts", async () => {
    const repositories = createRepositories(createMemoryStore());
    const post = await repositories.community.createPost({
      title: "Comment target",
      channel: "general"
    });
    const comment = await repositories.community.addComment(post.id, {
      body: "Useful reply."
    });
    const reaction = await repositories.community.reactToPost(post.id, {
      type: "like"
    });
    const feed = await repositories.community.getFeed();
    const updated = feed.feed.find((item) => item.id === post.id);

    assert.equal(comment.postId, post.id);
    assert.equal(reaction.score, 1);
    assert.equal(updated.replies, 1);
    assert.equal(updated.reactions, 1);
    assert.equal(updated.commentItems[0].body, "Useful reply.");
  });

  it("updates and deletes community comments", async () => {
    const repositories = createRepositories(createMemoryStore());
    const post = await repositories.community.createPost({
      title: "Editable comment target",
      channel: "general"
    });
    const comment = await repositories.community.addComment(post.id, {
      body: "First draft."
    });
    const updated = await repositories.community.updateComment(comment.id, {
      body: "Updated reply."
    });
    const deleted = await repositories.community.deleteComment(comment.id);
    const feed = await repositories.community.getFeed();
    const target = feed.feed.find((item) => item.id === post.id);

    assert.equal(updated.body, "Updated reply.");
    assert.equal(deleted.deleted, true);
    assert.equal(target.replies, 0);
    assert.equal(target.commentItems.length, 0);
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

  it("creates crews and events through the community repository", async () => {
    const repositories = createRepositories(createMemoryStore());
    const crew = await repositories.community.createCrew({
      name: "Neon Cartel",
      members: 6,
      focus: "heists",
      description: "Late night crew."
    });
    const event = await repositories.community.createEvent({
      title: "Neon Cartel launch route",
      type: "exploration",
      seats: 6,
      crew: crew.name
    });
    const community = await repositories.community.getFeed();

    assert.equal(crew.id, "neon-cartel");
    assert.equal(event.crew, "Neon Cartel");
    assert.ok(community.crews.some((item) => item.id === crew.id));
    assert.ok(community.events.some((item) => item.id === event.id));
  });

  it("updates and deletes crews and events", async () => {
    const repositories = createRepositories(createMemoryStore());
    await repositories.community.createCrew({
      name: "Editable Crew",
      members: 3
    });
    await repositories.community.createEvent({
      title: "Editable Event",
      seats: 3
    });

    const crew = await repositories.community.updateCrew("editable-crew", { status: "curated" });
    const event = await repositories.community.updateEvent("editable-event", { type: "featured" });
    const deletedCrew = await repositories.community.deleteCrew("editable-crew");
    const deletedEvent = await repositories.community.deleteEvent("editable-event");
    const community = await repositories.community.getFeed();

    assert.equal(crew.status, "curated");
    assert.equal(event.type, "featured");
    assert.equal(deletedCrew.deleted, true);
    assert.equal(deletedEvent.deleted, true);
    assert.equal(community.crews.some((item) => item.id === "editable-crew"), false);
    assert.equal(community.events.some((item) => item.id === "editable-event"), false);
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
