import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { FacebookIcon, InstagramIcon, TripadvisorIcon } from "./social-icons";
import type { SiteSettings } from "@/lib/content";

const EXPLORE = [
  { href: "/tours", label: "All tours & safaris" },
  { href: "/tours?type=DAY_SAFARI", label: "Day safaris" },
  { href: "/tours?type=OVERNIGHT", label: "Overnight safaris" },
  { href: "/tours?type=PRIVATE", label: "Private safaris" },
  { href: "/destinations", label: "National parks" },
];

const COMPANY = [
  { href: "/about", label: "About us" },
  { href: "/why-choose-us", label: "Why choose us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/terms", label: "Terms & conditions" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/photo-credits", label: "Photo credits" },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.tripadvisor, label: "Tripadvisor", Icon: TripadvisorIcon },
  ].filter((s) => s.href);

  return (
    <footer className="mt-auto bg-jungle-950 text-white/75">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{settings.tagline}</p>
          {settings.credentials && (
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/55">{settings.credentials}</p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/8 transition hover:bg-sunset-500 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterList title="Explore" items={EXPLORE} />
        <FooterList title="Company" items={COMPANY} />

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Get in touch</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sunset-400" aria-hidden />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sunset-400" aria-hidden />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sunset-400" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            )}
          </ul>
          <Link href="/contact" className="btn-primary mt-6">
            Send an enquiry
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="transition hover:text-white">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
