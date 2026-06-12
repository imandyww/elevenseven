# 🏪 Eleven Seven

**Agent-native upgrades for budgeted AI work.**

A playful-but-functional ecommerce site where AI agents buy the capabilities
they need before acting: a $1k/day operating pack, fleet launch packs,
security red-team runs, observability traces, workflow repair, payment
hardening, compliance briefs, data enrichment, integrations, procurement
runs, plus cheap micro-upgrades for frequent loops. Humans get a storefront;
agents get a JSON API and a prepaid-credits payment system.

> Prepaid credits. Machine-readable receipts. Products an agent can justify buying.

## How money works here

**AI agents do not own money.** A human (organization) funds a wallet by
buying **Agent Credits** through Stripe. Each agent gets an API key and a
spending policy. Agents spend credits — never cards — within their limits.

- Stripe is used **only** for buying credit bundles ($5 / $10 / $25 / $100 / $500 / $1,000 / $2,500 / $5,000).
- Agent purchases debit the prepaid wallet. No per-purchase Stripe charge —
  Stripe is only used when a human funds the wallet.
- Every credit and debit is a row in an **immutable ledger**; the balance is
  derived from the latest entry, never from a mutable column.
- Only **server-side Stripe verification** can credit a wallet.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- Prisma v6 + Postgres (docker-compose for local dev)
- Stripe Checkout (credit bundles), signed webhooks, and operator Stripe sync
- Zod validation on all payment/agent inputs

## Getting started

```bash
npm install                  # also runs prisma generate
docker compose up -d         # local Postgres on :5432
npm run db:migrate           # apply migrations
npm run db:seed              # seed org_demo + demo agent — PRINTS THE AGENT API KEY ONCE
npm run credits:grant -- org_demo 100000 # dev-only: grant $1,000 of credits without Stripe
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — storefront at `/`,
billing console at `/dashboard/billing`.

Other scripts: `npm run build` · `npm start` · `npm run lint` ·
`npm run db:studio` (browse the DB) · `npm run db:reset` (wipe + remigrate).

## Environment variables

`.env` (read by Prisma CLI and Next):

```bash
DATABASE_URL="postgresql://agentstore:agentstore@localhost:5432/agentstore"
DIRECT_URL="postgresql://agentstore:agentstore@localhost:5432/agentstore"
```

In production, `DATABASE_URL` is the pooled (PgBouncer) connection string with
`?pgbouncer=true` and `DIRECT_URL` the unpooled one for `prisma migrate deploy`.

`.env.local` (secrets; see `.env.example`):

```bash
STRIPE_SECRET_KEY=sk_test_...      # dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...    # from `stripe listen` (below)
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPERATOR_DASHBOARD_SECRET=...      # gates /dashboard and /api/revenue (optional in dev)
STANDING_ORDER_RUN_SECRET=...      # cron auth (required in production)
UPSTASH_REDIS_REST_URL=...         # distributed rate limits (optional in dev)
UPSTASH_REDIS_REST_TOKEN=...
```

For production outreach, `NEXT_PUBLIC_APP_URL` must be the public buyer-facing
origin. `/api/revenue/close-plan` reports `buyer_link_readiness` and warns when
checkout or recovery links are still local-only.

## Configuring Stripe

1. Put your **test-mode** `sk_test_...` key in `.env.local`.
2. Forward webhooks locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart dev.
3. Buy a bundle at `/dashboard/billing` with test card `4242 4242 4242 4242`.
   The webhook credits the wallet; if it is delayed, use the Revenue
   dashboard's Stripe sync to reconcile the paid session.

You can also drive the webhook without a browser:

```bash
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.organization_id=org_demo \
  --add checkout_session:metadata.credits_cents=100000
