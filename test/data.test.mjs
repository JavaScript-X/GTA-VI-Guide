import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { achievements, guides, linkedAccounts, profileSnapshot } from "../packages/service-kit/src/data.mjs";

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

  it("tracks a mock game profile snapshot", () => {
    assert.equal(profileSnapshot.syncMode, "mock");
    assert.ok(profileSnapshot.activeCharacter.level > 0);
  });
});
