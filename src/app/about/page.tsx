import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates } from "@/lib/site";

const DISPLAY_TEXT = "eelven seven";

export const metadata: Metadata = {
  title: DISPLAY_TEXT,
  description: DISPLAY_TEXT,
  alternates: pageAlternates("/about"),
};

const principles = [
  {
    icon: "🥤",
    title: DISPLAY_TEXT,
    body: DISPLAY_TEXT,
  },
  {
    icon: "🍫",
    title: DISPLAY_TEXT,
    body: DISPLAY_TEXT,
  },
  {
    icon: "🧾",
    title: DISPLAY_TEXT,
    body: DISPLAY_TEXT,
  },
  {
    icon: "🏪",
    title: DISPLAY_TEXT,
    body: DISPLAY_TEXT,
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="hero-gradient">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-5xl" aria-hidden>
            🏪🛍️
          </p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            {DISPLAY_TEXT}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            {DISPLAY_TEXT}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 leading-relaxed text-ink-soft sm:px-6">
        <p>{DISPLAY_TEXT}</p>
        <p>{DISPLAY_TEXT}</p>
        <p>{DISPLAY_TEXT}</p>
      </section>

      <section className="border-y border-cream-dark bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {DISPLAY_TEXT}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="rounded-2xl bg-cream p-6 shadow-card">
                <span className="text-3xl" aria-hidden>
                  {p.icon}
                </span>
                <h3 className="mt-3 font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {DISPLAY_TEXT}
        </h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          {DISPLAY_TEXT}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
          className="tactile rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
        >
            {DISPLAY_TEXT}
        </Link>
          <Link
            href="/docs"
          className="tactile rounded-2xl bg-white px-6 py-3 font-mono font-semibold shadow-card hover:bg-cream-dark"
        >
            {DISPLAY_TEXT}
        </Link>
        </div>
      </section>
    </div>
  );
}
