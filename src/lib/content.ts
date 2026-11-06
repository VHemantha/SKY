import "server-only";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { HeroSlide } from "./hero-slides";

// All site content lives in one JSON file — no database.
//
// • The starter copy is committed at data/content.json.
// • At runtime the site reads/writes  $DATA_DIR/content.json  (default ./data).
//   On Render, DATA_DIR points at a persistent disk (/var/data); on first start
//   the committed file is copied there, and admin edits are saved to it.

export type SiteSettings = {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  /** Empty = built-in default slides. */
  heroSlides: HeroSlide[];
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  tripadvisor: string;
  credentials: string;
};

export type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  highlights: string;
  bestTime: string;
  image: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Tour = {
  id: string;
  slug: string;
  title: string;
  /** DAY_SAFARI | OVERNIGHT | PRIVATE | NIGHT_SAFARI | ROUND_TOUR */
  type: string;
  summary: string;
  description: string;
  duration: string;
  price: number | null;
  currency: string;
  priceBasis: string;
  maxGroupSize: number | null;
  highlights: string;
  included: string;
  excluded: string;
  itinerary: string;
  coverImage: string | null;
  gallery: string[];
  videoUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  destinationIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Faq = { id: string; question: string; answer: string; sortOrder: number; published: boolean };

export type Page = { id: string; slug: string; title: string; body: string; metaDescription: string; updatedAt: Date };

export type Content = {
  settings: SiteSettings;
  destinations: Destination[];
  tours: Tour[];
  faqs: Faq[];
  pages: Page[];
};

const DEFAULT_FILE = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "content.json");
const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "./data");
const LIVE_FILE = path.join(/*turbopackIgnore: true*/ DATA_DIR, "content.json");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const revive = (_key: string, value: unknown) =>
  typeof value === "string" && ISO_DATE.test(value) ? new Date(value) : value;

let cached: { mtimeMs: number; content: Content } | null = null;

// During `next build` (e.g. on Render, where the disk isn't mounted yet) read the
// committed file and never touch DATA_DIR.
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

async function ensureLiveFile() {
  if (IS_BUILD) return;
  try {
    await stat(LIVE_FILE);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await copyFile(DEFAULT_FILE, LIVE_FILE);
  }
}

/** Returns the current content. Re-reads the file when it changes on disk. */
export async function readContent(): Promise<Content> {
  await ensureLiveFile();
  const file = IS_BUILD ? DEFAULT_FILE : LIVE_FILE;
  const { mtimeMs } = await stat(file);
  if (cached && cached.mtimeMs === mtimeMs) return cached.content;
  const content = JSON.parse(await readFile(file, "utf8"), revive) as Content;
  cached = { mtimeMs, content };
  return content;
}

// Writes are queued so two admin saves at once can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

/** Applies `change` to a copy of the content and saves it atomically. */
export function updateContent<T>(change: (content: Content) => T): Promise<T> {
  const run = queue.then(async () => {
    const content = structuredClone(await readContent());
    const result = change(content);
    const tmp = `${LIVE_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(content, null, 2) + "\n");
    await rename(tmp, LIVE_FILE);
    cached = null;
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const newId = () => randomUUID();
