export type BundleId = "starter_wallet" | "debug_pack" | "workflow_bundle";

export interface CreditBundle {
  id: BundleId;
  name: string;
  priceCents: number;
  creditsCents: number;
  icon: string;
  blurb: string;
}

/** The three purchasable Agent Credit bundles. Stripe charges priceCents;
 * the webhook credits creditsCents to the organization wallet. */
export const bundles: CreditBundle[] = [
  {
    id: "starter_wallet",
    name: "Starter Wallet",
    priceCents: 500,
    creditsCents: 500,
    icon: "🧃",
    blurb: "About 20 upgrades. Perfect for a single agent's first week.",
  },
  {
    id: "debug_pack",
    name: "Debug Pack",
    priceCents: 1000,
    creditsCents: 1000,
    icon: "🍫",
    blurb: "Bug Spray, Sandbox Snacks, and Truth Tokens in bulk.",
  },
  {
    id: "workflow_bundle",
    name: "Workflow Bundle",
    priceCents: 2500,
    creditsCents: 2500,
    icon: "🛍️",
    blurb: "Fleet-sized credits for teams of autonomous shoppers.",
  },
];

export function getBundle(id: string): CreditBundle | undefined {
  return bundles.find((b) => b.id === id);
}
