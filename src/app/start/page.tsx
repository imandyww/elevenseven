import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, pageOpenGraph } from "@/lib/site";
import {
  startPrefillFromSearchParams,
  type StartPrefillSearchParams,
} from "@/lib/start-prefill";
import { StartForm } from "./StartForm";

const description =
  "Create a buyer workspace, agent API key, and Stripe-funded wallet for production agent purchases.";

export const metadata: Metadata = {
  title: "Start",
  description,
  alternates: pageAlternates("/start"),
  openGraph: pageOpenGraph({
    title: "Start buying with agents",
    description,
    path: "/start",
  }),
};

const steps = [
  {
    label: "Workspace",
    detail: "Create an organization wallet and first agent key.",
  },
  {
    label: "Funding",
    detail: "Prepare the first Stripe checkout during setup.",
  },
  {
    label: "Purchasing",
    detail: "Let the agent buy one-off or standing daily orders.",
  },
];

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<
    StartPrefillSearchParams & { purchase?: string; session_id?: string }
  >;
}) {
  const params = await searchParams;
  const { purchase, session_id: sessionId } = params;
  const prefill = startPrefillFromSearchParams(params);

  return (
    <div>
      {purchase === "success" && (
        <div className="border-b border-mint/40 bg-mint-soft px-4 py-3 text-center text-sm text-emerald-800">
          Payment received. Credits post to the buyer wallet when server-side
          Stripe reconciliation confirms payment. Session {sessionId ?? "pending"}.
        </div>
      )}
      {purchase === "cancelled" && (
        <div className="border-b border-cream-dark bg-white px-4 py-3 text-center text-sm text-ink-soft">
          Checkout cancelled. No charge was made.
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:py-16">
        <section className="lg:col-span-2">
          <p className="font-mono text-xs font-semibold text-blue">
            SELF-SERVE BUYER SETUP
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Create the wallet your agent can spend from.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            This creates a buyer organization, a prepaid wallet, and the first
            production API key. The first wallet checkout is prepared in the
            same flow; purchases spend only from the wallet and policy envelope.
          </p>
          <div className="mt-6 grid gap-3">
            {steps.map((step, index) => (
              <div key={step.label} className="rounded-lg bg-white p-4 shadow-card">
                <p className="font-mono text-xs font-semibold text-blue">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-bold">{step.label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/api/agent-catalog"
              prefetch={false}
              className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
            >
              catalog JSON
            </Link>
            <Link
              href="/docs"
              className="rounded-xl bg-white px-4 py-2 font-mono text-xs font-semibold text-ink shadow-card hover:bg-cream-dark"
            >
              API docs
            </Link>
          </div>
        </section>

        <section className="lg:col-span-3">
          <StartForm
            initialOrganizationName={prefill.organizationName}
            initialEmail={prefill.email}
            initialWebsite={prefill.website}
            initialAgentName={prefill.agentName}
            initialWorkflow={prefill.workflow}
          />
        </section>
      </main>
    </div>
  );
}
