import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, pages] = await Promise.all([
    db.tour.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.destination.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: siteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/tours"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/destinations"), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/faq"), changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
    ...tours.map((t) => ({ url: siteUrl(`/tours/${t.slug}`), lastModified: t.updatedAt, priority: 0.8 })),
    ...destinations.map((d) => ({ url: siteUrl(`/destinations/${d.slug}`), lastModified: d.updatedAt, priority: 0.7 })),
    ...pages.map((p) => ({
      url: siteUrl(`/${p.slug}`),
      lastModified: p.updatedAt,
      priority: p.slug === "terms" || p.slug === "privacy" ? 0.2 : 0.6,
    })),
  ];
}
