import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StartForm } from "@/app/start/StartForm";
import { formatCents } from "@/lib/money";
import {
  getRevenueOffer,
  revenueOffers,
} from "@/lib/revenue-offers";
import { pageAlternates, pageOpenGraph } from "@/lib/site";
import {
  startPrefillFromSearchParams,
  type StartPrefillSearchParams,
} from "@/lib/start-prefill";

export function generateStaticParams() {
  return revenueOffers().map((offer) => ({ bundle: offer.bundle.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bundle: string }>;
}): Promise<Metadata> {
  const { bundle } = await params;
  const offer = getRevenueOffer(bundle);
  if (!offer) return {};

  const path = `/buy/${offer.bundle.id}`;
  const title = `Buy ${offer.bundle.name}`;
  const description = `${offer.summary} ${formatCents(
    offer.bundle.priceCents,
  )} funds ${formatCents(offer.bundle.creditsCents)} in Agent Credits.`;

  return {
    title,
    description,
    alternates: pageAlternates(path),
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function BuyBundlePage({
  params,
  searchParams,
}: {
  params: Promise<{ bundle: string }>;
  searchParams: Promise<StartPrefillSearchParams>;
}) {
  const { bundle } = await params;
  const prefill = startPrefillFromSearchParams(await searchParams);
  const offer = getRevenueOffer(bundle);
  if (!offer) notFound();

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:py-16">
      <section className="lg:col-span-2">
        <p className="font-mono text-xs font-semibold text-blue">
          DIRECT WALLET OFFER
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {offer.headline}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          {offer.summary} The checkout funds prepaid Agent Credits; agents
          spend only from the wallet after server-side Stripe reconciliation.
        </p>
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold text-ink-soft">
                WALLET
              </p>
              <h2 className="mt-1 text-xl font-bold">{offer.bundle.name}</h2>
            </div>
            <span className="font-mono text-lg font-bold text-coffee">
              {formatCents(offer.bundle.priceCents)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {offer.bundle.blurb}
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="border-t border-cream-dark pt-3">
              <dt className="font-mono text-xs text-ink-soft">Credits</dt>
              <dd className="mt-1 font-semibold">
                {formatCents(offer.bundle.creditsCents)}
              </dd>
            </div>
            <div className="border-t border-cream-dark pt-3">
              <dt className="font-mono text-xs text-ink-soft">
                Target daily spend
              </dt>
              <dd className="mt-1 font-semibold">
                {formatCents(offer.targetDailySpendCents)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/api/agent-catalog"
            prefetch={false}
            className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
          >
            catalog JSON
          </Link>
          <Link
            href="/api/revenue/close-plan"
            prefetch={false}
            className="rounded-xl bg-white px-4 py-2 font-mono text-xs font-semibold text-ink shadow-card hover:bg-cream-dark"
          >
            close plan JSON
          </Link>
        </div>
      </section>

      <section className="lg:col-span-3">
        <StartForm
          initialBundle={offer.bundle.id}
          initialTargetDailySpendCents={String(offer.targetDailySpendCents)}
          initialOrganizationName={prefill.organizationName}
          initialEmail={prefill.email}
          initialWebsite={prefill.website}
          initialAgentName={prefill.agentName}
          initialWorkflow={prefill.workflow}
          lockInitialBundle
        />
      </section>
    </main>
  );
}
