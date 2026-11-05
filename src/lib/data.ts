import "server-only";
import { cache } from "react";
import { db } from "./db";

export const getSettings = cache(async () => {
  return (
    (await db.siteSettings.findUnique({ where: { id: 1 } })) ??
    (await db.siteSettings.create({ data: { id: 1 } }))
  );
});

export type PublicTourFilter = { type?: string; destination?: string };

export const getPublishedTours = cache(async (filter: PublicTourFilter = {}) => {
  return db.tour.findMany({
    where: {
      published: true,
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.destination
        ? { destinations: { some: { slug: filter.destination } } }
        : {}),
    },
    include: { destinations: { select: { name: true, slug: true } } },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
});

export const getFeaturedTours = cache(async (take = 6) => {
  return db.tour.findMany({
    where: { published: true },
    include: { destinations: { select: { name: true, slug: true } } },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take,
  });
});

export const getTourBySlug = cache(async (slug: string) => {
  return db.tour.findFirst({
    where: { slug, published: true },
    include: { destinations: { where: { published: true } } },
  });
});

export const getPublishedDestinations = cache(async () => {
  return db.destination.findMany({
    where: { published: true },
    include: { _count: { select: { tours: { where: { published: true } } } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
});

export const getDestinationBySlug = cache(async (slug: string) => {
  return db.destination.findFirst({
    where: { slug, published: true },
    include: {
      tours: {
        where: { published: true },
        include: { destinations: { select: { name: true, slug: true } } },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      },
    },
  });
});

export const getFaqs = cache(async () => {
  return db.faq.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
});

export const getPage = cache(async (slug: string) => {
  return db.page.findUnique({ where: { slug } });
});

export type TourWithDestinations = Awaited<ReturnType<typeof getPublishedTours>>[number];
