"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Home hero with 3D depth: the photo sits on a back plane that tilts toward the
 * cursor, while the copy floats on a front plane and recedes into the scene as
 * the visitor scrolls. Static for reduced-motion users and on touch devices.
 */
export function HeroScene({ image, alt, children }: { image: string; alt: string; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let scroll = 0;
    let frame = 0;
    let running = true;

    const tick = () => {
      current.x += (pointer.x - current.x) * 0.06;
      current.y += (pointer.y - current.y) * 0.06;
      const h = el.offsetHeight || 1;
      const p = Math.min(scroll / h, 1);

      if (back.current) {
        back.current.style.transform = `translate3d(${current.x * -18}px, ${current.y * -12 + p * 120}px, 0) rotateX(${current.y * 3}deg) rotateY(${current.x * -4}deg) scale(${1.12 + p * 0.08})`;
      }
      if (front.current) {
        front.current.style.transform = `translate3d(${current.x * 14}px, ${current.y * 10 - p * 60}px, ${-p * 220}px) rotateX(${p * 10}deg)`;
        front.current.style.opacity = String(1 - p * 1.2);
      }
      if (running) frame = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => (scroll = window.scrollY);

    // Stop the loop entirely once the hero is off-screen.
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-jungle-950 pt-32 pb-16 text-white [perspective:1200px] sm:pb-24"
    >
      <div ref={back} className="absolute inset-0 -z-20 will-change-transform" style={{ transform: "scale(1.12)" }}>
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jungle-950 via-jungle-950/45 to-jungle-950/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-jungle-950/70 to-transparent" />
      <div ref={front} className="w-full will-change-transform [transform-style:preserve-3d]">
        {children}
      </div>
    </section>
  );
}
