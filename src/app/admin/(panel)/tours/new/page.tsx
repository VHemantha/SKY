import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { TourForm } from "../tour-form";

export const metadata: Metadata = { title: "New tour" };

export default async function NewTourPage() {
  const destinations = await db.destination.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <AdminHeader title="New tour" description="Fill in the details below. You can save it as a draft by turning off “Published”." />
      <TourForm destinations={destinations} />
    </>
  );
}
