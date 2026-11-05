import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteTour } from "../../../actions";
import { AdminHeader } from "@/components/admin/ui";
import { ConfirmForm } from "@/components/admin/action-form";
import { TourForm } from "../tour-form";

export const metadata: Metadata = { title: "Edit tour" };

export default async function EditTourPage({ params }: PageProps<"/admin/tours/[id]">) {
  const { id } = await params;
  const [tour, destinations] = await Promise.all([
    db.tour.findUnique({ where: { id }, include: { destinations: { select: { id: true } } } }),
    db.destination.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!tour) notFound();

  return (
    <>
      <AdminHeader
        title={tour.title}
        description="Edit tour"
        action={
          <div className="flex gap-2">
            {tour.published && (
              <Link href={`/tours/${tour.slug}`} target="_blank" className="btn border border-sand-300 px-4 py-2 hover:bg-sand-100">
                <ExternalLink className="h-4 w-4" aria-hidden /> View
              </Link>
            )}
            <ConfirmForm
              action={deleteTour}
              id={tour.id}
              message={`Delete “${tour.title}”? This can't be undone.`}
              className="btn border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </ConfirmForm>
          </div>
        }
      />
      <TourForm tour={tour} destinations={destinations} />
    </>
  );
}
