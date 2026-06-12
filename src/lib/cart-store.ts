import { getProduct } from "./products";
import type { CartItem } from "./types";

const STORAGE_KEY = "agent-dollar-store-cart";
const EMPTY: CartItem[] = [];
const MAX_QTY = 99;

// Module-level cart state, hydrated lazily from localStorage on the client.
// Consumed via useSyncExternalStore so SSR renders an empty cart and the
// client re-renders with the real one after hydration — no mismatch warnings.
let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

function update(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — cart still works in memory.
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): CartItem[] {
  if (items === null) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
      items = parsed.filter(
        (i) =>
          getProduct(i.productId) &&
          Number.isInteger(i.quantity) &&
          i.quantity > 0,
      );
    } catch {
      items = EMPTY;
    }
  }
  return items;
}

export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function addItem(productId: string, quantity = 1): void {
  const current = getSnapshot();
  const existing = current.find((i) => i.productId === productId);
  update(
    existing
      ? current.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
            : i,
        )
      : [...current, { productId, quantity }],
  );
}

export function setQuantity(productId: string, quantity: number): void {
  const current = getSnapshot();
  update(
    quantity <= 0
      ? current.filter((i) => i.productId !== productId)
      : current.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(MAX_QTY, quantity) }
            : i,
        ),
  );
}

export function removeItem(productId: string): void {
  update(getSnapshot().filter((i) => i.productId !== productId));
}

export function clear(): void {
  update([]);
}
