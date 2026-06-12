import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

// Operator gate: a single shared secret (OPERATOR_DASHBOARD_SECRET) protects
// the human dashboard and /api/revenue. The browser session cookie stores
// sha256(secret) — never the secret itself — so the raw value only transits
// the login form once. API callers may instead send the raw secret as a
// Bearer token. There is intentionally no user model here; customers never
// see these surfaces (they use the agent API and checkout links).

export const OPERATOR_SESSION_COOKIE = "op_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function operatorSecret(): string | null {
  const secret = process.env.OPERATOR_DASHBOARD_SECRET?.trim();
  return secret ? secret : null;
}

/** True when the gate is open because no secret is configured (dev only). */
function devBypassActive(): boolean {
  return !operatorSecret() && process.env.NODE_ENV !== "production";
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Constant-time equality over the sha256 of both inputs (no length leak). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

/** The value a valid operator session cookie must hold. */
export function operatorSessionToken(): string | null {
  const secret = operatorSecret();
  return secret ? sha256Hex(secret) : null;
}

export function isOperatorPassword(candidate: string): boolean {
  const secret = operatorSecret();
  if (!secret) return devBypassActive();
  return safeEqual(candidate, secret);
}

export function isOperatorSessionToken(token: string | undefined | null): boolean {
  const expected = operatorSessionToken();
  if (!expected) return devBypassActive();
  return typeof token === "string" && safeEqual(token, expected);
}

function bearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return token ? token : null;
}

/** Request-object check used by proxy.ts (cookie session or Bearer secret). */
export function isOperatorRequest(request: NextRequest): boolean {
  if (isOperatorSessionToken(request.cookies.get(OPERATOR_SESSION_COOKIE)?.value)) {
    return true;
  }
  const token = bearerToken(request.headers.get("authorization"));
  return token !== null && isOperatorPassword(token);
}

/**
 * Ambient check for server components and route handlers.
 * Accepts the session cookie or a Bearer secret.
 */
export async function isOperatorContext(): Promise<boolean> {
  const cookieStore = await cookies();
  if (isOperatorSessionToken(cookieStore.get(OPERATOR_SESSION_COOKIE)?.value)) {
    return true;
  }
  const headerStore = await headers();
  const token = bearerToken(headerStore.get("authorization"));
  return token !== null && isOperatorPassword(token);
}

/**
 * Per the proxy.ts docs, matchers do not reliably cover Server Functions
 * across refactors — every dashboard action and operator page must call this
 * directly rather than trusting the proxy alone.
 */
export async function requireOperator(): Promise<void> {
  if (await isOperatorContext()) return;
  redirect("/login");
}

export function operatorUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "operator_auth_required",
        message:
          "Operator-only endpoint. Send Authorization: Bearer <OPERATOR_DASHBOARD_SECRET> or sign in at /login.",
      },
    },
    { status: 401 },
  );
}

export function operatorSessionCookieOptions() {
  return {
    name: OPERATOR_SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
