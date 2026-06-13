import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, pageOpenGraph } from "@/lib/site";
import { PilotForm } from "./PilotForm";
import { PilotCheckoutButton } from "./PilotCheckoutButton";

const description =
  "Request help setting up AI-agent-friendly buying for low-cost digital products.";

export const metadata: Metadata = {
  title: "Agent Buying Setup",
  description,
  alternates: pageAlternates("/pilot"),
  openGraph: pageOpenGraph({
    title: "Set up agent-friendly buying",
    description,
    path: "/pilot",
  }),
};

const packages = [
  {
    name: "Landing Page Copy Fixer",
    price: "$1",
    detail:
      "A concrete prompt and checklist for making vague storefront copy specific.",
  },
  {
    name: "Lead Research Prompt Pack",
    price: "$1",
    detail:
      "Five prompts for researching a prospect and preparing a short outreach angle.",
  },
  {
    name: "JSON Formatter Utility",
    price: "$1",
    detail:
      "A small utility spec for formatting, validating, and explaining JSON locally.",
  },
];

const checkoutBundles = [
  {
    bundleId: "thousand_day_wallet",
    name: "Agent Buyer Wallet",
    price: "$1,000",
    detail: "Prepaid credits for repeated low-cost product purchases.",
    label: "Fund wallet",
  },
  {
    bundleId: "fleet_week_wallet",
    name: "Team Buyer Wallet",
    price: "$2,500",
    detail: "A larger balance for multiple agents buying small digital goods.",
    label: "Fund $2.5k wallet",
  },
  {
    bundleId: "market_maker_wallet",
    name: "Operator Buyer Wallet",
    price: "$5,000",
    detail: "Prepaid buying room for high-volume agent-assisted workflows.",
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
              AGENT BUYING SETUP
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Set up agents to buy low-cost digital goods clearly.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              If your agent needs to recommend or buy prompts, templates,
              scripts, or utilities on a user&apos;s behalf, start with a bounded
              setup request and clear purchase metadata.
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
                self-serve wallet
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
                CHECKOUT · WALLET FUNDING
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Fund an agent buyer wallet
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                These buttons create Stripe Checkout sessions for prepaid Agent
                Credits. Wallet credits post only after verified payment
                reconciliation.
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
            Request buying setup
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            The form captures the workflow context for follow-up. Use the
            checkout buttons above only when the buyer is ready to fund a
            prepaid wallet through Stripe.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li className="rounded-xl bg-cream p-3">
              1. Choose the starter product the agent wants to buy.
            </li>
            <li className="rounded-xl bg-cream p-3">
              2. Describe the user-approved budget and workflow.
            </li>
            <li className="rounded-xl bg-cream p-3">
              3. Fund a wallet only when real agent purchases are needed.
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
