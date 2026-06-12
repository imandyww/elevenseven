import { absoluteUrl, type UrlOptions } from "./site";

export interface StartPrefill {
  organizationName?: string;
  email?: string;
  website?: string;
  agentName?: string;
  workflow?: string;
}

export type StartPrefillSearchParams = Record<
  string,
  string | string[] | undefined
>;

const prefillKeys = {
  organizationName: ["organization", "organizationName", "org"],
  email: ["email", "billing_email"],
  website: ["website", "site"],
  agentName: ["agent", "agentName", "agent_name"],
  workflow: ["workflow", "use_case", "useCase"],
} as const;

function firstValue(params: StartPrefillSearchParams, keys: readonly string[]) {
  for (const key of keys) {
    const value = params[key];
    if (Array.isArray(value)) {
      const first = value.find((item) => item.trim());
      if (first) return first;
      continue;
    }
    if (value?.trim()) return value;
  }
  return undefined;
}

function clean(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export function startPrefillFromSearchParams(
  params: StartPrefillSearchParams,
): StartPrefill {
  return {
    organizationName: clean(
      firstValue(params, prefillKeys.organizationName),
      120,
    ),
    email: clean(firstValue(params, prefillKeys.email), 200),
    website: clean(firstValue(params, prefillKeys.website), 200),
    agentName: clean(firstValue(params, prefillKeys.agentName), 80),
    workflow: clean(firstValue(params, prefillKeys.workflow), 1200),
  };
}

export function prefilledStartUrl(
  path: string,
  prefill: StartPrefill,
  options: UrlOptions = {},
) {
  const url = new URL(absoluteUrl(path, options));
  if (prefill.organizationName) {
    url.searchParams.set("organization", prefill.organizationName);
  }
  if (prefill.email) url.searchParams.set("email", prefill.email);
  if (prefill.website) url.searchParams.set("website", prefill.website);
  if (prefill.agentName) url.searchParams.set("agent", prefill.agentName);
  if (prefill.workflow) url.searchParams.set("workflow", prefill.workflow);
  return url.toString();
}
