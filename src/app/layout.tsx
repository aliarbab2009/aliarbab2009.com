import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari, Orbitron, Rajdhani, VT323 } from "next/font/google";
import { headers } from "next/headers";
import localFont from "next/font/local";

import { JsonLd } from "@/components/seo/json-ld";
import { ThemeScript } from "@/components/shell/theme-script";
import { siteConfig } from "@/config/site";
import { personJsonLd } from "@/lib/json-ld";
import { cn } from "@/lib/utils";

import "./globals.css";

/**
 * Site-default brutalist Latin stack — self-hosted WOFF2 in public/fonts/:
 *   - Space Grotesk: 400 (body) + 500 (display headings)
 *   - JetBrains Mono: 400 (mono labels, code)
 *
 * Self-hosting trades Google Fonts CDN for stable cross-build hashes
 * and an offline-capable build.
 *
 * Per-project theme fonts loaded from Google for the three project worlds:
 *   - Inter (StockSaathi + BolHisaab) — fintech-default geometric sans
 *   - Noto Sans Devanagari (BolHisaab) — Hindi/Hinglish glyph coverage
 *   - Orbitron (MagLock) — cyberpunk display
 *   - Rajdhani (MagLock) — body counterpoint to Orbitron
 *   - VT323 (MagLock) — retro-terminal monospace for the wordmark
 *
 * Each font exposes a CSS custom property variable. The .theme-{slug}
 * scopes in globals.css re-bind --font-display / --font-body / --font-mono
 * to those vars so the typography flips inside each project world.
 */
const spaceGrotesk = localFont({
  src: [
    { path: "../../public/fonts/SpaceGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/SpaceGrotesk-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: [{ path: "../../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Cascadia Code", "Menlo", "monospace"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
  fallback: ["Inter", "system-ui", "sans-serif"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
  fallback: ["Space Grotesk", "system-ui", "sans-serif"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-vt323",
  display: "swap",
  fallback: ["JetBrains Mono", "ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.longDescription,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.longDescription,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.longDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f0" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolve the per-request CSP nonce ONCE at the root. We pass it as a
  // prop to <ThemeScript /> (and any other inline-script consumers in
  // children) so those components can stay synchronous. If they each
  // awaited headers() themselves, Next 15 / React 19 would defer them
  // into RSC streaming (`self.__next_f.push(...)`) and the script would
  // only execute AFTER hydration — which defeats the whole "set
  // data-theme pre-paint to prevent FOUC" point.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      // Static default — the inline <ThemeScript> below may UPDATE
      // this to "light" on first paint based on localStorage or
      // prefers-color-scheme. Having it server-rendered means React's
      // hydration sees data-theme on both sides (server and client),
      // even after the script mutates it. Without this, server emits
      // <html> with no data-theme; ThemeScript writes one pre-paint;
      // React hydration sees an attribute mismatch on <html> AND if
      // any other text mismatch fires error #418, React's recovery
      // unmounts/remounts the tree and the data-theme is lost.
      // suppressHydrationWarning + a stable default attribute is the
      // canonical pattern for theme toggles in App Router.
      data-theme="dark"
      className={cn(
        spaceGrotesk.variable,
        jetbrainsMono.variable,
        inter.variable,
        notoSansDevanagari.variable,
        orbitron.variable,
        rajdhani.variable,
        vt323.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript nonce={nonce} />
        <JsonLd data={personJsonLd()} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-[var(--color-primary-fg)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
