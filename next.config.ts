import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development only: lets phones and other devices on the home/office Wi-Fi
  // (e.g. http://192.168.1.10:3000) load the dev scripts. Ignored in production.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // Admin-edited content is refreshed with revalidatePath() after each save,
  // so the classic caching model is enough for this site.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/uploads/**" }],
  },
  serverExternalPackages: ["bcryptjs"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
