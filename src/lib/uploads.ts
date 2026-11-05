import "server-only";
import path from "node:path";

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Resolves a public /uploads/<name> request to a file inside UPLOAD_DIR, or null if unsafe. */
export function resolveUpload(name: string) {
  if (!/^[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(name)) return null;
  const full = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);
  return full.startsWith(UPLOAD_DIR + path.sep) ? full : null;
}
