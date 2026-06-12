import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle, type BundleId } from "@/lib/bundles";
import { prisma } from "@/lib/db";
import { recommendBundle } from "@/lib/funding";
import { formatCents } from "@/lib/money";
import { serializeStandingOrder } from "@/lib/standing-orders";
import { JsonManifest } from "@/components/JsonManifest";
import {
  activateStandingOrder,
  cancelStandingOrder,
  pauseStandingOrder,
} from "@/app/dashboard/actions";
import { StandingOrderCheckoutButton } from "../StandingOrderCheckoutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Standing Order",
  description: "Review and activate an agent-requested recurring purchase.",
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  requested: "bg-blue-soft text-blue",
  active: "bg-mint-soft text-emerald-700",
  paused: "bg-coffee-soft text-coffee",
  cancelled: "bg-cream-dark text-ink-soft",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${
        statusStyles[status] ?? "bg-cream-dark"
      }`}
    >
      {status}
    </span>
  );
}

function ActionForm({
  action,
  id,
  label,
  variant = "primary",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="standingOrderId" value={id} />
      <button
        type="submit"
        className={
          variant === "primary"
            ? "tactile w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
            : "w-full rounded-xl border border-cream-dark px-4 py-3 text-sm font-semibold text-ink-soft hover:border-blue hover:text-blue"
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function StandingOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ purchase?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const { purchase, session_id: sessionId } = await searchParams;

  const order = await prisma.standingOrder.findUnique({
    where: { id },
    include: {
      agent: { select: { name: true, keyPrefix: true } },
      organization: { select: { name: true } },
    },
  });

  if (!order) notFound();

  const recommendedBundle = recommendBundle(order.totalCents);
  const bundle = getBundle(recommendedBundle.id);
  if (!bundle) notFound();

  const manifest = serializeStandingOrder(order);

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
                AGENT STANDING ORDER
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {order.productName} every day
              </h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
                An agent requested a recurring purchase. Activating this order
                approves the daily spend envelope and lets the runner buy once
                per UTC day while wallet credits are available.
              </p>
            </div>
            <StatusPill status={order.status} />
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5">
        <section className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold tracking-tight">
              Recurring purchase
            </h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-mono text-xs text-ink-soft">SKU</dt>
                <dd className="mt-1 font-semibold">{order.sku}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Cadence</dt>
                <dd className="mt-1 font-semibold">{order.cadence}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Quantity</dt>
                <dd className="mt-1 font-semibold">{order.quantity}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Daily spend</dt>
                <dd className="mt-1 font-semibold text-coffee">
                  {formatCents(order.totalCents)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Agent</dt>
                <dd className="mt-1 font-semibold">
                  {order.agent.name} · {order.agent.keyPrefix}...
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Organization</dt>
                <dd className="mt-1 font-semibold">
                  {order.organization.name}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">Last run</dt>
                <dd className="mt-1 font-semibold">
                  {order.lastRunAt
                    ? `${order.lastRunStatus ?? "unknown"} · ${order.lastRunAt.toLocaleString()}`
                    : "not run yet"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-soft">
                  Monthly envelope
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatCents(order.totalCents * 31)}
                </dd>
              </div>
            </dl>
            <p className="mt-5 rounded-xl bg-cream p-4 text-sm leading-relaxed text-ink-soft">
              {order.reason}
            </p>
          </div>

          <JsonManifest data={manifest} title="standing-order.json" />
        </section>

        <aside className="space-y-5 lg:col-span-2">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="font-mono text-xs font-semibold text-blue">
                HUMAN APPROVAL
              </p>
              <h2 className="mt-3 text-xl font-bold">
                {formatCents(order.totalCents)} daily authorization
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Activation updates this agent&apos;s policy limits to cover
                the approved daily order. Wallet funding is still handled by
                Stripe checkout and the verified webhook.
              </p>
              <div className="mt-6 space-y-3">
                {(order.status === "requested" || order.status === "paused") && (
                  <ActionForm
                    action={activateStandingOrder}
                    id={order.id}
                    label="Activate standing order"
                  />
                )}
                {order.status === "active" && (
                  <ActionForm
                    action={pauseStandingOrder}
                    id={order.id}
                    label="Pause standing order"
                    variant="secondary"
                  />
                )}
                {order.status !== "cancelled" && (
                  <ActionForm
                    action={cancelStandingOrder}
                    id={order.id}
                    label="Cancel standing order"
                    variant="secondary"
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
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
              <div className="mt-6">
                <StandingOrderCheckoutButton
                  bundleId={bundle.id as BundleId}
                  organizationId={order.organizationId}
                  standingOrderId={order.id}
                />
              </div>
              <Link
                href="/dashboard/revenue"
                className="mt-4 block text-center font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
              >
                revenue dashboard
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
