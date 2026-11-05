import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "./page-hero";
import { RichText } from "./rich-text";
import { getPage } from "@/lib/data";

export async function contentPageMetadata(slug: string, fallbackTitle: string): Promise<Metadata> {
  const page = await getPage(slug);
  return {
    title: page?.title ?? fallbackTitle,
    description: page?.metaDescription || undefined,
    alternates: { canonical: `/${slug}` },
  };
}

/** Renders an admin-editable page (About, Why us, Terms, Privacy). */
export async function ContentPage({
  slug,
  eyebrow,
  image,
  showCta = true,
}: {
  slug: string;
  eyebrow: string;
  image?: string;
  showCta?: boolean;
}) {
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow={eyebrow} title={page.title} image={image} crumbs={[{ href: `/${slug}`, label: page.title }]} />
      <section className="py-14 sm:py-20">
        <div className="container-x max-w-3xl">
          <RichText text={page.body} />
          <p className="mt-12 text-xs text-ink/45">
            Last updated{" "}
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Colombo" }).format(page.updatedAt)}
          </p>
          {showCta && (
            <div className="mt-12 flex flex-wrap gap-3 rounded-3xl bg-jungle-900 p-8 text-white">
              <p className="w-full font-display text-2xl font-semibold">Ready to plan your trip?</p>
              <Link href="/tours" className="btn-primary">Browse tours</Link>
              <Link href="/contact" className="btn-ghost">Contact us</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
