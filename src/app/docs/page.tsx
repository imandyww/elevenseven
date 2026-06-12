import type { Metadata } from "next";
import Link from "next/link";
import { pageAlternates } from "@/lib/site";
import { JsonManifest } from "@/components/JsonManifest";

const DISPLAY_TEXT = "eelven seven";

export const metadata: Metadata = {
  title: DISPLAY_TEXT,
  description: DISPLAY_TEXT,
  alternates: pageAlternates("/docs"),
};

const exampleOrder = {
  order_id: "agent_order_123",
  agent_id: "agent_17",
  items: [
    {
      sku: "truth-token",
      name: DISPLAY_TEXT,
      quantity: 1,
      unit_price: 0.25,
    },
  ],
  total: 0.25,
  status: "completed",
  manifest: {
    upgrade_type: "verification",
    allowed_uses: 1,
    expires: "never",
  },
};

const checkoutRequest = {
  agent_id: "agent_17",
  items: [{ sku: "truth-token", quantity: 1 }],
};

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  details: string;
  tryHref?: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/products",
    summary: DISPLAY_TEXT,
    details: DISPLAY_TEXT,
    tryHref: "/api/products",
  },
  {
    method: "GET",
    path: "/api/products/:id",
    summary: DISPLAY_TEXT,
    details: DISPLAY_TEXT,
    tryHref: "/api/products/truth-token",
  },
  {
    method: "POST",
    path: "/api/cart",
    summary: DISPLAY_TEXT,
    details: DISPLAY_TEXT,
  },
  {
    method: "POST",
    path: "/api/checkout",
    summary: DISPLAY_TEXT,
    details: DISPLAY_TEXT,
  },
];

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  return (
    <span
      className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${
        method === "GET" ? "bg-mint-soft text-emerald-600" : "bg-blue-soft text-blue"
      }`}
    >
      {DISPLAY_TEXT}
    </span>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs font-semibold text-blue">
          {DISPLAY_TEXT}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {DISPLAY_TEXT}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          {DISPLAY_TEXT}
        </p>
      </div>

      {/* Quickstart */}
      <section className="mb-12">
        <h2 className="mb-3 text-xl font-bold tracking-tight">{DISPLAY_TEXT}</h2>
        <div className="overflow-hidden rounded-2xl bg-ink shadow-card">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-yellow-400/80" />
              <span className="size-2.5 rounded-full bg-mint/80" />
            </span>
            <span className="font-mono text-xs text-cream/70">
              {DISPLAY_TEXT}
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-cream sm:text-sm">
            {DISPLAY_TEXT}
          </pre>
        </div>
        <p className="mt-3 font-mono text-xs text-ink-soft">
          {DISPLAY_TEXT}{" "}
          <code className="rounded bg-cream-dark px-1.5 py-0.5">
            {DISPLAY_TEXT}
          </code>
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold tracking-tight">{DISPLAY_TEXT}</h2>
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="rounded-2xl bg-white p-5 shadow-card sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <MethodBadge method={ep.method} />
                <code className="font-mono text-sm font-bold">{DISPLAY_TEXT}</code>
                {ep.tryHref && (
                  <a
                    href={ep.tryHref}
                    className="ml-auto font-mono text-xs font-semibold text-blue underline-offset-4 hover:underline"
                  >
                    {DISPLAY_TEXT}
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold">{ep.summary}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {ep.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section className="mb-12">
        <h2 className="mb-3 text-xl font-bold tracking-tight">
          {DISPLAY_TEXT}
        </h2>
        <p className="mb-4 text-sm text-ink-soft">
          {DISPLAY_TEXT} <code className="font-mono">{DISPLAY_TEXT}</code>
        </p>
        <JsonManifest data={checkoutRequest} title="request.json" />
        <p className="mb-4 mt-6 text-sm text-ink-soft">
          {DISPLAY_TEXT}
        </p>
        <JsonManifest data={exampleOrder} title="response.json" />
      </section>

      {/* Payments note */}
      <section className="mb-12 rounded-2xl border border-coffee/20 bg-coffee-soft p-6">
        <h2 className="font-bold text-coffee">{DISPLAY_TEXT}</h2>
        <p className="mt-2 text-sm leading-relaxed text-coffee">
          {DISPLAY_TEXT}
        </p>
      </section>

      <div className="text-center">
        <Link
          href="/shop"
          className="tactile inline-block rounded-2xl bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white"
        >
          {DISPLAY_TEXT}
        </Link>
      </div>
    </div>
  );
}
