import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/ui";
import { DestinationForm } from "../destination-form";

export const metadata: Metadata = { title: "New destination" };

export default function NewDestinationPage() {
  return (
    <>
      <AdminHeader title="New destination" />
      <DestinationForm />
    </>
  );
}
