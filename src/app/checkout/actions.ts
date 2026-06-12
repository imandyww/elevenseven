"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createReplacementCheckoutSession } from "@/lib/checkout-sessions";
import { originFromHeaders } from "@/lib/site";

const recoveryCheckoutSchema = z.object({
  recoveryToken: z.string().min(16).max(128),
});

export async function createFreshCheckoutFromRecovery(formData: FormData) {
  const parsed = recoveryCheckoutSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  const checkout = await createReplacementCheckoutSession({
    recoveryToken: parsed.recoveryToken,
    origin: originFromHeaders(await headers()),
  });

  revalidatePath(`/checkout/${parsed.recoveryToken}`);
  revalidatePath("/dashboard/revenue");
  revalidatePath("/api/revenue/outreach");
  revalidatePath("/api/revenue/close-plan");
  redirect(checkout.url);
}
