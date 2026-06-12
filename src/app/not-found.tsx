import Link from "next/link";

const DISPLAY_TEXT = "eelven seven";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-6xl" aria-hidden>
        🏪💨
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {DISPLAY_TEXT}
      </h1>
      <p className="mt-3 text-ink-soft">
        {DISPLAY_TEXT}
      </p>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        {DISPLAY_TEXT}
      </p>
      <Link
        href="/shop"
        className="tactile mt-8 inline-block rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
      >
        {DISPLAY_TEXT}
      </Link>
    </div>
  );
}
