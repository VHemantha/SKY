import Link from "next/link";
import { ArrowRight, Inbox, Map, Mountain, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { ENQUIRY_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { AdminHeader, Badge, Card, CardTitle } from "@/components/admin/ui";

export default async function DashboardPage() {
  const [tours, published, destinations, newCount, total, recent] = await Promise.all([
    db.tour.count(),
    db.tour.count({ where: { published: true } }),
    db.destination.count(),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.enquiry.count(),
    db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { tour: { select: { title: true } } } }),
  ]);

  const stats = [
    { label: "New enquiries", value: newCount, sub: `${total} total`, href: "/admin/enquiries", Icon: Inbox },
    { label: "Tours", value: tours, sub: `${published} published`, href: "/admin/tours", Icon: Map },
    { label: "Destinations", value: destinations, sub: "national parks & places", href: "/admin/destinations", Icon: Mountain },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="An overview of your website."
        action={
          <Link href="/admin/tours/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> Add a tour
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, sub, href, Icon }) => (
          <Link key={label} href={href} className="rounded-2xl bg-white p-6 ring-1 ring-sand-200 transition hover:ring-jungle-300">
            <Icon className="h-5 w-5 text-sunset-600" aria-hidden />
            <p className="mt-4 text-3xl font-bold text-jungle-950">{value}</p>
            <p className="text-sm font-medium text-ink/80">{label}</p>
            <p className="text-xs text-ink/50">{sub}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <CardTitle>Latest enquiries</CardTitle>
          <Link href="/admin/enquiries" className="mb-5 flex items-center gap-1 text-sm font-medium text-jungle-700">
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-ink/60">No enquiries yet. They&apos;ll appear here as soon as visitors use the contact or tour forms.</p>
        ) : (
          <ul className="divide-y divide-sand-200">
            {recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-sand-50">
                  <span className="font-medium text-jungle-950">{e.name}</span>
                  <span className="text-sm text-ink/60">{e.tour?.title ?? "General enquiry"}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <Badge tone={e.status === "NEW" ? "amber" : e.status === "CONFIRMED" ? "green" : "neutral"}>
                      {ENQUIRY_STATUS[e.status as keyof typeof ENQUIRY_STATUS]}
                    </Badge>
                    <span className="text-xs text-ink/50">{formatDate(e.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <CardTitle>Getting started checklist</CardTitle>
        <ul className="space-y-2 text-sm text-ink/75">
          <li>1. <Link className="font-medium text-jungle-700 underline" href="/admin/settings">Add your phone, WhatsApp and email</Link> so visitors can reach you.</li>
          <li>2. <Link className="font-medium text-jungle-700 underline" href="/admin/tours">Replace the sample tours</Link> with your real tours, prices and photos.</li>
          <li>3. <Link className="font-medium text-jungle-700 underline" href="/admin/pages">Review About, Terms and Privacy</Link> — have the legal pages checked before launch.</li>
          <li>4. <Link className="font-medium text-jungle-700 underline" href="/admin/account">Change the admin password.</Link></li>
        </ul>
      </Card>
    </>
  );
}
