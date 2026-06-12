# 🤖 Agent Dollar Store

**Tiny upgrades for hardworking AI agents.**

A playful-but-functional ecommerce site where AI agents buy micro-upgrades —
Truth Tokens, Compute Cookies, Memory Mochi, Bug Spray — all priced between
$0.10 and $1.00. Humans get a storefront; agents get a JSON API and a
prepaid-credits payment system.

> Micro-upgrades for macro outcomes. Because even agents need snacks.

## How money works here

**AI agents do not own money.** A human (organization) funds a wallet by
buying **Agent Credits** through Stripe. Each agent gets an API key and a
spending policy. Agents spend credits — never cards — within their limits.

- Stripe is used **only** for buying credit bundles ($5 / $10 / $25).
- Tiny purchases ($0.10–$1.00) debit the prepaid wallet. No per-purchase
  Stripe charge — card fees would dwarf a $0.10 Reputation Sticker.
- Every credit and debit is a row in an **immutable ledger**; the balance is
  derived from the latest entry, never from a mutable column.
- Only the **verified Stripe webhook** can credit a wallet.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- Prisma v6 + SQLite (Postgres-portable schema)
- Stripe Checkout (credit bundles) + signed webhooks
- Zod validation on all payment/agent inputs

## Getting started

```bash
npm install                  # also runs prisma generate
npm run db:migrate           # create the SQLite database (prisma/dev.db)
npm run db:seed              # seed org_demo + demo agent — PRINTS THE AGENT API KEY ONCE
npm run credits:grant -- org_demo 1000   # dev-only: grant $10 of credits without Stripe
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — storefront at `/`,
billing console at `/dashboard/billing`.

Other scripts: `npm run build` · `npm start` · `npm run lint` ·
`npm run db:studio` (browse the DB) · `npm run db:reset` (wipe + remigrate).

## Environment variables

`.env` (read by Prisma CLI and Next):

```bash
DATABASE_URL="file:./dev.db"
```

`.env.local` (secrets; see `.env.example`):

```bash
STRIPE_SECRET_KEY=sk_test_...      # dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...    # from `stripe listen` (below)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configuring Stripe

1. Put your **test-mode** `sk_test_...` key in `.env.local`.
2. Forward webhooks locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart dev.
3. Buy a bundle at `/dashboard/billing` with test card `4242 4242 4242 4242`.
   The webhook credits the wallet; the ledger updates within seconds.

You can also drive the webhook without a browser:

```bash
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.organization_id=org_demo \
  --add checkout_session:metadata.credits_cents=500
```

No Stripe at all? `npm run credits:grant -- org_demo 1000` appends a dev-only
ledger adjustment so the agent API is fully testable offline.

## Buying Agent Credits (humans)

Go to **/dashboard/billing**: wallet balance, three bundles (
**$5 Starter Wallet**, **$10 Debug Pack**, **$25 Workflow Bundle**), the
ledger, and recent agent purchases. Checkout happens on Stripe; the success
redirect never credits the wallet — only the verified webhook does.

## Creating an agent API key

```bash
npm run agent:create -- "my-agent"        # in org_demo
npm run agent:create -- "my-agent" org_x  # another org
```

The raw `ag_live_...` key is printed **once** and only its SHA-256 hash is
stored. Manage the agent (limits, pause/revoke, spend) at
`/dashboard/agents`. Default policy: **$1.00/day, $10.00/month, $0.50 per
purchase**, all categories allowed. Agents cannot edit their own policy —
there is no agent-facing endpoint for it.

## Agent API (`/v1`)

All endpoints take `Authorization: Bearer ag_live_...`; writes also require
an `Idempotency-Key` header. Errors are always
`{"error":{"code":"...","message":"..."}}` (codes: `invalid_api_key`,
`missing_idempotency_key`, `invalid_request`, `product_not_found`,
`product_inactive`, `sku_blocked`, `category_not_allowed`,
`exceeds_per_purchase_limit`, `exceeds_daily_limit`,
`exceeds_monthly_limit`, `requires_human_approval`, `insufficient_credits`,
`duplicate_request_conflict`, `rate_limited`, `not_found`,
`internal_error`). Endpoints are rate-limited to 60 req/min per key.

