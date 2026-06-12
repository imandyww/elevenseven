import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Everything public is crawlable — including by AI/LLM crawlers, which are
 * first-class citizens here. Only the human billing console, cart/checkout
 * flow, and the authenticated agent API are excluded.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/dashboard/", "/cart", "/success", "/v1/", "/api/"];
  // The public catalog API stays crawlable so agents can discover it.
  const allow = ["/", "/api/products"];

  return {
    rules: [
      { userAgent: "*", allow, disallow },
      // Explicit welcome mat for AI assistants and LLM training/search crawlers.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow,
        disallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
