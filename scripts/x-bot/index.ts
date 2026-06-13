// Orchestrator for the X marketing + feedback bot.
// Usage: node scripts/x-bot/index.ts
// Env: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET,
//      ANTHROPIC_API_KEY, GH_TOKEN (for `gh issue create`),
//      DRY_RUN=true to compose without posting or filing issues,
//      STATE_DIR (default .x-bot-state).
//
// The post step and the feedback step are isolated: one failing never blocks
// the other. A non-zero exit makes the Actions run red — that is the alert.

import Anthropic from "@anthropic-ai/sdk";
import { composeTweet, fetchCatalogExcerpt } from "./compose.ts";
import { fileIssues, triageMentions } from "./feedback.ts";
import { loadState, saveState } from "./state.ts";
import { ANGLES, fallbackTweet } from "./templates.ts";
import {
  fetchMentions,
  getBotUserId,
  hasXCredentials,
  isDuplicateError,
  makeClient,
  postTweet,
} from "./x-client.ts";

async function main(): Promise<void> {
  const dryRun = process.env.DRY_RUN === "true";
  const stateDir = process.env.STATE_DIR ?? ".x-bot-state";
  const runIso = new Date().toISOString();

  const state = loadState(stateDir);
  const anthropic = new Anthropic();
  const xCreds = hasXCredentials();
  const x = xCreds ? makeClient() : null;

  let postFailed = false;
  let feedbackFailed = false;

  // ---- (a) compose + publish ----
  try {
    const angle = ANGLES[state.angleIndex % ANGLES.length];
    const catalog = await fetchCatalogExcerpt();
    const recentTexts = state.recentPosts.map((p) => p.text);

    let text: string;
    try {
      text = await composeTweet(anthropic, angle, catalog, recentTexts);
    } catch (err) {
      console.warn(`compose failed (${(err as Error).message}); using fallback template`);
      text = fallbackTweet(angle, runIso);
    }

    if (dryRun) {
      console.log(`[dry-run] angle=${angle} would post:\n${text}`);
    } else if (!x) {
      console.log("no X credentials; skipping post step");
    } else {
      let posted: { id: string };
      try {
        posted = await postTweet(x, text);
      } catch (err) {
        if (!isDuplicateError(err)) throw err;
        console.warn("duplicate tweet rejected; retrying once with fallback template");
        text = fallbackTweet(angle, runIso);
        posted = await postTweet(x, text);
      }
      console.log(`posted tweet ${posted.id} (angle=${angle})`);
      state.recentPosts.push({ id: posted.id, angle, text, postedAt: runIso });
    }
    state.angleIndex += 1;
  } catch (err) {
    console.error("post step failed:", err);
    postFailed = true;
  }

  // ---- (b) feedback triage (runs even if the post step failed) ----
  try {
    if (!x) {
      console.log("no X credentials; skipping feedback step");
    } else {
      state.botUserId ??= await getBotUserId(x);
      const mentions = await fetchMentions(x, state.botUserId, state.lastMentionId);
      console.log(`fetched ${mentions.length} new mention(s)`);

      const fresh = mentions.filter((m) => !state.triagedReplyIds.includes(m.id));
      const items = await triageMentions(anthropic, fresh);
      const created = fileIssues(items, new Set(state.triagedReplyIds), dryRun);

      if (!dryRun && mentions.length > 0) {
        state.lastMentionId = mentions
          .map((m) => m.id)
          .reduce((a, b) => (BigInt(a) > BigInt(b) ? a : b));
        state.triagedReplyIds.push(...fresh.map((m) => m.id));
        state.issuesCreated.push(...created);
      }
    }
  } catch (err) {
    console.error("feedback step failed:", err);
    feedbackFailed = true;
  }

  if (!dryRun) saveState(stateDir, state);

  if (postFailed || feedbackFailed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
