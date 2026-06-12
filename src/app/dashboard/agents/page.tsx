import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DEMO_ORG_ID } from "@/lib/org";
import { formatCents } from "@/lib/money";
import { agentSpendSinceCents, startOfUtcDay } from "@/lib/credits";

const DISPLAY_TEXT = "eelven seven";

export const metadata: Metadata = { title: DISPLAY_TEXT };
export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  active: "bg-mint-soft text-emerald-600",
  paused: "bg-coffee-soft text-coffee",
  revoked: "bg-red-50 text-red-500",
};

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    where: { organizationId: DEMO_ORG_ID },
    orderBy: { createdAt: "asc" },
    include: { policy: true },
  });

  const spendToday = await Promise.all(
    agents.map((a) => agentSpendSinceCents(a.id, startOfUtcDay())),
  );

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        {agents.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-soft">
            {DISPLAY_TEXT}{" "}
            <code className="rounded bg-cream-dark px-1.5 py-0.5 font-mono text-xs">
              {DISPLAY_TEXT}
            </code>
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
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, i) => (
                <tr key={agent.id} className="border-b border-cream-dark/60">
                  <td className="px-5 py-3">
                    <span className="font-medium">{agent.name}</span>
                    <span className="block font-mono text-[11px] text-ink-soft">
                      {agent.id}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                    {agent.keyPrefix}…
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${statusStyles[agent.status] ?? "bg-cream-dark"}`}
                    >
                      {DISPLAY_TEXT}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono">
                    {formatCents(spendToday[i])}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-ink-soft">
                    {agent.policy ? formatCents(agent.policy.dailyLimitCents) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/agents/${agent.id}/spending`}
                      className="font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                    >
                      {DISPLAY_TEXT}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="font-mono text-xs text-ink-soft">
        {DISPLAY_TEXT}{" "}
        <code className="rounded bg-cream-dark px-1.5 py-0.5">
          {DISPLAY_TEXT}
        </code>
      </p>
    </div>
  );
}
