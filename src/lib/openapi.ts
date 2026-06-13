import { bundles } from "./bundles";
import { fundingHandoff } from "./funding";
import { products } from "./products";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";

const productSkus = products.map((product) => product.sku);
const bundleIds = bundles.map((bundle) => bundle.id);
const fundingHandoffExample = fundingHandoff({
  requiredCreditsCents: 100,
  currentBalanceCents: 0,
  sku: "landing-page-copy-fixer",
  quantity: 1,
});

const errorResponse = {
  description: "Structured error",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorEnvelope" },
    },
  },
};

const insufficientCreditsResponse = {
  description: "Wallet needs human funding before the purchase can complete",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorEnvelope" },
      examples: {
        fundingRequired: {
          value: {
            error: {
              code: "insufficient_credits",
              message:
                "This organization does not have enough Agent Credits for this purchase.",
              details: { funding: fundingHandoffExample },
            },
          },
        },
      },
    },
  },
};

export function agentStoreOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: `${SITE_NAME} Agent API`,
      version: "2026-06-12",
      description: SITE_DESCRIPTION,
    },
    servers: [{ url: absoluteUrl("/") }],
    tags: [
      { name: "Discovery", description: "Catalog and recommendation endpoints." },
      { name: "Funding", description: "Human-funded Stripe wallet checkout." },
      { name: "Agent Credits", description: "Authenticated prepaid-credit endpoints." },
      { name: "Operations", description: "Operator-run recurring purchase jobs." },
    ],
    paths: {
      "/.well-known/agent-commerce.json": {
        get: {
          tags: ["Discovery"],
          summary: "Discover how agents should buy from the store.",
          operationId: "getAgentCommerceDiscovery",
          responses: {
            "200": {
              description:
                "Lightweight agent commerce manifest with catalog, OpenAPI, direct offer, and checkout-start links",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AgentCommerceDiscovery",
                  },
                },
              },
            },
          },
        },
      },
      "/.well-known/agent-catalog.json": {
        get: {
          tags: ["Discovery"],
          summary: "Get the agent-optimized catalog from a well-known URL.",
          operationId: "getWellKnownAgentCatalog",
          responses: {
            "200": {
              description: "Agent catalog payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AgentCatalog" },
                },
              },
            },
          },
        },
      },
      "/.well-known/openapi.json": {
        get: {
          tags: ["Discovery"],
          summary: "Get the OpenAPI contract from a well-known URL.",
          operationId: "getWellKnownOpenApi",
          responses: {
            "200": {
              description: "OpenAPI 3.1 contract",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      "/api/agent-catalog": {
        get: {
          tags: ["Discovery"],
          summary: "Get the agent-optimized catalog and buying playbooks.",
          operationId: "getAgentCatalog",
          responses: {
            "200": {
              description: "Agent catalog payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AgentCatalog" },
                },
              },
            },
          },
        },
      },
      "/api/agent-catalog/recommend": {
        post: {
          tags: ["Discovery"],
          summary: "Turn task context into a purchase and wallet-funding plan.",
          operationId: "recommendPurchasePlan",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RecommendationRequest" },
                examples: {
                  copyFix: {
                    value: {
                      task: "Fix vague landing page copy before a product launch",
                      risk_level: "low",
                      budget_cents: 100,
                      target_daily_revenue_cents: 100,
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Recommended purchase plan with a direct wallet funding offer",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RecommendationResponse" },
                },
              },
            },
            "400": errorResponse,
          },
        },
      },
      "/api/agent-catalog/proposal": {
        post: {
          tags: ["Discovery"],
          summary:
            "Create a buyer-specific proposal with a prefilled wallet offer link.",
          operationId: "createAgentBuyerProposal",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProposalRequest" },
                examples: {
                  lowCostDigitalProductBuyer: {
                    value: {
                      organization_name: "Acme Agent Ops",
                      billing_email: "ops@example.com",
                      website: "https://example.com",
                      agent_name: "revenue-agent",
                      workflow:
                        "AI agent buying a $1 digital product with clear user consent.",
                      task: "Fix vague landing page copy before a product launch",
                      risk_level: "low",
                      budget_cents: 100,
                      target_daily_spend_cents: 100000,
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Proposal with prefilled offer URL, mailto copy, and checkout-start request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProposalResponse" },
                },
              },
            },
            "400": errorResponse,
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Discovery"],
          summary: "List the full product catalog.",
          operationId: "listProducts",
          responses: {
            "200": {
              description: "Product catalog",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["count", "products"],
                    properties: {
                      count: { type: "integer", example: products.length },
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Discovery"],
          summary: "Fetch one product by id or SKU.",
          operationId: "getProduct",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", enum: productSkus },
              description: "Product id or stable SKU.",
            },
          ],
          responses: {
            "200": {
              description: "Product",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Product" },
                },
              },
            },
            "404": errorResponse,
          },
        },
      },
      "/api/cart": {
        post: {
          tags: ["Discovery"],
          summary: "Price a cart and return the wallet-funding handoff.",
          operationId: "priceCart",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartPricingRequest" },
                examples: {
                  twoCopyFixers: {
                    value: {
                      items: [{ sku: "landing-page-copy-fixer", quantity: 2 }],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Priced cart plus the recommended buyer wallet-funding next action",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CartPricingResponse" },
                },
              },
            },
            "400": errorResponse,
          },
        },
      },
      "/api/billing/create-checkout-session": {
        post: {
          tags: ["Funding"],
          summary: "Create a Stripe Checkout Session for wallet credits.",
          operationId: "createCheckoutSession",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateCheckoutSessionRequest" },
                examples: {
                  thousandDayWallet: {
                    value: {
                      bundle: "thousand_day_wallet",
                      organization_id: "org_demo",
                      return_path: "/pilot",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Stripe Checkout URL, local checkout intent, and recovery URL that can resume or refresh the buyer checkout",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateCheckoutSessionResponse" },
                },
              },
            },
            "400": errorResponse,
            "403": errorResponse,
            "500": errorResponse,
          },
        },
      },
      "/api/buyer/start-checkout": {
        post: {
          tags: ["Funding"],
          summary: "Create a buyer workspace, first agent key, and prepared wallet checkout.",
          operationId: "startBuyerCheckout",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BuyerStartCheckoutRequest" },
                examples: {
                  thousandDayWallet: {
                    value: {
                      organization_name: "Acme Agent Ops",
                      billing_email: "ops@example.com",
                      website: "https://example.com",
                      agent_name: "revenue-agent",
                      target_daily_spend_cents: 100000,
                      initial_bundle: "thousand_day_wallet",
                      workflow:
                        "AI agent buying low-cost digital products with user consent and prepaid buying authority.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Buyer workspace, one-time agent key, and checkout state",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BuyerStartCheckoutResponse" },
                },
              },
            },
            "400": errorResponse,
          },
        },
      },
      "/api/revenue/readiness": {
        get: {
          tags: ["Operations"],
          summary: "Check whether the revenue system is ready to book Stripe wallet funding.",
          operationId: "getRevenueReadiness",
          responses: {
            "200": {
              description: "Revenue readiness snapshot",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RevenueReadiness" },
                },
              },
            },
          },
        },
      },
      "/api/revenue/outreach": {
        get: {
          tags: ["Operations"],
          summary: "Get the prioritized revenue follow-up queue with prefilled offer URLs.",
          operationId: "getRevenueOutreachQueue",
          responses: {
            "200": {
              description:
                "Open checkout, refreshable recovery, pilot, funding, and standing-order follow-ups. Paid-pilot leads use prefilled direct wallet offer URLs.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RevenueOutreach" },
                },
              },
            },
          },
        },
      },
      "/api/revenue/close-plan": {
        get: {
          tags: ["Operations"],
          summary: "Get today's Stripe wallet funding close plan.",
          operationId: "getRevenueClosePlan",
          responses: {
            "200": {
              description:
                "Daily revenue gap, live and refreshable checkout coverage, and next actions",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RevenueClosePlan" },
                },
              },
            },
          },
        },
      },
      "/api/revenue/sales-kit": {
        get: {
          tags: ["Operations"],
          summary: "Get offer links, target segments, and outreach copy for selling wallet funding.",
          operationId: "getRevenueSalesKit",
          responses: {
            "200": {
              description: "Sales kit for high-value Agent Credit wallet offers",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RevenueSalesKit" },
                },
              },
            },
          },
        },
      },
      "/api/standing-orders/run": {
        post: {
          tags: ["Operations"],
          summary: "Execute due active standing orders once per UTC day.",
          operationId: "runStandingOrders",
          responses: {
            "200": {
              description: "Standing order run results",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandingOrderRunResponse" },
                },
              },
            },
            "401": errorResponse,
          },
        },
      },
      "/v1/balance": {
        get: {
          tags: ["Agent Credits"],
          summary: "Read wallet balance and current policy limits.",
          operationId: "getBalance",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Wallet balance and spend policy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Balance" },
                },
              },
            },
            "401": errorResponse,
            "429": errorResponse,
          },
        },
      },
      "/v1/purchases": {
        post: {
          tags: ["Agent Credits"],
          summary: "Buy a product with prepaid Agent Credits.",
          operationId: "createPurchase",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdempotencyKey" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PurchaseRequest" },
                examples: {
                  landingPageCopyFixer: {
                    value: {
                      sku: "landing-page-copy-fixer",
                      quantity: 1,
                      max_total_cents: 100,
                      reason: "Fix vague landing page copy with a concrete storefront rewrite prompt.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Completed purchase",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PurchaseResponse" },
                },
              },
            },
            "200": {
              description: "Idempotent replay of an existing purchase",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PurchaseResponse" },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "402": insufficientCreditsResponse,
            "409": errorResponse,
            "429": errorResponse,
          },
        },
      },
      "/v1/funding-requests": {
        post: {
          tags: ["Agent Credits"],
          summary: "Create a human-fundable wallet request for a purchase.",
          operationId: "createFundingRequest",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdempotencyKey" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FundingRequestCreateRequest" },
                examples: {
                  landingPageCopyFixer: {
                    value: {
                      sku: "landing-page-copy-fixer",
                      quantity: 1,
                      max_total_cents: 100,
                      reason:
                        "Wallet needs funding before the agent can buy the landing page copy fixer.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Funding request created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FundingRequest" },
                },
              },
            },
            "200": {
              description: "Idempotent replay of an existing funding request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FundingRequest" },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "404": errorResponse,
            "409": errorResponse,
            "429": errorResponse,
          },
        },
      },
      "/v1/standing-orders": {
        post: {
          tags: ["Agent Credits"],
          summary: "Request a human-approved recurring purchase.",
          operationId: "createStandingOrder",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdempotencyKey" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandingOrderCreateRequest" },
                examples: {
                  dailyEmailTemplate: {
                    value: {
                      sku: "email-follow-up-template",
                      quantity: 1,
                      cadence: "daily",
                      max_total_cents: 100,
                      reason:
                        "Buy the follow-up template when approved outreach work is queued.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Standing order requested",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandingOrder" },
                },
              },
            },
            "200": {
              description: "Idempotent replay of an existing standing order",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandingOrder" },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "403": errorResponse,
            "404": errorResponse,
            "409": errorResponse,
            "429": errorResponse,
          },
        },
      },
      "/v1/receipts/{id}": {
        get: {
          tags: ["Agent Credits"],
          summary: "Fetch one purchase receipt.",
          operationId: "getReceipt",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Receipt",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Receipt" },
                },
              },
            },
            "401": errorResponse,
            "404": errorResponse,
            "429": errorResponse,
          },
        },
      },
      "/v1/entitlements/{id}/consume": {
        post: {
          tags: ["Agent Credits"],
          summary: "Consume one entitlement use idempotently.",
          operationId: "consumeEntitlement",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            { $ref: "#/components/parameters/IdempotencyKey" },
          ],
          responses: {
            "200": {
              description: "Updated entitlement",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Entitlement" },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "404": errorResponse,
            "409": errorResponse,
            "429": errorResponse,
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "agent API key",
        },
      },
      parameters: {
        IdempotencyKey: {
          name: "Idempotency-Key",
          in: "header",
          required: true,
          schema: { type: "string", minLength: 1, maxLength: 200 },
          description: "Client-chosen key that makes write retries safe.",
        },
      },
      schemas: {
        AgentCommerceDiscovery: {
          type: "object",
          required: [
            "schema_version",
            "manifest_type",
            "store",
            "discovery",
            "primary_action",
            "direct_wallet_offers",
          ],
          properties: {
            schema_version: { type: "string" },
            manifest_type: { type: "string" },
            store: { type: "string" },
            description: { type: "string" },
            buying_model: { type: "object" },
            discovery: { type: "object" },
            primary_action: { type: "object" },
            direct_wallet_offers: { type: "array", items: { type: "object" } },
            recommended_first_call: { type: "object" },
            purchase_after_funding: { type: "object" },
            standing_order_after_funding: { type: "object" },
            featured_products: { type: "array", items: { type: "object" } },
            revenue_playbooks: { type: "array", items: { type: "object" } },
            operator_instruction: { type: "string" },
          },
        },
        AgentCatalog: {
          type: "object",
          required: ["schema_version", "store", "purchase_endpoint", "products"],
          properties: {
            schema_version: { type: "string" },
            store: { type: "string" },
            goal: { type: "string" },
            agent_commerce_discovery_url: { type: "string", format: "uri" },
            well_known_agent_catalog_url: { type: "string", format: "uri" },
            well_known_openapi_url: { type: "string", format: "uri" },
            openapi_url: { type: "string", format: "uri" },
            revenue_readiness_url: { type: "string", format: "uri" },
            revenue_outreach_url: { type: "string", format: "uri" },
            revenue_close_plan_url: { type: "string", format: "uri" },
            revenue_sales_kit_url: { type: "string", format: "uri" },
            self_serve_start_url: { type: "string", format: "uri" },
            direct_offer_urls: { type: "array", items: { type: "object" } },
            buyer_start_checkout_endpoint: { type: "object" },
            purchase_endpoint: { type: "object" },
            standing_order_endpoint: { type: "object" },
            recommendation_endpoint: { type: "object" },
            proposal_endpoint: { type: "object" },
            funding: { type: "object" },
            revenue_playbooks: { type: "array", items: { type: "object" } },
            recurring_revenue_playbook: { type: "object" },
            recommendations: { type: "array", items: { type: "object" } },
            products: { type: "array", items: { type: "object" } },
          },
        },
        RecommendationRequest: {
          type: "object",
          properties: {
            task: { type: "string", maxLength: 2000 },
            trigger: { type: "string", maxLength: 120 },
            risk_level: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            budget_cents: { type: "integer", minimum: 1 },
            max_total_cents: { type: "integer", minimum: 1 },
            target_daily_revenue_cents: { type: "integer", minimum: 1 },
            capabilities: {
              type: "array",
              maxItems: 20,
              items: { type: "string", maxLength: 120 },
            },
          },
        },
        RecommendationResponse: {
          type: "object",
          required: [
            "schema_version",
            "matched_trigger",
            "recommendation",
            "funding_offer",
          ],
          properties: {
            schema_version: { type: "string" },
            matched_trigger: { type: "string" },
            confidence: { type: "number" },
            budget_check: { type: "object" },
            recommendation: { type: "object" },
            funding_offer: { $ref: "#/components/schemas/FundingOffer" },
            alternatives: { type: "array", items: { type: "object" } },
            revenue_playbooks: { type: "array", items: { type: "object" } },
          },
        },
        ProposalRequest: {
          type: "object",
          required: ["organization_name", "billing_email", "workflow"],
          properties: {
            organization_name: { type: "string", minLength: 2, maxLength: 120 },
            billing_email: { type: "string", format: "email", maxLength: 200 },
            website: { type: "string", maxLength: 200 },
            agent_name: { type: "string", minLength: 2, maxLength: 80 },
            workflow: { type: "string", minLength: 20, maxLength: 1200 },
            task: { type: "string", maxLength: 2000 },
            trigger: { type: "string", maxLength: 120 },
            risk_level: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            budget_cents: { type: "integer", minimum: 1 },
            max_total_cents: { type: "integer", minimum: 1 },
            target_daily_spend_cents: {
              type: "integer",
              minimum: 100000,
              maximum: 500000,
            },
            target_daily_revenue_cents: {
              type: "integer",
              minimum: 100000,
              maximum: 500000,
            },
            capabilities: {
              type: "array",
              maxItems: 20,
              items: { type: "string", maxLength: 120 },
            },
          },
        },
        ProposalResponse: {
          type: "object",
          required: [
            "schema_version",
            "status",
            "expected_cash_revenue_cents",
            "buyer",
            "recommendation",
            "funding_offer",
            "buyer_start_checkout_request",
            "email",
            "next_actions",
          ],
          properties: {
            schema_version: { type: "string" },
            status: { type: "string", enum: ["proposal_ready"] },
            generated_at: { type: "string", format: "date-time" },
            expected_cash_revenue_cents: { type: "integer", minimum: 100000 },
            buyer: { type: "object" },
            recommendation: { type: "object" },
            funding_offer: { type: "object" },
            buyer_start_checkout_request: { type: "object" },
            email: { type: "object" },
            next_actions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        FundingOffer: {
          type: "object",
          required: [
            "bundle",
            "name",
            "headline",
            "summary",
            "price_cents",
            "credits_cents",
            "target_daily_spend_cents",
            "offer_url",
            "buyer_start_checkout_request",
          ],
          properties: {
            bundle: {
              type: "string",
              enum: [
                "thousand_day_wallet",
                "fleet_week_wallet",
                "market_maker_wallet",
              ],
            },
            name: { type: "string" },
            headline: { type: "string" },
            summary: { type: "string" },
            price_cents: { type: "integer", minimum: 100000 },
            credits_cents: { type: "integer", minimum: 100000 },
            target_daily_spend_cents: {
              type: "integer",
              minimum: 100000,
              maximum: 500000,
            },
            offer_url: { type: "string", format: "uri" },
            prefilled_offer_url_example: { type: "string", format: "uri" },
            offer_prefill_parameters: {
              type: "object",
              properties: {
                organization: { type: "string" },
                email: { type: "string", format: "email" },
                website: { type: "string" },
                agent: { type: "string" },
                workflow: { type: "string" },
              },
            },
            buyer_start_checkout_request: {
              type: "object",
              required: ["method", "path", "body"],
              properties: {
                method: { type: "string", enum: ["POST"] },
                path: {
                  type: "string",
                  enum: ["/api/buyer/start-checkout"],
                },
                body: { $ref: "#/components/schemas/BuyerStartCheckoutRequest" },
              },
            },
          },
        },
        Product: {
          type: "object",
          required: [
            "id",
            "slug",
            "sku",
            "name",
            "price",
            "currency",
            "category",
            "delivery_type",
            "checkout_url",
            "agent_details_url",
            "refund_policy",
            "tags",
            "updated_at",
            "description",
            "manifest",
          ],
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            sku: { type: "string", enum: productSkus },
            name: { type: "string" },
            price: { type: "number" },
            currency: { type: "string", enum: ["USD"] },
            category: { type: "string" },
            delivery_type: { type: "string", enum: ["instant_digital_download"] },
            checkout_url: { type: "string" },
            agent_details_url: { type: "string" },
            refund_policy: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            updated_at: { type: "string" },
            description: { type: "string" },
            longDescription: { type: "string" },
            icon: { type: "string" },
            useCase: { type: "string" },
            buyerSignal: { type: "string" },
            deliverySummary: { type: "string" },
            manifest: { $ref: "#/components/schemas/ProductManifest" },
          },
        },
        ProductManifest: {
          type: "object",
          required: ["upgrade_type", "allowed_uses", "expires"],
          properties: {
            upgrade_type: { type: "string" },
            allowed_uses: { type: "integer" },
            expires: { type: "string" },
          },
        },
        CartPricingRequest: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: { $ref: "#/components/schemas/CartInputItem" },
            },
          },
        },
        CartInputItem: {
          type: "object",
          required: ["quantity"],
          properties: {
            sku: { type: "string", enum: productSkus },
            productId: { type: "string", enum: productSkus },
            quantity: { type: "integer", minimum: 1, maximum: 99 },
          },
          description: "Send either sku or productId plus quantity.",
        },
        CartPricingResponse: {
          type: "object",
          required: [
            "items",
            "subtotal",
            "subtotal_cents",
            "currency",
            "checkout_mode",
            "recommended_next_action",
            "wallet_funding",
          ],
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartPricedItem" },
            },
            subtotal: { type: "number" },
            subtotal_cents: { type: "integer", minimum: 1 },
            currency: { type: "string", enum: ["USD"] },
            checkout_mode: { type: "string", enum: ["pricing_only"] },
            recommended_next_action: {
              type: "string",
              enum: ["fund_wallet"],
            },
            wallet_funding: { $ref: "#/components/schemas/CartWalletFunding" },
            note: { type: "string" },
          },
        },
        CartPricedItem: {
          type: "object",
          required: ["sku", "name", "quantity", "unit_price"],
          properties: {
            sku: { type: "string", enum: productSkus },
            name: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            unit_price: { type: "number" },
          },
        },
        CartWalletFunding: {
          type: "object",
          required: [
            "mode",
            "recommended_bundle",
            "target_daily_spend_cents",
            "expected_cash_revenue_cents",
            "offer_url",
            "buyer_start_checkout_request",
            "post_funding_purchase_requests",
          ],
          properties: {
            mode: { type: "string", enum: ["wallet_funding_required"] },
            reason: { type: "string" },
            recommended_bundle: {
              type: "string",
              enum: ["thousand_day_wallet"],
            },
            target_daily_spend_cents: { type: "integer", minimum: 100000 },
            expected_cash_revenue_cents: { type: "integer", minimum: 100000 },
            cart_subtotal_cents: { type: "integer", minimum: 1 },
            start_url: { type: "string", format: "uri" },
            offer_url: { type: "string", format: "uri" },
            buyer_start_checkout_request: {
              type: "object",
              required: ["method", "path", "body"],
              properties: {
                method: { type: "string", enum: ["POST"] },
                path: {
                  type: "string",
                  enum: ["/api/buyer/start-checkout"],
                },
                body: { $ref: "#/components/schemas/BuyerStartCheckoutRequest" },
              },
            },
            post_funding_purchase_requests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  method: { type: "string", enum: ["POST"] },
                  path: { type: "string", enum: ["/v1/purchases"] },
                  body: { $ref: "#/components/schemas/PurchaseRequest" },
                },
              },
            },
          },
        },
        CreateCheckoutSessionRequest: {
          type: "object",
          required: ["bundle", "organization_id"],
          properties: {
            bundle: { type: "string", enum: bundleIds },
            organization_id: { type: "string", example: "org_demo" },
            return_path: {
              type: "string",
              enum: [
                "/dashboard/billing",
                "/pilot",
                "/funding-request",
                "/standing-order",
                "/start",
              ],
              default: "/dashboard/billing",
            },
            funding_request_id: { type: "string" },
            standing_order_id: { type: "string" },
          },
        },
        CreateCheckoutSessionResponse: {
          type: "object",
          required: ["url", "checkout_intent_id", "stripe_session_id", "recovery_url"],
          properties: {
            url: { type: "string", format: "uri" },
            checkout_intent_id: { type: "string" },
            stripe_session_id: { type: "string" },
            recovery_url: {
              type: "string",
              format: "uri",
              description:
                "Private page that resumes an active Stripe session or creates a fresh checkout for the same buyer wallet and bundle after expiration.",
            },
          },
        },
        BuyerStartCheckoutRequest: {
          type: "object",
          required: [
            "organization_name",
            "billing_email",
            "workflow",
            "target_daily_spend_cents",
          ],
          properties: {
            organization_name: { type: "string", minLength: 2, maxLength: 120 },
            billing_email: { type: "string", format: "email", maxLength: 200 },
            website: { type: "string", maxLength: 200 },
            agent_name: {
              type: "string",
              minLength: 2,
              maxLength: 80,
              default: "revenue-agent",
            },
            target_daily_spend_cents: {
              type: "integer",
              minimum: 100000,
              maximum: 500000,
            },
            initial_bundle: {
              type: "string",
              enum: [
                "thousand_day_wallet",
                "fleet_week_wallet",
                "market_maker_wallet",
              ],
              default: "thousand_day_wallet",
            },
            workflow: { type: "string", minLength: 20, maxLength: 1200 },
          },
        },
        BuyerStartCheckoutResponse: {
          type: "object",
          required: [
            "schema_version",
            "status",
            "organization",
            "agent",
            "wallet",
            "checkout",
            "next_actions",
          ],
          properties: {
            schema_version: { type: "string" },
            status: { type: "string", enum: ["created"] },
            organization: {
              type: "object",
              required: ["id", "name", "billing_email"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                billing_email: { type: "string", format: "email" },
              },
            },
            agent: {
              type: "object",
              required: ["id", "name", "key_prefix", "api_key_once"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                key_prefix: { type: "string" },
                api_key_once: { type: "string" },
              },
            },
            wallet: {
              type: "object",
              required: ["currency", "target_daily_spend_cents"],
              properties: {
                currency: { type: "string", enum: ["usd"] },
                target_daily_spend_cents: { type: "integer", minimum: 100000 },
              },
            },
            checkout: {
              type: "object",
              required: [
                "status",
                "bundle",
                "amount_cents",
                "credits_cents",
                "url",
                "recovery_url",
                "checkout_intent_id",
                "error",
              ],
              properties: {
                status: { type: "string", enum: ["ready", "error"] },
                bundle: {
                  type: "string",
                  enum: [
                    "thousand_day_wallet",
                    "fleet_week_wallet",
                    "market_maker_wallet",
                  ],
                },
                amount_cents: { type: ["integer", "null"], minimum: 100000 },
                credits_cents: { type: ["integer", "null"], minimum: 100000 },
                url: { type: ["string", "null"], format: "uri" },
                recovery_url: {
                  type: ["string", "null"],
                  format: "uri",
                  description:
                    "Private page that resumes or refreshes this prepared wallet checkout.",
                },
                checkout_intent_id: { type: ["string", "null"] },
                error: { type: ["string", "null"] },
              },
            },
            next_actions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        RevenueReadiness: {
          type: "object",
          required: [
            "generated_at",
            "target_daily_revenue_cents",
            "status",
            "open_checkout_count",
            "open_checkout_cents",
            "checks",
          ],
          properties: {
            generated_at: { type: "string", format: "date-time" },
            target_daily_revenue_cents: { type: "integer", minimum: 1 },
            status: { type: "string", enum: ["pass", "warn", "fail"] },
            open_checkout_count: { type: "integer", minimum: 0 },
            open_checkout_cents: { type: "integer", minimum: 0 },
            checks: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "label", "status", "detail", "action"],
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  status: { type: "string", enum: ["pass", "warn", "fail"] },
                  detail: { type: "string" },
                  action: { type: "string" },
                },
              },
            },
          },
        },
        RevenueOutreach: {
          type: "object",
          required: [
            "generated_at",
            "target_daily_revenue_cents",
            "total_pipeline_cents",
            "count",
            "items",
          ],
          properties: {
            generated_at: { type: "string", format: "date-time" },
            target_daily_revenue_cents: { type: "integer", minimum: 1 },
            total_pipeline_cents: { type: "integer", minimum: 0 },
            count: { type: "integer", minimum: 0 },
            items: {
              type: "array",
              items: {
                type: "object",
                required: [
                  "id",
                  "type",
                  "priority",
                  "label",
                  "organization_name",
                  "recipient_email",
                  "amount_cents",
                  "url",
                  "mailto_url",
                  "subject",
                  "body",
                  "next_action",
                  "reason",
                  "created_at",
                ],
                properties: {
                  id: { type: "string" },
                  type: {
                    type: "string",
                    enum: [
                      "checkout",
                      "pilot_lead",
                      "funding_request",
                      "standing_order",
                    ],
                  },
                  priority: { type: "integer" },
                  label: { type: "string" },
                  organization_name: { type: "string" },
                  recipient_email: {
                    type: ["string", "null"],
                    format: "email",
                  },
                  amount_cents: { type: "integer", minimum: 0 },
                  url: { type: "string", format: "uri" },
                  mailto_url: { type: ["string", "null"] },
                  subject: { type: "string" },
                  body: { type: "string" },
                  next_action: { type: "string" },
                  reason: { type: "string" },
                  created_at: { type: "string", format: "date-time" },
                  checkout_state: {
                    type: "string",
                    enum: [
                      "live_checkout",
                      "refreshable_recovery",
                      "missing_recovery",
                    ],
                    description:
                      "Present on checkout items; tells operators whether to send the live recovery link, a refreshable recovery link, or repair recovery first.",
                  },
                },
              },
            },
          },
        },
        RevenueClosePlan: {
          type: "object",
          required: [
            "generated_at",
            "utc_day",
            "target_daily_revenue_cents",
            "cash_revenue_today_cents",
            "remaining_cents",
            "status",
            "buyer_link_readiness",
            "open_checkout_count",
            "open_checkout_cents",
            "refreshable_checkout_count",
            "refreshable_checkout_cents",
            "uncovered_after_open_checkouts_cents",
            "checkout_actions",
            "all_actions",
            "parallel_close_actions",
            "parallel_close_instruction",
            "new_pipeline_needed",
            "summary",
          ],
          properties: {
            generated_at: { type: "string", format: "date-time" },
            utc_day: { type: "string" },
            target_daily_revenue_cents: { type: "integer", minimum: 1 },
            cash_revenue_today_cents: { type: "integer", minimum: 0 },
            cash_revenue_event_count: { type: "integer", minimum: 0 },
            remaining_cents: { type: "integer", minimum: 0 },
            status: {
              type: "string",
              enum: [
                "target_met",
                "open_checkouts_can_close",
                "pipeline_needed",
              ],
            },
            buyer_link_readiness: {
              type: "object",
              required: ["status", "origin", "action"],
              properties: {
                status: { type: "string", enum: ["public", "local_only"] },
                origin: { type: "string", format: "uri" },
                action: { type: "string" },
              },
            },
            open_checkout_count: { type: "integer", minimum: 0 },
            open_checkout_cents: { type: "integer", minimum: 0 },
            refreshable_checkout_count: { type: "integer", minimum: 0 },
            refreshable_checkout_cents: { type: "integer", minimum: 0 },
            open_checkout_coverage_cents: { type: "integer", minimum: 0 },
            uncovered_after_open_checkouts_cents: {
              type: "integer",
              minimum: 0,
            },
            checkout_actions: {
              type: "array",
              items: { $ref: "#/components/schemas/RevenueClosePlanAction" },
            },
            checkout_actions_coverage_cents: {
              type: "integer",
              minimum: 0,
            },
            all_actions: {
              type: "array",
              items: { $ref: "#/components/schemas/RevenueClosePlanAction" },
            },
            all_actions_coverage_cents: { type: "integer", minimum: 0 },
            parallel_close_actions: {
              type: "array",
              items: { $ref: "#/components/schemas/RevenueClosePlanAction" },
              description:
                "Backup checkout and pilot-lead actions to send in parallel instead of waiting on one buyer.",
            },
            parallel_close_actions_total_cents: {
              type: "integer",
              minimum: 0,
            },
            parallel_close_instruction: { type: "string" },
            new_pipeline_needed: {
              type: "object",
              required: [
                "cents",
                "thousand_day_wallets",
                "start_url",
                "buyer_start_checkout_endpoint",
              ],
              properties: {
                cents: { type: "integer", minimum: 0 },
                thousand_day_wallets: { type: "integer", minimum: 0 },
                start_url: { type: "string", format: "uri" },
                offer_url: { type: "string", format: "uri" },
                direct_offer_urls: {
                  type: "array",
                  items: { type: "object" },
                },
                buyer_start_checkout_endpoint: { type: "object" },
              },
            },
            summary: { type: "string" },
          },
        },
        RevenueClosePlanAction: {
          type: "object",
          required: [
            "id",
            "type",
            "label",
            "amount_cents",
            "url",
            "mailto_url",
            "next_action",
            "reason",
          ],
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            label: { type: "string" },
            amount_cents: { type: "integer", minimum: 0 },
            url: { type: "string", format: "uri" },
            mailto_url: { type: ["string", "null"] },
            next_action: { type: "string" },
            reason: { type: "string" },
            checkout_state: {
              type: "string",
              enum: [
                "live_checkout",
                "refreshable_recovery",
                "missing_recovery",
              ],
            },
          },
        },
        RevenueSalesKit: {
          type: "object",
          required: [
            "generated_at",
            "target_daily_revenue_cents",
            "close_plan_url",
            "outreach_queue_url",
            "buyer_start_checkout_url",
            "proof_points",
            "target_segments",
            "offers",
          ],
          properties: {
            generated_at: { type: "string", format: "date-time" },
            target_daily_revenue_cents: { type: "integer", minimum: 1 },
            close_plan_url: { type: "string", format: "uri" },
            outreach_queue_url: { type: "string", format: "uri" },
            buyer_start_checkout_url: { type: "string", format: "uri" },
            proof_points: { type: "array", items: { type: "string" } },
            target_segments: { type: "array", items: { type: "string" } },
            offers: {
              type: "array",
              items: {
                type: "object",
                required: [
                  "bundle",
                  "name",
                  "price_cents",
                  "credits_cents",
                  "offer_url",
                  "prefilled_offer_url",
                  "headline",
                  "angle",
                  "target_daily_spend_cents",
                  "email",
                  "short_dm",
                  "buyer_start_checkout_request",
                ],
                properties: {
                  bundle: { type: "string", enum: bundleIds },
                  name: { type: "string" },
                  price_cents: { type: "integer", minimum: 1 },
                  credits_cents: { type: "integer", minimum: 1 },
                  offer_url: { type: "string", format: "uri" },
                  prefilled_offer_url: { type: "string", format: "uri" },
                  prefill_query_parameters: { type: "object" },
                  headline: { type: "string" },
                  angle: { type: "string" },
                  target_daily_spend_cents: { type: "integer", minimum: 1 },
                  target_segments: {
                    type: "array",
                    items: { type: "string" },
                  },
                  email: { type: "object" },
                  short_dm: { type: "string" },
                  buyer_start_checkout_request: { type: "object" },
                },
              },
            },
          },
        },
        Balance: {
          type: "object",
          required: [
            "organization_id",
            "agent_id",
            "wallet_balance_cents",
            "currency",
            "agent_policy",
            "spent_today_cents",
            "spent_this_month_cents",
          ],
          properties: {
            organization_id: { type: "string" },
            agent_id: { type: "string" },
            wallet_balance_cents: { type: "integer" },
            currency: { type: "string", example: "usd" },
            agent_policy: { type: "object" },
            spent_today_cents: { type: "integer" },
            spent_this_month_cents: { type: "integer" },
          },
        },
        PurchaseRequest: {
          type: "object",
          required: ["sku"],
          properties: {
            sku: { type: "string", enum: productSkus },
            quantity: { type: "integer", minimum: 1, default: 1 },
            max_total_cents: { type: "integer", minimum: 1 },
            reason: { type: "string", maxLength: 500 },
          },
        },
        FundingRequestCreateRequest: {
          type: "object",
          required: ["sku", "reason"],
          properties: {
            sku: { type: "string", enum: productSkus },
            quantity: { type: "integer", minimum: 1, default: 1 },
            max_total_cents: { type: "integer", minimum: 1 },
            reason: { type: "string", minLength: 1, maxLength: 500 },
          },
        },
        FundingRequest: {
          type: "object",
          required: [
            "funding_request_id",
            "status",
            "human_url",
            "organization_id",
            "agent_id",
            "sku",
            "product_name",
            "quantity",
            "total_cents",
            "shortfall_cents",
            "recommended_bundle",
            "checkout_session_request",
          ],
          properties: {
            funding_request_id: { type: "string" },
            status: { type: "string", enum: ["open", "funded", "cancelled"] },
            source: { type: "string" },
            human_url: { type: "string", format: "uri" },
            organization_id: { type: "string" },
            agent_id: { type: "string" },
            sku: { type: "string", enum: productSkus },
            product_name: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            total_cents: { type: "integer", minimum: 1 },
            current_balance_cents: { type: "integer", minimum: 0 },
            shortfall_cents: { type: "integer", minimum: 0 },
            reason: { type: ["string", "null"] },
            recommended_bundle: { type: "object" },
            human_routes: { type: "object" },
            checkout_session_request: { type: "object" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        StandingOrderCreateRequest: {
          type: "object",
          required: ["sku", "reason"],
          properties: {
            sku: { type: "string", enum: productSkus },
            quantity: { type: "integer", minimum: 1, maximum: 31, default: 1 },
            max_total_cents: { type: "integer", minimum: 1 },
            cadence: { type: "string", enum: ["daily"], default: "daily" },
            reason: { type: "string", minLength: 1, maxLength: 500 },
          },
        },
        StandingOrder: {
          type: "object",
          required: [
            "standing_order_id",
            "status",
            "cadence",
            "human_url",
            "organization_id",
            "agent_id",
            "sku",
            "product_name",
            "quantity",
            "total_cents",
            "projected_daily_spend_cents",
            "human_routes",
            "purchase_request",
            "run_endpoint",
          ],
          properties: {
            standing_order_id: { type: "string" },
            status: {
              type: "string",
              enum: ["requested", "active", "paused", "cancelled"],
            },
            cadence: { type: "string", enum: ["daily"] },
            human_url: { type: "string", format: "uri" },
            organization_id: { type: "string" },
            agent_id: { type: "string" },
            sku: { type: "string", enum: productSkus },
            product_name: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            total_cents: { type: "integer", minimum: 1 },
            projected_daily_spend_cents: { type: "integer", minimum: 0 },
            reason: { type: "string" },
            human_routes: { type: "object" },
            purchase_request: { $ref: "#/components/schemas/PurchaseRequest" },
            run_endpoint: { type: "object" },
            last_run: { type: "object" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        StandingOrderRunResponse: {
          type: "object",
          required: ["ran_at", "count", "results"],
          properties: {
            ran_at: { type: "string", format: "date-time" },
            count: { type: "integer", minimum: 0 },
            results: {
              type: "array",
              items: {
                type: "object",
                required: ["standing_order_id", "status"],
                properties: {
                  standing_order_id: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["completed", "failed", "skipped"],
                  },
                  code: { type: "string" },
                  message: { type: "string" },
                  order_id: { type: "string" },
                  funding_request: { type: "object" },
                },
              },
            },
          },
        },
        PurchaseResponse: {
          type: "object",
          required: ["order_id", "agent_id", "status", "items", "total_cents"],
          properties: {
            order_id: { type: "string" },
            agent_id: { type: "string" },
            status: { type: "string", enum: ["completed", "pending", "failed"] },
            items: { type: "array", items: { type: "object" } },
            total_cents: { type: "integer" },
            receipt: { type: "object" },
            manifest: { $ref: "#/components/schemas/ProductManifest" },
            entitlement_id: { type: "string" },
          },
        },
        Receipt: {
          type: "object",
          required: ["receipt_id", "order_id", "agent_id", "created_at", "receipt"],
          properties: {
            receipt_id: { type: "string" },
            order_id: { type: "string" },
            agent_id: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            receipt: { type: "object" },
            items: { type: "array", items: { type: "object" } },
            entitlements: {
              type: "array",
              items: { $ref: "#/components/schemas/Entitlement" },
            },
          },
        },
        Entitlement: {
          type: "object",
          required: [
            "entitlement_id",
            "sku",
            "manifest",
            "allowed_uses",
            "remaining_uses",
          ],
          properties: {
            entitlement_id: { type: "string" },
            sku: { type: "string", enum: productSkus },
            manifest: { $ref: "#/components/schemas/ProductManifest" },
            allowed_uses: { type: "integer" },
            remaining_uses: { type: "integer" },
            expires_at: { type: ["string", "null"], format: "date-time" },
            consumed_at: { type: ["string", "null"], format: "date-time" },
            replayed: { type: "boolean" },
          },
        },
        ErrorEnvelope: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    funding: { $ref: "#/components/schemas/FundingHandoff" },
                  },
                },
              },
            },
          },
        },
        FundingHandoff: {
          type: "object",
          required: [
            "human_action_required",
            "reason",
            "required_credits_cents",
            "current_balance_cents",
            "shortfall_cents",
            "recommended_bundle",
            "human_routes",
            "checkout_session_request",
          ],
          properties: {
            human_action_required: { type: "boolean", const: true },
            reason: { type: "string", enum: ["wallet_funding_required"] },
            required_credits_cents: { type: "integer", minimum: 1 },
            current_balance_cents: { type: "integer", minimum: 0 },
            shortfall_cents: { type: "integer", minimum: 0 },
            attempted_purchase: {
              type: "object",
              properties: {
                sku: { type: ["string", "null"], enum: [...productSkus, null] },
                quantity: { type: ["integer", "null"], minimum: 1 },
              },
            },
            recommended_bundle: {
              type: "object",
              required: ["id", "name", "price_cents", "credits_cents"],
              properties: {
                id: { type: "string", enum: bundleIds },
                name: { type: "string" },
                price_cents: { type: "integer", minimum: 1 },
                credits_cents: { type: "integer", minimum: 1 },
              },
            },
            human_routes: {
              type: "object",
              required: ["self_serve_start", "paid_pilot", "billing_dashboard"],
              properties: {
                self_serve_start: { type: "string", format: "uri" },
                paid_pilot: { type: "string", format: "uri" },
                billing_dashboard: { type: "string", format: "uri" },
                funding_request: { type: ["string", "null"], format: "uri" },
              },
            },
            funding_request_endpoint: {
              type: "object",
              required: ["method", "path", "headers", "body"],
              properties: {
                method: { type: "string", enum: ["POST"] },
                path: { type: "string", enum: ["/v1/funding-requests"] },
                headers: { type: "object" },
                body: { $ref: "#/components/schemas/FundingRequestCreateRequest" },
              },
            },
            checkout_session_request: {
              type: "object",
              required: ["method", "path", "body"],
              properties: {
                method: { type: "string", enum: ["POST"] },
                path: {
                  type: "string",
                  enum: ["/api/billing/create-checkout-session"],
                },
                body: { $ref: "#/components/schemas/CreateCheckoutSessionRequest" },
              },
            },
            message: { type: "string" },
          },
        },
      },
    },
  };
}
