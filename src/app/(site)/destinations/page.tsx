import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { DestinationCard } from "@/components/destination-card";
import { getPublishedDestinations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sri Lanka National Parks & Destinations",
  description:
    "Yala, Udawalawe, Wilpattu, Minneriya, Kumana and more — discover Sri Lanka's best national parks for leopards, elephants and birdlife, and when to visit.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const destinations = await getPublishedDestinations();
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Sri Lanka's national parks"
        intro="A small island with remarkable variety: dry-zone scrub full of leopards, lakeside grasslands that draw hundreds of elephants, and misty highland plains."
        image="/images/minneriya-gathering.jpg"
        crumbs={[{ href: "/destinations", label: "Destinations" }]}
      />
      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </section>
    </>
  );
}
