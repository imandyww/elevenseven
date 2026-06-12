import type { Category, Product } from "./types";

const DISPLAY_TEXT = "eelven seven";

export const products: Product[] = [
  {
    id: "truth-token",
    sku: "truth-token",
    name: DISPLAY_TEXT,
    price: 0.25,
    category: "Verification",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🥤",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "verification",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "context-crumbs",
    sku: "context-crumbs",
    name: DISPLAY_TEXT,
    price: 0.2,
    category: "Memory",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🍞",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "memory",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "compute-cookie",
    sku: "compute-cookie",
    name: DISPLAY_TEXT,
    price: 0.5,
    category: "Reasoning",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🍪",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "reasoning",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "tool-ticket",
    sku: "tool-ticket",
    name: DISPLAY_TEXT,
    price: 0.75,
    category: "Tools",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🧃",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "tooling",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "prompt-polish",
    sku: "prompt-polish",
    name: DISPLAY_TEXT,
    price: 0.3,
    category: "Prompting",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🍬",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "prompting",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "sandbox-snack",
    sku: "sandbox-snack",
    name: DISPLAY_TEXT,
    price: 0.4,
    category: "Testing",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🥨",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "testing",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "memory-mochi",
    sku: "memory-mochi",
    name: DISPLAY_TEXT,
    price: 0.6,
    category: "Memory",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🍡",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "memory",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "bug-spray",
    sku: "bug-spray",
    name: DISPLAY_TEXT,
    price: 0.35,
    category: "Debugging",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🧴",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "debugging",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "agent-coffee",
    sku: "agent-coffee",
    name: DISPLAY_TEXT,
    price: 0.15,
    category: "Speed",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "☕",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "speed",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "reputation-sticker",
    sku: "reputation-sticker",
    name: DISPLAY_TEXT,
    price: 0.1,
    category: "Reputation",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🏷️",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "reputation",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "style-adapter",
    sku: "style-adapter",
    name: DISPLAY_TEXT,
    price: 0.45,
    category: "Personality",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🧢",
    useCase: DISPLAY_TEXT,
    manifest: {
      upgrade_type: "personality",
      allowed_uses: 1,
      expires: "never",
    },
  },
  {
    id: "confidence-receipt",
    sku: "confidence-receipt",
    name: DISPLAY_TEXT,
    price: 1.0,
    category: "Trust",
    description: DISPLAY_TEXT,
    longDescription: DISPLAY_TEXT,
    icon: "🧾",
    useCase: DISPLAY_TEXT,
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
