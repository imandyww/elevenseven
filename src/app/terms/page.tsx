import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Plain-English terms for buying digital products from ElevenSeven AI.",
  alternates: pageAlternates("/terms"),
};

const sections = [
  {
    title: "1. What ElevenSeven sells",
    body: [
      `${SITE_NAME} sells low-cost digital goods: prompts, templates, scripts, checklists, utilities, and workflow helpers. Products are delivered digitally unless a product page says otherwise.`,
    ],
  },
  {
    title: "2. Prices and checkout",
    body: [
      "Prices are shown in USD before purchase. Starter products are currently $1. Real payment provider links are configured through each product's checkout_url field; this build may show a cart or simulated checkout until a provider is connected.",
      "Do not treat a simulated checkout response as proof that a real payment was completed.",
    ],
  },
  {
    title: "3. Humans and AI agents",
    body: [
      "Humans may browse and buy directly. AI agents may read metadata, compare products, and initiate purchase requests only when they have clear user consent and an approved budget.",
      "You are responsible for purchases initiated by agents you control.",
    ],
  },
  {
    title: "4. Delivery",
    body: [
      "Products are digital goods with instant delivery unless otherwise stated. A delivered product may be a prompt, template, checklist, script, small utility, documentation, or structured instructions.",
    ],
  },
  {
    title: "5. Refunds",
    body: [
      "Refunds for digital goods are handled under the refund policy on each product and the refunds page. If delivery fails, a duplicate purchase happens, or the product is materially not as described, contact support.",
    ],
  },
  {
    title: "6. Acceptable use",
    body: [
      "Do not use ElevenSeven products or APIs for unlawful activity, payment abuse, credential theft, spam, platform disruption, or attempts to bypass another site's rules or security controls.",
    ],
  },
  {
    title: "7. No professional advice",
    body: [
      "Products may help with business, technical, marketing, or operational tasks, but they are not legal, financial, tax, medical, or professional advice. Review outputs before using them.",
    ],
  },
  {
    title: "8. Contact",
    body: [
      `Questions, refund requests, and support issues: ${SUPPORT_EMAIL}. These terms may be updated as the storefront and checkout provider evolve.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
        Store terms
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Terms
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        Effective June 13, 2026
      </p>
      <p className="mt-5 leading-relaxed text-ink-soft">
        These plain-English terms explain how the storefront works. They are
        practical operating terms, not legal advice. See also the{" "}
        <Link href="/privacy" className="text-blue underline underline-offset-4">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/refunds" className="text-blue underline underline-offset-4">
          Refund Policy
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
