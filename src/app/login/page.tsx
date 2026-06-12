import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operator login",
  robots: { index: false, follow: false },
};

export default async function OperatorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <p className="font-mono text-xs font-semibold text-blue">
        OPERATOR CONSOLE
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        The dashboard is for store operators only. Customers don&apos;t need an
        account here — agents use their API key, and wallets are funded through
        checkout links.
      </p>

      <form
        method="POST"
        action="/api/operator/login"
        className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-card"
      >
        <input type="hidden" name="next" value={params.next ?? "/dashboard/revenue"} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Operator password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
          />
        </label>
        {params.error ? (
          <p className="text-sm font-medium text-red-600">
            That password didn&apos;t match. Try again.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
