import type { Metadata } from "next";

/** Canonical site identity — single source of truth for SEO, JSON-LD, and llms.txt. */
export const SITE_NAME = "ElevenSeven AI";
export const SITE_TAGLINE = "Tiny digital tools for humans and AI agents";
export const SITE_DESCRIPTION =
  "An AI-agent-friendly storefront for low-cost digital products, prompts, utilities, templates, and workflow helpers.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://elevenseven.ai";

/** Monitored support inbox shown in the footer, legal pages, and Stripe settings. */
export const SUPPORT_EMAIL = "support@elevenseven.ai";

export interface UrlOptions {
  origin?: string;
}

function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim() || undefined;
}

function cleanOrigin(origin: string | undefined): string | undefined {
  if (!origin) return undefined;
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

function cleanHost(host: string | undefined): string | undefined {
  if (!host) return undefined;
  if (/[\s/@\\]/.test(host)) return undefined;
  try {
    return new URL(`https://${host}`).host;
  } catch {
    return undefined;
  }
}

function cleanProtocol(
  protocol: string | undefined,
): "http" | "https" | undefined {
  const normalized = protocol?.replace(":", "").toLowerCase();
  if (normalized === "http" || normalized === "https") return normalized;
  return undefined;
}

export function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}

export function originFromHeaders(
  headersList: Headers,
  fallbackUrl?: string,
): string {
  const forwardedHost = cleanHost(
    firstHeaderValue(headersList.get("x-forwarded-host")),
  );
  const hasForwardedHost = Boolean(forwardedHost);
  const host =
    forwardedHost ?? cleanHost(firstHeaderValue(headersList.get("host")));
  const forwardedProto = cleanProtocol(
    firstHeaderValue(headersList.get("x-forwarded-proto")),
  );

  if (host) {
    const hostIsLocal = isLocalOrigin(`http://${host}`);
    const fallbackProto = !hasForwardedHost && fallbackUrl
      ? cleanProtocol(new URL(fallbackUrl).protocol)
      : undefined;
    const proto =
      hasForwardedHost && !hostIsLocal
        ? "https"
        : forwardedProto ?? fallbackProto ?? (hostIsLocal ? "http" : "https");
    return new URL(`${proto}://${host}`).origin;
  }

  return cleanOrigin(fallbackUrl) ?? SITE_URL;
}

export function originFromRequest(request: Request): string {
  return originFromHeaders(request.headers, request.url);
}

export function absoluteUrl(path: string, options: UrlOptions = {}): string {
  return new URL(path, cleanOrigin(options.origin) ?? SITE_URL).toString();
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
      "application/agent-commerce+json": "/.well-known/agent-commerce.json",
      "application/openapi+json": "/openapi.json",
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
