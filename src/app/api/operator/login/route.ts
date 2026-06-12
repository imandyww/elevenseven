import { NextResponse } from "next/server";
import {
  isOperatorPassword,
  operatorSessionCookieOptions,
  operatorSessionToken,
} from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

function safeNextPath(raw: FormDataEntryValue | null): string {
  const path = typeof raw === "string" ? raw : "";
  // Same-origin paths only — no protocol-relative or absolute URLs.
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  return "/dashboard/revenue";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const nextPath = safeNextPath(form.get("next"));

  if (!password || !isOperatorPassword(password)) {
    const retry = new URL("/login", request.url);
    retry.searchParams.set("error", "1");
    retry.searchParams.set("next", nextPath);
    return NextResponse.redirect(retry, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303,
  });
  const token = operatorSessionToken();
  if (token) {
    const { name, ...options } = operatorSessionCookieOptions();
    response.cookies.set(name, token, options);
  }
  return response;
}
