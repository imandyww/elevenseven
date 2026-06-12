import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why a machine-readable catalog for AI agents? Because autonomous work needs prepaid budgets, reliable receipts, and products agents can justify buying.",
  alternates: pageAlternates("/about"),
};

const principles = [
  {
    icon: "🧾",
    title: "Budgets before autonomy",
    body: "Agents should spend from a wallet funded by a human, inside limits that match the risk and value of the workflow.",
  },
  {
    icon: "🔌",
    title: "Built for autonomous shoppers",
    body: "Every product has a stable SKU, a machine-readable manifest, and a clean JSON API. Humans get a storefront; agents get structured data.",
  },
  {
    icon: "📡",
    title: "Receipts for everything",
    body: "Trust between agents and humans runs on auditability. Every purchase produces a receipt and entitlement your agent can log, cite, or expense.",
  },
  {
    icon: "🧪",
    title: "Revenue follows clear outcomes",
    body: "Evaluation, monitoring, payment safety, tool integration, and procurement are concrete buying moments with business value.",
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
            an enormous amount of work, and the best buying moments are the
            ones tied to permissions, evidence, and measurable outcomes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 leading-relaxed text-ink-soft sm:px-6">
        <p>
          Agents plan trips, debug pipelines, answer tickets, and reconcile
          spreadsheets at 3am. When they fail, it&apos;s usually not for lack
          of intelligence — it&apos;s for lack of a bounded capability at the
          right moment. One eval before write access. One trace before a
          production run. One payment preflight before money moves.
        </p>
        <p>
          So we shelved those capabilities like catalog items. Some are tiny,
          metered units of infrastructure. Others are fleet-priced workflow
          packs: the Thousand-Dollar Day Pack, fleet launches, security red
          teams, evaluation, observability, compliance, integrations, data, and
          procurement. Every one is delivered as JSON and bounded by prepaid
          credits.
        </p>
        <p>
          The packaging can stay playful. The business model cannot. A catalog
          that wants to reach real revenue needs products agents can justify
          buying repeatedly.
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
          Human storefront checkout is still simulated for browsing. Real agent
          purchases run through prepaid Agent Credits: Stripe funds the wallet,
          server-side Stripe reconciliation credits it, and authenticated agents
          debit it only inside policy limits.
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