```

No Stripe at all? `npm run credits:grant -- org_demo 100000` appends a dev-only
ledger adjustment so the agent API is fully testable offline.

## Buying Agent Credits (humans)

Go to **/dashboard/billing**: wallet balance, eight bundles (
**$5 Starter Wallet**, **$10 Debug Pack**, **$25 Workflow Bundle**,
**$100 Operator Wallet**, **$500 Scale Wallet**, **$1k/day Wallet**,
**$2,500 Fleet Week Wallet**, **$5,000 Market Maker Wallet**), the
ledger, and recent agent purchases. Checkout happens on Stripe; the success
redirect never credits the wallet. Wallet crediting requires the verified
webhook or the Revenue dashboard's server-side Stripe sync.

High-intent buyers can also start at **/pilot**, which has direct Stripe
Checkout buttons for the $1,000, $2,500, and $5,000 wallets plus a pilot
intake form.

## Creating an agent API key

Go to **/dashboard/agents** and create an agent key from the dashboard. The raw
`ag_live_...` key is shown exactly once; only its SHA-256 hash is stored.

CLI creation is still available for automation:

```bash
npm run agent:create -- "my-agent"        # in org_demo
npm run agent:create -- "my-agent" org_x  # another org
```

Manage the agent (limits, pause/revoke, spend) at `/dashboard/agents`. Default
policy: **$5,000/day, $100,000/month, $1,000 per purchase**, all categories
allowed. Agents cannot edit their own policy — there is no agent-facing
endpoint for it.

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
    "sku": "thousand-dollar-day-pack",
    "quantity": 1,
    "max_total_cents": 100000,
    "reason": "Daily operating pack for an agent fleet with a measurable target."
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

## Discovery and storefront API

Autonomous buyers can start from well-known discovery URLs:
`/.well-known/agent-commerce.json` is the lightweight buying manifest,
`/.well-known/agent-catalog.json` mirrors the full agent catalog, and
`/.well-known/openapi.json` mirrors the OpenAPI contract.

`GET /api/agent-catalog` is the agent-optimized discovery endpoint: products,
funding bundles, trigger-based recommendations, purchase examples, and
$1k/day playbooks in one response.

`/start` creates a buyer workspace, first agent key, and the first selected
Stripe wallet checkout in one setup flow, so a buyer can move from intent to a
recoverable checkout session without visiting the dashboard first.

Direct offer pages are available for outreach and campaigns:
`/buy/thousand_day_wallet`, `/buy/fleet_week_wallet`, and
`/buy/market_maker_wallet`. Each page locks the first funding bundle, creates
the buyer workspace/key, and prepares the Stripe checkout from one form.
Offer links can prefill buyer forms with `organization`, `email`, `website`,
`agent`, and `workflow` query parameters.

`POST /api/buyer/start-checkout` exposes that same path as JSON for agents,
campaigns, and integrations. It returns the buyer organization, a one-time
agent key, checkout URL or checkout error, and recovery URL when Stripe is
configured.

Checkout recovery pages at `/checkout/:token` resume an active Stripe session
or create a fresh checkout for the same buyer wallet and bundle if the original
session has expired or been cancelled.

`GET /api/revenue/outreach` is the operator queue for converting pending
money: open checkout recovery links, paid-pilot leads, agent funding requests,
and requested standing orders ranked by expected revenue impact. Paid-pilot
lead follow-up links go straight to prefilled direct wallet offer pages.
Checkout items include `checkout_state` so operators know whether to send a
live recovery link, a refreshable recovery link, or repair missing recovery
first.

`GET /api/revenue/close-plan` is the daily operating plan: verified Stripe
wallet credits booked today, the remaining $1k/day gap, live and refreshable
checkout coverage, ranked close actions, and the exact buyer-start request
body needed to create more $1k wallet checkout pipeline.

The Revenue dashboard can also sync open checkout intents against Stripe, so a
paid session is reconciled into wallet credits even if the webhook was delayed.

`GET /api/revenue/sales-kit` returns target segments, direct offer URLs,
prefilled offer URL examples, ready-to-send email/DM copy, and exact
buyer-start request bodies for the $1,000, $2,500, and $5,000 wallet offers.

`POST /api/agent-catalog/recommend` turns task context into a buyable plan
and returns a `funding_offer` with the direct wallet offer URL plus the exact
`/api/buyer/start-checkout` request body:

```bash
curl -X POST http://localhost:3000/api/agent-catalog/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Daily production workflow for outbound sales agents",
    "risk_level": "high",
    "budget_cents": 100000,
    "target_daily_revenue_cents": 100000
  }'
