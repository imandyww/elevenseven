import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What ElevenSeven AI collects for digital product browsing, support, checkout, and agent-readable catalog access.",
  alternates: pageAlternates("/privacy"),
};

const sections = [
  {
    title: "1. What we collect",
    body: [
      "Catalog browsing can be logged through normal server logs, including IP address, user agent, requested URL, and timestamp.",
      "If you contact support, request a refund, join a buyer flow, or submit a form, we collect the details you provide, such as name, email, organization, website, product name, and support notes.",
      "If a payment provider is connected, payment details are handled by that provider. We may store order identifiers, product names, checkout status, receipt data, and provider event IDs so we can deliver products and resolve support issues.",
      "Agent-readable routes such as /products.json and /llms.txt may be accessed by humans, crawlers, and AI agents. Requests to those routes may appear in logs.",
    ],
  },
  {
    title: "2. How we use information",
    body: [
      "We use information to operate the storefront, deliver digital products, maintain receipts, respond to support and refund requests, prevent abuse, improve product descriptions, and keep agent-readable metadata accurate.",
    ],
  },
  {
    title: "3. Sharing",
    body: [
      "We share information with service providers only as needed to run the store, such as hosting, database, email, analytics, error monitoring, and payment providers. We do not sell personal information.",
    ],
  },
  {
    title: "4. Retention",
    body: [
      "Support messages are kept while needed to resolve the issue and maintain business records. Order and payment records may be kept as long as required for accounting, fraud prevention, tax, or dispute purposes.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "We use ordinary technical safeguards such as TLS, provider-hosted payments, access controls, and limited data collection. No internet service can be guaranteed perfectly secure.",
    ],
  },
  {
    title: "6. Contact",
    body: [
      `Privacy questions or deletion requests can be sent to ${SUPPORT_EMAIL}. Some records, such as completed payment or accounting records, may need to be retained where required.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
        Privacy
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        Effective June 13, 2026
      </p>
      <p className="mt-5 leading-relaxed text-ink-soft">
        {SITE_NAME} is a digital storefront with human-readable pages and
        agent-readable metadata. This page explains what data is collected to
        operate it. See also the{" "}
        <Link href="/terms" className="text-blue underline underline-offset-4">
          Terms
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
