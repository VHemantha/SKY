"use client";

// Adapted from the 21st.dev "Tilt Card" component (tom_ui): 3D perspective tilt
// with a cursor spotlight. Updates the DOM directly instead of React state so it
// stays smooth with many cards, and only reacts to a mouse (touch scrolls normally).

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  tiltLimit = 8,
  scale = 1.02,
  perspective = 1100,
  spotlight = true,
}: {
  children: ReactNode;
  className?: string;
  tiltLimit?: number;
  scale?: number;
  perspective?: number;
  spotlight?: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const reset = () => {
    cancelAnimationFrame(frame.current);
    if (card.current) card.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    if (light.current) light.current.style.opacity = "0";
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = card.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      const rx = (0.5 - py) * tiltLimit * 2;
      const ry = (px - 0.5) * tiltLimit * 2;
      el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale},${scale},${scale})`;
      if (light.current) {
        light.current.style.opacity = "1";
        light.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.28), transparent 45%)`;
      }
    });
  };

  return (
    <div
      ref={card}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("relative h-full transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]", className)}
    >
      {children}
      {spotlight && (
        <div
          ref={light}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300"
        />
      )}
    </div>
  );
}
