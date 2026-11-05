import Link from "next/link";
import { cn } from "@/lib/utils";

// Text wordmark used until the final logo files arrive.
// To use an image logo, replace the <svg> + text with <Image src="/images/logo.svg" ... />.
export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Skylantic Holidays home">
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={light ? "#ffffff" : "#112f2b"} fillOpacity={light ? 0.12 : 1} />
        <circle cx="40" cy="24" r="8" fill="#e8843a" />
        <path d="M8 46c8-10 16-14 24-10s16 2 24-6v18H8z" fill="#4a9887" />
        <path d="M8 52c10-6 20-8 30-4s14 0 18-2v6H8z" fill="#ebdfc9" />
      </svg>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-xl font-semibold tracking-tight",
            light ? "text-white" : "text-jungle-900",
          )}
        >
          Skylantic
        </span>
        <span
          className={cn(
            "block text-[0.62rem] font-semibold tracking-[0.28em] uppercase",
            light ? "text-white/70" : "text-jungle-600",
          )}
        >
          Holidays · Sri Lanka
        </span>
      </span>
    </Link>
  );
}
