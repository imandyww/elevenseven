// Bot state persistence. The GitHub Actions workflow owns committing the
// state directory to the `x-bot-state` branch; this module only reads/writes
// the JSON file.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BotState } from "./types.ts";

const STATE_FILE = "state.json";

const MAX_RECENT_POSTS = 20;
const MAX_TRIAGED_IDS = 500;
const MAX_ISSUES = 100;

function defaultState(): BotState {
  return {
    botUserId: null,
    lastMentionId: null,
    angleIndex: 0,
    recentPosts: [],
    triagedReplyIds: [],
    issuesCreated: [],
  };
}

export function loadState(stateDir: string): BotState {
  try {
    const raw = readFileSync(join(stateDir, STATE_FILE), "utf8");
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(stateDir: string, state: BotState): void {
  state.recentPosts = state.recentPosts.slice(-MAX_RECENT_POSTS);
  state.triagedReplyIds = state.triagedReplyIds.slice(-MAX_TRIAGED_IDS);
  state.issuesCreated = state.issuesCreated.slice(-MAX_ISSUES);
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(
    join(stateDir, STATE_FILE),
    JSON.stringify(state, null, 2) + "\n",
    "utf8",
  );
}
