import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBundle } from "@/lib/bundles";
import { getStripe } from "@/lib/stripe";
import { writeAuditLog } from "@/lib/credits";

const bodySchema = z.object({
  bundle: z.enum(["starter_wallet", "debug_pack", "workflow_bundle"]),
  organization_id: z.string().min(1),
});

/**
 * Creates a Stripe Checkout Session for a credit bundle, server-side only.
 * The wallet is credited exclusively by the verified webhook — never here
 * and never from the browser's success redirect.
 */
export async function POST(request: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Expected { bundle, organization_id }." } },
      { status: 400 },
    );
  }

  // Single-tenant demo: membership check degenerates to "org exists".
  // With real auth, verify the signed-in user belongs to this organization.
  const org = await prisma.organization.findUnique({
    where: { id: parsed.organization_id },
  });
  if (!org) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Unknown organization." } },
      { status: 403 },
    );
  }

  const bundle = getBundle(parsed.bundle)!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: bundle.priceCents,
            product_data: {
              name: `Agent Credits — ${bundle.name}`,
              description: bundle.blurb,
            },
          },
        },
      ],
      metadata: {
        organization_id: org.id,
        credits_cents: String(bundle.creditsCents),
        bundle: bundle.id,
      },
      success_url: `${appUrl}/dashboard/billing?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?purchase=cancelled`,
    });

    await writeAuditLog({
      organizationId: org.id,
      actorType: "user",
      action: "billing.checkout_session_created",
      metadata: { bundle: bundle.id, price_cents: bundle.priceCents, session_id: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[billing] checkout session failed:", e);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "Could not start checkout. Is STRIPE_SECRET_KEY configured?",
        },
      },
      { status: 500 },
    );
  }
}
