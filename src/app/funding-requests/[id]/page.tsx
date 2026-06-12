import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle, type BundleId } from "@/lib/bundles";
import { prisma } from "@/lib/db";
import { fundingHandoff } from "@/lib/funding";
import { formatCents } from "@/lib/money";
import { pageAlternates } from "@/lib/site";
import { JsonManifest } from "@/components/JsonManifest";
import { FundingRequestCheckoutButton } from "../FundingRequestCheckoutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Funding Request",
  description:
    "Review and fund a wallet request created by an agent purchase attempt.",
  alternates: pageAlternates("/funding-requests"),
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  open: "bg-blue-soft text-blue",
  funded: "bg-mint-soft text-emerald-700",
  cancelled: "bg-cream-dark text-ink-soft",
};

export default async function FundingRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ purchase?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const { purchase, session_id: sessionId } = await searchParams;

  const request = await prisma.fundingRequest.findUnique({
    where: { id },
    include: {
      agent: { select: { name: true, keyPrefix: true } },
      organization: { select: { name: true } },
    },
  });

  if (!request) notFound();

  const bundle = getBundle(request.recommendedBundleId);
  if (!bundle) notFound();

  const handoff = fundingHandoff({
    requiredCreditsCents: request.totalCents,
    currentBalanceCents: request.currentBalanceCents,
    sku: request.sku,
    quantity: request.quantity,
    reason: request.reason ?? undefined,
    organizationId: request.organizationId,
    recommendedBundleId: request.recommendedBundleId,
    fundingRequestId: request.id,
  });

  return (
    <div>
      {purchase === "success" && (
        <div className="border-b border-mint/40 bg-mint-soft px-4 py-3 text-center text-sm text-emerald-800">
          Checkout completed. Credits post to the wallet when server-side
          Stripe reconciliation confirms payment. Session {sessionId ?? "pending"}.
        </div>
      )}
      {purchase === "cancelled" && (
        <div className="border-b border-cream-dark bg-white px-4 py-3 text-center text-sm text-ink-soft">
          Checkout cancelled. No charge was made.
        </div>
      )}

      <section className="hero-gradient border-b border-cream-dark">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold text-blue">
                AGENT FUNDING REQUEST
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Fund {request.productName}
              </h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
                An agent created this request because the organization wallet
                needs more prepaid credits before the purchase can complete.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                statusStyles[request.status] ?? "bg-cream-dark"
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5">
        <section className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold tracking-tight">Purchase intent</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-mono text-xs text-ink-soft">SKU</dt>
                <dd className="mt-1 font-semibold">{request.sku}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Quantity</dt>
                <dd className="mt-1 font-semibold">{request.quantity}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Agent</dt>
                <dd className="mt-1 font-semibold">
                  {request.agent.name} · {request.agent.keyPrefix}...
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Organization</dt>
                <dd className="mt-1 font-semibold">
                  {request.organization.name}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Current balance</dt>
                <dd className="mt-1 font-semibold">
                  {formatCents(request.currentBalanceCents)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Shortfall</dt>
                <dd className="mt-1 font-semibold text-coffee">
                  {formatCents(request.shortfallCents)}
                </dd>
              </div>
            </dl>
            {request.reason && (
              <p className="mt-5 rounded-xl bg-cream p-4 text-sm leading-relaxed text-ink-soft">
                {request.reason}
              </p>
            )}
          </div>

          <JsonManifest data={handoff} title="funding-handoff.json" />
        </section>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-card">
            <p className="font-mono text-xs font-semibold text-blue">
              RECOMMENDED WALLET
            </p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{bundle.name}</h2>
              <span className="font-mono text-sm font-bold text-coffee">
                {formatCents(bundle.priceCents)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {bundle.blurb}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Credits added</dt>
                <dd className="font-mono font-semibold">
                  {formatCents(bundle.creditsCents)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Requested purchase</dt>
                <dd className="font-mono font-semibold">
                  {formatCents(request.totalCents)}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <FundingRequestCheckoutButton
                bundleId={bundle.id as BundleId}
                organizationId={request.organizationId}
                fundingRequestId={request.id}
              />
            </div>
            <Link
              href="/dashboard/revenue"
              className="mt-4 block text-center font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
            >
              revenue dashboard
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
