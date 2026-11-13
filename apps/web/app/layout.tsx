import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";

import "@/styles/globals.css";

const sans = Geist({ subsets: ["latin", "cyrillic"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Aether Studio", template: "%s · Aether Studio" },
  description: "One workspace for image, video and character generation models.",
};

export const viewport: Viewport = { themeColor: "#09090c", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-accent="violet" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface-3 focus:px-4 focus:py-2 focus:text-sm">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
