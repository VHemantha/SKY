"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Photo = { src: string; caption: string };

/**
 * A ring of photos arranged in 3D space. The ring turns as the visitor scrolls
 * past it (and drifts slowly on its own), so photos swing in from the sides.
 * Reduced-motion users get a still ring.
 */
export function PhotoCarousel3D({ photos }: { photos: Photo[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const step = 360 / photos.length;

  useEffect(() => {
    const el = stage.current;
    const r = ring.current;
    if (!el || !r || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let running = false;
    let drift = 0;
    let angle = 0;
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
      r.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(-6deg) rotateY(${angle}deg)`;
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
    };
  }, []);

  return (
    <div
      ref={stage}
      className="relative h-[420px] overflow-hidden [--card-w:210px] [--radius:330px] [perspective:1100px] sm:h-[520px] sm:[--card-w:260px] sm:[--radius:470px] lg:[--radius:560px]"
    >
      <div
        ref={ring}
        className="absolute top-1/2 left-1/2 h-0 w-0 will-change-transform [transform-style:preserve-3d]"
        style={{ transform: "translateZ(calc(var(--radius) * -1)) rotateX(-6deg)" }}
      >
        {photos.map((p, i) => (
          <figure
            key={p.src}
            className="absolute top-[calc(var(--card-w)*-2/3)] left-[calc(var(--card-w)/-2)] m-0 aspect-[3/4] w-[var(--card-w)] overflow-hidden rounded-3xl bg-jungle-900 shadow-2xl shadow-black/40 ring-1 ring-white/10 [backface-visibility:hidden]"
            style={{ transform: `rotateY(${i * step}deg) translateZ(var(--radius))` }}
          >
            <Image src={p.src} alt={p.caption} fill sizes="260px" className="object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-sm font-medium text-white">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
