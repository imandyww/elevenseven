import type { Metadata } from "next";

/** Canonical site identity — single source of truth for SEO, JSON-LD, and llms.txt. */
export const SITE_NAME = "eelven seven";
export const SITE_TAGLINE = "eelven seven";
export const SITE_DESCRIPTION = "eelven seven";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Page-level alternates replace the root layout's object wholesale (shallow
 * merge), so the llms.txt discovery link must ride along with every canonical.
 */
export function pageAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    types: {
      // Curated site map for LLMs and autonomous agents (llmstxt.org).
      "text/plain": "/llms.txt",
    },
  };
}

/**
 * Page-level openGraph replaces the root layout's object wholesale (shallow
 * merge), so every page that overrides it must re-state siteName/type/locale.
 */
export function pageOpenGraph({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata["openGraph"] {
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: path,
    title,
    description,
  };
}
