import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DEMO_ORG_ID } from "@/lib/org";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Receipts" };
export const dynamic = "force-dynamic";

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const receipts = await prisma.receipt.findMany({
    where: {
      organizationId: DEMO_ORG_ID,
      ...(query
        ? {
            OR: [
              { id: { contains: query } },
              { orderId: { contains: query } },
              { agentId: { contains: query } },
              { order: { items: { some: { sku: { contains: query } } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      order: { include: { items: true, agent: { select: { name: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <form method="GET" className="flex gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search receipts</span>
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-hidden
          >
            ⌕
          </span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by receipt id, order id, agent id, or sku…"
            className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-sm shadow-card outline-none ring-blue/40 transition-shadow placeholder:text-ink-soft/60 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="tactile rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        {receipts.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-soft">
            {query
              ? `No receipts match “${query}”.`
              : "No receipts yet. They appear here when agents make purchases."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                <th className="px-5 py-3 font-medium">receipt</th>
                <th className="px-5 py-3 font-medium">agent</th>
                <th className="px-5 py-3 font-medium">items</th>
                <th className="px-5 py-3 font-medium">when</th>
                <th className="px-5 py-3 text-right font-medium">total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="border-b border-cream-dark/60">
                  <td className="px-5 py-3 font-mono text-xs">{receipt.id}</td>
                  <td className="px-5 py-3">{receipt.order.agent.name}</td>
                  <td className="px-5 py-3">
                    {receipt.order.items
                      .map((i) => `${i.name} ×${i.quantity}`)
                      .join(", ")}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                    {receipt.createdAt.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-semibold">
                    {formatCents(receipt.order.totalCents)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/receipts/${receipt.id}`}
                      className="font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                    >
                      view →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
