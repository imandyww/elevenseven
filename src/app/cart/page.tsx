"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WireOrder } from "@/lib/types";
import { fromWireOrder } from "@/lib/orders";
import { setLastOrder } from "@/lib/order-store";
import { formatPrice, getProduct } from "@/lib/products";
import { useCart } from "@/components/cart-context";

const DISPLAY_TEXT = "eelven seven";

const creditBundles = [
  {
    name: DISPLAY_TEXT,
    price: 5,
    icon: "🧃",
    blurb: DISPLAY_TEXT,
  },
  {
    name: DISPLAY_TEXT,
    price: 10,
    icon: "🍫",
    blurb: DISPLAY_TEXT,
  },
  {
    name: DISPLAY_TEXT,
    price: 25,
    icon: "🛍️",
    blurb: DISPLAY_TEXT,
  },
];

export default function CartPage() {
  const router = useRouter();
  const { items, ready, subtotal, setQuantity, removeItem, clear } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: "agent_web_visitor", items }),
      });
      if (!res.ok) {
        await res.json().catch(() => null);
        throw new Error(DISPLAY_TEXT);
      }
      const wire: WireOrder = await res.json();
      setLastOrder(fromWireOrder(wire));
      clear();
      router.push("/success");
    } catch {
      setError(DISPLAY_TEXT);
      setCheckingOut(false);
    }
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <p className="animate-pulse font-mono text-sm text-ink-soft">
          {DISPLAY_TEXT}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-6xl" aria-hidden>
          🛒
        </p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {DISPLAY_TEXT}
        </h1>
        <p className="mt-3 text-ink-soft">
          {DISPLAY_TEXT}
        </p>
        <Link
          href="/shop"
          className="tactile mt-8 inline-block rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
        >
          {DISPLAY_TEXT}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {DISPLAY_TEXT}
      </h1>
      <p className="mt-2 text-ink-soft">
        {DISPLAY_TEXT}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <div
                key={item.productId}
                className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-card sm:p-5"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-soft to-mint-soft text-3xl transition-transform hover:scale-110"
                >
                  {product.icon}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-bold hover:text-blue"
                  >
                    {product.name}
                  </Link>
                  <p className="font-mono text-xs text-ink-soft">
                    {formatPrice(product.price)} {DISPLAY_TEXT}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-cream p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    aria-label={DISPLAY_TEXT}
                    className="tactile grid size-8 place-items-center rounded-lg bg-white font-bold shadow-card hover:bg-blue hover:text-white"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-mono text-sm font-bold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    aria-label={DISPLAY_TEXT}
                    className="tactile grid size-8 place-items-center rounded-lg bg-white font-bold shadow-card hover:bg-blue hover:text-white"
                  >
                    +
                  </button>
                </div>
                <span className="w-16 text-right font-mono text-sm font-bold text-coffee">
                  {formatPrice(product.price * item.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={DISPLAY_TEXT}
                  className="tactile rounded-lg px-2 py-1 text-sm text-ink-soft hover:bg-red-50 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6 shadow-card">
            <h2 className="font-bold">{DISPLAY_TEXT}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>{DISPLAY_TEXT}</dt>
                <dd className="font-mono">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>{DISPLAY_TEXT}</dt>
                <dd className="font-mono text-emerald-600">$0.00 {DISPLAY_TEXT}</dd>
              </div>
              <div className="flex justify-between border-t border-cream-dark pt-3 text-base font-bold">
                <dt>{DISPLAY_TEXT}</dt>
                <dd className="font-mono text-coffee">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            {error && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="tactile mt-5 w-full rounded-2xl bg-blue px-6 py-3.5 font-semibold text-white shadow-card hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {DISPLAY_TEXT}
            </button>
            <p className="mt-4 rounded-xl bg-coffee-soft p-3 font-mono text-[11px] leading-relaxed text-coffee">
              💡 {DISPLAY_TEXT}
            </p>
          </div>

          {/* Agent Credits */}
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-bold">{DISPLAY_TEXT}</h2>
            <p className="mt-1 text-xs text-ink-soft">
              {DISPLAY_TEXT}{" "}
              <Link
                href="/dashboard/billing"
                className="font-semibold text-blue underline-offset-4 hover:underline"
              >
                {DISPLAY_TEXT}
              </Link>
            </p>
            <ul className="mt-4 space-y-3">
              {creditBundles.map((bundle) => (
                <li
                  key={bundle.name}
                  className="flex items-start gap-3 rounded-xl bg-cream p-3"
                >
                  <span className="text-xl" aria-hidden>
                    {bundle.icon}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold">{bundle.name}</span>
                      <span className="font-mono text-sm font-bold text-coffee">
                        ${bundle.price}
                      </span>
                    </span>
                    <span className="block text-xs text-ink-soft">
                      {bundle.blurb}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
