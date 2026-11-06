"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession, requireAdmin } from "@/lib/auth";
import { CURRENCIES, ENQUIRY_STATUS, PAGE_SLUGS, PRICE_BASIS, TOUR_TYPES } from "@/lib/constants";
import { db } from "@/lib/db";
import { seedAdmin, seedContent } from "@/lib/seed";
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

async function uniqueSlug(base: string, table: "tour" | "destination", ignoreId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; ; i++) {
    const existing =
      table === "tour"
        ? await db.tour.findUnique({ where: { slug }, select: { id: true } })
        : await db.destination.findUnique({ where: { slug }, select: { id: true } });
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

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // First login on a fresh database: create the admin from ADMIN_EMAIL / ADMIN_PASSWORD.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && (await db.adminUser.count()) === 0) {
    try {
      await seedAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
      await seedContent(db);
    } catch (e) {
      console.error("Creating the first admin failed", e);
    }
  }
  const user = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  // Compare against a dummy hash when the user doesn't exist to keep timing similar.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2b$12$27BagE7JEhWSV0DN6GUW7OpSE/9ZQWggdWQ2U.3CcMmdv.sst0aPK");

  if (!user || !ok) {
    const next = attempt && attempt.until > Date.now() ? attempt.count + 1 : 1;
    loginAttempts.set(ip, { count: next, until: Date.now() + 15 * 60_000 });
    return { error: "Incorrect email or password." };
  }

  loginAttempts.delete(ip);
  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  if (next !== confirm) return { error: "New passwords don't match." };

  const user = await db.adminUser.findUnique({ where: { id: session.userId } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { success: "Password updated." };
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

  const destinationIds = formData.getAll("destinationIds").map(String).filter(Boolean);
  const slug = await uniqueSlug(parsed.data.slug || parsed.data.title, "tour", id);
  const data = {
    ...parsed.data,
    slug,
    gallery: JSON.stringify(gallery),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };

  if (id) {
    await db.tour.update({
      where: { id },
      data: { ...data, destinations: { set: destinationIds.map((d) => ({ id: d })) } },
    });
  } else {
    await db.tour.create({ data: { ...data, destinations: { connect: destinationIds.map((d) => ({ id: d })) } } });
  }
  refreshSite();
  redirect("/admin/tours?saved=1");
}

export async function deleteTour(formData: FormData) {
  await requireAdmin();
  await db.tour.delete({ where: { id: String(formData.get("id")) } });
  refreshSite();
  redirect("/admin/tours");
}

export async function toggleTour(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const field = formData.get("field") === "featured" ? "featured" : "published";
  const tour = await db.tour.findUnique({ where: { id } });
  if (tour) await db.tour.update({ where: { id }, data: { [field]: !tour[field] } });
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

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, "destination", id);
  const data = { ...parsed.data, slug, published: formData.get("published") === "on" };
  if (id) await db.destination.update({ where: { id }, data });
  else await db.destination.create({ data });
  refreshSite();
  redirect("/admin/destinations?saved=1");
}

export async function deleteDestination(formData: FormData) {
  await requireAdmin();
  await db.destination.delete({ where: { id: String(formData.get("id")) } });
  refreshSite();
  redirect("/admin/destinations");
}

// ───────────────────────────── Enquiries ─────────────────────────────

export async function updateEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!(status in ENQUIRY_STATUS)) return { error: "Unknown status." };
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  await db.enquiry.update({ where: { id }, data: { status, notes } });
  revalidatePath("/admin", "layout");
  return { success: "Enquiry updated." };
}

export async function deleteEnquiry(formData: FormData) {
  await requireAdmin();
  await db.enquiry.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries");
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
  if (id) await db.faq.update({ where: { id }, data });
  else await db.faq.create({ data });
  refreshSite();
  return { success: id ? "FAQ saved." : "FAQ added." };
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  await db.faq.delete({ where: { id: String(formData.get("id")) } });
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
  await db.page.upsert({ where: { slug }, update: data, create: { slug, ...data } });
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
  const data = { ...rest, heroSlides: JSON.stringify(heroSlides), heroImage: heroSlides[0].src };
  await db.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  refreshSite();
  return { success: "Settings saved." };
}
