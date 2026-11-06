import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import { readContent } from "@/lib/content";
import { PAGE_SLUGS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdminPage() {
  const { pages } = await readContent();
  return (
    <>
      <AdminHeader title="Pages" description="Edit the text on your About, Why choose us, Terms and Privacy pages." />
      <ul className="grid gap-4 sm:grid-cols-2">
        {Object.entries(PAGE_SLUGS).map(([slug, label]) => {
          const page = pages.find((p) => p.slug === slug);
          return (
            <li key={slug} className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-sand-200">
              <FileText className="h-8 w-8 shrink-0 text-jungle-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-jungle-950">{label}</p>
                <p className="text-xs text-ink/55">/{slug} · {page ? `Updated ${formatDate(page.updatedAt)}` : "Not created yet"}</p>
              </div>
              <Link href={`/admin/pages/${slug}`} className="btn border border-sand-300 px-3 py-1.5 hover:bg-sand-100">
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
