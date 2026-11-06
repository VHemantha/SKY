import { z } from "zod";

export type HeroSlide = { src: string; alt: string; caption?: string };

export const MAX_HERO_SLIDES = 10;

/** Shown until the admin saves their own slides in Site settings. */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { src: "/images/hero/leopard-walking.jpg", alt: "Sri Lankan leopard stepping onto a sandy safari track", caption: "Sri Lankan leopard" },
  { src: "/images/hero/elephant-forest-track.jpg", alt: "Wild elephant walking down a forest track", caption: "Wild Asian elephant" },
  { src: "/images/hero/peacock.jpg", alt: "Peacock perched on a weathered branch against a blue sky", caption: "Indian peafowl" },
  { src: "/images/hero/leopard-rock.jpg", alt: "Leopard yawning on a granite rock at dusk", caption: "Leopard at dusk" },
  { src: "/images/hero/elephants-grassland.jpg", alt: "Two elephants grazing in green grassland, seen from above", caption: "Elephants grazing" },
];

export const heroSlideSchema = z.object({
  src: z
    .string()
    .trim()
    .min(1, "every slide needs a photo")
    .max(500)
    .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "must be an uploaded image or https URL"),
  alt: z.string().trim().max(200).default(""),
  caption: z.string().trim().max(80).default(""),
});

export const heroSlidesSchema = z
  .array(heroSlideSchema)
  .min(1, "add at least one photo")
  .max(MAX_HERO_SLIDES, `use ${MAX_HERO_SLIDES} photos or fewer`);

/** Reads the saved hero slides, falling back to the defaults when none are set. */
export function parseHeroSlides(input: HeroSlide[] | string | null | undefined): HeroSlide[] {
  if (!input || input.length === 0) return DEFAULT_HERO_SLIDES;
  try {
    const parsed = heroSlidesSchema.safeParse(typeof input === "string" ? JSON.parse(input) : input);
    return parsed.success ? parsed.data : DEFAULT_HERO_SLIDES;
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}
