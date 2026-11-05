import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ENQUIRY_STATUS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { AdminHeader, Badge, EmptyState } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Enquiries" };

function statusTone(s: string) {
  return s === "NEW" ? "amber" : s === "CONFIRMED" ? "green" : s === "CONTACTED" ? "blue" : "neutral";
}

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const { status } = await searchParams;
  const filter = typeof status === "string" && status in ENQUIRY_STATUS ? status : undefined;
  const [enquiries, counts] = await Promise.all([
    db.enquiry.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { createdAt: "desc" },
      include: { tour: { select: { title: true } } },
      take: 200,
    }),
    db.enquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((n, c) => n + c._count, 0);

  return (
    <>
      <AdminHeader title="Enquiries" description="Messages from the contact and tour booking forms." />
      <div className="mb-6 flex flex-wrap gap-2">
        <Tab href="/admin/enquiries" active={!filter}>All ({total})</Tab>
        {Object.entries(ENQUIRY_STATUS).map(([key, label]) => (
          <Tab key={key} href={`/admin/enquiries?status=${key}`} active={filter === key}>
            {label} ({count(key)})
          </Tab>
        ))}
      </div>
      {enquiries.length === 0 ? (
        <EmptyState title="Nothing here" text="New enquiries from the website will show up in this list." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-xs tracking-wider text-ink/50 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Tour</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Travel date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {enquiries.map((e) => (
                <tr key={e.id} className={cn("hover:bg-sand-50", e.status === "NEW" && "font-medium")}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/enquiries/${e.id}`} className="block text-jungle-950 hover:underline">{e.name}</Link>
                    <span className="block text-xs font-normal text-ink/55">{e.email}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink/70 md:table-cell">{e.tour?.title ?? "General"}</td>
                  <td className="hidden px-4 py-3 text-ink/70 sm:table-cell">{e.travelDate || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(e.status)}>{ENQUIRY_STATUS[e.status as keyof typeof ENQUIRY_STATUS]}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-ink/55 lg:table-cell">{formatDate(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm",
        active ? "bg-jungle-900 text-white" : "bg-white text-ink/70 ring-1 ring-sand-200 hover:bg-sand-100",
      )}
    >
      {children}
    </Link>
  );
}
