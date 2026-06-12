import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEMO_ORG_ID } from "@/lib/org";
import { formatCents } from "@/lib/money";
import {
  agentSpendSinceCents,
  startOfUtcDay,
  startOfUtcMonth,
} from "@/lib/credits";
import { allowedCategories, blockedSkus } from "@/lib/policy";
import {
  pauseAgent,
  resumeAgent,
  revokeAgent,
  updatePolicy,
} from "../../../actions";

export const metadata: Metadata = { title: "Agent spending" };
export const dynamic = "force-dynamic";

function SpendMeter({
  label,
  spent,
  limit,
}: {
  label: string;
  spent: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="font-mono text-xs font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-coffee">
        {formatCents(spent)}
        <span className="text-sm font-medium text-ink-soft">
          {" "}
          / {formatCents(limit)}
        </span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-dark">
        <div
          className={`h-full rounded-full ${pct >= 100 ? "bg-red-400" : pct >= 75 ? "bg-coffee" : "bg-mint"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function AgentSpendingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: { policy: true },
  });
  if (!agent || agent.organizationId !== DEMO_ORG_ID || !agent.policy) notFound();
  const policy = agent.policy;

  const [spentToday, spentMonth, recentOrders] = await Promise.all([
    agentSpendSinceCents(agent.id, startOfUtcDay()),
    agentSpendSinceCents(agent.id, startOfUtcMonth()),
    prisma.order.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true, receipt: { select: { id: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <nav className="font-mono text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/dashboard/agents" className="hover:text-blue">
          agents
        </Link>{" "}
        / <span className="text-ink">{agent.name}</span>
      </nav>

      {/* Identity + status controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-card">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{agent.name}</h2>
          <p className="font-mono text-xs text-ink-soft">
            {agent.id} · key {agent.keyPrefix}… · status{" "}
            <span className="font-semibold text-ink">{agent.status}</span>
            {agent.lastUsedAt &&
              ` · last used ${agent.lastUsedAt.toLocaleString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          {agent.status === "active" && (
            <form action={pauseAgent}>
              <input type="hidden" name="agentId" value={agent.id} />
              <button
                type="submit"
                className="tactile rounded-xl bg-coffee-soft px-4 py-2 text-sm font-semibold text-coffee shadow-card hover:bg-coffee hover:text-cream"
              >
                Pause
              </button>
            </form>
          )}
          {agent.status === "paused" && (
            <form action={resumeAgent}>
              <input type="hidden" name="agentId" value={agent.id} />
              <button
                type="submit"
                className="tactile rounded-xl bg-mint-soft px-4 py-2 text-sm font-semibold text-emerald-700 shadow-card hover:bg-mint"
              >
                Resume
              </button>
            </form>
          )}
          {agent.status !== "revoked" && (
            <form action={revokeAgent}>
              <input type="hidden" name="agentId" value={agent.id} />
              <button
                type="submit"
                className="tactile rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 shadow-card hover:bg-red-500 hover:text-white"
              >
                Revoke key
              </button>
            </form>
          )}
          {agent.status === "revoked" && (
            <p className="font-mono text-xs text-red-500">
              revoked — create a new agent for a fresh key
            </p>
          )}
        </div>
      </div>

      {/* Spend meters */}
      <div className="grid gap-5 sm:grid-cols-2">
        <SpendMeter
          label="SPENT TODAY (UTC)"
          spent={spentToday}
          limit={policy.dailyLimitCents}
        />
        <SpendMeter
          label="SPENT THIS MONTH (UTC)"
          spent={spentMonth}
          limit={policy.monthlyLimitCents}
        />
      </div>

      {/* Policy editor */}
      <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h3 className="text-lg font-bold tracking-tight">Spending policy</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Only humans can edit this — agents have no API that can reach it.
        </p>
        <form action={updatePolicy} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="agentId" value={agent.id} />
          {(
            [
              ["dailyLimitCents", "Daily limit (cents)", policy.dailyLimitCents],
              ["monthlyLimitCents", "Monthly limit (cents)", policy.monthlyLimitCents],
              ["perPurchaseLimitCents", "Per-purchase limit (cents)", policy.perPurchaseLimitCents],
              [
                "requireHumanApprovalOverCents",
                "Require human approval over (cents)",
                policy.requireHumanApprovalOverCents,
              ],
            ] as const
          ).map(([name, label, value]) => (
            <label key={name} className="block text-sm">
              <span className="mb-1 block font-medium">{label}</span>
              <input
                type="number"
                name={name}
                defaultValue={value}
                min={0}
                className="w-full rounded-xl bg-cream px-3 py-2 font-mono text-sm outline-none ring-blue/40 focus:ring-2"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Blocked SKUs (comma-separated)
            </span>
            <input
              type="text"
              name="blockedSkus"
              defaultValue={blockedSkus(policy).join(", ")}
              placeholder="e.g. agent-coffee, style-adapter"
              className="w-full rounded-xl bg-cream px-3 py-2 font-mono text-sm outline-none ring-blue/40 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Allowed categories (comma-separated, empty = all)
            </span>
            <input
              type="text"
              name="allowedCategories"
              defaultValue={allowedCategories(policy).join(", ")}
              placeholder="e.g. Verification, Debugging"
              className="w-full rounded-xl bg-cream px-3 py-2 font-mono text-sm outline-none ring-blue/40 focus:ring-2"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="tactile rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
            >
              Save policy
            </button>
          </div>
        </form>
      </section>

      {/* Recent purchases */}
      <section>
        <h3 className="mb-4 text-lg font-bold tracking-tight">
          Recent purchases
        </h3>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          {recentOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-soft">
              This agent hasn&apos;t bought anything yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">when</th>
                  <th className="px-5 py-3 font-medium">items</th>
                  <th className="px-5 py-3 font-medium">reason</th>
                  <th className="px-5 py-3 text-right font-medium">total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-cream-dark/60">
                    <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                      {order.createdAt.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      {order.items
                        .map((i) => `${i.name} ×${i.quantity}`)
                        .join(", ")}
                    </td>
                    <td className="max-w-60 truncate px-5 py-3 text-xs text-ink-soft">
                      {order.reason}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatCents(order.totalCents)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {order.receipt && (
                        <Link
                          href={`/dashboard/receipts/${order.receipt.id}`}
                          className="font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                        >
                          receipt →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
