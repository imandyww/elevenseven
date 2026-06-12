import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEMO_ORG_ID } from "@/lib/org";
import { formatCents } from "@/lib/money";
import { JsonManifest } from "@/components/JsonManifest";

export const metadata: Metadata = { title: "Receipt" };
export const dynamic = "force-dynamic";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          entitlements: true,
          agent: { select: { name: true } },
        },
      },
    },
  });
  if (!receipt || receipt.organizationId !== DEMO_ORG_ID) notFound();

  return (
    <div className="space-y-6">
      <nav className="font-mono text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/dashboard/receipts" className="hover:text-blue">
          receipts
        </Link>{" "}
        / <span className="text-ink">{receipt.id}</span>
      </nav>

      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {formatCents(receipt.order.totalCents)} ·{" "}
              {receipt.order.items.map((i) => i.name).join(", ")}
            </h2>
            <p className="mt-1 font-mono text-xs text-ink-soft">
              {receipt.id} · order {receipt.orderId} · agent{" "}
              {receipt.order.agent.name} ·{" "}
              {receipt.createdAt.toLocaleString()}
            </p>
            {receipt.order.reason && (
              <p className="mt-3 rounded-xl border-l-4 border-mint bg-mint-soft/50 p-3 text-sm text-ink-soft">
                Agent&apos;s reason: &ldquo;{receipt.order.reason}&rdquo;
              </p>
            )}
          </div>
          <span className="rounded-full bg-mint-soft px-3 py-1 font-mono text-xs font-semibold text-emerald-600">
            {receipt.order.status}
          </span>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
              <th className="pb-2 font-medium">item</th>
              <th className="pb-2 text-center font-medium">qty</th>
              <th className="pb-2 text-right font-medium">unit</th>
              <th className="pb-2 text-right font-medium">total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.order.items.map((item) => (
              <tr key={item.id} className="border-b border-cream-dark/60">
                <td className="py-2.5 font-medium">{item.name}</td>
                <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono">
                  {formatCents(item.unitPriceCents)}
                </td>
                <td className="py-2.5 text-right font-mono">
                  {formatCents(item.unitPriceCents * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {receipt.order.entitlements.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-bold">Entitlements</h3>
            {receipt.order.entitlements.map((ent) => (
              <p
                key={ent.id}
                className="rounded-xl bg-cream p-3 font-mono text-xs text-ink-soft"
              >
                {ent.id} · {ent.sku} · {ent.remainingUses}/{ent.allowedUses}{" "}
                uses remaining
                {ent.consumedAt
                  ? ` · fully consumed ${ent.consumedAt.toLocaleString()}`
                  : ""}
              </p>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold tracking-tight">
          Receipt manifest
        </h3>
        <JsonManifest
          data={JSON.parse(receipt.receiptJson)}
          title={`${receipt.id}.json`}
        />
      </div>
    </div>
  );
}
