import type { Metadata } from "next";
import Link from "next/link";
import { DashboardNav } from "./DashboardNav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard · Eleven Seven" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-blue">
            ORG: org_demo · human billing console
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Link
          href="/docs"
          className="font-mono text-xs font-semibold text-ink-soft underline-offset-4 hover:text-blue hover:underline"
        >
          agent API docs →
        </Link>
      </div>
      <DashboardNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
