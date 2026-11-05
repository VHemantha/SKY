import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Skylantic Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const newEnquiries = await db.enquiry.count({ where: { status: "NEW" } });

  return (
    <div className="flex min-h-svh flex-col bg-sand-50 lg:flex-row">
      <aside className="bg-jungle-950 text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between px-5 py-5">
          <Logo light />
        </div>
        <div className="px-3 pb-3 lg:flex-1">
          <AdminNav newEnquiries={newEnquiries} />
        </div>
        <div className="hidden border-t border-white/10 p-4 text-sm lg:block">
          <p className="truncate text-white/80">{session.name}</p>
          <p className="truncate text-xs text-white/50">{session.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View site
            </Link>
            <form action={logout}>
              <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
                <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-end gap-2 border-b border-sand-200 bg-white px-5 py-2 lg:hidden">
          <Link href="/" target="_blank" className="rounded-lg px-2 py-1.5 text-xs text-ink/70 hover:bg-sand-100">View site</Link>
          <form action={logout}>
            <button className="rounded-lg px-2 py-1.5 text-xs text-ink/70 hover:bg-sand-100">Sign out</button>
          </form>
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
