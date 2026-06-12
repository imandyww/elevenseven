"use client";

import { useActionState } from "react";
import { formatCents } from "@/lib/money";
import type { RevenueOfferBundleId } from "@/lib/revenue-offers";
import { startWorkspace, type StartState } from "./actions";
import { StartCheckoutButton } from "./StartCheckoutButton";

const initialState: StartState = {
  ok: false,
  message: "",
};

const targetOptions = [
  { value: "100000", label: "$1,000/day" },
  { value: "250000", label: "$2,500/day" },
  { value: "500000", label: "$5,000/day" },
];

const checkoutBundles: Array<{
  bundleId: RevenueOfferBundleId;
  name: string;
  price: string;
  detail: string;
  label: string;
}> = [
  {
    bundleId: "thousand_day_wallet",
    name: "$1k/day Wallet",
    price: "$1,000",
    detail: "Funds the first daily operating pack for this buyer workspace.",
    label: "Fund $1k wallet",
  },
  {
    bundleId: "fleet_week_wallet",
    name: "Fleet Week Wallet",
    price: "$2,500",
    detail: "Funds multiple launch, security, and daily operations purchases.",
    label: "Fund $2.5k wallet",
  },
  {
    bundleId: "market_maker_wallet",
    name: "Market Maker Wallet",
    price: "$5,000",
    detail: "Funds sustained agent spend for buyers targeting recurring usage.",
    label: "Fund $5k wallet",
  },
];

export function StartForm({
  initialBundle = "thousand_day_wallet",
  initialTargetDailySpendCents = "100000",
  initialOrganizationName,
  initialEmail,
  initialWebsite,
  initialAgentName = "revenue-agent",
  initialWorkflow,
  lockInitialBundle = false,
}: {
  initialBundle?: RevenueOfferBundleId;
  initialTargetDailySpendCents?: string;
  initialOrganizationName?: string;
  initialEmail?: string;
  initialWebsite?: string;
  initialAgentName?: string;
  initialWorkflow?: string;
  lockInitialBundle?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    startWorkspace,
    initialState,
  );
  const organizationId = state.organizationId;
  const selectedBundle =
    checkoutBundles.find((bundle) => bundle.bundleId === initialBundle) ??
    checkoutBundles[0];

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-card"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Organization</span>
            <input
              name="organizationName"
              required
              minLength={2}
              maxLength={120}
              defaultValue={initialOrganizationName}
              className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
              placeholder="Acme Agent Ops"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Billing email</span>
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              defaultValue={initialEmail}
              className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
              placeholder="ops@example.com"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Website</span>
            <input
              name="website"
              maxLength={200}
              defaultValue={initialWebsite}
              className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
              placeholder="https://example.com"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">First agent name</span>
            <input
              name="agentName"
              required
              minLength={2}
              maxLength={80}
              defaultValue={initialAgentName}
              className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Target daily spend</span>
          <select
            name="targetDailySpendCents"
            defaultValue={initialTargetDailySpendCents}
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
          >
            {targetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">First wallet funding</span>
          {lockInitialBundle ? (
            <div className="rounded-xl bg-cream px-3 py-2">
              <input
                type="hidden"
                name="initialBundle"
                value={selectedBundle.bundleId}
              />
              <span className="font-semibold">{selectedBundle.name}</span>
              <span className="font-mono text-xs text-ink-soft">
                {" "}
                - {selectedBundle.price}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {selectedBundle.detail}
              </p>
            </div>
          ) : (
            <select
              name="initialBundle"
              defaultValue={initialBundle}
              className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            >
              {checkoutBundles.map((bundle) => (
                <option key={bundle.bundleId} value={bundle.bundleId}>
                  {bundle.name} - {bundle.price}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Agent workflow</span>
          <textarea
            name="workflow"
            required
            minLength={20}
            maxLength={1200}
            rows={5}
            defaultValue={initialWorkflow}
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            placeholder="Describe the production workflow this agent will run and why it needs prepaid buying power."
          />
        </label>

        <input
          type="text"
          name="companyUrl2"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        {state.message && (
          <p
            className={`rounded-xl p-3 text-sm ${
              state.ok ? "bg-mint-soft text-emerald-800" : "bg-red-50 text-red-600"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || Boolean(state.rawKey)}
          className="tactile w-full rounded-xl bg-ink px-5 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Creating workspace and checkout..."
            : state.rawKey
              ? "Workspace created"
              : "Create workspace, agent key, and checkout"}
        </button>
      </form>

      {state.rawKey && organizationId && (
        <section className="rounded-2xl border border-mint/50 bg-mint-soft p-6 shadow-card">
          <p className="font-mono text-xs font-semibold text-emerald-800">
            BUYER WORKSPACE CREATED
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Copy this agent key now
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900">
            This key is shown once. It is already scoped to{" "}
            <span className="font-mono">{state.organizationId}</span> and can
            buy from the wallet after Stripe funding posts.
          </p>
          <textarea
            readOnly
            value={state.rawKey}
            className="mt-4 h-24 w-full rounded-xl bg-white p-3 font-mono text-sm text-ink outline-none"
          />
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-3">
              <dt className="font-mono text-xs text-ink-soft">Organization</dt>
              <dd className="mt-1 font-semibold">{state.organizationId}</dd>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <dt className="font-mono text-xs text-ink-soft">Agent</dt>
              <dd className="mt-1 font-semibold">{state.agentName}</dd>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <dt className="font-mono text-xs text-ink-soft">Key prefix</dt>
              <dd className="mt-1 font-semibold">{state.keyPrefix}</dd>
            </div>
          </dl>
        </section>
      )}

      {organizationId && (
        <section className="rounded-2xl bg-white p-6 shadow-card">
          {state.checkoutUrl ? (
            <div className="mb-5 rounded-xl border border-mint/50 bg-mint-soft p-4">
              <p className="font-mono text-xs font-semibold text-emerald-800">
                STRIPE CHECKOUT READY
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Fund{" "}
                {state.checkoutAmountCents
                  ? formatCents(state.checkoutAmountCents)
                  : "the selected wallet"}{" "}
                now
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                This checkout is already tied to{" "}
                <span className="font-mono">{organizationId}</span>. If the
                buyer leaves before paying, use the recovery link below from
                the follow-up queue.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={state.checkoutUrl}
                  className="tactile rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
                >
                  Open Stripe Checkout
                </a>
                {state.checkoutRecoveryUrl && (
                  <a
                    href={state.checkoutRecoveryUrl}
                    className="rounded-xl bg-white px-4 py-2.5 font-mono text-xs font-semibold text-ink shadow-card hover:bg-cream-dark"
                  >
                    recovery page
                  </a>
                )}
              </div>
              {state.checkoutIntentId && (
                <p className="mt-3 font-mono text-[11px] text-emerald-900">
                  checkout intent {state.checkoutIntentId}
                </p>
              )}
            </div>
          ) : state.checkoutError ? (
            <div className="mb-5 rounded-xl border border-coffee/30 bg-coffee-soft p-4 text-sm leading-relaxed text-coffee">
              {state.checkoutError}
            </div>
          ) : null}

          <p className="font-mono text-xs font-semibold text-blue">
            FUND THIS BUYER WALLET
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Start with prepaid Agent Credits
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            These buttons create Stripe Checkout sessions for the buyer
            organization above, not the demo wallet.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {checkoutBundles.map((bundle) => (
              <div
                key={bundle.bundleId}
                className="flex flex-col rounded-xl border border-cream-dark bg-cream p-4"
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
                <StartCheckoutButton
                  bundleId={bundle.bundleId}
                  organizationId={organizationId}
                  label={bundle.label}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
