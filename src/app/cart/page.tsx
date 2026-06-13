"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { WireOrder } from "@/lib/types";
import { fromWireOrder } from "@/lib/orders";
import { setLastOrder } from "@/lib/order-store";
import { formatPrice, getProduct } from "@/lib/products";
import { useCart } from "@/components/cart-context";

export default function CartPage() {
  const router = useRouter();
  const { items, ready, subtotal, addItem, setQuantity, removeItem, clear } =
    useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledSku = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const searchParams = new URLSearchParams(window.location.search);
    const sku = searchParams.get("sku");
    if (!sku || handledSku.current === sku) return;
    const product = getProduct(sku);
    if (!product) return;
    handledSku.current = sku;
    addItem(product.id);
    router.replace("/cart");
  }, [addItem, ready, router]);

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
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Checkout failed");
      }
      const wire: WireOrder = await res.json();
      setLastOrder(fromWireOrder(wire));
      clear();
      router.push("/success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Try again.");
      setCheckingOut(false);
    }
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <p className="animate-pulse font-mono text-sm text-ink-soft">
          loading cart…
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
          Your cart is empty
        </h1>
        <p className="mt-3 text-ink-soft">
          Add a prompt, template, checklist, script, or utility from the
          product catalog.
        </p>
        <Link
          href="/products"
          className="tactile mt-8 inline-block rounded-lg bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
        >
          Browse the store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cart</h1>
      <p className="mt-2 text-ink-soft">
        Review selected digital goods. This checkout is currently simulated
        until a payment provider is connected to product checkout_url fields.
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
                className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-card sm:p-5"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="grid size-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-soft to-mint-soft font-mono text-sm font-bold transition-transform hover:scale-105"
                >
                  {product.icon}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-bold hover:text-blue"
                  >
                    {product.name}
                  </Link>
                  <p className="font-mono text-xs text-ink-soft">
                    {formatPrice(product.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-cream p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    aria-label={`Decrease ${product.name} quantity`}
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
                    aria-label={`Increase ${product.name} quantity`}
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
                  aria-label={`Remove ${product.name} from cart`}
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
            <h2 className="font-bold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>Subtotal</dt>
                <dd className="font-mono">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Card fees</dt>
                <dd className="font-mono text-emerald-600">$0.00 (simulated)</dd>
              </div>
              <div className="flex justify-between border-t border-cream-dark pt-3 text-base font-bold">
                <dt>Total</dt>
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
              className="tactile mt-5 w-full rounded-lg bg-ink px-6 py-3.5 font-semibold text-cream shadow-card hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOut ? "Creating demo order..." : "Run simulated checkout"}
            </button>
            <p className="mt-4 rounded-lg bg-coffee-soft p-3 font-mono text-[11px] leading-relaxed text-coffee">
              This checkout does not charge a card or complete a real purchase.
              Connect Stripe, LemonSqueezy, Gumroad, Polar, or another provider
              by replacing product checkout_url values.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-card">
            <h2 className="font-bold">Agent-readable checkout notes</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Agents should confirm user consent, product price, refund policy,
              and delivery type before initiating a purchase.{" "}
              <Link
                href="/products.json"
                prefetch={false}
                className="font-semibold text-blue underline-offset-4 hover:underline"
              >
                Read /products.json
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
