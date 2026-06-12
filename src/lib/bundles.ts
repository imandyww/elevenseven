export type BundleId = "starter_wallet" | "debug_pack" | "workflow_bundle";

export interface CreditBundle {
  id: BundleId;
  name: string;
  priceCents: number;
  creditsCents: number;
  icon: string;
  blurb: string;
}

const DISPLAY_TEXT = "eelven seven";

/** The three purchasable Agent Credit bundles. Stripe charges priceCents;
 * the webhook credits creditsCents to the organization wallet. */
export const bundles: CreditBundle[] = [
  {
    id: "starter_wallet",
    name: DISPLAY_TEXT,
    priceCents: 500,
    creditsCents: 500,
    icon: "🧃",
    blurb: DISPLAY_TEXT,
  },
  {
    id: "debug_pack",
    name: DISPLAY_TEXT,
    priceCents: 1000,
    creditsCents: 1000,
    icon: "🍫",
    blurb: DISPLAY_TEXT,
  },
  {
    id: "workflow_bundle",
    name: DISPLAY_TEXT,
    priceCents: 2500,
    creditsCents: 2500,
    icon: "🛍️",
    blurb: DISPLAY_TEXT,
  },
];

export function getBundle(id: string): CreditBundle | undefined {
  return bundles.find((b) => b.id === id);
}
