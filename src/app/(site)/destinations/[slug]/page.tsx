import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { TourCard } from "@/components/tour-card";
import { JsonLd } from "@/components/json-ld";
import { getDestinationBySlug } from "@/lib/data";
import { lines, siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestinationBySlug(slug);
  if (!d) return {};
  return {
    title: `${d.name} Safari & Travel Guide`,
    description: d.summary,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { images: d.image ? [{ url: d.image, alt: d.name }] : undefined },
  };
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const d = await getDestinationBySlug(slug);
  if (!d) notFound();
  const highlights = lines(d.highlights);

  return (
    <>
      <PageHero
        eyebrow={d.region}
        title={d.name}
        intro={d.summary}
        image={d.image}
        crumbs={[
          { href: "/destinations", label: "Destinations" },
          { href: `/destinations/${d.slug}`, label: d.name },
        ]}
      />

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink/75">
            {d.description.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
          <aside className="space-y-6">
            {d.bestTime && (
              <div className="rounded-3xl bg-jungle-900 p-7 text-white">
                <CalendarDays className="h-6 w-6 text-sunset-400" aria-hidden />
                <h2 className="mt-3 text-lg font-semibold">Best time to visit</h2>
                <p className="mt-2 text-sm text-white/80">{d.bestTime}</p>
              </div>
            )}
            {highlights.length > 0 && (
              <div className="rounded-3xl bg-white p-7 ring-1 ring-sand-200">
                <h2 className="text-lg font-semibold text-jungle-950">What you may see</h2>
                <ul className="mt-4 space-y-3 text-sm text-ink/75">
                  {highlights.map((h) => (
                    <li key={h} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-jungle-500" aria-hidden />{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="bg-sand-100 py-14 sm:py-20">
        <div className="container-x">
          <h2 className="font-display text-3xl font-semibold text-jungle-950 sm:text-4xl">Tours in {d.name}</h2>
          {d.tours.length > 0 ? (
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {d.tours.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-ink/65">
              Tours for {d.name} are coming soon.{" "}
              <Link href="/contact" className="font-semibold text-jungle-700 underline">Ask us</Link> and we&apos;ll arrange one for you.
            </p>
          )}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: d.name,
          description: d.summary,
          url: siteUrl(`/destinations/${d.slug}`),
          ...(d.image ? { image: siteUrl(d.image) } : {}),
          containedInPlace: { "@type": "Country", name: "Sri Lanka" },
        }}
      />
    </>
  );
}
