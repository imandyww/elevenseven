"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-context";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Agent API" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function Header() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <header className="glass sticky top-0 z-50 shadow-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-ink text-lg shadow-card transition-transform group-hover:-rotate-6">
            🤖
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight sm:text-base">
              Agent Dollar Store
            </span>
            <span className="hidden font-mono text-[10px] text-ink-soft sm:block">
              ~/upgrades --under-a-dollar
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-cream-dark hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            aria-label={`Cart, ${count} items`}
            className={`tactile relative ml-1 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-card ${
              pathname.startsWith("/cart")
                ? "bg-blue text-white"
                : "bg-white text-ink hover:bg-blue hover:text-white"
            }`}
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {ready && count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-mint px-1 font-mono text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
