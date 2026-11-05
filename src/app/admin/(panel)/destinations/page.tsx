import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader, Badge, EmptyState, SavedNotice } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Destinations" };

export default async function AdminDestinationsPage({ searchParams }: PageProps<"/admin/destinations">) {
  const { saved } = await searchParams;
  const destinations = await db.destination.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { tours: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Destinations"
        description="National parks and places your tours visit. Each one gets its own page on the website."
        action={
          <Link href="/admin/destinations/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New destination
          </Link>
        }
      />
      <SavedNotice show={saved === "1"}>Destination saved. The website has been updated.</SavedNotice>
      {destinations.length === 0 ? (
        <EmptyState title="No destinations yet" text="Add national parks such as Yala or Udawalawe." href="/admin/destinations/new" cta="Add a destination" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <li key={d.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200">
              <div className="relative aspect-[16/9] bg-sand-100">
                {d.image && <Image src={d.image} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-jungle-950">
                    {d.name} {!d.published && <Badge>Hidden</Badge>}
                  </p>
                  <p className="text-xs text-ink/55">{d.region} · {d._count.tours} tours</p>
                </div>
                <Link href={`/admin/destinations/${d.id}`} className="btn border border-sand-300 px-3 py-1.5 hover:bg-sand-100">
                  <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
