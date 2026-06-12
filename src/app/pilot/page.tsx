import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, pageOpenGraph } from "@/lib/site";
import { PilotForm } from "./PilotForm";
import { PilotCheckoutButton } from "./PilotCheckoutButton";

const description =
  "Request a paid pilot for agent fleet operations, MCP security, or launch readiness with prepaid Agent Credits.";

export const metadata: Metadata = {
  title: "Paid Pilot",
  description,
  alternates: pageAlternates("/pilot"),
  openGraph: pageOpenGraph({
    title: "Start a paid agent pilot",
    description,
    path: "/pilot",
  }),
};

const packages = [
  {
    name: "Thousand-Dollar Day Pack",
    price: "$1,000/day",
    detail:
      "Daily operating budget for a serious agent fleet with evaluation, traces, repair reserve, and audit output.",
  },
  {
    name: "MCP Security Red Team",
    price: "$799/run",
    detail:
      "Prompt-injection, tool-scope, data-leak, and permission-boundary checks before privileged tools go live.",
  },
  {
    name: "Agent Fleet Launch Pack",
    price: "$499/launch",
    detail:
      "Launch gate for teams moving from a demo agent to real write/tool permissions.",
  },
];

const checkoutBundles = [
  {
    bundleId: "thousand_day_wallet",
    name: "$1k/day Wallet",
    price: "$1,000",
    detail: "One daily operating pack worth of prepaid Agent Credits.",
    label: "Fund $1k wallet",
  },
  {
    bundleId: "fleet_week_wallet",
    name: "Fleet Week Wallet",
    price: "$2,500",
    detail: "Enough balance for launch packs, red-team runs, and daily ops.",
    label: "Fund $2.5k wallet",
  },
  {
    bundleId: "market_maker_wallet",
    name: "Market Maker Wallet",
    price: "$5,000",
    detail: "A larger operator balance for sustained agent fleet spend.",
    label: "Fund $5k wallet",
  },
] as const;

export default async function PilotPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const { purchase } = await searchParams;

  return (
    <div>
      {purchase === "success" && (
        <div className="border-b border-mint/40 bg-mint-soft px-4 py-3 text-center text-sm text-emerald-800">
          Payment received. Credits post to the wallet when the Stripe webhook
          confirms; check the Revenue dashboard for booked cash.
        </div>
      )}
      {purchase === "cancelled" && (
        <div className="border-b border-cream-dark bg-white px-4 py-3 text-center text-sm text-ink-soft">
          Checkout cancelled. No charge was made.
        </div>
      )}
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:py-20">
          <div className="lg:col-span-3">
            <p className="font-mono text-xs font-semibold text-blue">
              PAID PILOT · PREPAID AGENT CREDITS
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Start with one agent fleet day worth paying for.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              If your agents have a real workflow, a real risk surface, and a
              real budget, start with a bounded paid pilot. We&apos;ll turn the
              work into a wallet-funded purchase path and a receipt trail.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/api/agent-catalog"
                prefetch={false}
                className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
              >
                agent catalog JSON
              </Link>
              <Link
                href="/start"
                className="rounded-xl bg-white px-4 py-2 font-mono text-xs font-semibold text-ink shadow-card hover:bg-cream-dark"
              >
                self-serve start
              </Link>
            </div>
          </div>
          <div className="grid gap-3 lg:col-span-2">
            {packages.map((pkg) => (
              <div key={pkg.name} className="rounded-lg bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold">{pkg.name}</h2>
                  <span className="shrink-0 font-mono text-sm font-bold text-coffee">
                    {pkg.price}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {pkg.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-cream-dark bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold text-blue">
                CHECKOUT · VERIFIED STRIPE REVENUE
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Fund the pilot wallet now
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                These buttons create real Stripe Checkout sessions for prepaid
                Agent Credits. Wallet credits are still posted only by the
                verified webhook.
              </p>
            </div>
            <Link
              href="/dashboard/revenue"
              className="font-mono text-sm font-semibold text-blue underline-offset-4 hover:underline"
            >
              revenue dashboard →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {checkoutBundles.map((bundle) => (
              <div
                key={bundle.bundleId}
                className="flex flex-col rounded-lg border border-cream-dark bg-cream p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold">{bundle.name}</h3>
                  <span className="font-mono text-sm font-bold text-coffee">
                    {bundle.price}
                  </span>
                </div>
                <p className="mb-4 mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {bundle.detail}
                </p>
                <PilotCheckoutButton
                  bundleId={bundle.bundleId}
                  label={bundle.label}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Request the pilot
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            The form captures the workflow context for follow-up. Use the
            checkout buttons above when the buyer is ready to fund the wallet
            immediately through Stripe.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li className="rounded-xl bg-cream p-3">
              1. Create the pilot lead and choose a target daily spend.
            </li>
            <li className="rounded-xl bg-cream p-3">
              2. Create an agent key in the dashboard.
            </li>
            <li className="rounded-xl bg-cream p-3">
              3. Fund the wallet and let the agent buy the recommended SKU.
            </li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <PilotForm />
        </div>
      </section>
    </div>
  );
}
