import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { AdminHeader } from "@/components/admin/ui";
import { TourForm } from "../tour-form";

export const metadata: Metadata = { title: "New tour" };

export default async function NewTourPage() {
  const destinations = [...(await readContent()).destinations]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name }) => ({ id, name }));
  return (
    <>
      <AdminHeader title="New tour" description="Fill in the details below. You can save it as a draft by turning off “Published”." />
      <TourForm destinations={destinations} />
    </>
  );
}
