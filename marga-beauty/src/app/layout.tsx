import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { content } from "@/content";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
});

const sans = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: content.meta.title,
  description: content.meta.description,
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    images: ["/images/marga-hero.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F3EAE7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={content.htmlLang} className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
