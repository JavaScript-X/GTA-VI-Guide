import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { achievements, contentSources, guides, linkedAccounts, profileSnapshot } from "../packages/service-kit/src/data.mjs";

describe("seed data", () => {
  it("contains account integration states", () => {
    assert.ok(linkedAccounts.some((account) => account.provider === "psn"));
    assert.ok(linkedAccounts.some((account) => account.status === "ready-for-oauth"));
  });

  it("keeps achievement progress inside 0-100", () => {
    for (const achievement of achievements) {
      assert.ok(achievement.progress >= 0);
      assert.ok(achievement.progress <= 100);
    }
  });

  it("has French guide content for launch", () => {
    assert.ok(guides.some((guide) => guide.language === "fr"));
  });

  it("registers attributed content sources without mirrored media", () => {
    assert.ok(contentSources.some((source) => source.trustLevel === "official"));
    assert.ok(contentSources.some((source) => source.trustLevel === "community"));
    assert.ok(contentSources.every((source) => source.url.startsWith("https://")));
    assert.ok(contentSources.every((source) => source.mediaPolicy));
  });

  it("tracks a mock game profile snapshot", () => {
    assert.equal(profileSnapshot.syncMode, "mock");
    assert.ok(profileSnapshot.activeCharacter.level > 0);
  });
});
