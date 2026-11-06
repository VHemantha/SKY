import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, MapPin, Tag, Users, X } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry-form";
import { JsonLd } from "@/components/json-ld";
import { getSettings, getTourBySlug } from "@/lib/data";
import {
  formatPrice,
  lines,
  parseGallery,
  parseItinerary,
  priceBasisLabel,
  siteUrl,
  tourTypeLabel,
  videoEmbedUrl,
  whatsappLink,
} from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return {};
  const description = tour.metaDescription || tour.summary;
  return {
    title: tour.metaTitle || tour.title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.metaTitle || tour.title,
      description,
      type: "website",
      images: tour.coverImage ? [{ url: tour.coverImage, alt: tour.title }] : undefined,
    },
  };
}

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  const [tour, settings] = await Promise.all([getTourBySlug(slug), getSettings()]);
  if (!tour) notFound();

  const price = formatPrice(tour.price, tour.currency);
  const gallery = parseGallery(tour.gallery);
  const itinerary = parseItinerary(tour.itinerary);
  const highlights = lines(tour.highlights);
  const included = lines(tour.included);
  const excluded = lines(tour.excluded);
  const video = videoEmbedUrl(tour.videoUrl);
  const wa = whatsappLink(settings.whatsapp, `Hi Skylantic! I'm interested in "${tour.title}".`);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-jungle-950 pt-36 pb-14 text-white sm:pt-44 sm:pb-20">
        {tour.coverImage && (
          <>
            <Image src={tour.coverImage} alt={tour.title} fill priority sizes="100vw" className="-z-20 object-cover opacity-70" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jungle-950 via-jungle-950/50 to-jungle-950/20" />
          </>
        )}
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/tours" className="hover:text-white">Tours</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-white/90">{tour.title}</li>
            </ol>
          </nav>
          <span className="inline-block rounded-full bg-sunset-500 px-3 py-1 text-xs font-semibold">{tourTypeLabel(tour.type)}</span>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl">{tour.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{tour.summary}</p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-sunset-400" aria-hidden />{tour.duration}</li>
            {tour.maxGroupSize && (
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-sunset-400" aria-hidden />Up to {tour.maxGroupSize} guests</li>
            )}
            {tour.destinations.length > 0 && (
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sunset-400" aria-hidden />
                {tour.destinations.map((d, i) => (
                  <span key={d.id}>
                    {i > 0 && " · "}
                    <Link href={`/destinations/${d.slug}`} className="underline-offset-4 hover:underline">{d.name}</Link>
                  </span>
                ))}
              </li>
            )}
            <li className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-sunset-400" aria-hidden />
              {price ? `From ${price} ${priceBasisLabel(tour.priceBasis)}` : "Price on request"}
            </li>
          </ul>
        </div>
      </section>

      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_400px] lg:py-20">
        <div className="min-w-0 space-y-14">
          {highlights.length > 0 && (
            <section>
              <h2 className="font-display text-3xl font-semibold text-jungle-950">Highlights</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-sand-200">
                    <Check className="h-5 w-5 shrink-0 text-jungle-500" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display text-3xl font-semibold text-jungle-950">About this tour</h2>
            <div className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-ink/75">
              {tour.description.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="whitespace-pre-line">{p}</p>
              ))}
            </div>
          </section>

          {itinerary.length > 0 && (
            <section>
              <h2 className="font-display text-3xl font-semibold text-jungle-950">Itinerary</h2>
              <ol className="mt-6 space-y-0">
                {itinerary.map((step, i) => (
                  <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
                    {i < itinerary.length - 1 && (
                      <span className="absolute top-10 bottom-0 left-[1.2rem] w-px bg-sand-300" aria-hidden />
                    )}
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-jungle-900 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="font-semibold text-jungle-950">{step.title}</h3>
                      {step.details && <p className="mt-1 text-sm leading-relaxed text-ink/70">{step.details}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(included.length > 0 || excluded.length > 0) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {included.length > 0 && (
                <div className="rounded-3xl bg-white p-7 ring-1 ring-sand-200">
                  <h2 className="text-lg font-semibold text-jungle-950">What&apos;s included</h2>
                  <ul className="mt-4 space-y-3 text-sm text-ink/75">
                    {included.map((x) => (
                      <li key={x} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-jungle-500" aria-hidden />{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {excluded.length > 0 && (
                <div className="rounded-3xl bg-white p-7 ring-1 ring-sand-200">
                  <h2 className="text-lg font-semibold text-jungle-950">Not included</h2>
                  <ul className="mt-4 space-y-3 text-sm text-ink/75">
                    {excluded.map((x) => (
                      <li key={x} className="flex gap-3"><X className="h-5 w-5 shrink-0 text-red-400" aria-hidden />{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {gallery.length > 0 && (
            <section>
              <h2 className="font-display text-3xl font-semibold text-jungle-950">Gallery</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noopener" className="relative aspect-square overflow-hidden rounded-2xl bg-sand-200">
                    <Image src={src} alt={`${tour.title} — photo ${i + 1}`} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {video && (
            <section>
              <h2 className="font-display text-3xl font-semibold text-jungle-950">Video</h2>
              <div className="mt-6 aspect-video overflow-hidden rounded-3xl bg-black">
                <iframe
                  src={video}
                  title={`${tour.title} video`}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div id="enquire" className="rounded-3xl bg-white p-6 shadow-xl shadow-jungle-900/5 ring-1 ring-sand-200 sm:p-7">
            <p className="text-sm text-ink/60">{price ? "From" : "Pricing"}</p>
            <p className="font-display text-4xl font-semibold text-jungle-950">{price ?? "On request"}</p>
            {price && <p className="text-sm text-ink/60">{priceBasisLabel(tour.priceBasis)}</p>}
            <hr className="my-6 border-sand-200" />
            <h2 className="mb-4 text-lg font-semibold text-jungle-950">Check availability</h2>
            <EnquiryForm tourTitle={tour.title} whatsapp={settings.whatsapp} email={settings.email} compact />
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10">
                Ask on WhatsApp
              </a>
            )}
          </div>
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.title,
          description: tour.summary,
          url: siteUrl(`/tours/${tour.slug}`),
          ...(tour.coverImage ? { image: siteUrl(tour.coverImage) } : {}),
          touristType: tourTypeLabel(tour.type),
          provider: { "@type": "TravelAgency", name: settings.siteName, url: siteUrl() },
          ...(tour.destinations.length
            ? { itinerary: { "@type": "ItemList", itemListElement: tour.destinations.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristDestination", name: d.name } })) } }
            : {}),
          ...(tour.price != null
            ? { offers: { "@type": "Offer", price: tour.price, priceCurrency: tour.currency, availability: "https://schema.org/InStock", url: siteUrl(`/tours/${tour.slug}`) } }
            : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Tours", item: siteUrl("/tours") },
            { "@type": "ListItem", position: 3, name: tour.title, item: siteUrl(`/tours/${tour.slug}`) },
          ],
        }}
      />
    </>
  );
}
