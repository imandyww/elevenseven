-- CreateEnum
CREATE TYPE "OrganizationSource" AS ENUM ('seed', 'self_serve', 'manual');

-- CreateEnum
CREATE TYPE "PilotLeadStatus" AS ENUM ('new', 'contacted', 'won', 'lost');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('credit', 'debit', 'refund', 'adjustment');

-- CreateEnum
CREATE TYPE "CheckoutIntentStatus" AS ENUM ('open', 'paid', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('user', 'agent', 'system');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('active', 'paused', 'revoked');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "FundingRequestStatus" AS ENUM ('open', 'funded', 'cancelled');

-- CreateEnum
CREATE TYPE "StandingOrderCadence" AS ENUM ('daily');

-- CreateEnum
CREATE TYPE "StandingOrderStatus" AS ENUM ('requested', 'active', 'paused', 'cancelled');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billingEmail" TEXT,
    "website" TEXT,
    "source" "OrganizationSource" NOT NULL DEFAULT 'seed',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilotLead" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "useCase" TEXT NOT NULL,
    "targetDailySpendCents" INTEGER NOT NULL DEFAULT 100000,
    "requestedSku" TEXT NOT NULL DEFAULT 'thousand-dollar-day-pack',
    "status" "PilotLeadStatus" NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'pilot_page',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT,
    "orderId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "balanceAfterCents" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "externalRef" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" TEXT NOT NULL,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutIntent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "creditsCents" INTEGER NOT NULL,
    "status" "CheckoutIntentStatus" NOT NULL DEFAULT 'open',
    "stripeSessionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "checkoutUrl" TEXT,
    "recoveryToken" TEXT,
    "followupCount" INTEGER NOT NULL DEFAULT 0,
    "lastFollowedUpAt" TIMESTAMP(3),
    "returnPath" TEXT NOT NULL,
    "fundingRequestId" TEXT,
    "standingOrderId" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "metadataJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'active',
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPolicy" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "dailyLimitCents" INTEGER NOT NULL DEFAULT 500000,
    "monthlyLimitCents" INTEGER NOT NULL DEFAULT 10000000,
    "perPurchaseLimitCents" INTEGER NOT NULL DEFAULT 100000,
    "allowedCategoriesJson" TEXT NOT NULL DEFAULT '[]',
    "blockedSkusJson" TEXT NOT NULL DEFAULT '[]',
    "requireHumanApprovalOverCents" INTEGER NOT NULL DEFAULT 100000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "reason" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "receiptJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "manifestJson" TEXT NOT NULL,
    "allowedUses" INTEGER NOT NULL,
    "remainingUses" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalCents" INTEGER NOT NULL,
    "currentBalanceCents" INTEGER NOT NULL DEFAULT 0,
    "shortfallCents" INTEGER NOT NULL,
    "recommendedBundleId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "FundingRequestStatus" NOT NULL DEFAULT 'open',
    "source" TEXT NOT NULL DEFAULT 'agent_api',
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandingOrder" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalCents" INTEGER NOT NULL,
    "cadence" "StandingOrderCadence" NOT NULL DEFAULT 'daily',
    "status" "StandingOrderStatus" NOT NULL DEFAULT 'requested',
    "reason" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "lastOrderId" TEXT,
    "lastFundingRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementConsumption" (
    "id" TEXT NOT NULL,
    "entitlementId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntitlementConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "PilotLead_status_createdAt_idx" ON "PilotLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PilotLead_email_idx" ON "PilotLead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_organizationId_key" ON "Wallet"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_idempotencyKey_key" ON "LedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LedgerEntry_walletId_createdAt_idx" ON "LedgerEntry"("walletId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_stripeEventId_key" ON "StripeEvent"("stripeEventId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutIntent_stripeSessionId_key" ON "CheckoutIntent"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutIntent_recoveryToken_key" ON "CheckoutIntent"("recoveryToken");

-- CreateIndex
CREATE INDEX "CheckoutIntent_organizationId_status_createdAt_idx" ON "CheckoutIntent"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutIntent_status_createdAt_idx" ON "CheckoutIntent"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_keyHash_key" ON "Agent"("keyHash");

-- CreateIndex
CREATE INDEX "Agent_organizationId_idx" ON "Agent"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPolicy_agentId_key" ON "AgentPolicy"("agentId");

-- CreateIndex
CREATE INDEX "Order_agentId_createdAt_idx" ON "Order"("agentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_agentId_idempotencyKey_key" ON "Order"("agentId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_orderId_key" ON "Receipt"("orderId");

-- CreateIndex
CREATE INDEX "Receipt_agentId_createdAt_idx" ON "Receipt"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "Entitlement_agentId_idx" ON "Entitlement"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingRequest_idempotencyKey_key" ON "FundingRequest"("idempotencyKey");

-- CreateIndex
CREATE INDEX "FundingRequest_organizationId_status_createdAt_idx" ON "FundingRequest"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "FundingRequest_agentId_createdAt_idx" ON "FundingRequest"("agentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StandingOrder_idempotencyKey_key" ON "StandingOrder"("idempotencyKey");

-- CreateIndex
CREATE INDEX "StandingOrder_organizationId_status_createdAt_idx" ON "StandingOrder"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "StandingOrder_agentId_createdAt_idx" ON "StandingOrder"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "StandingOrder_status_cadence_lastRunAt_idx" ON "StandingOrder"("status", "cadence", "lastRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "EntitlementConsumption_agentId_idempotencyKey_key" ON "EntitlementConsumption"("agentId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutIntent" ADD CONSTRAINT "CheckoutIntent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPolicy" ADD CONSTRAINT "AgentPolicy_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandingOrder" ADD CONSTRAINT "StandingOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandingOrder" ADD CONSTRAINT "StandingOrder_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementConsumption" ADD CONSTRAINT "EntitlementConsumption_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
