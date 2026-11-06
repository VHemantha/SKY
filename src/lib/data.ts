import "server-only";
import { cache } from "react";
import { readContent, type Destination, type Tour } from "./content";

export const getSettings = cache(async () => (await readContent()).settings);

type DestinationRef = { name: string; slug: string };
export type TourWithDestinations = Tour & { destinations: DestinationRef[] };

const byFeatured = (a: Tour, b: Tour) =>
  Number(b.featured) - Number(a.featured) ||
  a.sortOrder - b.sortOrder ||
  b.createdAt.getTime() - a.createdAt.getTime();

function withDestinations(tour: Tour, destinations: Destination[]): TourWithDestinations {
  return {
    ...tour,
    destinations: destinations
      .filter((d) => tour.destinationIds.includes(d.id))
      .map((d) => ({ name: d.name, slug: d.slug })),
  };
}

export type PublicTourFilter = { type?: string; destination?: string };

export const getPublishedTours = cache(async (filter: PublicTourFilter = {}) => {
  const { tours, destinations } = await readContent();
  return tours
    .filter((t) => t.published && (!filter.type || t.type === filter.type))
    .map((t) => withDestinations(t, destinations))
    .filter((t) => !filter.destination || t.destinations.some((d) => d.slug === filter.destination))
    .sort(byFeatured);
});

export const getFeaturedTours = cache(async (take = 6) => (await getPublishedTours()).slice(0, take));

export const getTourBySlug = cache(async (slug: string) => {
  const { tours, destinations } = await readContent();
  const tour = tours.find((t) => t.slug === slug && t.published);
  if (!tour) return null;
  return {
    ...tour,
    destinations: destinations.filter((d) => d.published && tour.destinationIds.includes(d.id)),
  };
});

const bySortThenName = (a: Destination, b: Destination) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);

export const getPublishedDestinations = cache(async () => {
  const { tours, destinations } = await readContent();
  return destinations
    .filter((d) => d.published)
    .sort(bySortThenName)
    .map((d) => ({
      ...d,
      _count: { tours: tours.filter((t) => t.published && t.destinationIds.includes(d.id)).length },
    }));
});

export const getDestinationBySlug = cache(async (slug: string) => {
  const { tours, destinations } = await readContent();
  const destination = destinations.find((d) => d.slug === slug && d.published);
  if (!destination) return null;
  return {
    ...destination,
    tours: tours
      .filter((t) => t.published && t.destinationIds.includes(destination.id))
      .map((t) => withDestinations(t, destinations))
      .sort(byFeatured),
  };
});

export const getFaqs = cache(async () =>
  (await readContent()).faqs.filter((f) => f.published).sort((a, b) => a.sortOrder - b.sortOrder),
);

export const getPage = cache(async (slug: string) => (await readContent()).pages.find((p) => p.slug === slug) ?? null);
