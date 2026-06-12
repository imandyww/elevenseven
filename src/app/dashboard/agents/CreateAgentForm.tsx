"use client";

import { useActionState, useState } from "react";
import { createAgent, type CreateAgentState } from "../actions";

const initialState: CreateAgentState = {
  ok: false,
  message: "",
};

export function CreateAgentForm() {
  const [state, formAction, pending] = useActionState(createAgent, initialState);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    if (!state.rawKey) return;
    try {
      await navigator.clipboard.writeText(state.rawKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Create agent key</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Generate an API key from the dashboard, fund the wallet, then let
            the agent call the recommendation and purchase APIs.
          </p>
        </div>
        <span className="rounded-full bg-mint-soft px-3 py-1 font-mono text-[11px] font-semibold text-emerald-700">
          $5k/day default limit
        </span>
      </div>

      <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Agent name</span>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="revenue-agent-01"
            className="w-full rounded-xl bg-cream px-4 py-3 text-sm outline-none ring-blue/40 placeholder:text-ink-soft/60 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="tactile rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-card hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create key"}
        </button>
      </form>

      {state.message && (
        <div
          className={`mt-4 rounded-xl p-4 text-sm ${
            state.ok
              ? "border border-mint/40 bg-mint-soft text-emerald-800"
              : "border border-red-100 bg-red-50 text-red-600"
          }`}
        >
          <p className="font-semibold">{state.message}</p>
          {state.rawKey && (
            <div className="mt-3">
              <p className="font-mono text-[11px] uppercase tracking-wide">
                API key shown once
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-xs text-ink">
                  {state.rawKey}
                </code>
                <button
                  type="button"
                  onClick={copyKey}
                  className="tactile rounded-lg bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream shadow-card hover:bg-blue"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              {state.agentId && (
                <p className="mt-2 font-mono text-[11px]">
                  agent_id: {state.agentId} · key prefix: {state.keyPrefix}...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
