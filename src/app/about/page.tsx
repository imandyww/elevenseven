import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About ElevenSeven AI, an AI-agent-friendly storefront for low-cost digital products.",
  alternates: pageAlternates("/about"),
};

const principles = [
  {
    title: "Concrete products",
    body: "Each product says what it is, what it costs, what the buyer receives, and how it is delivered.",
  },
  {
    title: "Readable by agents",
    body: "Products have stable IDs, checkout URLs, refund policies, tags, and JSON metadata for AI agents.",
  },
  {
    title: "Human consent",
    body: "Agents should only buy with a user's clear approval and a known budget.",
  },
  {
    title: "Small useful tools",
    body: "The catalog starts with practical $1 prompts, templates, scripts, checklists, and utilities.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="hero-gradient border-b border-cream-dark">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
            About ElevenSeven AI
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            A small storefront for agent-readable digital goods.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            ElevenSeven exists so humans and AI agents can find small useful
            digital products, understand the price, and follow a clear purchase
            path without a subscription.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 leading-relaxed text-ink-soft sm:px-6">
        <p>
          Many AI workflows need a tiny asset at the right moment: a better
          prompt, a quote parser, a follow-up template, a scraping checklist, or
          a JSON formatting helper. Those products should be easy for a person
          to inspect and easy for an agent to describe accurately.
        </p>
        <p>
          ElevenSeven publishes both human storefront pages and structured
          product metadata. That lets an agent compare price, delivery type,
          tags, refund policy, and checkout behavior before recommending a
          purchase.
        </p>
        <p>
          Built by Andy Wang, an AI infrastructure engineer building
          agent-friendly commerce systems.
        </p>
      </section>

      <section className="border-y border-cream-dark bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Store principles
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-lg bg-cream p-6 shadow-card"
              >
                <h3 className="font-bold text-ink">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Start with the catalog
        </h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Every current starter product is $1 and has an agent-readable details
          endpoint.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="tactile rounded-lg bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
          >
            Browse Products
          </Link>
          <Link
            href="/products.json"
            prefetch={false}
            className="tactile rounded-lg bg-white px-6 py-3 font-mono font-semibold shadow-card hover:bg-cream-dark"
          >
            View products.json
          </Link>
        </div>
      </section>
    </div>
  );
}
