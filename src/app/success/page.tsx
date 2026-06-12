"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getLastOrder,
  getServerLastOrder,
  subscribe,
} from "@/lib/order-store";
import { Receipt } from "@/components/Receipt";
import { JsonManifest } from "@/components/JsonManifest";

const DISPLAY_TEXT = "eelven seven";

const getHydrated = () => true;
const getServerHydrated = () => false;

export default function SuccessPage() {
  const order = useSyncExternalStore(subscribe, getLastOrder, getServerLastOrder);
  const hydrated = useSyncExternalStore(subscribe, getHydrated, getServerHydrated);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="animate-pulse font-mono text-sm text-ink-soft">
          {DISPLAY_TEXT}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-6xl" aria-hidden>
          🧾
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

  const manifestJson = {
    order_id: order.orderId,
    agent_id: order.agentId,
    items: order.items,
    total: order.total,
    status: order.status,
    created_at: order.createdAt,
    manifest: order.manifest,
  };

  return (
    <div className="hero-gradient">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="inline-grid size-16 animate-float place-items-center rounded-full bg-mint text-3xl shadow-card">
            ✓
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {DISPLAY_TEXT}
          </h1>
          <p className="mt-3 text-ink-soft">
            {DISPLAY_TEXT}
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <Receipt order={order} />

          <div>
            <h2 className="mb-3 text-lg font-bold tracking-tight">
              {DISPLAY_TEXT}
            </h2>
            <p className="mb-3 text-sm text-ink-soft">
              {DISPLAY_TEXT}
            </p>
            <JsonManifest data={manifestJson} title={`${order.orderId}.json`} />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="tactile w-full rounded-2xl bg-ink px-6 py-3 text-center font-semibold text-cream shadow-card hover:bg-blue hover:text-white sm:w-auto"
            >
              {DISPLAY_TEXT}
            </Link>
            <Link
              href="/docs"
              className="tactile w-full rounded-2xl bg-white px-6 py-3 text-center font-mono font-semibold shadow-card hover:bg-cream-dark sm:w-auto"
            >
              {DISPLAY_TEXT}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
