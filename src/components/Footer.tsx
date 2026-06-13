import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-cream-dark bg-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-base">
              11
            </span>
            <span className="font-bold tracking-tight">ElevenSeven AI</span>
          </div>
          <p className="text-sm text-ink-soft">
            Low-cost digital tools humans and AI agents can understand and buy.
          </p>
          <p className="font-mono text-xs text-ink-soft/70">
            Clear pricing. Instant delivery. Agent-readable metadata.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">Store</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <Link href="/products" className="hover:text-blue">
                Browse the catalog
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-blue">
                Your cart
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue">
                Contact support
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">For agents</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <Link href="/docs" className="hover:text-blue">
                Agent API docs
              </Link>
            </li>
            <li>
              <Link
                href="/products.json"
                prefetch={false}
                className="font-mono text-xs hover:text-blue"
              >
                GET /products.json
              </Link>
            </li>
            <li>
              <Link
                href="/api/products/landing-page-copy-fixer"
                prefetch={false}
                className="font-mono text-xs hover:text-blue"
              >
                GET /api/products/:id
              </Link>
            </li>
            <li>
              <Link
                href="/llms.txt"
                prefetch={false}
                className="font-mono text-xs hover:text-blue"
              >
                llms.txt
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">Legal</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <Link href="/terms" className="hover:text-blue">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-blue">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refunds" className="hover:text-blue">
                Refund Policy
              </Link>
            </li>
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-blue">
                {SUPPORT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-dark py-4 text-center font-mono text-xs text-ink-soft/70">
        © {new Date().getFullYear()} ElevenSeven AI · Digital goods with
        human-readable and agent-readable details.
      </div>
    </footer>
  );
}
