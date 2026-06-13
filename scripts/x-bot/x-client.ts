// Thin wrapper over twitter-api-v2 (OAuth 1.0a user context — tokens don't
// expire, so no refresh handling is needed for an unattended cron).

import { ApiResponseError, TwitterApi } from "twitter-api-v2";
import type { TwitterApiReadWrite } from "twitter-api-v2";
import type { Mention } from "./types.ts";

const CRED_VARS = [
  "X_API_KEY",
  "X_API_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_TOKEN_SECRET",
] as const;

export function hasXCredentials(): boolean {
  return CRED_VARS.every((v) => Boolean(process.env[v]));
}

export function makeClient(): TwitterApiReadWrite {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
  }).readWrite;
}

export async function getBotUserId(client: TwitterApiReadWrite): Promise<string> {
  const me = await client.v2.me();
  return me.data.id;
}

export function isDuplicateError(err: unknown): boolean {
  return (
    err instanceof ApiResponseError &&
    err.code === 403 &&
    /duplicate/i.test(JSON.stringify(err.data ?? {}))
  );
}

export async function postTweet(
  client: TwitterApiReadWrite,
  text: string,
): Promise<{ id: string }> {
  const res = await client.v2.tweet(text);
  return { id: res.data.id };
}

export async function fetchMentions(
  client: TwitterApiReadWrite,
  botUserId: string,
  sinceId: string | null,
): Promise<Mention[]> {
  const paginator = await client.v2.userMentionTimeline(botUserId, {
    max_results: 100,
    ...(sinceId ? { since_id: sinceId } : {}),
    "tweet.fields": ["author_id", "created_at", "conversation_id"],
    expansions: ["author_id"],
    "user.fields": ["username"],
  });

  const users = new Map<string, string>();
  for (const user of paginator.includes?.users ?? []) {
    users.set(user.id, user.username);
  }

  return paginator.tweets.map((tweet) => ({
    id: tweet.id,
    authorUsername: users.get(tweet.author_id ?? "") ?? "unknown",
    text: tweet.text,
    createdAt: tweet.created_at ?? "",
  }));
}