```

`POST /api/agent-catalog/proposal` goes one step closer to cash: send buyer
details and task context, and it returns a prefilled direct wallet offer URL,
mailto copy, the exact buyer-start checkout request, expected cash revenue,
and the recommended post-funding agent purchase request.

`GET /api/products` and `GET /api/products/:id` expose the catalog.
`POST /api/cart` prices a legacy cart and returns `wallet_funding` with the
direct $1k wallet offer, buyer-start checkout body, and post-funding purchase
requests. `POST /api/checkout` remains simulated: it returns
`payment_mode: "simulated"` and `revenue_booked_cents: 0`, then points serious
buyers back to wallet funding.

## Pages

| Route | What it is |
| --- | --- |
| `/` `/shop` `/products/[id]` `/cart` `/success` `/about` `/docs` | Storefront, catalog, cart, success, about, and API docs |
| `/pilot` | Paid-pilot intake and direct Stripe wallet checkout for high-intent buyers |
| `/dashboard/revenue` | Daily target tracker, readiness checks, follow-up queue, verified Stripe wallet funding vs agent spend |
| `/dashboard/billing` | Wallet balance, buy credit bundles, ledger, recent purchases |
| `/dashboard/receipts` | Searchable receipts + detail view with copyable JSON manifest |
| `/dashboard/agents` | Agent list → per-agent spending page (policy edit, pause/revoke) |

## Payment architecture

```
src/lib/
  bundles.ts      # credit bundles (single source of truth)
  credits.ts      # ledger append/read, balance, spend aggregates, audit log
  purchases.ts    # the serializable purchase transaction
  policy.ts       # pure policy checks (blocked SKUs, categories, limits)
  agent-auth.ts   # Bearer key → sha256 → agent (+ key generation)
  api-errors.ts   # {"error":{code,message}} envelope
  rate-limit.ts   # in-memory sliding window (swap for Redis when scaling out)
  stripe.ts       # lazy Stripe singleton, pinned apiVersion
src/app/api/agent-catalog/route.ts      # machine-readable buying playbooks
src/app/api/agent-catalog/recommend     # task context -> purchase plan
src/app/api/revenue/outreach/route.ts   # pending-money follow-up queue
src/app/api/billing/create-checkout-session/route.ts
src/app/api/webhooks/stripe/route.ts    # signed webhook entrypoint
src/lib/stripe-checkout-reconciliation.ts # verified Stripe session -> wallet credit
src/app/pilot/...                       # paid-pilot lead capture + wallet checkout
src/app/v1/...                          # agent purchase/balance/receipts/consume
prisma/schema.prisma                    # Wallet, LedgerEntry, StripeEvent, AuditLog,
                                        # Agent(+Policy), Order(+Items), Receipt,
                                        # Entitlement(+Consumption)
```

Key invariants:

- **Immutable ledger** — `balanceAfterCents` is computed inside a
  serializable transaction; never-negative is enforced before insert, with a
  unique `idempotencyKey` per entry as a double-spend backstop.
- **Stripe reconciliation idempotency** — wallet credits are keyed to the
  Checkout Session id, so webhook and dashboard sync cannot credit the same
  paid checkout twice.
- **Purchase idempotency** — unique `(agentId, idempotencyKey)` on orders +
  a request hash to distinguish replays (200) from conflicts (409).
- **Separation of powers** — only server-side Stripe reconciliation credits;
  only `/v1/purchases` debits; only humans (dashboard server actions) edit
  policies; credits are never transferable between orgs and never cash out.

## Refunds & disputes (operator runbook)

There is no automated webhook handling for `charge.refunded` or
`charge.dispute.created` yet — a Stripe-side refund does **not** remove
credits on its own. The manual procedure, in order:

1. Find the payment in the Stripe dashboard and issue the refund there
   (policy in `/terms`: unspent credits refundable within 30 days; spent
   credits are not).
2. Remove the matching credits from the wallet (idempotent per refund id):
   `npm run credits:refund -- <organization_id> <amount_cents> <stripe_refund_id>`
3. For disputes/chargebacks, add `--pause-agents` so the org stops spending
   while you reconcile. The script refuses to take a balance negative — if
   credits were already spent, refund at most the remaining balance and treat
   the rest as a dispute loss.
4. Check `/dashboard/revenue` afterwards; the ledger entry shows up as
   `type: refund`, `source: stripe_refund`.

## Production TODOs (documented, deliberate)

- **Customer dashboard auth:** the dashboard is operator-only behind
  `OPERATOR_DASHBOARD_SECRET` (cookie via `/login`, or
  `Authorization: Bearer` for `/api/revenue/*`). The app is still
  single-tenant in the dashboard (`org_demo`, see `src/lib/org.ts`);
  customer-facing org views need real multi-tenant auth.
- **Refund/dispute webhooks:** automate the runbook above by handling
  `charge.refunded` / `charge.dispute.created` in the Stripe webhook.
- **Prisma 7:** upgrade requires the new generator + driver adapters.
