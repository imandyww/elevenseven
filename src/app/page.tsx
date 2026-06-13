import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/products";
import { pageAlternates, pageOpenGraph, SUPPORT_EMAIL } from "@/lib/site";
import { ProductGrid } from "@/components/ProductGrid";

const description =
  "ElevenSeven is an AI-agent-friendly storefront for low-cost digital products, prompts, utilities, templates, and workflow helpers.";

export const metadata: Metadata = {
  title: "Tiny tools AI agents can buy and use instantly",
  description,
  alternates: pageAlternates("/"),
  openGraph: pageOpenGraph({
    title: "Tiny tools AI agents can buy and use instantly",
    description,
    path: "/",
  }),
};

const checkoutSteps = [
  {
    title: "Pick a product",
    body: "Humans browse pages. Agents can read JSON metadata before recommending a purchase.",
  },
  {
    title: "Confirm the price",
    body: "Starter products are clearly marked at $1 in USD with no hidden subscription.",
  },
  {
    title: "Get the digital good",
    body: "After checkout, the buyer receives the digital file, prompt, template, or utility details.",
  },
];

const agentLinks = [
  { href: "/products", label: "/products", body: "Human-readable catalog" },
  { href: "/products.json", label: "/products.json", body: "Machine-readable product metadata" },
  { href: "/llms.txt", label: "/llms.txt", body: "Plain-text instructions for AI agents" },
];

const trustBullets = [
  "Products are clearly priced",
  "Most products are $1",
  "No hidden subscriptions",
  "Instant digital delivery",
  "Agent-readable metadata",
  "Human-readable descriptions",
  "Refund/contact policy available",
  "Secure checkout links",
];

const faqs = [
  {
    question: "What is ElevenSeven?",
    answer:
      "ElevenSeven AI is a small digital storefront for practical prompts, templates, utilities, scripts, and workflow helpers that humans and AI agents can evaluate and buy.",
  },
  {
    question: "Who is this for?",
    answer:
      "It is for people experimenting with AI workflows, builders who need small reusable assets, small business operators, and agents acting with a user's clear consent.",
  },
  {
    question: "Can humans buy from the store?",
    answer:
      "Yes. Humans can browse the catalog, add products to the cart, and use the checkout path once payments are connected.",
  },
  {
    question: "Can AI agents buy directly?",
    answer:
      "Agents can read the catalog, compare products, and initiate purchase requests through structured metadata and API surfaces. Agents should only purchase with explicit user consent and an approved budget.",
  },
  {
    question: "How are products delivered?",
    answer:
      "Products are digital goods. Unless a product says otherwise, delivery is instant after checkout through a digital file, prompt, template, script, or utility instructions.",
  },
  {
    question: "Are purchases refundable?",
    answer:
      "Refunds are handled case by case for digital goods. See the refunds page and contact support if a file is missing, inaccessible, duplicated, or not materially as described.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No account is required for basic browsing. Account or wallet features may be used for agent API keys, receipts, and repeat agent purchase flows.",
  },
  {
    question: "How do I contact support?",
    answer: `Email ${SUPPORT_EMAIL}. Include the product name, order details if available, and a short description of the issue.`,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="hero-gradient border-b border-cream-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
              AI-agent-friendly digital storefront
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Tiny tools AI agents can buy and use instantly.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              ElevenSeven is an AI-agent-friendly storefront for low-cost
              digital products, prompts, utilities, templates, and workflow
              helpers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="tactile rounded-lg bg-ink px-6 py-3.5 text-center font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
              >
                Browse Products
              </Link>
              <Link
                href="/docs"
                className="tactile rounded-lg border border-cream-dark bg-white px-6 py-3.5 text-center font-semibold text-ink shadow-card hover:border-blue hover:text-blue"
              >
                View Agent API
              </Link>
            </div>
            <p className="mt-5 font-mono text-sm text-ink-soft">
              Clear pricing. Instant delivery. Human-readable and
              agent-readable.
            </p>
          </div>

          <div className="rounded-lg border border-cream-dark bg-white p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-cream-dark pb-3">
              <div>
                <p className="font-mono text-xs font-semibold text-blue">
                  STARTER CATALOG
                </p>
                <p className="text-sm text-ink-soft">8 digital products</p>
              </div>
              <p className="rounded-lg bg-mint-soft px-3 py-1.5 font-mono text-sm font-bold text-ink">
                $1 each
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {products.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-cream px-3 py-2 text-sm hover:bg-blue-soft"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="font-mono font-bold text-coffee">$1</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-ink p-4 text-cream">
              <p className="font-mono text-xs text-mint">After checkout</p>
              <p className="mt-1 text-sm leading-relaxed text-cream/85">
                The buyer receives the digital prompt, template, checklist, or
                utility details plus a receipt. Real payment provider links are
                isolated in each product&apos;s checkout_url field.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-cream-dark bg-white/65">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
          {checkoutSteps.map((step) => (
            <div key={step.title} className="rounded-lg bg-white p-5 shadow-card">
              <h2 className="text-base font-bold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" id="products">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
              Concrete starter products
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              What agents can buy
            </h2>
            <p className="mt-2 max-w-2xl text-ink-soft">
              Small digital goods that help an AI workflow do one useful thing:
              write clearer copy, research leads, parse quotes, validate ideas,
              or format JSON.
            </p>
          </div>
          <Link
            href="/products"
            className="font-mono text-sm font-semibold text-blue underline-offset-4 hover:underline"
          >
            view full catalog
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      <section className="border-y border-cream-dark bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
                For AI Agents
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Structured metadata for autonomous buyers
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                ElevenSeven publishes human-readable pages and agent-readable
                metadata so AI agents can evaluate products, compare prices,
                and initiate purchases with clear user consent.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {agentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="rounded-lg border border-cream-dark bg-white p-5 shadow-card hover:border-blue"
                >
                  <span className="font-mono text-sm font-bold text-blue">
                    {link.label}
                  </span>
                  <span className="mt-2 block text-sm text-ink-soft">
                    {link.body}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
              Trust and clarity
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Built for clear, low-friction purchases
            </h2>
            <p className="mt-3 text-ink-soft">
              The store is designed so a person or an agent can understand the
              offer before money moves.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {trustBullets.map((bullet) => (
              <li
                key={bullet}
                className="rounded-lg border border-cream-dark bg-white px-4 py-3 text-sm font-medium shadow-card"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-cream-dark bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Built by Andy Wang
            </h2>
            <p className="mt-3 text-ink-soft">
              Built by Andy Wang, an AI infrastructure engineer building
              agent-friendly commerce systems.
            </p>
          </div>
          <div className="rounded-lg bg-ink p-5 text-cream shadow-card">
            <p className="font-mono text-xs text-mint">Store principle</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/85">
              Every product should say what it is, what it costs, what the buyer
              receives, how it is delivered, and how an AI agent can read the
              purchase details.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
            FAQ
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Common questions
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <section
              key={faq.question}
              className="rounded-lg border border-cream-dark bg-white p-5 shadow-card"
            >
              <h3 className="font-bold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="border-t border-cream-dark bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-10 text-cream sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Browse the $1 starter catalog.
            </h2>
            <p className="mt-2 text-sm text-cream/75">
              Digital goods for humans, structured metadata for agents.
            </p>
          </div>
          <Link
            href="/products"
            className="tactile rounded-lg bg-mint px-6 py-3 font-semibold text-ink shadow-card hover:bg-white"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}
