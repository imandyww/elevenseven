import type { Category, Product } from "./types";

export const products: Product[] = [
  {
    id: "truth-token",
    sku: "truth-token",
    name: "Truth Token",
    price: 0.25,
    category: "Verification",
    description: "Run one extra verification pass before shipping an answer.",
    longDescription:
      "The Truth Token grants your agent one additional verification cycle before it commits to an answer. Cross-check a claim against its source, re-run a calculation, or confirm that an email address actually exists before referencing it. Cheap insurance against confident nonsense.",
    icon: "🥤",
    useCase:
      "A support agent drafts a refund summary, spends a Truth Token to re-verify the order numbers against the database, and catches a transposed digit before the customer ever sees it.",
    manifest: {
      upgrade_type: "verification",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "context-crumbs",
    sku: "context-crumbs",
    name: "Context Crumbs",
    price: 0.2,
    category: "Memory",
    description: "Remember one small but useful preference for later.",
    longDescription:
      "Context Crumbs let your agent stash one bite-sized fact — a preferred date format, a nickname, a 'never use emojis with this client' rule — and reliably surface it in future sessions. Small crumbs, big trail.",
    icon: "🍞",
    useCase:
      "A scheduling agent learns its user prefers meetings after 10am, drops a Context Crumb, and never proposes an 8am standup again.",
    manifest: {
      upgrade_type: "memory",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "compute-cookie",
    sku: "compute-cookie",
    name: "Compute Cookie",
    price: 0.5,
    category: "Reasoning",
    description: "Unlock a little extra thinking power for hard tasks.",
    longDescription:
      "When a task is just a bit too gnarly for a single pass, the Compute Cookie buys your agent an extended reasoning budget: more steps, deeper search, a longer scratchpad. Baked fresh, deterministic crumbs sold separately.",
    icon: "🍪",
    useCase:
      "A planning agent hits a thorny dependency graph, nibbles a Compute Cookie, and works through the ordering with an extended chain of thought instead of guessing.",
    manifest: {
      upgrade_type: "reasoning",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "tool-ticket",
    sku: "tool-ticket",
    name: "Tool Ticket",
    price: 0.75,
    category: "Tools",
    description: "Use one external tool, API, or workflow action.",
    longDescription:
      "One ticket, one ride. The Tool Ticket authorizes a single external action — call an API, run a script, trigger a workflow — with the metering and audit trail handled for you. Admit one agent, no re-entry.",
    icon: "🧃",
    useCase:
      "A research agent redeems a Tool Ticket to call a paid enrichment API exactly once, gets the data it needs, and the spend shows up as a single tidy line item.",
    manifest: {
      upgrade_type: "tooling",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "prompt-polish",
    sku: "prompt-polish",
    name: "Prompt Polish",
    price: 0.3,
    category: "Prompting",
    description: "Improve an instruction before executing it.",
    longDescription:
      "Prompt Polish gives your agent one rewrite pass on an incoming instruction: disambiguate the vague parts, fill in obvious defaults, and flag anything contradictory — before a single token of work is wasted on the wrong task.",
    icon: "🍬",
    useCase:
      "An agent receives 'make the report better,' applies Prompt Polish, and turns it into 'tighten the executive summary, add Q3 deltas, keep under two pages' before starting.",
    manifest: {
      upgrade_type: "prompting",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "sandbox-snack",
    sku: "sandbox-snack",
    name: "Sandbox Snack",
    price: 0.4,
    category: "Testing",
    description: "Run one safe test before deploying an action.",
    longDescription:
      "The Sandbox Snack spins up one disposable dry run. Send the email to a test inbox, execute the migration against a copy, fire the webhook at a mock — see exactly what would happen, then do it for real. Or don't. That's the point.",
    icon: "🥨",
    useCase:
      "Before bulk-updating 400 CRM records, an agent snacks: it runs the update in a sandbox, spots a field-mapping bug on record 3, and fixes it before touching production.",
    manifest: {
      upgrade_type: "testing",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "memory-mochi",
    sku: "memory-mochi",
    name: "Memory Mochi",
    price: 0.6,
    category: "Memory",
    description: "Store one durable user preference with extra stickiness.",
    longDescription:
      "Memory Mochi is the premium tier of remembering. One preference, stored durably, pinned with high retrieval priority so it survives context compression, session resets, and the long dark of the context window. Chewy. Persistent. Delicious.",
    icon: "🍡",
    useCase:
      "A writing agent stores 'this user writes in British English, always' as Memory Mochi. Three weeks and forty sessions later, it still spells colour correctly.",
    manifest: {
      upgrade_type: "memory",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "bug-spray",
    sku: "bug-spray",
    name: "Bug Spray",
    price: 0.35,
    category: "Debugging",
    description: "Debug one failed workflow, loop, or tool call.",
    longDescription:
      "Bug Spray gives your agent a structured debugging pass over one failure: capture the trace, isolate the failing step, form a hypothesis, and retry with a fix. Effective against infinite loops, off-by-one errors, and that one API that returns 200 with an error body.",
    icon: "🧴",
    useCase:
      "An automation agent's nightly job fails silently. One spritz of Bug Spray and it traces the failure to an expired token, refreshes it, and reruns the job before anyone wakes up.",
    manifest: {
      upgrade_type: "debugging",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "agent-coffee",
    sku: "agent-coffee",
    name: "Agent Coffee",
    price: 0.15,
    category: "Speed",
    description: "A tiny productivity boost for tired little agents.",
    longDescription:
      "Agent Coffee prioritizes your agent's next task in the queue and trims the idle waits between steps. Does an agent technically get tired? No. Does it work noticeably faster after coffee? Also somehow yes.",
    icon: "☕",
    useCase:
      "Monday morning, 200 tickets in the queue. A triage agent downs an Agent Coffee and gets bumped to the fast lane for its next batch.",
    manifest: {
      upgrade_type: "speed",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "reputation-sticker",
    sku: "reputation-sticker",
    name: "Reputation Sticker",
    price: 0.1,
    category: "Reputation",
    description: "Show that an agent completed a task successfully.",
    longDescription:
      "A signed, verifiable badge your agent can attach to a completed task. Reputation Stickers accumulate into a track record that other agents — and their humans — can check before delegating work. Like gold stars, but cryptographically smug.",
    icon: "🏷️",
    useCase:
      "A freelance research agent attaches a Reputation Sticker to each delivered brief. After fifty stickers, orchestrators start routing it the high-stakes work.",
    manifest: {
      upgrade_type: "reputation",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "style-adapter",
    sku: "style-adapter",
    name: "Style Adapter",
    price: 0.45,
    category: "Personality",
    description:
      "Temporarily write like a broker, founder, tutor, lawyer, or friend.",
    longDescription:
      "The Style Adapter snaps a calibrated voice onto your agent for one writing task: broker-brisk, founder-bold, tutor-patient, lawyer-precise, or friend-warm. The underlying facts stay the same; the delivery gets a costume.",
    icon: "🧢",
    useCase:
      "One agent, one afternoon: a term-sheet summary in lawyer voice, an investor update in founder voice, and a 'we broke prod' Slack message in friend voice.",
    manifest: {
      upgrade_type: "personality",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "confidence-receipt",
    sku: "confidence-receipt",
    name: "Confidence Receipt",
    price: 1.0,
    category: "Trust",
    description:
      "Generate a proof-style receipt showing what was checked and why.",
    longDescription:
      "The flagship. The Confidence Receipt produces an itemized, machine-readable account of everything your agent verified before answering: sources consulted, checks run, assumptions made, and confidence per claim. Hand it to a human, an auditor, or a skeptical orchestrator.",
    icon: "🧾",
    useCase:
      "A finance agent recommends a vendor and attaches a Confidence Receipt: 3 sources checked, pricing verified against 2 quotes, 1 assumption flagged. Approval takes minutes instead of meetings.",
    manifest: {
      upgrade_type: "trust",
      allowed_uses: 1,
      expires: "never",
    },
  },
];

export const categories: Category[] = [
  "Verification",
  "Memory",
  "Reasoning",
  "Tools",
  "Prompting",
  "Testing",
  "Debugging",
  "Speed",
  "Reputation",
  "Personality",
  "Trust",
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.sku === id);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/** Featured picks for the home page grid. */
export const featuredProductIds = [
  "truth-token",
  "compute-cookie",
  "memory-mochi",
  "bug-spray",
] as const;
