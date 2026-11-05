import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteDestination } from "../../../actions";
import { AdminHeader } from "@/components/admin/ui";
import { ConfirmForm } from "@/components/admin/action-form";
import { DestinationForm } from "../destination-form";

export const metadata: Metadata = { title: "Edit destination" };

export default async function EditDestinationPage({ params }: PageProps<"/admin/destinations/[id]">) {
  const { id } = await params;
  const destination = await db.destination.findUnique({ where: { id } });
  if (!destination) notFound();
  return (
    <>
      <AdminHeader
        title={destination.name}
        description="Edit destination"
        action={
          <ConfirmForm
            action={deleteDestination}
            id={destination.id}
            message={`Delete “${destination.name}”? Tours will stay but lose this park.`}
            className="btn border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Delete
          </ConfirmForm>
        }
      />
      <DestinationForm destination={destination} />
    </>
  );
}
