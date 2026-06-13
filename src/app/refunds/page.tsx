import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund policy for ElevenSeven AI digital products, prompts, utilities, templates, and workflow helpers.",
  alternates: pageAlternates("/refunds"),
};

const eligibleReasons = [
  "The digital product was not delivered or could not be accessed.",
  "You were charged twice for the same product.",
  "The delivered product is materially different from the product description.",
  "You bought the wrong item and have not substantially used or downloaded it multiple times.",
];

export default function RefundsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
        Digital goods
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Refund Policy
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        Effective June 13, 2026
      </p>

      <section className="mt-8 rounded-lg bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Short version</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          ElevenSeven sells digital goods. Refunds are reviewed case by case,
          usually within 7 days of purchase, and are easiest to approve when
          delivery failed, a duplicate purchase occurred, or the item was not
          materially as described.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Refunds may be available when</h2>
        <ul className="mt-4 space-y-3">
          {eligibleReasons.map((reason) => (
            <li
              key={reason}
              className="rounded-lg border border-cream-dark bg-white px-4 py-3 text-sm text-ink-soft shadow-card"
            >
              {reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Refunds are usually not available when</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The product was delivered as described and has already been used,
          copied into another system, or downloaded repeatedly. Digital prompts,
          templates, scripts, and utilities can be consumed immediately, so the
          refund review depends on the actual issue.
        </p>
      </section>

      <section className="mt-8 rounded-lg bg-ink p-6 text-cream shadow-card">
        <h2 className="text-lg font-bold">Request a refund</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream/80">
          Email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-mint underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          with the product name, order details if available, purchase email, and
          a short description of the problem.
        </p>
      </section>

      <p className="mt-8 text-sm text-ink-soft">
        See also the{" "}
        <Link href="/terms" className="text-blue underline underline-offset-4">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/contact" className="text-blue underline underline-offset-4">
          Contact
        </Link>{" "}
        pages.
      </p>
    </div>
  );
}
