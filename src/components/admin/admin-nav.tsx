"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, HelpCircle, LayoutDashboard, Map, Mountain, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/tours", label: "Tours", Icon: Map },
  { href: "/admin/destinations", label: "Destinations", Icon: Mountain },
  { href: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
  { href: "/admin/pages", label: "Pages", Icon: FileText },
  { href: "/admin/settings", label: "Site settings", Icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {ITEMS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                  active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
