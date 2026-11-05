"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";

export type EnquiryState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").max(200),
  phone: z.string().trim().max(40).default(""),
  country: z.string().trim().max(80).default(""),
  travelDate: z.string().trim().max(40).default(""),
  adults: z.coerce.number().int().min(1).max(50).default(2),
  children: z.coerce.number().int().min(0).max(50).default(0),
  message: z.string().trim().max(4000).default(""),
  tourId: z.string().trim().max(40).optional(),
});

// Basic per-IP throttle: 5 saved enquiries per 10 minutes per server instance.
// Only valid submissions count, so fixing a typo never locks a visitor out.
const hits = new Map<string, number[]>();
function recentHits(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.set(ip, recent);
  return recent;
}

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) return { ok: true, message: "Thank you! We'll be in touch shortly." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string" && v !== ""),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      errors[key] ??= issue.message;
    }
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      errors,
      values: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)])),
    };
  }

  const recent = recentHits(ip);
  if (recent.length >= 5) {
    return { ok: false, message: "Too many enquiries from your connection. Please try again in a few minutes." };
  }
  recent.push(Date.now());

  const { tourId, ...data } = parsed.data;
  const tour = tourId ? await db.tour.findUnique({ where: { id: tourId }, select: { id: true } }) : null;

  await db.enquiry.create({ data: { ...data, tourId: tour?.id ?? null } });

  return {
    ok: true,
    message: "Thank you! Your enquiry has reached our team — we usually reply within 24 hours.",
  };
}
