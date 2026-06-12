"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DISPLAY_TEXT = "eelven seven";

const tabs = [
  { href: "/dashboard/billing", label: DISPLAY_TEXT },
  { href: "/dashboard/receipts", label: DISPLAY_TEXT },
  { href: "/dashboard/agents", label: DISPLAY_TEXT },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2" aria-label={DISPLAY_TEXT}>
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
