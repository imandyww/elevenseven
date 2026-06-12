import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for buying prepaid Agent Credits and using the Eleven Seven agent purchasing API.",
  alternates: pageAlternates("/terms"),
};

const sections = [
  {
    title: "1. What this service is",
    body: [
      `${SITE_NAME} sells prepaid "Agent Credits." A human funds an organization wallet through Stripe Checkout; AI agents authorized by that organization then spend from the wallet through our API, inside spending policies the organization controls. Credits are a prepayment for catalog products — they are not money, not a deposit account, not redeemable for cash, and not transferable between organizations.`,
    ],
  },
  {
    title: "2. Accounts, agents, and API keys",
    body: [
      "Creating a workspace gives your organization a wallet and one or more agent API keys. You are responsible for everything done with your keys, including purchases made by autonomous agents you run. Keep keys secret; if a key leaks, revoke it in writing to support or rotate it immediately. We may pause or revoke agents that appear compromised or abusive.",
      "You must provide a working billing email. We use it for receipts, recovery links, and notices about your wallet.",
    ],
  },
  {
    title: "3. Payments and credits",
    body: [
      "Wallet funding is processed by Stripe. Credits appear in your wallet only after Stripe confirms payment. Every wallet movement is recorded in an append-only ledger, and every agent purchase produces a receipt and entitlement manifest you can audit.",
      "Credited amounts match charged amounts 1:1. Prices for catalog products are shown before purchase and frozen into the receipt at purchase time.",
    ],
  },
  {
    title: "4. Refunds",
    body: [
      "Unspent credits are refundable to the original payment method within 30 days of purchase — email support from your billing address. Credits already spent by your agents are not refundable, because the corresponding products were delivered at purchase time. If we refund a payment (including after a card dispute), the matching credits are removed from your wallet and your agents may be paused until the balance is reconciled.",
    ],
  },
  {
    title: "5. Acceptable use",
    body: [
      "You may not use the service for unlawful activity, to test stolen payment cards, to launder funds, to probe or disrupt the platform, or to resell credits. Agents must operate within the spending policies their organization sets. We may suspend organizations that violate these rules and will refund any unspent, lawfully purchased credits when we do.",
    ],
  },
  {
    title: "6. Service changes and availability",
    body: [
      "We may change the catalog, prices, and API over time; documented API versions will get reasonable notice before breaking changes. The service is provided \"as is\" without warranties. To the maximum extent permitted by law, our total liability for any claim is limited to the amount you paid us in the 12 months before the claim arose.",
    ],
  },
  {
    title: "7. Contact",
    body: [
      `Questions, refund requests, and key-compromise reports: ${SUPPORT_EMAIL}. We may update these terms; material changes will be announced on this page with a new effective date, and continued use after that date is acceptance.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs font-semibold text-blue">THE FINE PRINT</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        Effective June 12, 2026
      </p>
      <p className="mt-5 leading-relaxed text-ink-soft">
        These terms govern your purchase of prepaid Agent Credits and your use
        of the {SITE_NAME} storefront and agent API. By funding a wallet or
        using an agent API key, you agree to them on behalf of your
        organization. See also our{" "}
        <Link href="/privacy" className="text-blue underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-ink">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-2 text-sm leading-relaxed text-ink-soft"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
