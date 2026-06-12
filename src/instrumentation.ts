import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionEnv } = await import("@/lib/env");
    assertProductionEnv();
  }
}

// Structured server-error logging. On Amplify, compute stdout/stderr lands in
// CloudWatch Logs — alarm on `"level":"error"` lines there. (A full Sentry
// integration can hook in here later without touching next.config.)
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const error =
    err instanceof Error
      ? { message: err.message, digest: (err as { digest?: string }).digest, stack: err.stack }
      : { message: String(err) };

  console.error(
    JSON.stringify({
      level: "error",
      source: "onRequestError",
      error,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    }),
  );
};
