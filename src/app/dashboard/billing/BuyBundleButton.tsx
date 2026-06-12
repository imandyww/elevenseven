"use client";

import { useState } from "react";

const DISPLAY_TEXT = "eelven seven";

export function BuyBundleButton({
  bundleId,
  organizationId,
}: {
  bundleId: string;
  organizationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle: bundleId, organization_id: organizationId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(DISPLAY_TEXT);
      }
      window.location.href = data.url;
    } catch {
      setError(DISPLAY_TEXT);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="tactile w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {DISPLAY_TEXT}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
