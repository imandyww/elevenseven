import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Everything public is crawlable — including by AI/LLM crawlers, which are
 * first-class citizens here. Only the human billing console, cart/checkout
 * flow, and the authenticated agent API are excluded.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/dashboard/", "/cart", "/success", "/v1/", "/api/"];
  // Agent discovery and public catalog surfaces stay crawlable.
  const allow = [
    "/",
    "/.well-known/",
    "/llms.txt",
    "/products",
    "/products.json",
    "/openapi.json",
    "/api/agent-catalog",
    "/api/products",
    "/api/revenue/sales-kit",
  ];

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
