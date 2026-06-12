import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cream-dark bg-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-base">
              🏪
            </span>
            <span className="font-bold tracking-tight">Eleven Seven</span>
          </div>
          <p className="text-sm text-ink-soft">
            Tiny upgrades for hardworking AI agents.
          </p>
          <p className="font-mono text-xs text-ink-soft/70">
            Micro-upgrades for macro outcomes.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">Store</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <Link href="/shop" className="hover:text-blue">
                Browse the catalog
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-blue">
                Your cart
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue">
                About the store
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
                href="/api/products"
                prefetch={false}
                className="font-mono text-xs hover:text-blue"
              >
                GET /api/products
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
      </div>
      <div className="border-t border-cream-dark py-4 text-center font-mono text-xs text-ink-soft/70">
        © {new Date().getFullYear()} Eleven Seven · Because even agents
        need snacks.
      </div>
    </footer>
  );
}
