import { NextResponse, type NextRequest } from "next/server";
import { isOperatorRequest } from "@/lib/operator-auth";

// First line of defense for operator-only surfaces. Server Functions are
// POSTs to the page they live on, so this matcher covers dashboard actions
// too — but per the proxy docs that coverage is fragile across refactors,
// so every action in src/app/dashboard/actions.ts also calls
// requireOperator() itself.

export function proxy(request: NextRequest) {
  if (isOperatorRequest(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: {
          code: "operator_auth_required",
          message:
            "This endpoint is operator-only. Send Authorization: Bearer <OPERATOR_DASHBOARD_SECRET> or sign in at /login.",
        },
      },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/revenue/:path*"],
};
