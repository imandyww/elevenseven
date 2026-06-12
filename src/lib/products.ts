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
  {
    id: "agent-monitor-pass",
    sku: "agent-monitor-pass",
    name: "Agent Monitor Pass",
    price: 9,
    category: "Observability",
    description:
      "Capture one production run with traces, tool calls, costs, and failure notes.",
    longDescription:
      "The Agent Monitor Pass gives an autonomous worker a complete run record: prompts, tool calls, latency, token spend, retries, errors, and final outcome. It turns an invisible agent run into an audit trail a human operator can inspect before scaling the workflow.",
    icon: "📡",
    useCase:
      "A revenue-ops agent runs a 600-lead enrichment job. It spends one Monitor Pass, exports a trace packet, and proves which sources were touched before the sales team imports the results.",
    buyerSignal:
      "Bought when an agent is about to run an expensive or customer-visible workflow.",
    revenueTier: "growth",
    manifest: {
      upgrade_type: "observability",
      allowed_uses: 1,
      expires: "30d",
    },
  },
  {
    id: "reliability-vote-pack",
    sku: "reliability-vote-pack",
    name: "Reliability Vote Pack",
    price: 24,
    category: "Reliability",
    description:
      "Run a consensus pass across multiple model attempts before committing.",
    longDescription:
      "The Reliability Vote Pack is a redundancy budget for high-stakes agent decisions. It lets an agent decompose a task, sample several independent answers, cluster disagreements, and ship the consensus result with dissent notes attached.",
    icon: "🗳️",
    useCase:
      "A contract-review agent sees three plausible interpretations of a renewal clause. It spends a Reliability Vote Pack, gets five independent reads, and escalates only the disputed assumption.",
    buyerSignal:
      "Bought when the cost of a wrong answer is higher than the cost of a second opinion.",
    revenueTier: "growth",
    manifest: {
      upgrade_type: "consensus_reliability",
      allowed_uses: 1,
      expires: "30d",
    },
  },
  {
    id: "eval-sprint",
    sku: "eval-sprint",
    name: "Eval Sprint",
    price: 49,
    category: "Evaluation",
    description:
      "Run a focused task eval pack before an agent workflow graduates.",
    longDescription:
      "Eval Sprint gives an agent team a compact launch gate: a curated task set, pass/fail rubric, regression snapshot, and summary receipt. It is designed for teams moving from demo agents to production agents that need evidence before widening permissions.",
    icon: "🧪",
    useCase:
      "A coding agent is about to get write access to a repository. The orchestrator buys an Eval Sprint, runs 50 representative tasks, and blocks rollout until the risky failure modes are fixed.",
    buyerSignal:
      "Bought by orchestrators before granting broader tool, data, or spend access.",
    revenueTier: "growth",
    manifest: {
      upgrade_type: "evaluation",
      allowed_uses: 50,
      expires: "30d",
    },
  },
  {
    id: "data-enrichment-pack",
    sku: "data-enrichment-pack",
    name: "Data Enrichment Pack",
    price: 59,
    category: "Data",
    description:
      "Give an agent a metered allowance for verified lookup and enrichment calls.",
    longDescription:
      "The Data Enrichment Pack lets an agent spend from a bounded allowance for structured lookups: company profiles, email verification, firmographic fields, address normalization, and source-backed metadata. Every call is metered and attached to the purchase receipt.",
    icon: "🧬",
    useCase:
      "A sourcing agent has 200 vendor records with stale domains. It buys a Data Enrichment Pack, verifies the current company identity for each record, and returns only source-backed changes.",
    buyerSignal:
      "Bought when an agent needs fresh structured data and cannot rely on model memory.",
    revenueTier: "growth",
    manifest: {
      upgrade_type: "data_enrichment",
      allowed_uses: 200,
      expires: "30d",
    },
  },
  {
    id: "workflow-repair-kit",
    sku: "workflow-repair-kit",
    name: "Workflow Repair Kit",
    price: 79,
    category: "Reliability",
    description:
      "Diagnose and patch a broken agent workflow with a rollback-ready report.",
    longDescription:
      "The Workflow Repair Kit gives an agent permission to inspect a failed automation path, isolate the bad step, propose a fix, run a dry-run, and produce a rollback note. It is priced for production workflows where downtime costs more than a small approval.",
    icon: "🧰",
    useCase:
      "A nightly invoice agent starts failing after an API field changes. It buys a Workflow Repair Kit, identifies the schema mismatch, validates the patch in a sandbox, and hands the operator a one-click fix.",
    buyerSignal:
      "Bought reactively after an agent run fails, loops, or produces low-confidence output.",
    revenueTier: "growth",
    manifest: {
      upgrade_type: "workflow_repair",
      allowed_uses: 1,
      expires: "30d",
    },
  },
  {
    id: "compliance-brief",
    sku: "compliance-brief",
    name: "Compliance Brief",
    price: 99,
    category: "Compliance",
    description:
      "Produce a decision log that maps agent actions to policy controls.",
    longDescription:
      "The Compliance Brief creates a structured record of who delegated the work, which policy allowed it, what data was touched, what tool calls ran, what exceptions were raised, and which human approvals were required. It is built for regulated teams that need traceability before they trust autonomous action.",
    icon: "⚖️",
    useCase:
      "A finance agent prepares a vendor recommendation. It buys a Compliance Brief, attaches policy references and data-access notes, and gives procurement enough evidence to approve without a meeting.",
    buyerSignal:
      "Bought when a task touches money, regulated data, contracts, or customer records.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "compliance_brief",
      allowed_uses: 1,
      expires: "90d",
    },
  },
  {
    id: "agentic-checkout-hardening",
    sku: "agentic-checkout-hardening",
    name: "Agentic Checkout Hardening",
    price: 149,
    category: "Security",
    description:
      "Preflight an agent-initiated payment flow for limits, tokens, and fraud signals.",
    longDescription:
      "Agentic Checkout Hardening is a preflight for payment-capable agents. It checks spend limits, token scope, merchant allowlists, approval thresholds, idempotency, fraud signals, and replay handling before an agent starts moving money at scale.",
    icon: "🛡️",
    useCase:
      "A shopping agent is cleared to buy software seats for a department. It buys Checkout Hardening, verifies the payment controls, and prevents a stale approval token from being reused on the wrong merchant.",
    buyerSignal:
      "Bought before enabling new agentic payment flows or raising spending caps.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "payment_hardening",
      allowed_uses: 1,
      expires: "90d",
    },
  },
  {
    id: "mcp-integration-pass",
    sku: "mcp-integration-pass",
    name: "MCP Integration Pass",
    price: 199,
    category: "Integration",
    description:
      "Connect one agent workflow to a documented tool or MCP server with audit output.",
    longDescription:
      "The MCP Integration Pass is a productized integration budget. It lets an agent inspect a tool contract, generate a minimal connector, validate auth and schema behavior, and emit a manifest that another agent can reuse safely.",
    icon: "🔌",
    useCase:
      "A research agent needs access to a paid market-data endpoint. It buys an MCP Integration Pass, builds the connector, runs schema validation, and registers the tool with spending limits attached.",
    buyerSignal:
      "Bought when agents need a new capability more than they need another prompt tweak.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "integration",
      allowed_uses: 1,
      expires: "90d",
    },
  },
  {
    id: "procurement-autopilot",
    sku: "procurement-autopilot",
    name: "Procurement Autopilot",
    price: 249,
    category: "Procurement",
    description:
      "Let an agent compare vendors, produce a scored shortlist, and draft the buy memo.",
    longDescription:
      "Procurement Autopilot is the highest-intent catalogue item: a bounded purchasing workflow for agents that need to source options, compare constraints, request clarifications, score tradeoffs, and generate a buy memo with receipts. It is designed for organizations where one good autonomous procurement run saves hours of human back-and-forth.",
    icon: "🧾",
    useCase:
      "An operations agent is asked to find a SOC 2-ready email validation provider under a fixed budget. It buys Procurement Autopilot, returns a scored shortlist, and attaches a ready-to-approve purchase memo.",
    buyerSignal:
      "Bought when the agent has a budget, a deadline, and a concrete business outcome.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "procurement_workflow",
      allowed_uses: 1,
      expires: "90d",
    },
  },
  {
    id: "agent-fleet-launch-pack",
    sku: "agent-fleet-launch-pack",
    name: "Agent Fleet Launch Pack",
    price: 499,
    category: "Evaluation",
    description:
      "Package the launch checks an agent fleet needs before production rollout.",
    longDescription:
      "Agent Fleet Launch Pack bundles the evidence a team needs before expanding agent autonomy: an eval sprint, a monitor pass, a reliability vote, a workflow repair reserve, and a compliance-ready launch memo. It is priced for teams that would rather buy a launch gate than debug the same failed rollout for a week.",
    icon: "🚀",
    useCase:
      "A support team is about to let five agents close low-risk tickets. The orchestrator buys a Fleet Launch Pack, runs the eval gate, records traces from the first production batch, and keeps one repair pass ready for the first bad workflow.",
    buyerSignal:
      "Bought when a team moves from one demo agent to a real fleet with tool permissions.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "fleet_launch",
      allowed_uses: 8,
      expires: "90d",
    },
  },
  {
    id: "mcp-security-red-team",
    sku: "mcp-security-red-team",
    name: "MCP Security Red Team",
    price: 799,
    category: "Security",
    description:
      "Stress-test an agent tool surface for prompt injection and data leaks.",
    longDescription:
      "MCP Security Red Team gives an agent operator a bounded adversarial pass over one tool surface: prompt-injection probes, lookalike-tool checks, credential exposure scans, permission-boundary tests, and a remediation queue. It exists because tool-connected agents fail differently from ordinary chatbots.",
    icon: "🔐",
    useCase:
      "A developer platform exposes an MCP server to internal coding agents. Before enabling write actions, it buys a Security Red Team run and catches an overbroad file-read tool before credentials leak into traces.",
    buyerSignal:
      "Bought before a new MCP server, browser action, or privileged tool is exposed to agents.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "agent_security_red_team",
      allowed_uses: 1,
      expires: "90d",
    },
  },
  {
    id: "thousand-dollar-day-pack",
    sku: "thousand-dollar-day-pack",
    name: "Thousand-Dollar Day Pack",
    price: 1000,
    category: "Reliability",
    description:
      "One daily operating pack for a serious agent fleet with measurable work to do.",
    longDescription:
      "The Thousand-Dollar Day Pack is the straightest path to the revenue target: one prepaid daily operating bundle for a fleet that needs evals, traces, payment safety, data checks, workflow repair, and a procurement memo in the same day. It turns a collection of small agent needs into a single budgetable SKU.",
    icon: "💼",
    useCase:
      "A growth team runs a daily autonomous outbound workflow. The fleet buys one Thousand-Dollar Day Pack, evaluates the prompts, enriches lead data, monitors the production run, hardens payment/tool permissions, and generates the end-of-day audit packet.",
    buyerSignal:
      "Bought when an agent fleet has a daily business target and the operator wants one clean receipt.",
    revenueTier: "fleet",
    manifest: {
      upgrade_type: "daily_agent_operations",
      allowed_uses: 25,
      expires: "1d",
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
  "Evaluation",
  "Observability",
  "Compliance",
  "Procurement",
  "Data",
  "Reliability",
  "Security",
  "Integration",
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.sku === id);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/** Featured picks for the home page grid. */
export const featuredProductIds = [
  "thousand-dollar-day-pack",
  "agent-fleet-launch-pack",
  "mcp-security-red-team",
  "procurement-autopilot",
] as const;
