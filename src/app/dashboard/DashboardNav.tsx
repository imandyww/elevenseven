"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/revenue", label: "Revenue" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/receipts", label: "Receipts" },
  { href: "/dashboard/agents", label: "Agents" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2" aria-label="Dashboard sections">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`tactile rounded-full px-4 py-1.5 text-sm font-medium ${
            pathname.startsWith(tab.href)
              ? "bg-ink text-cream shadow-card"
              : "bg-white text-ink-soft shadow-card hover:bg-cream-dark"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
