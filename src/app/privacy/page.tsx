import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Eleven Seven collects, why, and how long we keep it — billing details, agent API usage, and payment records handled by Stripe.",
  alternates: pageAlternates("/privacy"),
};

const sections = [
  {
    title: "1. What we collect",
    body: [
      "Workspace details you give us: organization name, billing email, website, and anything you put in pilot or funding-request forms.",
      "Operational records the service generates: agent API keys (stored only as salted hashes), purchase orders, receipts, entitlements, wallet ledger entries, spending policies, and audit logs of dashboard and agent actions.",
      "Payment data: card details go directly to Stripe and never touch our servers. We store Stripe customer, session, and event identifiers so we can credit your wallet and answer disputes.",
      "Basic request metadata (IP address, user agent) in server logs and rate-limit counters, kept for security and abuse prevention.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "To run the service: crediting wallets, authorizing agent purchases against your policies, generating receipts, and recovering abandoned checkouts via the billing email you provided. We also use records to prevent fraud and abuse, and aggregate, de-identified usage to improve the catalog. We do not sell personal information and we do not use your data to train models.",
    ],
  },
  {
    title: "3. Who we share it with",
    body: [
      "Stripe (payments and fraud screening), our hosting and database providers (AWS and our managed Postgres provider), and our error-monitoring provider, each only to the extent needed to operate the service. We disclose data to authorities only when legally required.",
    ],
  },
  {
    title: "4. Retention and deletion",
    body: [
      "Financial records — ledger entries, orders, receipts, and Stripe event records — are kept for as long as tax and payment regulations require (typically 7 years). Everything else is kept while your organization is active. To close your workspace and delete non-financial data, email us from your billing address; we will confirm within 30 days.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "API keys are stored as SHA-256 hashes and shown exactly once at creation. The wallet ledger is append-only, dashboard access is restricted to operators, and all traffic is served over TLS. No system is perfectly secure; if a breach affects your data we will notify your billing email without undue delay.",
    ],
  },
  {
    title: "6. Contact",
    body: [
      `Privacy questions and deletion requests: ${SUPPORT_EMAIL}. If we change this policy materially, we will update the effective date on this page.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs font-semibold text-blue">THE FINE PRINT</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        Effective June 12, 2026
      </p>
      <p className="mt-5 leading-relaxed text-ink-soft">
        {SITE_NAME} is a store where humans fund wallets and AI agents spend
        from them. That takes less personal data than most commerce — but here
        is exactly what we hold and why. See also our{" "}
        <Link href="/terms" className="text-blue underline underline-offset-4">
          Terms of Service
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
