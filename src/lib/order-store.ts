import type { Order } from "./types";

const STORAGE_KEY = "agent-dollar-store-last-order";

// Last completed order, mirrored in sessionStorage so the success page
// survives a refresh. Read via useSyncExternalStore (see success page).
let cached: Order | null | undefined;
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLastOrder(): Order | null {
  if (cached === undefined) {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      cached = raw ? (JSON.parse(raw) as Order) : null;
    } catch {
      cached = null;
    }
  }
  return cached;
}

export function getServerLastOrder(): null {
  return null;
}

export function setLastOrder(order: Order): void {
  cached = order;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // Storage unavailable — the in-memory copy still serves this session.
  }
  listeners.forEach((listener) => listener());
}
