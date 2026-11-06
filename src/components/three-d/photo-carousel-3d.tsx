"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type Photo = { src: string; caption: string };

// Centre-to-centre distance between neighbouring front cards on large screens,
// as a multiple of the card width (1.1 leaves a gap of about a tenth of a card).
const SPACING = 1.1;
// Largest the oval may get sideways, as a share of the stage width.
const MAX_REACH = 0.62;
// Ring depth on large screens, as a multiple of the card width.
const DEPTH = 2.1;
// Phones and tablets: slightly tighter spacing and a shallower ring, so the
// centre card stays big and its neighbours peek in from the sides.
const SPACING_SMALL = 1.08;
const DEPTH_SMALL = 1.6;
const LARGE = "(min-width: 1024px)";

/**
 * A ring of photos arranged in 3D space. The ring turns as the visitor scrolls
 * past it (and drifts slowly on its own), so photos swing in from the sides.
 * Reduced-motion users get a still ring.
 *
 * The ring's size is worked out from the card width and the number of photos,
 * so cards never overlap however many photos there are. On large screens it
 * becomes a wide oval that spreads towards the edges of the page; when there's
 * room, every photo appears twice, each copy directly opposite the other, so
 * the visible front half stays full and never shows the same photo twice.
 */
export function PhotoCarousel3D({ photos }: { photos: Photo[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [doubled, setDoubled] = useState(false);
  const list = doubled ? [...photos, ...photos] : photos;
  const count = list.length;
  const step = 360 / count;

  useEffect(() => {
    const el = stage.current;
    const r = ring.current;
    if (!el || !r) return;
    const n = photos.length;
    const large = window.matchMedia(LARGE);

    let rx = 0;
    let rz = 0;
    // Work out the oval for the current screen size. Returns false if the card
    // count needs to change first (the effect then re-runs with the new count).
    const measure = () => {
      const card = cards.current[0]?.offsetWidth ?? 0;
      if (!card) {
        rx = rz = probe.current?.offsetWidth ?? 0;
      } else {
        const isLarge = large.matches;
        // Desktop keeps the ring within the page; on phones the side cards may
        // run off-screen so they peek in from the edges.
        const maxRx = isLarge ? el.offsetWidth * MAX_REACH : Infinity;
        const wantDouble = isLarge && n < 12 && maxRx * Math.sin(Math.PI / n) >= card * SPACING * 0.92;
        if (wantDouble !== doubled) {
          setDoubled(wantDouble);
          return false;
        }
        const spacing = isLarge ? SPACING : SPACING_SMALL;
        // Size the ring so neighbouring cards sit `spacing` card-widths apart and never overlap.
        const fit = count >= 3 ? (card * spacing) / Math.sin((2 * Math.PI) / count) : card * spacing;
        rx = Math.min(fit, maxRx);
        rz = Math.min(rx, card * (isLarge ? DEPTH : DEPTH_SMALL));
      }
      r.style.transform = `translateZ(${-rz}px) rotateX(-6deg)`;
      return true;
    };

    // Place every card on the oval for a given ring angle, turned to face outwards.
    const layout = (angle: number) => {
      for (let i = 0; i < count; i++) {
        const c = cards.current[i];
        if (!c) continue;
        const t = ((i * step + angle) * Math.PI) / 180;
        const face = (Math.atan2(Math.sin(t) / rx, Math.cos(t) / rz) * 180) / Math.PI;
        c.style.transform = `translate3d(${rx * Math.sin(t)}px, 0, ${rz * Math.cos(t)}px) rotateY(${face}deg)`;
      }
    };

    let angle = 0;
    if (!measure()) return;
    layout(angle);
    const ro = new ResizeObserver(() => measure() && layout(angle));
    ro.observe(el);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => ro.disconnect();

    let frame = 0;
    let running = false;
    let drift = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      drift += dt * 0.004;
      const rect = el.getBoundingClientRect();
      // -1 when the stage enters from below, +1 when it leaves at the top.
      const progress = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight;
      const target = -(progress * 140 + drift);
      angle += (target - angle) * 0.08;
      layout(angle);
      if (running) frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (running) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
    };
  }, [photos.length, doubled, count, step]);

  return (
    <div
      ref={stage}
      // Before the script runs (or if it never does), CSS alone places the cards on a
      // circle sized so neighbours can't overlap: radius = card * 1.1 / sin(step).
      style={{ "--fit": count >= 3 ? `calc(var(--card-w) * 1.1 / sin(${step}deg))` : "var(--card-w)" } as CSSProperties}
      className="relative h-[calc(var(--card-w)*4/3_+_110px)] overflow-hidden [--card-w:clamp(200px,60vw,250px)] [perspective:1100px] sm:h-[calc(var(--card-w)*4/3_+_150px)] sm:[--card-w:clamp(250px,34vw,300px)] lg:h-[calc(var(--card-w)*4/3_+_175px)] lg:[--card-w:clamp(240px,20vw,380px)] lg:[perspective:1800px]"
    >
      {/* Invisible ruler so the script can read the fallback radius in pixels. */}
      <div ref={probe} aria-hidden className="pointer-events-none absolute h-0 w-[var(--fit)]" />
      <div
        ref={ring}
        className="absolute top-1/2 left-1/2 h-0 w-0 will-change-transform [transform-style:preserve-3d]"
        style={{ transform: "translateZ(calc(var(--fit) * -1)) rotateX(-6deg)" }}
      >
        {list.map((p, i) => {
          const copy = i >= photos.length;
          return (
            <figure
              key={`${p.src}-${copy ? 2 : 1}`}
              ref={(node) => {
                cards.current[i] = node;
              }}
              aria-hidden={copy || undefined}
              className="absolute top-[calc(var(--card-w)*-2/3)] left-[calc(var(--card-w)/-2)] m-0 aspect-[3/4] w-[var(--card-w)] overflow-hidden rounded-3xl bg-jungle-900 shadow-2xl shadow-black/40 ring-1 ring-white/10 [backface-visibility:hidden]"
              style={{ transform: `rotateY(${i * step}deg) translateZ(var(--fit))` }}
            >
              <Image src={p.src} alt={copy ? "" : p.caption} fill sizes="(min-width: 1024px) 380px, 260px" className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-sm font-medium text-white">
                {p.caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
