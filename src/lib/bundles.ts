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
    icon: "ST",
    blurb: "Enough balance for several $1 starter products.",
  },
  {
    id: "debug_pack",
    name: "Debug Pack",
    priceCents: 1000,
    creditsCents: 1000,
    icon: "DB",
    blurb: "Credits for repeated small utility and prompt purchases.",
  },
  {
    id: "workflow_bundle",
    name: "Workflow Bundle",
    priceCents: 2500,
    creditsCents: 2500,
    icon: "WF",
    blurb: "Credits for teams testing agent-assisted buying workflows.",
  },
  {
    id: "operator_wallet",
    name: "Operator Wallet",
    priceCents: 10000,
    creditsCents: 10000,
    icon: "OP",
    blurb: "Funds recurring product, prompt, and template purchases for one team.",
  },
  {
    id: "scale_wallet",
    name: "Scale Wallet",
    priceCents: 50000,
    creditsCents: 50000,
    icon: "SC",
    blurb: "Enough room for high-volume small digital product purchases.",
  },
  {
    id: "thousand_day_wallet",
    name: "Agent Buyer Wallet",
    priceCents: 100000,
    creditsCents: 100000,
    icon: "AW",
    blurb: "Prepaid credits for repeated low-cost agent purchases.",
  },
  {
    id: "fleet_week_wallet",
    name: "Team Buyer Wallet",
    priceCents: 250000,
    creditsCents: 250000,
    icon: "TW",
    blurb: "Prepay multiple agents buying small digital goods with approval.",
  },
  {
    id: "market_maker_wallet",
    name: "Operator Buyer Wallet",
    priceCents: 500000,
    creditsCents: 500000,
    icon: "OW",
    blurb: "A larger operator balance for high-volume agent-assisted commerce.",
  },
];

export function getBundle(id: string): CreditBundle | undefined {
  return bundles.find((b) => b.id === id);
}
