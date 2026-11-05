import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Star } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice, priceBasisLabel, tourTypeLabel } from "@/lib/utils";
import { toggleTour } from "../../actions";
import { AdminHeader, Badge, EmptyState, SavedNotice } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Tours" };

export default async function AdminToursPage({ searchParams }: PageProps<"/admin/tours">) {
  const { saved } = await searchParams;
  const tours = await db.tour.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { destinations: { select: { name: true } }, _count: { select: { enquiries: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Tours"
        description="Add, edit, publish and feature your tours and safaris."
        action={
          <Link href="/admin/tours/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New tour
          </Link>
        }
      />
      <SavedNotice show={saved === "1"}>Tour saved. The website has been updated.</SavedNotice>

      {tours.length === 0 ? (
        <EmptyState title="No tours yet" text="Create your first tour to show it on the website." href="/admin/tours/new" cta="Create a tour" />
      ) : (
        <ul className="space-y-3">
          {tours.map((t) => (
            <li key={t.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-sand-200 sm:flex-row sm:items-center">
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-sand-100 sm:w-28">
                {t.coverImage && <Image src={t.coverImage} alt="" fill sizes="112px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/tours/${t.id}`} className="font-semibold text-jungle-950 hover:underline">{t.title}</Link>
                  {!t.published && <Badge tone="neutral">Draft</Badge>}
                  {t.featured && <Badge tone="amber">Featured</Badge>}
                </div>
                <p className="mt-1 text-sm text-ink/60">
                  {tourTypeLabel(t.type)} · {t.duration}
                  {t.destinations.length > 0 && ` · ${t.destinations.map((d) => d.name).join(", ")}`}
                </p>
                <p className="mt-0.5 text-sm text-ink/60">
                  {formatPrice(t.price, t.currency) ? `${formatPrice(t.price, t.currency)} ${priceBasisLabel(t.priceBasis)}` : "Price on request"}
                  {t._count.enquiries > 0 && ` · ${t._count.enquiries} enquiries`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form action={toggleTour}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="field" value="featured" />
                  <button title={t.featured ? "Unfeature" : "Feature on home page"} aria-label={t.featured ? "Unfeature" : "Feature on home page"} className="rounded-lg p-2 text-ink/60 hover:bg-sand-100">
                    <Star className={t.featured ? "h-4.5 w-4.5 fill-sunset-500 text-sunset-500" : "h-4.5 w-4.5"} />
                  </button>
                </form>
                <form action={toggleTour}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="field" value="published" />
                  <button title={t.published ? "Unpublish" : "Publish"} aria-label={t.published ? "Unpublish" : "Publish"} className="rounded-lg p-2 text-ink/60 hover:bg-sand-100">
                    {t.published ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
                  </button>
                </form>
                <Link href={`/admin/tours/${t.id}`} className="btn border border-sand-300 px-4 py-2 hover:bg-sand-100">
                  <Pencil className="h-4 w-4" aria-hidden /> Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
