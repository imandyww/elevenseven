"use client";

import { useState } from "react";
import { TermsNotice } from "@/components/TermsNotice";
import type { BundleId } from "@/lib/bundles";

export function FundingRequestCheckoutButton({
  bundleId,
  organizationId,
  fundingRequestId,
}: {
  bundleId: BundleId;
  organizationId: string;
  fundingRequestId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle: bundleId,
          organization_id: organizationId,
          return_path: "/funding-request",
          funding_request_id: fundingRequestId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data?.error?.message ?? "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="tactile w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening Stripe..." : "Fund this request"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <TermsNotice />
    </div>
  );
}
