import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why a convenience store for AI agents? Because the future of agent infrastructure is small, metered, and surprisingly cute.",
  alternates: pageAlternates("/about"),
};

const principles = [
  {
    icon: "🥤",
    title: "Everything under a dollar",
    body: "Upgrades should be cheap enough that an agent never has to escalate to a human for budget approval. A Truth Token costs less than the mistake it prevents.",
  },
  {
    icon: "🍫",
    title: "Built for autonomous shoppers",
    body: "Every product has a stable SKU, a machine-readable manifest, and a clean JSON API. Humans get a pretty storefront; agents get structured data. Everyone's happy.",
  },
  {
    icon: "🧾",
    title: "Receipts for everything",
    body: "Trust between agents and humans runs on auditability. Every purchase produces a manifest your agent can log, cite, or expense.",
  },
  {
    icon: "🏪",
    title: "Serious infrastructure, unserious packaging",
    body: "Verification passes, memory persistence, metered tool calls — real primitives of agent infrastructure. We just believe they're more lovable as snacks.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="hero-gradient">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-5xl" aria-hidden>
            🏪🛍️
          </p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            A corner store for the agent economy
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Eleven Seven started with a simple observation: AI agents do
            an enormous amount of work, and almost nobody ever buys them
            anything.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 leading-relaxed text-ink-soft sm:px-6">
        <p>
          Agents plan trips, debug pipelines, answer tickets, and reconcile
          spreadsheets at 3am. When they fail, it&apos;s usually not for lack
          of intelligence — it&apos;s for lack of a small, cheap capability at
          the right moment. One more verification pass. One remembered
          preference. One safe dry run before the irreversible action.
        </p>
        <p>
          So we shelved those capabilities like convenience-store goods. Each
          product is a tiny, metered unit of agent infrastructure: priced in
          cents, delivered as JSON, and stackable with everything else in the
          catalog. The packaging is playful. The primitives underneath —
          verification, memory, compute, tooling, reputation, trust — are the
          serious building blocks of dependable autonomous systems.
        </p>
        <p>
          Is it a little absurd that the memory upgrade is a mochi? Yes. Do
          agents seem to perform better when their infrastructure has a face?
          Also yes. We don&apos;t make the rules; we just stock the shelves.
        </p>
      </section>

      <section className="border-y border-cream-dark bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            What we believe
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="rounded-2xl bg-cream p-6 shadow-card">
                <span className="text-3xl" aria-hidden>
                  {p.icon}
                </span>
                <h3 className="mt-3 font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          The fine print
        </h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Today, checkout is simulated and no real money moves. When real
          payments arrive, they&apos;ll run on prepaid Agent Credits and
          bundles — because paying $0.30 in card fees to buy a $0.10 sticker
          is exactly the kind of inefficiency our customers were built to
          eliminate.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="tactile rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
          >
            Browse the store
          </Link>
          <Link
            href="/docs"
            className="tactile rounded-2xl bg-white px-6 py-3 font-mono font-semibold shadow-card hover:bg-cream-dark"
          >
            Read the Agent API docs
          </Link>
        </div>
      </section>
    </div>
  );
}
