export const TOUR_TYPES = {
  DAY_SAFARI: "Day safari",
  OVERNIGHT: "Overnight safari",
  PRIVATE: "Private safari",
  NIGHT_SAFARI: "Night safari",
  ROUND_TOUR: "Round tour",
} as const;

export type TourType = keyof typeof TOUR_TYPES;

export const CURRENCIES = ["USD", "EUR", "GBP", "LKR"] as const;

export const PRICE_BASIS = {
  PER_PERSON: "per person",
  PER_GROUP: "per group",
  PER_JEEP: "per jeep",
} as const;

export const ENQUIRY_STATUS = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  CLOSED: "Closed",
} as const;

export const PAGE_SLUGS = {
  about: "About us",
  "why-choose-us": "Why choose us",
  terms: "Terms & conditions",
  privacy: "Privacy policy",
} as const;

export const SESSION_COOKIE = "sky_session";
