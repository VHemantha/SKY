"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/hero-slides";

const INTERVAL_MS = 6000;
const SLIDE_MS = 1100;

/**
 * Home hero with a full-bleed photo slider. Photos glide in from the side on a
 * timer, each with a slow zoom while it's on screen. Visitors can also use the
 * arrows, the dots, the keyboard or a swipe. The copy on top gently recedes as
 * the page scrolls.
 */
export function HeroScene({ slides, children }: { slides: HeroSlide[]; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const busy = useRef(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (target: number, direction: 1 | -1) => {
      if (busy.current || count < 2) return;
      const nextIndex = (target + count) % count;
      if (nextIndex === active) return;
      busy.current = true;
      // Set the direction first so the incoming photo is parked on the correct
      // side, then start the slide on a later frame.
      setDir(direction);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setPrev(active);
          setActive(nextIndex);
          window.setTimeout(() => (busy.current = false), SLIDE_MS);
        }),
      );
    },
    [active, count],
  );

  const next = useCallback(() => go(active + 1, 1), [go, active]);
  const back = useCallback(() => go(active - 1, -1), [go, active]);

  // Autoplay. Restarts whenever the slide changes, so a manual click gets a full interval.
  useEffect(() => {
    if (paused || count < 2) return;
    const t = window.setTimeout(next, INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, next, count]);

  // Pause autoplay while the tab is hidden or the hero is off-screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let visible = true;
    const sync = () => setPaused(!visible || document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Copy floats back into the scene as the visitor scrolls.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const p = Math.min(window.scrollY / (el.offsetHeight || 1), 1);
        if (front.current) {
          front.current.style.transform = `translate3d(0, ${-p * 60}px, ${-p * 220}px) rotateX(${p * 10}deg)`;
          front.current.style.opacity = String(1 - p * 1.2);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Featured photos"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") back();
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : back)();
        touchX.current = null;
      }}
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-jungle-950 pt-32 pb-24 text-white [perspective:1200px] sm:pb-28"
    >
      {/* Slides */}
      <div className="absolute inset-0 -z-20">
        {slides.map((slide, i) => {
          const isActive = i === active;
          const isPrev = i === prev;
          // The active photo sits in place, the outgoing one slides away, and the rest
          // wait off-screen on the side the next photo will come in from.
          const x = isActive ? 0 : isPrev ? -dir * 100 : dir * 100;
          return (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!isActive}
              className="absolute inset-0 overflow-hidden will-change-transform"
              style={{
                transform: `translate3d(${x}%, 0, 0)`,
                transition: isActive || isPrev ? `transform ${SLIDE_MS}ms cubic-bezier(0.77, 0, 0.18, 1)` : "none",
                visibility: isActive || isPrev ? "visible" : "hidden",
                zIndex: isActive ? 2 : isPrev ? 1 : 0,
              }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{
                  transform: `scale(${isActive ? 1 : 1.1})`,
                  transition: isActive ? `transform ${INTERVAL_MS + SLIDE_MS}ms ease-out` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jungle-950 via-jungle-950/45 to-jungle-950/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-jungle-950/70 to-transparent" />

      <div ref={front} className="w-full will-change-transform [transform-style:preserve-3d]">
        {children}
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="absolute right-5 bottom-6 z-10 flex items-center gap-3 sm:right-8 sm:bottom-8">
          {slides[active].caption && (
            <p aria-live="polite" className="mr-2 hidden text-xs font-medium tracking-wide text-white/70 md:block">
              {slides[active].caption}
            </p>
          )}
          <button
            type="button"
            onClick={back}
            aria-label="Previous photo"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => go(i, i > active ? 1 : -1)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className="grid h-6 place-items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-500",
                    i === active ? "w-7 bg-sunset-400" : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
