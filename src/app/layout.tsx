import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Skylantic Holidays | Sri Lanka Wildlife Safaris & Tours",
    template: "%s | Skylantic Holidays Sri Lanka",
  },
  description:
    "Jeep safaris in Yala, Udawalawe, Wilpattu and Minneriya, plus tailor-made Sri Lanka holidays. Small groups, local guides and honest prices from Skylantic Holidays.",
  applicationName: "Skylantic Holidays",
  keywords: [
    "Sri Lanka safari",
    "Yala safari",
    "Udawalawe safari",
    "Wilpattu safari",
    "Minneriya elephant gathering",
    "Sri Lanka tours",
    "Sri Lanka holidays",
    "leopard safari Sri Lanka",
  ],
  openGraph: {
    type: "website",
    siteName: "Skylantic Holidays",
    locale: "en_GB",
    images: [{ url: "/images/yala-leopard.jpg", width: 1920, height: 1280, alt: "Sri Lankan leopard in Yala" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#112f2b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
