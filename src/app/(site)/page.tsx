import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Binoculars, Compass, HandCoins, Leaf, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { TourCard } from "@/components/tour-card";
import { DestinationCard } from "@/components/destination-card";
import { getFaqs, getFeaturedTours, getPublishedDestinations, getSettings } from "@/lib/data";
import { TOUR_TYPES } from "@/lib/constants";
import { whatsappLink } from "@/lib/utils";
import { HeroScene } from "@/components/three-d/hero-scene";
import { Globe } from "@/components/three-d/globe";
import { PhotoCarousel3D } from "@/components/three-d/photo-carousel-3d";
import { Reveal } from "@/components/three-d/reveal";

const MOMENTS = [
  { src: "/images/yala-leopard.jpg", caption: "Leopard, Yala" },
  { src: "/images/minneriya-gathering.jpg", caption: "The Gathering, Minneriya" },
  { src: "/images/ella-nine-arch.jpg", caption: "Nine Arch Bridge, Ella" },
  { src: "/images/tea-nuwara-eliya.jpg", caption: "Tea country, Nuwara Eliya" },
  { src: "/images/sigiriya.jpg", caption: "Sigiriya Rock" },
  { src: "/images/mirissa.jpg", caption: "Mirissa coast" },
  { src: "/images/galle-fort.jpg", caption: "Galle Fort" },
  { src: "/images/wilpattu-sambar.jpg", caption: "Sambar deer, Wilpattu" },
  { src: "/images/horton-plains.jpg", caption: "Horton Plains" },
  { src: "/images/kumana.jpg", caption: "Kumana wetlands" },
];

