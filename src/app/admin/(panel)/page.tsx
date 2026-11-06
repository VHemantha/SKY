import Link from "next/link";
import { HelpCircle, Map, Mountain, Plus } from "lucide-react";
import { readContent } from "@/lib/content";
import { AdminHeader, Card, CardTitle } from "@/components/admin/ui";

export default async function DashboardPage() {
  const { tours, destinations, faqs } = await readContent();

  const stats = [
    { label: "Tours", value: tours.length, sub: `${tours.filter((t) => t.published).length} published`, href: "/admin/tours", Icon: Map },
    { label: "Destinations", value: destinations.length, sub: "national parks & places", href: "/admin/destinations", Icon: Mountain },
    { label: "FAQs", value: faqs.length, sub: `${faqs.filter((f) => f.published).length} published`, href: "/admin/faqs", Icon: HelpCircle },
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
        <CardTitle>Enquiries</CardTitle>
        <p className="text-sm text-ink/70">
          Visitors&apos; enquiry forms open WhatsApp or their email app with the trip details filled in, so enquiries
          arrive straight on the WhatsApp number and email address set in{" "}
          <Link className="font-medium text-jungle-700 underline" href="/admin/settings">Site settings</Link>.
        </p>
      </Card>

      <Card className="mt-6">
        <CardTitle>Getting started checklist</CardTitle>
        <ul className="space-y-2 text-sm text-ink/75">
          <li>1. <Link className="font-medium text-jungle-700 underline" href="/admin/settings">Add your phone, WhatsApp and email</Link> so visitors can reach you — the enquiry forms need them.</li>
          <li>2. <Link className="font-medium text-jungle-700 underline" href="/admin/tours">Replace the sample tours</Link> with your real tours, prices and photos.</li>
          <li>3. <Link className="font-medium text-jungle-700 underline" href="/admin/pages">Review About, Terms and Privacy</Link> — have the legal pages checked before launch.</li>
        </ul>
      </Card>
    </>
  );
}
