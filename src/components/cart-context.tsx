"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";
import { getProduct } from "@/lib/products";
import * as cartStore from "@/lib/cart-store";

interface CartContextValue {
  items: CartItem[];
  /** False during SSR/hydration, true once the client cart is live. */
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const getHydrated = () => true;
const getServerHydrated = () => false;

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const ready = useSyncExternalStore(
    cartStore.subscribe,
    getHydrated,
    getServerHydrated,
  );

  const value = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) continue;
      count += item.quantity;
      subtotal += product.price * item.quantity;
    }
    return {
      items,
      ready,
      count,
      subtotal: Math.round(subtotal * 100) / 100,
      addItem: cartStore.addItem,
      setQuantity: cartStore.setQuantity,
      removeItem: cartStore.removeItem,
      clear: cartStore.clear,
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
