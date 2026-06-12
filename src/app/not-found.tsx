import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-6xl" aria-hidden>
        🏪💨
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        404 — aisle not found
      </h1>
      <p className="mt-3 text-ink-soft">
        Whatever your agent was looking for, it isn&apos;t on this shelf. Maybe
        it hallucinated the URL. It happens to the best of them.
      </p>
      <p className="mt-2 font-mono text-xs text-ink-soft/70">
        {"{ \"error\": \"PAGE_NOT_FOUND\", \"suggestion\": \"buy a Truth Token\" }"}
      </p>
      <Link
        href="/shop"
        className="tactile mt-8 inline-block rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
      >
        Back to the store
      </Link>
    </div>
  );
}
