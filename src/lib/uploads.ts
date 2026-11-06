import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded photos are saved as files in UPLOAD_DIR (on Render: the persistent disk).
const CONFIGURED_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");
// Used when UPLOAD_DIR can't be created (e.g. Render without a disk) — photos then
// last only until the next restart.
const FALLBACK_DIR = path.resolve(/*turbopackIgnore: true*/ "./storage/uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const NAME_PATTERN = /^[a-z0-9-]+\.(jpg|png|webp|avif)$/;

let uploadDir: Promise<string> | null = null;

function getUploadDir() {
  uploadDir ??= mkdir(CONFIGURED_DIR, { recursive: true })
    .then(() => CONFIGURED_DIR)
    .catch(async (error: NodeJS.ErrnoException) => {
      console.warn(
        `[uploads] Can't use UPLOAD_DIR "${CONFIGURED_DIR}" (${error.code}). Using ${FALLBACK_DIR} instead — ` +
          `uploaded photos will be lost on restart. Attach a persistent disk, or unset UPLOAD_DIR.`,
      );
      await mkdir(FALLBACK_DIR, { recursive: true });
      return FALLBACK_DIR;
    });
  return uploadDir;
}

/** Resolves an upload name to a file inside the upload folder, or null if unsafe. */
async function diskPath(name: string) {
  if (!NAME_PATTERN.test(name)) return null;
  const dir = await getUploadDir();
  const full = path.join(/*turbopackIgnore: true*/ dir, name);
  return full.startsWith(dir + path.sep) ? full : null;
}

export async function saveUpload(name: string, data: Buffer) {
  const file = await diskPath(name);
  if (!file) throw new Error("Invalid upload name");
  await writeFile(file, data);
}

/** Returns the stored bytes for /uploads/<name>, or null if missing or unsafe. */
export async function readUpload(name: string): Promise<Uint8Array | null> {
  try {
    const file = await diskPath(name);
    return file ? new Uint8Array(await readFile(file)) : null;
  } catch {
    return null;
  }
}
