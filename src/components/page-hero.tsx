import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href: string; label: string };

export function PageHero({
  title,
  eyebrow,
  intro,
  image,
  crumbs = [],
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  image?: string | null;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-jungle-950 pt-36 pb-16 text-white sm:pt-44 sm:pb-24">
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jungle-950 via-jungle-950/60 to-jungle-950/30" />
        </>
      )}
      <div className="container-x">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-sunset-400 uppercase">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-white/80">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
