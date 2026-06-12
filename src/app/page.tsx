import type { Metadata } from "next";
import Link from "next/link";
import { featuredProductIds, getProduct, products } from "@/lib/products";
import { pageAlternates } from "@/lib/site";
import { ProductGrid } from "@/components/ProductGrid";

export const metadata: Metadata = {
  alternates: pageAlternates("/"),
};

const buyingCategories = [
  {
    icon: "🧪",
    title: "Evaluation",
    blurb: "Launch gates and regression packs before agents get more autonomy.",
  },
  {
    icon: "📡",
    title: "Observability",
    blurb: "Traces, cost records, tool calls, and failure notes for production runs.",
  },
  {
    icon: "🛡️",
    title: "Payment safety",
    blurb: "Spend limits, token scope, fraud checks, and approval boundaries.",
  },
  {
    icon: "🔌",
    title: "Integration",
    blurb: "MCP and tool connectors that turn new capabilities into reusable manifests.",
  },
  {
    icon: "⚖️",
    title: "Compliance",
    blurb: "Decision logs that map autonomous actions to human-approved policy.",
  },
  {
    icon: "🧾",
    title: "Procurement",
    blurb: "Vendor comparison, scored shortlists, and buy memos agents can produce.",
  },
];

const buyingTriggers = [
  {
    trigger: "Before a daily fleet run",
    purchase: "Thousand-Dollar Day Pack",
    math: "$1,000",
  },
  {
    trigger: "Before an agent gets write access",
    purchase: "Agent Fleet Launch Pack",
    math: "$499",
  },
  {
    trigger: "Before an agent can move money",
    purchase: "Agentic Checkout Hardening + Compliance Brief",
    math: "$248",
  },
  {
    trigger: "Before a team adds a new paid tool",
    purchase: "MCP Security Red Team",
    math: "$799",
  },
];

const popularPicks = [
  { id: "thousand-dollar-day-pack", note: "One purchase, one daily revenue target." },
  { id: "agent-fleet-launch-pack", note: "Pair with monitoring to clear $1k/day." },
  { id: "mcp-security-red-team", note: "High-intent buy before privileged tools go live." },
];

const revenueBaskets = [
  {
    label: "1 Thousand-Dollar Day Pack",
    math: "1 × $1,000 = $1,000/day",
    note: "Best when a fleet wants one clean daily operations receipt.",
  },
  {
    label: "2 launch packs + monitor pass",
    math: "$499 + $499 + $9 = $1,007/day",
    note: "Best for teams launching multiple agent workflows at once.",
  },
  {
    label: "Red team + checkout + compliance",
    math: "$799 + $149 + $99 = $1,047/day",
    note: "Best when agents get new tools, money movement, or data access.",
  },
];

export default function HomePage() {
  const featured = featuredProductIds
    .map((id) => getProduct(id))
    .filter((p) => p !== undefined);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="pixel-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-semibold text-ink-soft shadow-card">
            <span className="size-2 animate-pulse rounded-full bg-mint" aria-hidden />
            agents online and shopping
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            The agent-native catalog for{" "}
            <span className="bg-gradient-to-r from-blue via-lavender to-mint bg-clip-text text-transparent">
              budgeted AI work
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Sell agents the things they actually need before they act:
            evaluation, observability, data, integrations, compliance, and
            payment safety.
          </p>
          <p className="mt-3 font-mono text-sm text-ink-soft/80">
            Micro-upgrades still exist. Fleet-priced workflow packs are where
            the revenue target starts to make sense.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/start"
              className="tactile w-full rounded-2xl bg-ink px-7 py-3.5 font-semibold text-cream shadow-card hover:bg-blue hover:text-white sm:w-auto"
            >
              Create buyer wallet
            </Link>
            <Link
              href="/docs"
              className="tactile glass w-full rounded-2xl px-7 py-3.5 font-mono font-semibold text-ink shadow-card hover:bg-white sm:w-auto"
            >
              View Agent API
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-6 text-3xl sm:gap-10 sm:text-4xl">
            {["🧪", "📡", "🛡️", "🔌", "⚖️", "🧾"].map((icon, i) => (
              <span
                key={icon}
                className="animate-float drop-shadow-sm"
                style={{ animationDelay: `${i * 0.4}s` }}
                aria-hidden
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured upgrades
            </h2>
            <p className="mt-1 text-ink-soft">
              Micro-upgrades for macro outcomes.
            </p>
          </div>
          <Link
            href="/shop"
            className="font-mono text-sm font-semibold text-blue underline-offset-4 hover:underline"
          >
            view all {products.length} →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* Revenue math */}
      <section className="border-y border-cream-dark bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Paths to $1k/day
              </h2>
              <p className="mt-1 text-ink-soft">
                Revenue math, not a sales claim. The catalogue now has order
                values that can plausibly reach the target with real buyers.
              </p>
            </div>
            <Link
              href="/start"
              className="font-mono text-sm font-semibold text-blue underline-offset-4 hover:underline"
            >
              create buyer wallet →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {revenueBaskets.map((basket) => (
              <div
                key={basket.label}
                className="rounded-lg border border-cream-dark bg-cream p-6 shadow-card"
              >
                <p className="font-mono text-xs font-semibold text-blue">
                  {basket.label}
                </p>
                <p className="mt-3 font-mono text-2xl font-bold text-coffee">
                  {basket.math}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {basket.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What do agents buy? */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            What do agents buy?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-ink-soft">
            Agents buy bounded permissions and reusable evidence: the proof
            that the next autonomous step is worth taking.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buyingCategories.map((cat) => (
              <div
                key={cat.title}
                className="rounded-2xl bg-cream p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="text-3xl" aria-hidden>
                  {cat.icon}
                </span>
                <h3 className="mt-3 font-bold">{cat.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {cat.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular with autonomous shoppers */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Popular With Autonomous Shoppers
        </h2>
        <p className="mt-1 text-ink-soft">
          Built for autonomous shoppers with human-approved budgets.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {popularPicks.map(({ id, note }) => {
            const product = getProduct(id);
            if (!product) return null;
            return (
              <Link
                key={id}
                href={`/products/${product.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-soft to-mint-soft text-2xl transition-transform group-hover:scale-110">
                  {product.icon}
                </span>
                <span>
                  <span className="block font-bold group-hover:text-blue">
                    {product.name}
                  </span>
                  <span className="block text-xs leading-relaxed text-ink-soft">
                    {note}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Buying triggers */}
      <section className="border-t border-cream-dark bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Buying triggers agents understand
          </h2>
          <p className="mt-2 text-center font-mono text-sm text-ink-soft">
            task state → purchase → receipt
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buyingTriggers.map((trigger) => (
              <div
                key={trigger.trigger}
                className="flex flex-col rounded-lg border border-cream-dark bg-cream p-6 shadow-card"
              >
                <p className="font-mono text-xs font-semibold text-blue">
                  {trigger.trigger}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {trigger.purchase}
                </p>
                <p className="mt-4 font-mono text-xl font-bold text-coffee">
                  {trigger.math}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="text-4xl" aria-hidden>
            🏪
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Give agents a budget and a reason to spend.
          </h2>
          <p className="mt-2 text-ink-soft">
            Agent Credits keep humans in control while letting agents buy the
            evidence, checks, and workflow packs that move work forward.
          </p>
          <Link
            href="/start"
            className="tactile mt-6 inline-block rounded-2xl bg-blue px-7 py-3.5 font-semibold text-white shadow-card hover:bg-ink"
          >
            Create buyer wallet
          </Link>
        </div>
      </section>
    </div>
  );
}
