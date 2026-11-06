import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { readContent } from "@/lib/content";
import { PAGE_SLUGS } from "@/lib/constants";
import { savePage } from "../../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminHeader, Card, Input, Textarea } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Edit page" };

export default async function EditPagePage({ params }: PageProps<"/admin/pages/[slug]">) {
  const { slug } = await params;
  if (!(slug in PAGE_SLUGS)) notFound();
  const page = (await readContent()).pages.find((p) => p.slug === slug);
  const label = PAGE_SLUGS[slug as keyof typeof PAGE_SLUGS];

  return (
    <>
      <Link href="/admin/pages" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-jungle-800">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All pages
      </Link>
      <AdminHeader
        title={label}
        action={
          <Link href={`/${slug}`} target="_blank" className="btn border border-sand-300 px-4 py-2 hover:bg-sand-100">
            <ExternalLink className="h-4 w-4" aria-hidden /> View page
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <ActionForm action={savePage} submitLabel="Save & publish">
            <input type="hidden" name="slug" value={slug} />
            <Input label="Page title" name="title" required defaultValue={page?.title ?? label} />
            <Textarea label="Content" name="body" required rows={24} defaultValue={page?.body ?? ""} className="font-mono" />
            <Input label="SEO description" name="metaDescription" maxLength={170} defaultValue={page?.metaDescription ?? ""} hint="Shown in Google results. Up to 170 characters." />
          </ActionForm>
        </Card>
        <aside className="h-fit rounded-2xl bg-jungle-50 p-5 text-sm text-jungle-900">
          <p className="font-semibold">Formatting help</p>
          <ul className="mt-3 space-y-2 text-jungle-800">
            <li><code className="rounded bg-white px-1">## Heading</code> — section heading</li>
            <li><code className="rounded bg-white px-1">### Subheading</code> — smaller heading</li>
            <li><code className="rounded bg-white px-1">- item</code> — bullet point</li>
            <li><code className="rounded bg-white px-1">**bold**</code> — bold text</li>
            <li>Leave an empty line between paragraphs.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
