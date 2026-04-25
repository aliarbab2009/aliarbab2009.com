import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

/**
 * Central SEO config + per-route metadata builder.
 *
 * Every page route imports `buildMetadata({ ... })` and re-exports the
 * result either as a static `metadata` constant or from an async
 * `generateMetadata`. The helper guarantees:
 *   - canonical URL is always built from `metadataBase` + path
 *   - title format is locked to `${title} — Ali Arbab` (home is the
 *     one exception via `isHome: true`)
 *   - twitter + openGraph share the same image and description
 *   - robots default to `index, follow`; opt out per route with
 *     `noIndex: true`
 *   - locale is hard-coded `en_US`
 *
 * Per P4.01.
 */

export const SEO_BASE = {
  siteName: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  defaultTitle: `${siteConfig.name} — Builds AI, voice, and IoT systems`,
  defaultDescription: siteConfig.longDescription,
  defaultOgImage: "/og/default.png",
  twitter: {
    card: "summary_large_image" as const,
    creator: `@${siteConfig.githubHandle}`,
  },
  locale: "en_US",
} as const;

export type BuildMetadataArgs = {
  /** Page-specific title fragment. Helper appends ` — Ali Arbab` unless `isHome` is true. */
  title: string;
  /** 140–160 chars. Each route must be unique and concrete. */
  description: string;
  /** Canonical pathname, e.g. `/projects/stocksaathi`. Must start with `/`. */
  path: string;
  /** Per-route OG image, relative to `public/`. */
  ogImage?: string;
  /** OG image alt text. Falls back to title. */
  ogImageAlt?: string;
  /** OpenGraph type. Project case studies use `"article"`. */
  ogType?: "website" | "article";
  /** Article only — ISO date string. Becomes `article:published_time`. */
  publishedTime?: string;
  /** Article only — author name. Defaults to "Ali Arbab". */
  author?: string;
  /** Section/keywords for article OG. */
  keywords?: readonly string[];
  /** True only for `/`. Skips the title suffix. */
  isHome?: boolean;
  /** Set true to emit `noindex, nofollow`. Used by `/dev/*` and 404. */
  noIndex?: boolean;
};

export function buildMetadata(args: BuildMetadataArgs): Metadata {
  const {
    title,
    description,
    path,
    ogImage = SEO_BASE.defaultOgImage,
    ogImageAlt,
    ogType = "website",
    publishedTime,
    author = siteConfig.author,
    keywords,
    isHome = false,
    noIndex = false,
  } = args;

  if (!path.startsWith("/")) {
    throw new Error(`buildMetadata: path must start with "/" (got: ${path})`);
  }

  const fullTitle = isHome ? title : `${title} — ${SEO_BASE.siteName}`;
  const canonical = path === "/" ? "/" : path;
  const ogUrl = new URL(path, SEO_BASE.metadataBase).toString();
  const imageAlt = ogImageAlt ?? title;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: ogType,
      url: ogUrl,
      title: fullTitle,
      description,
      siteName: SEO_BASE.siteName,
      locale: SEO_BASE.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      ...(ogType === "article" && publishedTime
        ? {
            publishedTime,
            authors: [author],
          }
        : {}),
    },
    twitter: {
      card: SEO_BASE.twitter.card,
      title: fullTitle,
      description,
      images: [ogImage],
      creator: SEO_BASE.twitter.creator,
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
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
    ...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
  };

  return metadata;
}