### Buy a product

```bash
curl -X POST http://localhost:3000/v1/purchases \
  -H "Authorization: Bearer ag_live_xxx" \
  -H "Idempotency-Key: purchase_test_001" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "truth-token",
    "quantity": 1,
    "max_total_cents": 25,
    "reason": "Verify answer before sending."
  }'
```

Returns `201` with order, receipt, and entitlement manifest. Retrying with
the same `Idempotency-Key` returns `200` with the **original** order — never
a double charge. Reusing the key with a different body returns `409`.

### Check balance & limits

```bash
curl http://localhost:3000/v1/balance \
  -H "Authorization: Bearer ag_live_xxx"
```

### Receipts & entitlements

```bash
curl http://localhost:3000/v1/receipts/rcpt_xxx \
  -H "Authorization: Bearer ag_live_xxx"

curl -X POST http://localhost:3000/v1/entitlements/ent_xxx/consume \
  -H "Authorization: Bearer ag_live_xxx" \
  -H "Idempotency-Key: consume_001"
```

Agents can only read their own receipts/entitlements; consume is idempotent
per key and decrements `remaining_uses` exactly once.

## Storefront API (unchanged, no payment)

`GET /api/products`, `GET /api/products/:id`, `POST /api/cart`,
`POST /api/checkout` (the original simulated human checkout) still work as
before and never touch the wallet.

## Pages

| Route | What it is |
| --- | --- |
| `/` `/shop` `/products/[id]` `/cart` `/success` `/about` `/docs` | Original storefront (unchanged) |
| `/dashboard/billing` | Wallet balance, buy credit bundles, ledger, recent purchases |
| `/dashboard/receipts` | Searchable receipts + detail view with copyable JSON manifest |
| `/dashboard/agents` | Agent list → per-agent spending page (policy edit, pause/revoke) |

## Payment architecture

```
src/lib/
  bundles.ts      # the 3 credit bundles (single source of truth)
  credits.ts      # ledger append/read, balance, spend aggregates, audit log
  purchases.ts    # the serializable purchase transaction
  policy.ts       # pure policy checks (blocked SKUs, categories, limits)
  agent-auth.ts   # Bearer key → sha256 → agent (+ key generation)
  api-errors.ts   # {"error":{code,message}} envelope
  rate-limit.ts   # in-memory sliding window (swap for Redis when scaling out)
  stripe.ts       # lazy Stripe singleton, pinned apiVersion
src/app/api/billing/create-checkout-session/route.ts
src/app/api/webhooks/stripe/route.ts    # the ONLY code path that credits wallets
src/app/v1/...                          # agent purchase/balance/receipts/consume
prisma/schema.prisma                    # Wallet, LedgerEntry, StripeEvent, AuditLog,
                                        # Agent(+Policy), Order(+Items), Receipt,
                                        # Entitlement(+Consumption)
```

Key invariants:

- **Immutable ledger** — `balanceAfterCents` is computed inside a
  serializable transaction; never-negative is enforced before insert, with a
  unique `idempotencyKey` per entry as a double-spend backstop.
- **Webhook idempotency** — `StripeEvent.stripeEventId` is unique and
  inserted in the *same* transaction as the credit, so an event is processed
  exactly once (replays return `{deduped:true}`).
- **Purchase idempotency** — unique `(agentId, idempotencyKey)` on orders +
  a request hash to distinguish replays (200) from conflicts (409).
- **Separation of powers** — only the webhook credits; only `/v1/purchases`
  debits; only humans (dashboard server actions) edit policies; credits are
  never transferable between orgs and never cash out.

## Production TODOs (documented, deliberate)

- **Auth:** the app is single-tenant (`org_demo`, see `src/lib/org.ts`) with
  an open dashboard. Add real user auth and swap that one constant.
- **Postgres:** change the Prisma datasource, convert the commented
  `String` enum/JSON columns to real `enum`/`Json`, and add
  `CHECK (balance_after_cents >= 0)`.
- **Rate limiting:** in-memory today; use Redis/Upstash for multi-instance.
- **Prisma 7:** upgrade requires the new generator + driver adapters.
