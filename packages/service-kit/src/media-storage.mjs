import { mkdir, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { extname, join, normalize, resolve } from "node:path";

const defaultMaxBytes = Number(process.env.MEDIA_UPLOAD_MAX_BYTES || 2_000_000);
const allowedMimeTypes = new Set(
  (process.env.MEDIA_UPLOAD_MIME_TYPES || "image/png,image/jpeg,image/webp,image/gif")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
);

const extensionByMimeType = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

function parseDataUrl(value) {
  const match = String(value || "").match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) {
    return null;
  }
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64")
  };
}

function sanitizeFileName(name) {
  const base = String(name || "upload")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "upload";
}

export async function storeMediaUpload(input, options = {}) {
  const parsed = parseDataUrl(input.dataUrl);
  if (!parsed) {
    const error = new Error("Media upload must be a base64 data URL");
    error.statusCode = 400;
    error.code = "invalid_media_payload";
    throw error;
  }

  if (!allowedMimeTypes.has(parsed.mimeType)) {
    const error = new Error("Media type is not allowed");
    error.statusCode = 415;
    error.code = "unsupported_media_type";
    throw error;
  }

  const maxBytes = Number(options.maxBytes || defaultMaxBytes);
  if (parsed.buffer.byteLength > maxBytes) {
    const error = new Error(`Media upload exceeds ${maxBytes} bytes`);
    error.statusCode = 413;
    error.code = "media_too_large";
    throw error;
  }

  const root = resolve(options.root || process.env.MEDIA_UPLOAD_DIR || "storage/uploads");
  const uploadId = `media_${randomUUID()}`;
  const sourceName = sanitizeFileName(input.fileName);
  const extension = extensionByMimeType[parsed.mimeType] || extname(sourceName) || ".bin";
  const fileName = `${uploadId}${extension}`;
  const targetPath = normalize(join(root, fileName));

  if (!targetPath.startsWith(root)) {
    const error = new Error("Invalid upload path");
    error.statusCode = 400;
    error.code = "invalid_upload_path";
    throw error;
  }

  await mkdir(root, { recursive: true });
  await writeFile(targetPath, parsed.buffer);

  return {
    id: uploadId,
    fileName: sourceName,
    storedFileName: fileName,
    mimeType: parsed.mimeType,
    size: parsed.buffer.byteLength,
    checksum: createHash("sha256").update(parsed.buffer).digest("hex"),
    storage: "local",
    url: `/uploads/${fileName}`,
    relatedType: input.relatedType || "guide",
    relatedId: input.relatedId || null,
    altText: input.altText || "",
    attribution: input.attribution || "user-uploaded",
    policy: "User-provided media only. External copyrighted media must be linked and attributed instead of mirrored.",
    createdAt: new Date().toISOString()
  };
}
