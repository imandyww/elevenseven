import type { Category, Product } from "./types";

export const STORE_CURRENCY = "USD";
export const PRODUCTS_UPDATED_AT = "2026-06-13";

const checkoutUrl = (slug: string) => `/cart?sku=${slug}`;
const agentDetailsUrl = (slug: string) => `/api/products/${slug}`;

/**
 * Single source of truth for the storefront catalog.
 *
 * Replace checkout_url with provider-hosted checkout links when Stripe,
 * LemonSqueezy, Gumroad, Polar, or another payment provider is connected.
 */
export const products: Product[] = [
  {
    id: "landing-page-copy-fixer",
    slug: "landing-page-copy-fixer",
    sku: "landing-page-copy-fixer",
    name: "Landing Page Copy Fixer",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Copywriting",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("landing-page-copy-fixer"),
    agent_details_url: agentDetailsUrl("landing-page-copy-fixer"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["landing-page", "copywriting", "conversion", "prompt"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "A compact prompt and checklist for turning vague homepage copy into specific product, price, and outcome language.",
    longDescription:
      "Landing Page Copy Fixer gives a human or AI agent a structured rewrite pass for a small website. It asks for the buyer, offer, price, proof, delivery, and next action, then returns sharper headline, subheadline, CTA, trust, and FAQ copy.",
    icon: "LP",
    useCase:
      "An agent reviews a founder's unclear landing page, identifies missing pricing and delivery details, and returns replacement copy the founder can paste into the hero and FAQ.",
    buyerSignal:
      "Useful when a page sounds abstract and the buyer needs concrete copy quickly.",
    deliverySummary:
      "Prompt file, rewrite checklist, and example output format.",
    manifest: {
      upgrade_type: "copy_fix",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "lead-research-prompt-pack",
    slug: "lead-research-prompt-pack",
    sku: "lead-research-prompt-pack",
    name: "Lead Research Prompt Pack",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Research",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("lead-research-prompt-pack"),
    agent_details_url: agentDetailsUrl("lead-research-prompt-pack"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["lead-research", "sales", "prompt", "small-business"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "Five prompts for researching a lead, summarizing fit, and preparing a short outreach angle with cited evidence.",
    longDescription:
      "Lead Research Prompt Pack helps an agent gather company basics, buyer role context, recent signals, objections, and a concise outreach angle. The output is intentionally short so a human can review it before sending.",
    icon: "LR",
    useCase:
      "A sales assistant agent researches ten local businesses and returns a one-paragraph fit summary plus a suggested opening line for each.",
    buyerSignal:
      "Useful when an operator needs lightweight lead prep without buying a full sales platform.",
    deliverySummary:
      "Prompt pack with research steps, output schema, and review checklist.",
    manifest: {
      upgrade_type: "lead_research_prompt",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "email-follow-up-template",
    slug: "email-follow-up-template",
    sku: "email-follow-up-template",
    name: "Email Follow-Up Template",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Email",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("email-follow-up-template"),
    agent_details_url: agentDetailsUrl("email-follow-up-template"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["email", "follow-up", "sales", "template"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "A short follow-up sequence for prospects, invoices, proposals, and stalled conversations.",
    longDescription:
      "Email Follow-Up Template includes concise versions for a warm nudge, a value-add follow-up, a deadline reminder, and a clean close-the-loop message. It is written so agents can personalize without inventing facts.",
    icon: "EM",
    useCase:
      "A small business owner asks an agent to follow up on three unanswered proposals; the agent uses the template to draft clear, polite messages for approval.",
    buyerSignal:
      "Useful when follow-up needs to happen today and a generic long email would hurt response rates.",
    deliverySummary:
      "Reusable email templates, personalization fields, and approval notes.",
    manifest: {
      upgrade_type: "email_template",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "web-scraping-checklist",
    slug: "web-scraping-checklist",
    sku: "web-scraping-checklist",
    name: "Web Scraping Checklist",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Operations",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("web-scraping-checklist"),
    agent_details_url: agentDetailsUrl("web-scraping-checklist"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["scraping", "checklist", "data", "compliance"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "A practical preflight checklist for small scraping jobs: scope, permission, rate limits, fields, and output format.",
    longDescription:
      "Web Scraping Checklist helps an agent decide whether a small scraping task is appropriate, what fields to collect, how to avoid unnecessary load, and how to return structured results with source URLs and caveats.",
    icon: "WS",
    useCase:
      "Before collecting public vendor listings, an agent checks robots guidance, field scope, rate limits, dedupe rules, and the expected CSV columns.",
    buyerSignal:
      "Useful when an agent needs data from public pages but the operator wants a deliberate, reviewable plan first.",
    deliverySummary:
      "Checklist, field-planning worksheet, and output schema.",
    manifest: {
      upgrade_type: "scraping_checklist",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "contractor-quote-parser",
    slug: "contractor-quote-parser",
    sku: "contractor-quote-parser",
    name: "Contractor Quote Parser",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Data",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("contractor-quote-parser"),
    agent_details_url: agentDetailsUrl("contractor-quote-parser"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["contractors", "quotes", "parser", "json"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "A prompt and JSON schema for extracting line items, totals, dates, exclusions, and questions from contractor quotes.",
    longDescription:
      "Contractor Quote Parser turns messy quote text into reviewable structured data. It flags missing details, separates labor and materials when possible, and returns questions a human should ask before accepting the quote.",
    icon: "QP",
    useCase:
      "A homeowner forwards three renovation quotes to an agent, which extracts totals, scope, exclusions, and follow-up questions into comparable JSON.",
    buyerSignal:
      "Useful when quotes arrive as PDFs, emails, or pasted text and need quick comparison.",
    deliverySummary:
      "Extraction prompt, JSON schema, and comparison notes.",
    manifest: {
      upgrade_type: "quote_parser",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "real-estate-outreach-script",
    slug: "real-estate-outreach-script",
    sku: "real-estate-outreach-script",
    name: "Real Estate Outreach Script",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Real Estate",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("real-estate-outreach-script"),
    agent_details_url: agentDetailsUrl("real-estate-outreach-script"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["real-estate", "outreach", "script", "follow-up"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "Short call, text, and email scripts for real estate follow-up that keep claims modest and specific.",
    longDescription:
      "Real Estate Outreach Script gives agents concise outreach variants for buyer leads, seller leads, open-house follow-up, and stale conversations. It includes fields for local context and clear human approval before sending.",
    icon: "RE",
    useCase:
      "A real estate assistant agent drafts a polite follow-up after an open house, using only the property details and buyer preference notes the agent was given.",
    buyerSignal:
      "Useful when a real estate operator needs practical scripts without a CRM subscription.",
    deliverySummary:
      "Call script, SMS script, email script, and personalization fields.",
    manifest: {
      upgrade_type: "real_estate_outreach",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "business-idea-validator",
    slug: "business-idea-validator",
    sku: "business-idea-validator",
    name: "Business Idea Validator",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Strategy",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("business-idea-validator"),
    agent_details_url: agentDetailsUrl("business-idea-validator"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["business-ideas", "validation", "market-research", "prompt"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "A validation worksheet prompt for testing a small business idea against buyer, urgency, price, and distribution.",
    longDescription:
      "Business Idea Validator helps an agent turn a rough idea into a short validation memo. It checks the likely buyer, painful moment, existing alternatives, first paid offer, distribution path, and fastest next test.",
    icon: "BI",
    useCase:
      "A founder gives an agent a rough product idea; the agent returns a one-page validation memo and three concrete tests to run this week.",
    buyerSignal:
      "Useful when a builder wants a sober first pass before spending days on a vague idea.",
    deliverySummary:
      "Validation prompt, scoring rubric, and one-page memo format.",
    manifest: {
      upgrade_type: "idea_validation",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "json-formatter-utility",
    slug: "json-formatter-utility",
    sku: "json-formatter-utility",
    name: "JSON Formatter Utility",
    price: 1,
    currency: STORE_CURRENCY,
    category: "Utility",
    delivery_type: "instant_digital_download",
    checkout_url: checkoutUrl("json-formatter-utility"),
    agent_details_url: agentDetailsUrl("json-formatter-utility"),
    refund_policy:
      "Refunds are available within 7 days if the file has not been substantially used or downloaded multiple times.",
    tags: ["json", "formatter", "utility", "developer"],
    updated_at: PRODUCTS_UPDATED_AT,
    description:
      "A tiny copy-paste utility spec for formatting, validating, and explaining JSON without sending data to a third party.",
    longDescription:
      "JSON Formatter Utility provides a small local HTML/JavaScript utility spec and agent instructions for validating JSON, formatting it with two-space indentation, and explaining parse errors in plain English.",
    icon: "JS",
    useCase:
      "An agent receives malformed webhook JSON, formats it locally, identifies the missing comma, and returns a corrected version for human review.",
    buyerSignal:
      "Useful when a builder needs a small offline-friendly helper instead of a full developer tool.",
    deliverySummary:
      "Utility spec, local usage notes, and agent-readable validation behavior.",
    manifest: {
      upgrade_type: "json_formatter",
      allowed_uses: 1,
      expires: "never",
    },
  },
];

export const categories: Category[] = [
  "Copywriting",
  "Research",
  "Email",
  "Operations",
  "Data",
  "Real Estate",
  "Strategy",
  "Utility",
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.sku === id || p.slug === id);
}

export function formatPrice(price: number, currency = STORE_CURRENCY): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function productPath(product: Product): string {
  return `/products/${product.slug}`;
}

/** Featured starter products for the home page grid. */
export const featuredProductIds = products.map((product) => product.id);
