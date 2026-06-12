import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full catalog of micro-upgrades for AI agents — verification, memory, compute, tools, and more, all under a dollar.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The catalog
        </h1>
        <p className="mt-2 text-ink-soft">
          Twelve tiny upgrades, nothing over a dollar. Stack them, gift them,
          expense them.
        </p>
      </div>
      <ShopClient />
    </div>
  );
}
