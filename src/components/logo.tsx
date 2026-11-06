import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logoMark from "../../public/images/logo-mark.png";

// Brand emblem (transparent PNG cut from the master logo) + live-text wordmark,
// so the logo stays crisp and works on both light and dark backgrounds.
// The full master artwork lives at /images/logo-full.png.
export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Skylantic Holidays home">
      <Image src={logoMark} alt="" priority sizes="44px" className="h-11 w-11 shrink-0" />
      <span className="leading-none">
        <span
          className={cn(
            "block font-sans text-[1.35rem] font-semibold tracking-tight",
            light ? "text-white" : "text-[#1b2f63]",
          )}
        >
          Skylantic
        </span>
        <span
          className={cn(
            "mt-1 block text-[0.62rem] font-semibold tracking-[0.32em] uppercase",
            light ? "text-white/75" : "text-[#1fa6ad]",
          )}
        >
          Holidays
        </span>
      </span>
    </Link>
  );
}
