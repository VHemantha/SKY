import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TiltCard } from "./three-d/tilt-card";

type Props = {
  destination: { slug: string; name: string; region: string; summary: string; image: string | null; _count?: { tours: number } };
  className?: string;
};

export function DestinationCard({ destination: d, className = "" }: Props) {
  return (
    <TiltCard className={`rounded-3xl ${className}`}>
      <Link
        href={`/destinations/${d.slug}`}
        className="group relative block h-full min-h-80 overflow-hidden rounded-3xl bg-jungle-900"
      >
        {d.image && (
          <Image
            src={d.image}
            alt={`${d.name}, Sri Lanka`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-90 transition duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-jungle-950/90 via-jungle-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="text-xs font-semibold tracking-[0.18em] text-sunset-400 uppercase">{d.region}</p>
          <h3 className="mt-1 flex items-center justify-between gap-3 font-display text-2xl font-semibold">
            {d.name}
            <ArrowUpRight className="h-6 w-6 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/80">{d.summary}</p>
          {d._count && d._count.tours > 0 && (
            <p className="mt-3 text-xs font-medium text-white/60">
              {d._count.tours} {d._count.tours === 1 ? "tour" : "tours"}
            </p>
          )}
        </div>
      </Link>
    </TiltCard>
  );
}
