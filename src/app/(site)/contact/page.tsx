import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { EnquiryForm } from "@/components/enquiry-form";
import { getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & Enquiries",
  description:
    "Plan your Sri Lanka safari or holiday with Skylantic. Send an enquiry or message us on WhatsApp — we reply within 24 hours.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, "Hi Skylantic! I'd like help planning a trip.");

  const items = [
    wa && { Icon: MessageCircle, label: "WhatsApp", value: s.whatsapp, href: wa },
    s.phone && { Icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    s.email && { Icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.address && { Icon: MapPin, label: "Address", value: s.address },
  ].filter(Boolean) as { Icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's plan your Sri Lanka adventure"
        intro="Tell us when you're travelling and what you'd love to see. We'll come back with options and a clear quote."
        image="/images/tea-nuwara-eliya.jpg"
        crumbs={[{ href: "/contact", label: "Contact" }]}
      />
      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            {items.map(({ Icon, label, value, href }) => {
              const body = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-jungle-50 text-jungle-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wider text-ink/50 uppercase">{label}</span>
                    <span className="mt-0.5 block font-medium whitespace-pre-line text-jungle-950">{value}</span>
                  </span>
                </>
              );
              return href ? (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-sand-200 transition hover:ring-jungle-300">
                  {body}
                </a>
              ) : (
                <div key={label} className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-sand-200">{body}</div>
              );
            })}
            <div className="flex gap-4 rounded-3xl bg-jungle-900 p-5 text-white">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-sunset-400">
                <Clock className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-xs font-semibold tracking-wider text-white/60 uppercase">Response time</span>
                <span className="mt-0.5 block font-medium">We reply to every enquiry within 24 hours (Sri Lanka time, GMT+5:30).</span>
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-jungle-900/5 ring-1 ring-sand-200 sm:p-10">
            <h2 className="font-display text-3xl font-semibold text-jungle-950">Send an enquiry</h2>
            <p className="mt-2 mb-8 text-sm text-ink/60">Fields marked * are required.</p>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
