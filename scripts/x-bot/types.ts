// Shared types for the X marketing + feedback bot.
// Self-contained (no "@/*" imports) so plain `node` can run it.

export type Angle =
  | "product-spotlight"
  | "agent-api-howto"
  | "audit-receipts"
  | "wallet-bundles"
  | "agents-pitch"
  | "discovery-endpoints";

export interface RecentPost {
  id: string;
  angle: Angle;
  text: string;
  postedAt: string;
}

export interface BotState {
  botUserId: string | null;
  lastMentionId: string | null;
  angleIndex: number;
  recentPosts: RecentPost[];
  triagedReplyIds: string[];
  issuesCreated: { replyId: string; issueNumber: number }[];
}

export interface Mention {
  id: string;
  authorUsername: string;
  text: string;
  createdAt: string;
}

export type TriageCategory =
  | "feature_request"
  | "bug_report"
  | "question"
  | "spam"
  | "other";

export interface TriageItem {
  tweetId: string;
  category: TriageCategory;
  summary: string;
  issueTitle: string | null;
  issueBody: string | null;
}

export interface CatalogProduct {
  sku: string;
  name: string;
  price: number;
  category: string;
  pitch: string;
}
