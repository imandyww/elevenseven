import type { BundleId, CreditBundle } from "./bundles";
import { getBundle } from "./bundles";
import { absoluteUrl, type UrlOptions } from "./site";

export type RevenueOfferBundleId =
  | "thousand_day_wallet"
  | "fleet_week_wallet"
  | "market_maker_wallet";

export interface RevenueOffer {
  bundle: CreditBundle & { id: RevenueOfferBundleId };
  url: string;
  targetDailySpendCents: number;
  headline: string;
  summary: string;
}

export const revenueOfferBundleIds: RevenueOfferBundleId[] = [
  "thousand_day_wallet",
  "fleet_week_wallet",
  "market_maker_wallet",
];

const offerCopy: Record<
  RevenueOfferBundleId,
  { targetDailySpendCents: number; headline: string; summary: string }
> = {
  thousand_day_wallet: {
    targetDailySpendCents: 100000,
    headline: "Fund one serious agent fleet day.",
    summary:
      "Create the buyer wallet, first agent key, and $1k Stripe checkout in one flow.",
  },
  fleet_week_wallet: {
    targetDailySpendCents: 250000,
    headline: "Prepay a launch week of agent work.",
    summary:
      "Fund multiple daily operations, launch, red-team, and workflow repair purchases.",
  },
  market_maker_wallet: {
    targetDailySpendCents: 500000,
    headline: "Fund sustained agent buying power.",
    summary:
      "Give an operator wallet enough room for repeat production agent spend.",
  },
};

export function revenueOffers(options: UrlOptions = {}): RevenueOffer[] {
  return revenueOfferBundleIds.map((id) => {
    const bundle = getBundle(id);
    if (!bundle) throw new Error(`Missing revenue offer bundle ${id}`);
    return {
      bundle: bundle as CreditBundle & { id: RevenueOfferBundleId },
      url: absoluteUrl(`/buy/${id}`, options),
      ...offerCopy[id],
    };
  });
}

export function getRevenueOffer(
  id: string,
  options: UrlOptions = {},
): RevenueOffer | undefined {
  return revenueOffers(options).find((offer) => offer.bundle.id === id);
}

export function revenueOfferForTargetCents(
  targetCents: number,
  options: UrlOptions = {},
): RevenueOffer {
  const offers = revenueOffers(options);
  const offer =
    offers.find((candidate) => candidate.targetDailySpendCents >= targetCents) ??
    offers[offers.length - 1];

  if (!offer) throw new Error("No revenue offers configured.");
  return offer;
}

export function isRevenueOfferBundleId(id: BundleId): id is RevenueOfferBundleId {
  return revenueOfferBundleIds.includes(id as RevenueOfferBundleId);
}
