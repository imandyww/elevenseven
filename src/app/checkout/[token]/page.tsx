import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/bundles";
import { checkoutHasUsableStripeSession } from "@/lib/checkout-recovery";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { createFreshCheckoutFromRecovery } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume Checkout",
  description: "Resume funding an Eleven Seven agent wallet.",
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  open: "bg-blue-soft text-blue",
  paid: "bg-mint-soft text-emerald-700",
  expired: "bg-cream-dark text-ink-soft",
  cancelled: "bg-coffee-soft text-coffee",
};

export default async function CheckoutRecoveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ purchase?: string; session_id?: string }>;
}) {
  const { token } = await params;
  const { purchase, session_id: sessionId } = await searchParams;

  const intent = await prisma.checkoutIntent.findUnique({
    where: { recoveryToken: token },
    include: {
      organization: {
        select: { name: true, billingEmail: true },
      },
    },
  });

  if (!intent) notFound();

  const bundle = getBundle(intent.bundleId);
  const status = purchase === "success" ? "paid" : intent.status;
  const checkoutIsStillUsable = checkoutHasUsableStripeSession({
    status,
    checkoutUrl: intent.checkoutUrl,
    expiresAt: intent.expiresAt,
  });

  return (
    <div>
      {purchase === "success" && (
        <div className="border-b border-mint/40 bg-mint-soft px-4 py-3 text-center text-sm text-emerald-800">
          Checkout completed. Credits post when server-side Stripe
          reconciliation confirms payment. Session {sessionId ?? "pending"}.
        </div>
      )}
      {purchase === "cancelled" && (
        <div className="border-b border-cream-dark bg-white px-4 py-3 text-center text-sm text-ink-soft">
          Checkout cancelled. No charge was made.
        </div>
      )}

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:py-16">
        <section className="lg:col-span-3">
          <p className="font-mono text-xs font-semibold text-blue">
            WALLET FUNDING CHECKOUT
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Resume funding {intent.organization.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            This checkout funds prepaid Agent Credits for the organization
            wallet. Agents can spend those credits only inside their policy
            limits, and the wallet is credited only after server-side Stripe
            reconciliation confirms payment.
          </p>
          <div className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-card sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs text-ink-soft">Bundle</p>
              <p className="mt-1 font-semibold">
                {bundle?.name ?? intent.bundleId}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-soft">Amount</p>
              <p className="mt-1 font-mono font-semibold text-coffee">
                {formatCents(intent.amountCents)}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-soft">Credits</p>
              <p className="mt-1 font-mono font-semibold">
                {formatCents(intent.creditsCents)}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-soft">Status</p>
              <p className="mt-1">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                    statusStyles[status] ?? "bg-cream-dark"
                  }`}
                >
                  {status}
                </span>
              </p>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-card">
            <p className="font-mono text-xs font-semibold text-blue">
              NEXT STEP
            </p>
            <h2 className="mt-3 text-xl font-bold">
              {status === "paid" ? "Wallet funding is complete" : "Finish checkout"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {status === "paid"
                ? "Server-side Stripe reconciliation will update the wallet credit and revenue dashboard."
                : checkoutIsStillUsable
                  ? "Use the Stripe checkout link below. This recovery page stays available for buyer follow-up."
                  : "Create a fresh Stripe Checkout for this same buyer wallet and bundle."}
            </p>
            {checkoutIsStillUsable && intent.checkoutUrl ? (
              <a
                href={intent.checkoutUrl}
                className="tactile mt-6 block rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
              >
                Resume Stripe checkout
              </a>
            ) : status !== "paid" ? (
              <form action={createFreshCheckoutFromRecovery}>
                <input type="hidden" name="recoveryToken" value={token} />
                <button
                  type="submit"
                  className="tactile mt-6 block w-full rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
                >
                  Create fresh Stripe checkout
                </button>
              </form>
            ) : (
              <Link
                href="/dashboard/revenue"
                className="mt-6 block rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
              >
                View revenue dashboard
              </Link>
            )}
            <p className="mt-4 font-mono text-[11px] text-ink-soft">
              {intent.organization.billingEmail ?? "No billing email on file"}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
