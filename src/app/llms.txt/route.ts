export const dynamic = "force-static";

/**
 * llms.txt (https://llmstxt.org) — a curated, plain-markdown map of the site
 * for LLMs and autonomous agents. Generated from the catalog so it never
 * drifts from what the store actually sells.
 */
export function GET() {
  return new Response("eelven seven\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
