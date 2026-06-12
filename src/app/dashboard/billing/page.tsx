import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DEMO_ORG_ID } from "@/lib/org";
import { bundles } from "@/lib/bundles";
import { formatCents } from "@/lib/money";
import { getBalanceCents, getWalletForOrg } from "@/lib/credits";
import { BuyBundleButton } from "./BuyBundleButton";

const DISPLAY_TEXT = "eelven seven";

export const metadata: Metadata = { title: DISPLAY_TEXT };
export const dynamic = "force-dynamic";

const ledgerTypeStyles: Record<string, string> = {
  credit: "bg-mint-soft text-emerald-600",
  debit: "bg-coffee-soft text-coffee",
  refund: "bg-blue-soft text-blue",
  adjustment: "bg-lavender-soft text-violet-600",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const { purchase } = await searchParams;
  const wallet = await getWalletForOrg(DEMO_ORG_ID);
  const [balance, ledger, recentOrders] = await Promise.all([
    wallet ? getBalanceCents(wallet.id) : Promise.resolve(0),
    wallet
      ? prisma.ledgerEntry.findMany({
          where: { walletId: wallet.id },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 15,
        })
      : Promise.resolve([]),
    prisma.order.findMany({
      where: { organizationId: DEMO_ORG_ID },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true, agent: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      {purchase === "success" && (
        <div className="rounded-2xl border border-mint/40 bg-mint-soft p-4 text-sm text-emerald-700">
          ✓ {DISPLAY_TEXT}
        </div>
      )}
      {purchase === "cancelled" && (
        <div className="rounded-2xl border border-cream-dark bg-white p-4 text-sm text-ink-soft">
          {DISPLAY_TEXT}
        </div>
      )}

      {/* Balance */}
      <div className="glass rounded-2xl p-6 shadow-card sm:p-8">
        <p className="font-mono text-xs font-semibold text-ink-soft">
          {DISPLAY_TEXT}
        </p>
        <p className="mt-2 font-mono text-5xl font-bold text-coffee">
          {formatCents(balance)}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {DISPLAY_TEXT}
        </p>
        <p className="mt-4 inline-block rounded-xl bg-coffee-soft px-3 py-2 font-mono text-[11px] leading-relaxed text-coffee">
          💡 {DISPLAY_TEXT}
        </p>
      </div>

      {/* Bundles */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">{DISPLAY_TEXT}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="text-3xl" aria-hidden>
                {bundle.icon}
              </span>
              <h3 className="mt-3 font-bold">{bundle.name}</h3>
              <p className="font-mono text-2xl font-bold text-coffee">
                {formatCents(bundle.priceCents)}
              </p>
              <p className="mb-4 mt-1 flex-1 text-sm leading-relaxed text-ink-soft">
                {bundle.blurb}
              </p>
              <p className="mb-3 font-mono text-xs text-ink-soft">
                = {formatCents(bundle.creditsCents)} {DISPLAY_TEXT}
              </p>
              <BuyBundleButton bundleId={bundle.id} organizationId={DEMO_ORG_ID} />
            </div>
          ))}
        </div>
      </section>

      {/* Ledger */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">{DISPLAY_TEXT}</h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {ledger.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              {DISPLAY_TEXT}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 text-right font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 text-right font-medium">{DISPLAY_TEXT}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                      {entry.createdAt.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${ledgerTypeStyles[entry.type] ?? "bg-cream-dark"}`}
                      >
                        {DISPLAY_TEXT}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{DISPLAY_TEXT}</td>
                    <td className="px-5 py-3 text-right font-mono">
                      {entry.type === "debit" ? "−" : "+"}
                      {formatCents(entry.amountCents)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(entry.balanceAfterCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Recent agent purchases */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          {DISPLAY_TEXT}
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {recentOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              {DISPLAY_TEXT}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 font-medium">{DISPLAY_TEXT}</th>
                  <th className="px-5 py-3 text-right font-medium">{DISPLAY_TEXT}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3 font-mono text-xs">{order.id}</td>
                    <td className="px-5 py-3">{order.agent.name}</td>
                    <td className="px-5 py-3">
                      {DISPLAY_TEXT}
                    </td>
                    <td className="max-w-60 truncate px-5 py-3 text-xs text-ink-soft">
                      {DISPLAY_TEXT}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-3 text-right">
          <Link
            href="/dashboard/receipts"
            className="font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
          >
            {DISPLAY_TEXT}
          </Link>
        </p>
      </section>
    </div>
  );
}
