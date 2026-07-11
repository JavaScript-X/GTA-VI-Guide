import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { storeMediaUpload } from "../packages/service-kit/src/media-storage.mjs";

describe("media storage", () => {
  it("stores a validated data URL upload with metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "gta-media-"));
    const upload = await storeMediaUpload(
      {
        fileName: "Vice Shot.png",
        dataUrl: `data:image/png;base64,${Buffer.from("sample-image").toString("base64")}`,
        relatedType: "guide",
        relatedId: "launch-guide",
        altText: "Launch checklist",
        attribution: "User upload"
      },
      { root }
    );
    const stored = await readFile(join(root, upload.storedFileName), "utf8");

    assert.equal(upload.mimeType, "image/png");
    assert.equal(upload.fileName, "vice-shot.png");
    assert.equal(upload.relatedId, "launch-guide");
    assert.equal(upload.storage, "local");
    assert.equal(stored, "sample-image");
    assert.match(upload.checksum, /^[a-f0-9]{64}$/);
  });

  it("rejects invalid upload payloads", async () => {
    await assert.rejects(
      () => storeMediaUpload({ fileName: "bad.txt", dataUrl: "not-base64" }),
      /base64 data URL/
    );
  });
});
