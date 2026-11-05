import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { ENQUIRY_STATUS } from "@/lib/constants";
import { formatDate, whatsappLink } from "@/lib/utils";
import { deleteEnquiry, updateEnquiry } from "../../../actions";
import { ActionForm, ConfirmForm } from "@/components/admin/action-form";
import { Card, CardTitle, Select, Textarea } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  const { id } = await params;
  const e = await db.enquiry.findUnique({ where: { id }, include: { tour: { select: { title: true, slug: true } } } });
  if (!e) notFound();

  const wa = whatsappLink(e.phone, `Hi ${e.name}, thank you for your enquiry with Skylantic Holidays!`);
  const subject = encodeURIComponent(`Your Skylantic Holidays enquiry${e.tour ? ` — ${e.tour.title}` : ""}`);
  const travellers = `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? `, ${e.children} child${e.children === 1 ? "" : "ren"}` : ""}`;
  const rows: [string, string][] = [
    ["Email", e.email],
    ["Phone", e.phone || "—"],
    ["Country", e.country || "—"],
    ["Tour", e.tour?.title ?? "General enquiry"],
    ["Travel date", e.travelDate || "—"],
    ["Travellers", travellers],
    ["Received", formatDate(e.createdAt)],
  ];

  return (
    <>
      <Link href="/admin/enquiries" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-jungle-800">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All enquiries
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-jungle-950">{e.name}</h1>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${e.email}?subject=${subject}`} className="btn-dark px-4 py-2">
            <Mail className="h-4 w-4" aria-hidden /> Reply by email
          </a>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-4 py-2 text-white hover:bg-[#1fb457]">
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          )}
          {e.phone && (
            <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="btn border border-sand-300 px-4 py-2 hover:bg-sand-100">
              <Phone className="h-4 w-4" aria-hidden /> Call
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle>Details</CardTitle>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[140px_1fr]">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-ink/50">{k}</dt>
                  <dd className="break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <CardTitle>Message</CardTitle>
            <p className="text-sm leading-relaxed whitespace-pre-line text-ink/80">{e.message || "No message."}</p>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardTitle>Status & notes</CardTitle>
            <ActionForm action={updateEnquiry} submitLabel="Update">
              <input type="hidden" name="id" value={e.id} />
              <Select label="Status" name="status" options={ENQUIRY_STATUS} defaultValue={e.status} />
              <Textarea label="Internal notes" name="notes" rows={6} defaultValue={e.notes} hint="Only visible to admins." />
            </ActionForm>
          </Card>
          <ConfirmForm
            action={deleteEnquiry}
            id={e.id}
            message="Delete this enquiry permanently?"
            className="btn px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Delete enquiry
          </ConfirmForm>
        </div>
      </div>
    </>
  );
}
