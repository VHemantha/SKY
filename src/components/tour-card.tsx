import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";
import type { TourWithDestinations } from "@/lib/data";
import { formatPrice, priceBasisLabel, tourTypeLabel } from "@/lib/utils";
import { TiltCard } from "./three-d/tilt-card";

export function TourCard({ tour, priority = false }: { tour: TourWithDestinations; priority?: boolean }) {
  const price = formatPrice(tour.price, tour.currency);
  return (
    <TiltCard className="rounded-3xl">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sand-200 transition hover:shadow-2xl hover:shadow-jungle-900/15">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand-200">
          {tour.coverImage && (
            <Image
              src={tour.coverImage}
              alt={tour.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          )}
          <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-jungle-900">
            {tourTypeLabel(tour.type)}
          </span>
          {tour.featured && (
            <span className="absolute top-4 right-4 rounded-full bg-sunset-500 px-3 py-1 text-xs font-semibold text-white">
              Popular
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          {tour.destinations.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-jungle-600">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {tour.destinations.map((d) => d.name).join(" · ")}
            </p>
          )}
          <h3 className="mt-2 font-display text-xl leading-snug font-semibold text-jungle-950">
            <Link href={`/tours/${tour.slug}`} className="after:absolute after:inset-0">
              {tour.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/65">{tour.summary}</p>

          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
              <li className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {tour.duration}
              </li>
              {tour.maxGroupSize && (
                <li className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  Max {tour.maxGroupSize}
                </li>
              )}
            </ul>
            <p className="text-right">
              {price ? (
                <>
                  <span className="block text-[0.7rem] text-ink/50">From</span>
                  <span className="text-lg font-bold text-jungle-900">{price}</span>
                  <span className="block text-[0.7rem] text-ink/50">{priceBasisLabel(tour.priceBasis)}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-jungle-700">Price on request</span>
              )}
            </p>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
