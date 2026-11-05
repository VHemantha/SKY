import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { getFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ — Sri Lanka Safaris",
  description:
    "Answers to common questions about Sri Lanka safaris: best time to visit, what to bring, pickups, park fees, children, payments and cancellations.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHero eyebrow="Help" title="Frequently asked questions" crumbs={[{ href: "/faq", label: "FAQ" }]} />
      <section className="py-14 sm:py-20">
        <div className="container-x max-w-3xl">
          <div className="divide-y divide-sand-200 rounded-3xl bg-white px-6 ring-1 ring-sand-200 sm:px-8">
            {faqs.map((f) => (
              <details key={f.id} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-jungle-950 [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-jungle-700 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/70">{f.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-center text-ink/65">
            Still have a question?{" "}
            <Link href="/contact" className="font-semibold text-jungle-700 underline">Get in touch</Link> — we reply within 24 hours.
          </p>
        </div>
      </section>
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      )}
    </>
  );
}
