"use client";

// Adapted from the 21st.dev "Globe" component (dillionverma / Magic UI), rebuilt
// for cobe v2: Sri Lanka stays in focus, flight arcs run from key source markets
// to Colombo, and the globe can be dragged and springs back when released.

import createGlobe, { type Arc, type Marker } from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const COLOMBO: [number, number] = [6.9271, 79.8612];

const ORIGINS: [number, number][] = [
  [51.5072, -0.1276], // London
  [50.1109, 8.6821], // Frankfurt
  [48.8566, 2.3522], // Paris
  [25.2048, 55.2708], // Dubai
  [19.076, 72.8777], // Mumbai
  [55.7558, 37.6173], // Moscow
  [1.3521, 103.8198], // Singapore
  [-33.8688, 151.2093], // Sydney
  [39.9042, 116.4074], // Beijing
];

const PARKS: Marker[] = [
  { location: [6.3725, 81.5168], size: 0.05, id: "yala" },
  { location: [6.4383, 80.8887], size: 0.04, id: "udawalawe" },
  { location: [8.4562, 80.0141], size: 0.04, id: "wilpattu" },
  { location: [8.0414, 80.8981], size: 0.04, id: "minneriya" },
  { location: COLOMBO, size: 0.06, id: "colombo" },
];

const ARCS: Arc[] = ORIGINS.map((from) => ({ from, to: COLOMBO }));

/** Rotation that puts a lat/long facing the viewer. */
function focusAngles([lat, long]: [number, number]): [number, number] {
  return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180 * 0.6];
}

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ startX: number; startY: number; dx: number; dy: number } | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [basePhi, baseTheta] = focusAngles([7.8731, 80.7718]);
    let width = canvas.offsetWidth;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let frame = 0;
    let visible = false;
    const start = performance.now();

    const draw = (now: number) => {
      if (!globe) return;
      const t = (now - start) / 1000;
      // Gentle sway around Sri Lanka, plus the user's drag offset easing back to 0.
      const sway = reduceMotion ? 0 : Math.sin(t * 0.35) * 0.35;
      if (!drag.current) {
        offset.current.x *= 0.94;
        offset.current.y *= 0.94;
      }
      globe.update({
        phi: basePhi + sway + offset.current.x,
        theta: baseTheta + offset.current.y,
        width: width * 2,
        height: width * 2,
      });
      if (visible) frame = requestAnimationFrame(draw);
    };

    const init = () => {
      width = canvas.offsetWidth;
      const [phi, theta] = [basePhi, baseTheta];
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi,
        theta,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 16000,
        mapBrightness: 5,
        mapBaseBrightness: 0.05,
        baseColor: [0.16, 0.35, 0.31],
        markerColor: [0.91, 0.52, 0.23],
        glowColor: [0.17, 0.39, 0.34],
        markers: PARKS,
        arcs: ARCS,
        arcColor: [0.95, 0.64, 0.36],
        arcWidth: 0.5,
        arcHeight: 0.3,
        markerElevation: 0.02,
      });
      canvas.style.opacity = "1";
    };

    // Only spin up WebGL once the globe scrolls near the viewport, and pause it when off-screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (!globe) init();
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    const onResize = () => (width = canvas.offsetWidth);
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      globe?.destroy();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drag.current = { startX: e.clientX, startY: e.clientY, dx: offset.current.x, dy: offset.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    offset.current.x = drag.current.dx + (e.clientX - drag.current.startX) / 150;
    offset.current.y = Math.max(-0.6, Math.min(0.6, drag.current.dy + (e.clientY - drag.current.startY) / 300));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drag.current = null;
    e.currentTarget.style.cursor = "grab";
  };

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[600px]", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="3D globe showing flights from around the world to Sri Lanka"
        className="size-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000 [contain:layout_paint_size]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}
