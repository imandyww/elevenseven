import { products } from "@/lib/products";
import { absoluteUrl, SUPPORT_EMAIL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const catalog = products
    .map(
      (product) =>
        `- ${product.name}: $${product.price} ${product.currency} | ${product.category} | ${product.description} | details: ${absoluteUrl(product.agent_details_url)} | checkout: ${absoluteUrl(product.checkout_url)}`,
    )
    .join("\n");

  const body = `# ElevenSeven AI

ElevenSeven AI is an AI-agent-friendly storefront for low-cost digital products, prompts, utilities, templates, scripts, checklists, and workflow helpers.

Products are digital goods with instant delivery unless a product explicitly says otherwise. Starter products are currently $1 USD each.

## Product Catalog

Human-readable catalog: ${absoluteUrl("/products")}
Machine-readable catalog: ${absoluteUrl("/products.json")}
Single-product agent details: ${absoluteUrl("/api/products/:id")}
OpenAPI document: ${absoluteUrl("/openapi.json")}

## Products

${catalog}

## Checkout Behavior

Each product has a checkout_url field. In this build, checkout_url points to the local cart placeholder so humans can add items and see the current checkout path. Real payment provider URLs should replace checkout_url when Stripe, LemonSqueezy, Gumroad, Polar, or another provider is connected.

AI agents should not purchase without clear user consent, a known budget, and a product that matches the user's requested task. Agents should compare price, delivery_type, refund_policy, tags, and description before recommending a product.

## Refunds and Contact

Refund policy: ${absoluteUrl("/refunds")}
Terms: ${absoluteUrl("/terms")}
Privacy: ${absoluteUrl("/privacy")}
Contact: ${absoluteUrl("/contact")}
Support email: ${SUPPORT_EMAIL}

For support, include the product name, order details if available, and a short description of the issue.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
