import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded photos are stored in Netlify Blobs when running on Netlify (whose
// functions have no permanent disk), and in a local folder everywhere else.
// Set UPLOAD_STORAGE=blobs or UPLOAD_STORAGE=disk to force one or the other.

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");
const STORE_NAME = "uploads";

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const NAME_PATTERN = /^[a-z0-9-]+\.(jpg|png|webp|avif)$/;

function storeInBlobs() {
  const forced = process.env.UPLOAD_STORAGE;
  if (forced) return forced === "blobs";
  return Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT || (globalThis as { netlifyBlobsContext?: unknown }).netlifyBlobsContext,
  );
}

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  // Strong consistency so a photo shows up in the admin preview right after upload.
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

/** Resolves an upload name to a file inside UPLOAD_DIR, or null if unsafe. */
function diskPath(name: string) {
  const full = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);
  return full.startsWith(UPLOAD_DIR + path.sep) ? full : null;
}

export async function saveUpload(name: string, data: Buffer, contentType: string) {
  if (!NAME_PATTERN.test(name)) throw new Error("Invalid upload name");
  if (storeInBlobs()) {
    const store = await blobStore();
    const bytes = new Uint8Array(data);
    await store.set(name, bytes.buffer as ArrayBuffer, { metadata: { contentType } });
    return;
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(diskPath(name)!, data);
}

/** Returns the stored bytes for /uploads/<name>, or null if missing or unsafe. */
export async function readUpload(name: string): Promise<Uint8Array | null> {
  if (!NAME_PATTERN.test(name)) return null;
  try {
    if (storeInBlobs()) {
      const store = await blobStore();
      const data = await store.get(name, { type: "arrayBuffer" });
      return data ? new Uint8Array(data) : null;
    }
    const file = diskPath(name);
    return file ? new Uint8Array(await readFile(file)) : null;
  } catch {
    return null;
  }
}
