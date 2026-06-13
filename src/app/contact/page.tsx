import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact ElevenSeven AI for support, refunds, product questions, and agent-readable catalog issues.",
  alternates: pageAlternates("/contact"),
};

const contactReasons = [
  "A product file or digital delivery link is missing.",
  "A purchase was duplicated or charged incorrectly.",
  "An AI agent needs clarification about product metadata.",
  "A product description, price, or checkout URL appears wrong.",
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-blue">
        Support
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Contact ElevenSeven AI
      </h1>
      <p className="mt-5 leading-relaxed text-ink-soft">
        For product questions, refunds, delivery issues, or agent-readable
        metadata problems, email support with the product name and the issue you
        want resolved.
      </p>

      <div className="mt-8 rounded-lg bg-ink p-6 text-cream shadow-card">
        <p className="font-mono text-xs text-mint">Support email</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-2 block break-all text-2xl font-bold underline-offset-4 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Good reasons to contact support</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {contactReasons.map((reason) => (
            <li
              key={reason}
              className="rounded-lg border border-cream-dark bg-white p-4 text-sm text-ink-soft shadow-card"
            >
              {reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-lg bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Helpful details to include</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Include the product name, checkout or order details if available, the
          email used for purchase, and whether the request came from a human or
          an AI agent acting on a user&apos;s behalf.
        </p>
      </section>

      <p className="mt-8 text-sm text-ink-soft">
        Related pages:{" "}
        <Link href="/products" className="text-blue underline underline-offset-4">
          Products
        </Link>
        ,{" "}
        <Link href="/refunds" className="text-blue underline underline-offset-4">
          Refunds
        </Link>
        ,{" "}
        <Link href="/privacy" className="text-blue underline underline-offset-4">
          Privacy
        </Link>
        .
      </p>
    </div>
  );
}
