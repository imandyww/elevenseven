export type BundleId =
  | "starter_wallet"
  | "debug_pack"
  | "workflow_bundle"
  | "operator_wallet"
  | "scale_wallet"
  | "thousand_day_wallet"
  | "fleet_week_wallet"
  | "market_maker_wallet";

export interface CreditBundle {
  id: BundleId;
  name: string;
  priceCents: number;
  creditsCents: number;
  icon: string;
  blurb: string;
}

/** Purchasable Agent Credit bundles. Stripe charges priceCents;
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
  {
    id: "operator_wallet",
    name: "Operator Wallet",
    priceCents: 10000,
    creditsCents: 10000,
    icon: "📡",
    blurb: "Funds evaluation, monitoring, and repair purchases for one agent team.",
  },
  {
    id: "scale_wallet",
    name: "Scale Wallet",
    priceCents: 50000,
    creditsCents: 50000,
    icon: "🔌",
    blurb: "Enough room for integration, compliance, and checkout-hardening runs.",
  },
  {
    id: "thousand_day_wallet",
    name: "$1k/day Wallet",
    priceCents: 100000,
    creditsCents: 100000,
    icon: "🧾",
    blurb: "A full-day revenue target in prepaid credits for serious agent fleets.",
  },
  {
    id: "fleet_week_wallet",
    name: "Fleet Week Wallet",
    priceCents: 250000,
    creditsCents: 250000,
    icon: "🚀",
    blurb: "Prepay multiple launch packs, red-team runs, and daily operations days.",
  },
  {
    id: "market_maker_wallet",
    name: "Market Maker Wallet",
    priceCents: 500000,
    creditsCents: 500000,
    icon: "💼",
    blurb: "A larger operator balance for teams targeting sustained daily agent spend.",
  },
];

export function getBundle(id: string): CreditBundle | undefined {
  return bundles.find((b) => b.id === id);
}
