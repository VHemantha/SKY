import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-jungle-950 px-6 py-32 text-center text-white">
      <div>
        <Compass className="mx-auto h-14 w-14 text-sunset-400" aria-hidden />
        <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-sunset-400 uppercase">404</p>
        <h1 className="mt-3 font-display text-5xl font-semibold">Off the trail</h1>
        <p className="mx-auto mt-4 max-w-md text-white/70">
          We couldn&apos;t find that page. It may have moved, or the tour is no longer available.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Back to home</Link>
          <Link href="/tours" className="btn-ghost">Browse tours</Link>
        </div>
      </div>
    </main>
  );
}
