import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { TourCard } from "@/components/tour-card";
import { getPublishedDestinations, getPublishedTours } from "@/lib/data";
import { TOUR_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tours & Safaris in Sri Lanka",
  description:
    "Day safaris, overnight camping, private jeep tours and night safaris in Yala, Udawalawe, Wilpattu, Minneriya and more. Compare prices and enquire online.",
  alternates: { canonical: "/tours" },
};

export default async function ToursPage({ searchParams }: PageProps<"/tours">) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" && sp.type in TOUR_TYPES ? sp.type : undefined;
  const destination = typeof sp.park === "string" ? sp.park : undefined;

  const [tours, destinations] = await Promise.all([
    getPublishedTours({ type, destination }),
    getPublishedDestinations(),
  ]);

  const href = (next: { type?: string; park?: string }) => {
    const params = new URLSearchParams();
    if (next.type) params.set("type", next.type);
    if (next.park) params.set("park", next.park);
    const q = params.toString();
    return q ? `/tours?${q}` : "/tours";
  };

  return (
    <>
      <PageHero
        eyebrow="Tours & safaris"
        title="Find your Sri Lankan safari"
        intro="Every tour includes a private jeep with driver and hotel pickup from nearby towns. Prices are shown from — we confirm a final quote for your dates."
        image="/images/yala-jeeps.jpg"
        crumbs={[{ href: "/tours", label: "Tours" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="container-x">
          <div className="flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-sand-200 sm:p-6">
            <FilterRow label="Type">
              <Chip href={href({ park: destination })} active={!type}>
                All types
              </Chip>
              {Object.entries(TOUR_TYPES).map(([key, label]) => (
                <Chip key={key} href={href({ type: key, park: destination })} active={type === key}>
                  {label}
                </Chip>
              ))}
            </FilterRow>
            {destinations.length > 0 && (
              <FilterRow label="Park">
                <Chip href={href({ type })} active={!destination}>
                  All parks
                </Chip>
                {destinations.map((d) => (
                  <Chip key={d.id} href={href({ type, park: d.slug })} active={destination === d.slug}>
                    {d.name}
                  </Chip>
                ))}
              </FilterRow>
            )}
          </div>

          <p className="mt-8 text-sm text-ink/60" aria-live="polite">
            {tours.length} {tours.length === 1 ? "tour" : "tours"} found
          </p>

          {tours.length > 0 ? (
            <div className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white p-12 text-center ring-1 ring-sand-200">
              <p className="font-display text-2xl font-semibold text-jungle-900">No tours match these filters yet</p>
              <p className="mt-2 text-ink/60">We can still arrange it — tell us what you have in mind.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/tours" className="btn-dark">
                  Clear filters
                </Link>
                <Link href="/contact" className="btn-primary">
                  Ask for a custom tour
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="w-14 shrink-0 text-xs font-semibold tracking-wider text-ink/50 uppercase">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full px-4 py-2 text-sm transition",
        active ? "bg-jungle-900 text-white" : "bg-sand-100 text-ink/75 hover:bg-sand-200",
      )}
    >
      {children}
    </Link>
  );
}
