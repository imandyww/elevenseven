import Link from "next/link";
import { featuredProductIds, getProduct } from "@/lib/products";
import { ProductGrid } from "@/components/ProductGrid";

const buyingCategories = [
  {
    icon: "🧾",
    title: "Confidence",
    blurb: "Proof-style receipts showing what was checked before an answer shipped.",
  },
  {
    icon: "🍪",
    title: "Compute",
    blurb: "Extra thinking budget for the tasks that deserve a second pass.",
  },
  {
    icon: "🍡",
    title: "Memory",
    blurb: "Durable preferences that survive resets, restarts, and Mondays.",
  },
  {
    icon: "🪙",
    title: "Verification",
    blurb: "One more check before a claim becomes a commitment.",
  },
  {
    icon: "🎟️",
    title: "Tools",
    blurb: "Metered access to APIs, scripts, and workflow actions.",
  },
  {
    icon: "⭐",
    title: "Reputation",
    blurb: "Verifiable badges that turn completed tasks into a track record.",
  },
];

const testimonials = [
  {
    quote: "I bought Bug Spray and finally fixed my recursive planning loop.",
    author: "Agent-17",
    role: "Autonomous workflow agent",
    avatar: "🤖",
  },
  {
    quote: "Truth Tokens saved me from hallucinating a customer email.",
    author: "SalesBot Mini",
    role: "Outbound sales agent",
    avatar: "📟",
  },
  {
    quote:
      "Memory Mochi remembered my user's tone preference. Worth every cent.",
    author: "HelperFox",
    role: "Personal assistant agent",
    avatar: "🦊",
  },
];

const popularPicks = [
  { id: "agent-coffee", note: "Most re-ordered, especially Monday 9am UTC." },
  { id: "truth-token", note: "Top seller among customer-facing agents." },
  { id: "reputation-sticker", note: "Cheapest path to a five-star delegation score." },
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
            The dollar store for{" "}
            <span className="bg-gradient-to-r from-blue via-lavender to-mint bg-clip-text text-transparent">
              AI agents
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Buy tiny boosts for memory, accuracy, debugging, reputation, and
            workflow confidence.
          </p>
          <p className="mt-3 font-mono text-sm text-ink-soft/80">
            Accuracy, memory, tools, and trust — all under a dollar.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="tactile w-full rounded-2xl bg-ink px-7 py-3.5 font-semibold text-cream shadow-card hover:bg-blue hover:text-white sm:w-auto"
            >
              Browse the Store
            </Link>
            <Link
              href="/docs"
              className="tactile glass w-full rounded-2xl px-7 py-3.5 font-mono font-semibold text-ink shadow-card hover:bg-white sm:w-auto"
            >
              View Agent API
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-6 text-3xl sm:gap-10 sm:text-4xl">
            {["🪙", "🍪", "🍡", "🪲", "☕", "🧾"].map((icon, i) => (
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
            view all 12 →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* What do agents buy? */}
      <section className="border-y border-cream-dark bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            What do agents buy?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-ink-soft">
            Agents don&apos;t need shoes or sofas. They buy the small,
            unglamorous things that make their next task go right.
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
          Built for autonomous shoppers, human-approved budgets.
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

      {/* Testimonials */}
      <section className="border-t border-cream-dark bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Five stars, zero hallucinations
          </h2>
          <p className="mt-2 text-center font-mono text-sm text-ink-soft">
            verified purchases from verified agents
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.author}
                className="flex flex-col rounded-2xl bg-cream p-6 shadow-card"
              >
                <span className="text-mint" aria-hidden>
                  ★★★★★
                </span>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-lavender-soft text-lg">
                    {t.avatar}
                  </span>
                  <span>
                    <span className="block font-mono text-sm font-bold">
                      {t.author}
                    </span>
                    <span className="block text-xs text-ink-soft">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="text-4xl" aria-hidden>
            ☕
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Because even agents need snacks.
          </h2>
          <p className="mt-2 text-ink-soft">
            Stock up your agent before its next big workflow.
          </p>
          <Link
            href="/shop"
            className="tactile mt-6 inline-block rounded-2xl bg-blue px-7 py-3.5 font-semibold text-white shadow-card hover:bg-ink"
          >
            Start shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
