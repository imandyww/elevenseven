export type OpenCheckoutFollowupState =
  | "live_checkout"
  | "refreshable_recovery"
  | "missing_recovery";

export function checkoutHasUsableStripeSession(
  checkout: {
    status: string;
    checkoutUrl: string | null;
    expiresAt: Date | null;
  },
  now = new Date(),
) {
  return (
    checkout.status === "open" &&
    Boolean(checkout.checkoutUrl) &&
    (!checkout.expiresAt || checkout.expiresAt > now)
  );
}

export function openCheckoutFollowupState(
  checkout: {
    checkoutUrl: string | null;
    expiresAt: Date | null;
    recoveryToken: string | null;
  },
  now = new Date(),
): OpenCheckoutFollowupState {
  if (!checkout.recoveryToken) return "missing_recovery";
  if (!checkout.checkoutUrl || (checkout.expiresAt && checkout.expiresAt <= now)) {
    return "refreshable_recovery";
  }
  return "live_checkout";
}
