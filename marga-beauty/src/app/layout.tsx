import type { Metadata, Viewport } from "next";
import { Host_Grotesk } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { content } from "@/content";

const sans = Host_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: content.meta.title,
  description: content.meta.description,
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "MARGA Brazilian Beauty" }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C202C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={content.htmlLang} className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
