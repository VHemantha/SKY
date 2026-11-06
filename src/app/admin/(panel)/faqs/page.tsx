import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { readContent } from "@/lib/content";
import { deleteFaq, saveFaq } from "../../actions";
import { ActionForm, ConfirmForm } from "@/components/admin/action-form";
import { AdminHeader, Badge, Card, CardTitle, Input, Textarea, Toggle } from "@/components/admin/ui";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsAdminPage() {
  const faqs = [...(await readContent()).faqs].sort((a, b) => a.sortOrder - b.sortOrder);
  const nextOrder = (faqs.at(-1)?.sortOrder ?? 0) + 10;

  return (
    <>
      <AdminHeader title="FAQs" description="Questions shown on the FAQ page and home page. They also appear as rich results in Google." />

      <Card className="mb-8">
        <CardTitle>Add a question</CardTitle>
        {/* key remounts the form after each new FAQ so the fields clear */}
        <ActionForm key={faqs.length} action={saveFaq} submitLabel="Add FAQ">
          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <Input label="Question" name="question" required />
            <Input label="Order" name="sortOrder" type="number" defaultValue={nextOrder} />
            <Textarea label="Answer" name="answer" required rows={3} className="sm:col-span-2" />
          </div>
          <Toggle label="Published" name="published" defaultChecked />
        </ActionForm>
      </Card>

      <div className="space-y-4">
        {faqs.map((f) => (
          <details key={f.id} className="group rounded-2xl bg-white ring-1 ring-sand-200">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
              <span className="text-xs text-ink/40">#{f.sortOrder}</span>
              <span className="flex-1 font-medium text-jungle-950">{f.question}</span>
              {!f.published && <Badge>Hidden</Badge>}
              <span className="text-sm text-jungle-700 group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-sand-200 p-5">
              <ActionForm action={saveFaq} submitLabel="Save">
                <input type="hidden" name="id" value={f.id} />
                <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                  <Input label="Question" name="question" required defaultValue={f.question} />
                  <Input label="Order" name="sortOrder" type="number" defaultValue={f.sortOrder} />
                  <Textarea label="Answer" name="answer" required rows={4} defaultValue={f.answer} className="sm:col-span-2" />
                </div>
                <Toggle label="Published" name="published" defaultChecked={f.published} />
              </ActionForm>
              <div className="mt-4 border-t border-sand-200 pt-4">
                <ConfirmForm action={deleteFaq} id={f.id} message="Delete this question?" className="btn px-4 py-2 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete question
                </ConfirmForm>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
