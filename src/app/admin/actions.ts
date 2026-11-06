"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession, requireAdmin } from "@/lib/auth";
import { ADMIN_DISPLAY_NAME, ADMIN_PASSWORD_HASH, ADMIN_USERNAME } from "@/lib/admin-credentials";
import { CURRENCIES, PAGE_SLUGS, PRICE_BASIS, TOUR_TYPES } from "@/lib/constants";
import { newId, updateContent } from "@/lib/content";
import { heroSlidesSchema } from "@/lib/hero-slides";
import { slugify } from "@/lib/utils";

export type FormState = { error?: string; success?: string };

/** Refresh every public page after content changes. */
function refreshSite() {
  revalidatePath("/", "layout");
}

function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  if (issue.path[0] === "heroSlides") {
    const n = typeof issue.path[1] === "number" ? ` ${issue.path[1] + 1}` : "s";
    return `Slider photo${n}: ${issue.message}`;
  }
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

const text = (max = 500) => z.string().trim().max(max).default("");
const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);
const imagePath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "must be an uploaded image or https URL")
  .optional()
  .transform((v) => v || null);

function formObject(formData: FormData) {
  const obj: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$")) obj[k] = v;
  return obj;
}

function uniqueSlug(base: string, items: { id: string; slug: string }[], ignoreId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; ; i++) {
    const existing = items.find((item) => item.slug === slug);
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${i}`;
  }
}

// ───────────────────────────── Auth ─────────────────────────────

const loginAttempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const attempt = loginAttempts.get(ip);
  if (attempt && attempt.until > Date.now() && attempt.count >= 5) {
    return { error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // Always run bcrypt so a wrong username takes as long as a wrong password.
  const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  const ok = passwordOk && username === ADMIN_USERNAME;

  if (!ok) {
    const next = attempt && attempt.until > Date.now() ? attempt.count + 1 : 1;
    loginAttempts.set(ip, { count: next, until: Date.now() + 15 * 60_000 });
    return { error: "Incorrect username or password." };
  }

  loginAttempts.delete(ip);
  await createSession({ username: ADMIN_USERNAME, name: ADMIN_DISPLAY_NAME });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

// ───────────────────────────── Tours ─────────────────────────────

const tourSchema = z.object({
  title: z.string().trim().min(3, "is required").max(160),
  slug: text(100),
  type: z.enum(Object.keys(TOUR_TYPES) as [string, ...string[]]),
  summary: z.string().trim().min(10, "needs at least a sentence").max(400),
  description: z.string().trim().min(10, "is required").max(20000),
  duration: z.string().trim().min(1, "is required").max(80),
  price: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "must be a positive number"),
  currency: z.enum(CURRENCIES),
  priceBasis: z.enum(Object.keys(PRICE_BASIS) as [string, ...string[]]),
  maxGroupSize: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0), "must be a whole number"),
  highlights: text(4000),
  included: text(4000),
  excluded: text(4000),
  itinerary: text(10000),
  coverImage: imagePath,
  gallery: z.string().default("[]"),
  videoUrl: optionalText(300),
  sortOrder: z.coerce.number().int().default(0),
  metaTitle: optionalText(70),
  metaDescription: optionalText(170),
});

export async function saveTour(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = tourSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  let gallery: string[];
  try {
    gallery = z.array(z.string().max(500)).max(40).parse(JSON.parse(parsed.data.gallery));
  } catch {
    return { error: "Gallery data is invalid." };
  }

  const ids = formData.getAll("destinationIds").map(String).filter(Boolean);
  const found = await updateContent((c) => {
    const now = new Date();
    const data = {
      ...parsed.data,
      slug: uniqueSlug(parsed.data.slug || parsed.data.title, c.tours, id),
      gallery,
      destinationIds: c.destinations.filter((d) => ids.includes(d.id)).map((d) => d.id),
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      updatedAt: now,
    };
    if (!id) {
      c.tours.push({ ...data, id: newId(), createdAt: now });
      return true;
    }
    const index = c.tours.findIndex((t) => t.id === id);
    if (index === -1) return false;
    c.tours[index] = { ...c.tours[index], ...data };
    return true;
  });
  if (!found) return { error: "This tour no longer exists." };
  refreshSite();
  redirect("/admin/tours?saved=1");
}

export async function deleteTour(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await updateContent((c) => {
    c.tours = c.tours.filter((t) => t.id !== id);
  });
  refreshSite();
  redirect("/admin/tours");
}

export async function toggleTour(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const field = formData.get("field") === "featured" ? "featured" : "published";
  await updateContent((c) => {
    const tour = c.tours.find((t) => t.id === id);
    if (tour) {
      tour[field] = !tour[field];
      tour.updatedAt = new Date();
    }
  });
  refreshSite();
}

// ───────────────────────────── Destinations ─────────────────────────────

const destinationSchema = z.object({
  name: z.string().trim().min(2, "is required").max(120),
  slug: text(100),
  region: text(120),
  summary: z.string().trim().min(10, "needs at least a sentence").max(400),
  description: text(20000),
  highlights: text(4000),
  bestTime: text(300),
  image: imagePath,
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveDestination(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = destinationSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const found = await updateContent((c) => {
    const now = new Date();
    const data = {
      ...parsed.data,
      slug: uniqueSlug(parsed.data.slug || parsed.data.name, c.destinations, id),
      published: formData.get("published") === "on",
      updatedAt: now,
    };
    if (!id) {
      c.destinations.push({ ...data, id: newId(), createdAt: now });
      return true;
    }
    const index = c.destinations.findIndex((d) => d.id === id);
    if (index === -1) return false;
    c.destinations[index] = { ...c.destinations[index], ...data };
    return true;
  });
  if (!found) return { error: "This destination no longer exists." };
  refreshSite();
  redirect("/admin/destinations?saved=1");
}

export async function deleteDestination(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await updateContent((c) => {
    c.destinations = c.destinations.filter((d) => d.id !== id);
    for (const t of c.tours) t.destinationIds = t.destinationIds.filter((d) => d !== id);
  });
  refreshSite();
  redirect("/admin/destinations");
}

// ───────────────────────────── FAQs ─────────────────────────────

const faqSchema = z.object({
  question: z.string().trim().min(5, "is required").max(300),
  answer: z.string().trim().min(2, "is required").max(4000),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveFaq(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = faqSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const data = { ...parsed.data, published: formData.get("published") === "on" };
  await updateContent((c) => {
    const index = id ? c.faqs.findIndex((f) => f.id === id) : -1;
    if (index === -1) c.faqs.push({ ...data, id: newId() });
    else c.faqs[index] = { ...c.faqs[index], ...data };
  });
  refreshSite();
  return { success: id ? "FAQ saved." : "FAQ added." };
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await updateContent((c) => {
    c.faqs = c.faqs.filter((f) => f.id !== id);
  });
  refreshSite();
}

// ───────────────────────────── Pages ─────────────────────────────

const pageSchema = z.object({
  slug: z.enum(Object.keys(PAGE_SLUGS) as [string, ...string[]]),
  title: z.string().trim().min(2, "is required").max(120),
  body: z.string().trim().min(10, "is required").max(50000),
  metaDescription: text(170),
});

export async function savePage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = pageSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { slug, ...data } = parsed.data;
  await updateContent((c) => {
    const index = c.pages.findIndex((p) => p.slug === slug);
    const page = { ...data, slug, updatedAt: new Date() };
    if (index === -1) c.pages.push({ ...page, id: newId() });
    else c.pages[index] = { ...c.pages[index], ...page };
  });
  refreshSite();
  return { success: "Page saved and published." };
}

// ───────────────────────────── Settings ─────────────────────────────

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  tagline: text(200),
  heroTitle: z.string().trim().min(2).max(120),
  heroSubtitle: text(300),
  heroSlides: z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "could not be read" });
        return z.NEVER;
      }
    })
    .pipe(heroSlidesSchema),
  phone: text(40),
  whatsapp: text(40),
  email: z.union([z.literal(""), z.email()]).default(""),
  address: text(300),
  facebook: z.union([z.literal(""), z.url()]).default(""),
  instagram: z.union([z.literal(""), z.url()]).default(""),
  tripadvisor: z.union([z.literal(""), z.url()]).default(""),
  credentials: text(500),
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { heroSlides, ...rest } = parsed.data;
  // The first slide doubles as the site's share image in search results and social previews.
  await updateContent((c) => {
    c.settings = { ...c.settings, ...rest, heroSlides, heroImage: heroSlides[0].src };
  });
  refreshSite();
  return { success: "Settings saved." };
}