export default async function HomePage() {
  const [settings, tours, destinations, faqs] = await Promise.all([
    getSettings(),
    getFeaturedTours(6),
    getPublishedDestinations(),
    getFaqs(),
  ]);
  const wa = whatsappLink(settings.whatsapp, "Hi Skylantic! I'd like help planning a trip to Sri Lanka.");

  return (
    <>
      {/* Hero */}
      <HeroScene image={settings.heroImage} alt="Wildlife in Sri Lanka">
        <div className="container-x">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-sunset-400" /> Sri Lanka · Safaris & holidays
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-7xl lg:text-8xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85 sm:text-xl">
            {settings.heroSubtitle ||
              "Leopards in Yala, elephant herds in Minneriya, and quiet mornings in Wilpattu — guided by locals who know the parks."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/tours" className="btn-primary px-7 py-3.5 text-base">
              Explore safaris <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost px-7 py-3.5 text-base text-white">
                <MessageCircle className="h-4 w-4" aria-hidden /> Chat on WhatsApp
              </a>
            ) : (
              <Link href="/contact" className="btn-ghost px-7 py-3.5 text-base text-white">
                Plan a custom trip
              </Link>
            )}
          </div>

          <ul className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 border-t border-white/15 pt-8 text-sm sm:grid-cols-4">
            {["Local safari guides", "Small private groups", "Hotel pickup included", "Reply within 24h"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-white/80">
                <ShieldCheck className="h-4 w-4 shrink-0 text-sunset-400" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </HeroScene>

      {/* Safari types */}
      <section className="border-b border-sand-200 bg-white">
        <div className="container-x flex flex-wrap items-center gap-3 py-6">
          <span className="mr-2 text-sm font-semibold text-jungle-900">Find your safari:</span>
          {Object.entries(TOUR_TYPES).map(([key, label]) => (
            <Link
              key={key}
              href={`/tours?type=${key}`}
              className="rounded-full border border-sand-300 px-4 py-2 text-sm text-ink/75 transition hover:border-jungle-500 hover:bg-jungle-50 hover:text-jungle-900"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured tours */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Tours & safaris</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold text-jungle-950 sm:text-5xl">
                Hand-picked experiences across the island
              </h2>
            </div>
            <Link href="/tours" className="group inline-flex items-center gap-2 text-sm font-semibold text-jungle-700">
              View all tours <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          {tours.length > 0 ? (
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour, i) => (
                <Reveal key={tour.id} delay={(i % 3) * 120}>
                  <TourCard tour={tour} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 rounded-3xl bg-white p-10 text-center text-ink/60 ring-1 ring-sand-200">
              New tours are being added — <Link href="/contact" className="font-semibold text-jungle-700 underline">ask us</Link> for a custom itinerary.
            </p>
          )}
        </div>
      </section>

      {/* 3D photo carousel */}
      <section className="overflow-hidden bg-jungle-950 pt-20 text-white sm:pt-28">
        <Reveal className="container-x text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-sunset-400 uppercase">Moments from the island</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
            One small island, a world of experiences
          </h2>
        </Reveal>
        <PhotoCarousel3D photos={MOMENTS} />
      </section>

      {/* Why us */}
      <section className="bg-jungle-950 py-20 text-white sm:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/yala-jeep.jpg"
              alt="Safari jeeps on a red-earth track in Yala National Park"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute right-5 bottom-5 left-5 rounded-2xl bg-white/95 p-5 text-ink shadow-xl sm:right-auto sm:max-w-xs">
              <p className="font-display text-lg font-semibold text-jungle-900">A new company, an old love for the wild</p>
              <p className="mt-1 text-sm text-ink/65">
                We&apos;re a young Sri Lankan team building the safari company we&apos;d want to travel with.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-sunset-400 uppercase">Why Skylantic</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Small groups. Honest prices. Real local knowledge.
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2">
              {[
                { Icon: Binoculars, title: "Guides who read the bush", text: "Trackers and drivers from the villages around each park, not call-centre schedulers." },
                { Icon: Users, title: "Your group, your jeep", text: "Private jeeps and small groups so you can linger at a sighting as long as you like." },
                { Icon: HandCoins, title: "Clear, upfront pricing", text: "Park fees, jeep and guide spelled out before you book. No surprises at the gate." },
                { Icon: Leaf, title: "Respect for wildlife", text: "We keep our distance, never crowd animals and follow park rules on every drive." },
              ].map(({ Icon, title, text }) => (
                <li key={title}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sunset-400">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{text}</p>
                </li>
              ))}
            </ul>
            <Link href="/why-choose-us" className="btn-primary mt-10">
              More about how we work
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      {destinations.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x">
            <div className="max-w-2xl">
              <p className="eyebrow">Where we go</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-jungle-950 sm:text-5xl">
                Sri Lanka&apos;s great national parks
              </h2>
              <p className="mt-4 text-lg text-ink/65">
                From leopard country in the dry south-east to the lakes where hundreds of elephants gather each year.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.slice(0, 6).map((d, i) => (
                <Reveal key={d.id} delay={(i % 3) * 100} className={i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}>
                  <DestinationCard destination={d} className={i === 0 ? "h-full lg:min-h-full" : "h-full"} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/destinations" className="btn-dark">
                See all destinations
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3D globe */}
      <section className="relative overflow-hidden bg-jungle-950 py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute top-1/2 right-0 h-[700px] w-[700px] -translate-y-1/2 translate-x-1/4 rounded-full bg-jungle-500/20 blur-3xl" aria-hidden />
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] text-sunset-400 uppercase">Getting here</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Sri Lanka is closer than you think</h2>
            <p className="mt-5 max-w-lg text-lg text-white/75">
              Direct and one-stop flights connect Colombo with Europe, the Middle East, India, Asia and Australia. Land at
              Bandaranaike International Airport and we can take it from there — airport pickup, transfers and safaris
              arranged in one place.
            </p>
            <ul className="mt-8 grid max-w-md grid-cols-2 gap-4 text-sm">
              {[
                ["~4.5 hrs", "from Dubai"],
                ["~3.5 hrs", "from Singapore"],
                ["~2.5 hrs", "from Mumbai"],
                ["~5 hrs", "airport to Yala by road"],
              ].map(([value, label]) => (
                <li key={label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block font-display text-2xl font-semibold text-sunset-400">{value}</span>
                  <span className="text-white/65">{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/40">Approximate flight and drive times. Drag the globe to explore.</p>
          </Reveal>
          <Globe className="max-w-[560px]" />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100 py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How booking works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-jungle-950 sm:text-5xl">Three simple steps</h2>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Compass, title: "Tell us your plans", text: "Pick a tour or describe your dream trip. Dates, group size and where you're staying help." },
              { Icon: MessageCircle, title: "Get a clear quote", text: "We confirm availability and send a full price within 24 hours — by email or WhatsApp." },
              { Icon: Binoculars, title: "Head into the wild", text: "We pick you up, handle park tickets and take care of everything on the day." },
            ].map(({ Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 120} className="relative rounded-3xl bg-white p-8 ring-1 ring-sand-200">
                <span className="font-display text-6xl font-semibold text-sand-200">0{i + 1}</span>
                <Icon className="absolute top-8 right-8 h-7 w-7 text-sunset-500" aria-hidden />
                <h3 className="mt-4 text-xl font-semibold text-jungle-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ preview */}
      {faqs.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="eyebrow">Good to know</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-jungle-950">Frequently asked questions</h2>
              <Link href="/faq" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-jungle-700">
                All questions <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="divide-y divide-sand-200 rounded-3xl bg-white px-6 ring-1 ring-sand-200 sm:px-8">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-jungle-950 [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand-100 text-jungle-700 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink/70">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-20 sm:pb-28">
        <div className="container-x">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-jungle-900 px-8 py-16 text-white sm:px-16">
            <Image src="/images/minneriya-gathering.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-35" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-jungle-950 via-jungle-950/80 to-transparent" />
            <h2 className="max-w-2xl font-display text-4xl font-semibold sm:text-5xl">Ready to see Sri Lanka&apos;s wildlife up close?</h2>
            <p className="mt-4 max-w-xl text-white/80">
              Tell us your dates and we&apos;ll put together the right safari — or a full island itinerary.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary px-7 py-3.5 text-base">
                Start planning
              </Link>
              <Link href="/tours" className="btn-ghost px-7 py-3.5 text-base">
                Browse tours
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
