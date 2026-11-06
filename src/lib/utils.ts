import { PRICE_BASIS, TOUR_TYPES } from "./constants";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function lines(text: string | null | undefined) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function parseGallery(input: string[] | string | null | undefined): string[] {
  try {
    const value = Array.isArray(input) ? input : JSON.parse(input || "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Itinerary lines are written as "Title :: details" (details optional). */
export function parseItinerary(text: string | null | undefined) {
  return lines(text).map((line) => {
    const [title, ...rest] = line.split("::");
    return { title: title.trim(), details: rest.join("::").trim() };
  });
}

export function formatPrice(price: number | null | undefined, currency: string) {
  if (price == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "LKR" ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(price);
}

export function priceBasisLabel(basis: string) {
  return PRICE_BASIS[basis as keyof typeof PRICE_BASIS] ?? "";
}

export function tourTypeLabel(type: string) {
  return TOUR_TYPES[type as keyof typeof TOUR_TYPES] ?? type;
}

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Turns YouTube / Vimeo share links into embeddable URLs. */
export function videoEmbedUrl(url: string | null | undefined) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Colombo",
  }).format(date);
}
