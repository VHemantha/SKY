import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { JsonLd } from "@/components/json-ld";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

// Rendered on request: the database isn't available while the site is being built
// (Netlify Database applies migrations just before the deploy goes live).
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  const sameAs = [settings.facebook, settings.instagram, settings.tripadvisor].filter(Boolean);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <WhatsAppButton number={settings.whatsapp} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: settings.siteName,
          description: settings.tagline,
          url: siteUrl(),
          logo: siteUrl("/icon.svg"),
          image: siteUrl(settings.heroImage),
          areaServed: { "@type": "Country", name: "Sri Lanka" },
          address: { "@type": "PostalAddress", addressCountry: "LK", streetAddress: settings.address || undefined },
          ...(settings.phone ? { telephone: settings.phone } : {}),
          ...(settings.email ? { email: settings.email } : {}),
          ...(sameAs.length ? { sameAs } : {}),
        }}
      />
    </>
  );
}
