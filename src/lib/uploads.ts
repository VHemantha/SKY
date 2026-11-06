import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded photos are saved as files in UPLOAD_DIR (on Render: the persistent disk).
export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const NAME_PATTERN = /^[a-z0-9-]+\.(jpg|png|webp|avif)$/;

/** Resolves an upload name to a file inside UPLOAD_DIR, or null if unsafe. */
function diskPath(name: string) {
  if (!NAME_PATTERN.test(name)) return null;
  const full = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);
  return full.startsWith(UPLOAD_DIR + path.sep) ? full : null;
}

export async function saveUpload(name: string, data: Buffer) {
  const file = diskPath(name);
  if (!file) throw new Error("Invalid upload name");
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(file, data);
}

/** Returns the stored bytes for /uploads/<name>, or null if missing or unsafe. */
export async function readUpload(name: string): Promise<Uint8Array | null> {
  const file = diskPath(name);
  if (!file) return null;
  try {
    return new Uint8Array(await readFile(file));
  } catch {
    return null;
  }
}
