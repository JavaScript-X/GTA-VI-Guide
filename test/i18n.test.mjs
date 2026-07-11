import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { languages, normalizeLocale, t } from "../apps/web/src/i18n.ts";

describe("frontend i18n", () => {
  it("ships at least seven supported languages", () => {
    assert.ok(languages.length >= 7);
    for (const code of ["fr", "en", "es", "pt", "de", "ar", "zh"]) {
      assert.ok(languages.some((language) => language.code === code));
      assert.notEqual(t(code, "nav.home"), "nav.home");
    }
  });

  it("normalizes browser locales and falls back safely", () => {
    assert.equal(normalizeLocale("en-US"), "en");
    assert.equal(normalizeLocale("ar-MA"), "ar");
    assert.equal(normalizeLocale("unknown"), "fr");
  });
});
