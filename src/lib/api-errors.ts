import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "invalid_api_key"
  | "missing_idempotency_key"
  | "invalid_request"
  | "product_not_found"
  | "product_inactive"
  | "sku_blocked"
  | "category_not_allowed"
  | "exceeds_per_purchase_limit"
  | "exceeds_daily_limit"
  | "exceeds_monthly_limit"
  | "requires_human_approval"
  | "insufficient_credits"
  | "duplicate_request_conflict"
  | "rate_limited"
  | "not_found"
  | "internal_error";

const statusByCode: Record<ApiErrorCode, number> = {
  invalid_api_key: 401,
  missing_idempotency_key: 400,
  invalid_request: 400,
  product_not_found: 404,
  product_inactive: 410,
  sku_blocked: 403,
  category_not_allowed: 403,
  exceeds_per_purchase_limit: 403,
  exceeds_daily_limit: 403,
  exceeds_monthly_limit: 403,
  requires_human_approval: 403,
  insufficient_credits: 402,
  duplicate_request_conflict: 409,
  rate_limited: 429,
  not_found: 404,
  internal_error: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
    this.status = statusByCode[code];
  }
}

/** Standard agent-API error envelope: {"error":{"code","message"}}. */
export function errorResponse(error: ApiError): NextResponse {
  return NextResponse.json(
    { error: { code: error.code, message: error.message } },
    { status: error.status },
  );
}

/** Wrap unexpected failures so routes never leak stack traces. */
export function internalErrorResponse(e: unknown): NextResponse {
  console.error("[agent-api] internal error:", e);
  return errorResponse(
    new ApiError("internal_error", "Something went wrong on our side. Safe to retry."),
  );
}
