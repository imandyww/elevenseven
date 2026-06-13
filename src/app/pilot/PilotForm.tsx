"use client";

import { useActionState } from "react";
import { createPilotLead, type PilotLeadState } from "./actions";

const initialState: PilotLeadState = {
  ok: false,
  message: "",
};

const skuOptions = [
  {
    value: "landing-page-copy-fixer",
    label: "Landing Page Copy Fixer",
    price: "$1",
  },
  {
    value: "lead-research-prompt-pack",
    label: "Lead Research Prompt Pack",
    price: "$1",
  },
  {
    value: "json-formatter-utility",
    label: "JSON Formatter Utility",
    price: "$1",
  },
];

export function PilotForm() {
  const [state, formAction, pending] = useActionState(
    createPilotLead,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5 rounded-2xl bg-white p-6 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Organization</span>
          <input
            name="organizationName"
            required
            minLength={2}
            maxLength={120}
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            placeholder="Acme AI Ops"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Work email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            placeholder="ops@example.com"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Contact name</span>
          <input
            name="contactName"
            maxLength={120}
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            placeholder="Ada"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Website</span>
          <input
            name="website"
            maxLength={200}
            className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
            placeholder="https://example.com"
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Starter product</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {skuOptions.map((option, index) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-xl border border-cream-dark bg-cream p-3 text-sm"
            >
              <input
                type="radio"
                name="requestedSku"
                value={option.value}
                defaultChecked={index === 0}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold">{option.label}</span>
                <span className="font-mono text-xs text-coffee">{option.price}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Target daily spend</span>
        <select
          name="targetDailySpendCents"
          defaultValue="100000"
          className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
        >
          <option value="100000">$1,000 wallet limit</option>
          <option value="250000">$2,500 wallet limit</option>
          <option value="500000">$5,000 wallet limit</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Agent workflow</span>
        <textarea
          name="useCase"
          required
          minLength={20}
          maxLength={1200}
          rows={5}
          className="w-full rounded-xl bg-cream px-3 py-2 outline-none ring-blue/40 focus:ring-2"
          placeholder="Describe what the agent should buy, the user-approved budget, and how the digital product will be used."
        />
      </label>

      <input
        type="text"
        name="companyUrl2"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      {state.message && (
        <p
          className={`rounded-xl p-3 text-sm ${
            state.ok ? "bg-mint-soft text-emerald-800" : "bg-red-50 text-red-600"
          }`}
        >
          {state.message}
          {state.leadId && (
            <span className="block font-mono text-[11px]">lead_id: {state.leadId}</span>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="tactile w-full rounded-xl bg-ink px-5 py-3 font-semibold text-cream shadow-card hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Request buying setup"}
      </button>
    </form>
  );
}
