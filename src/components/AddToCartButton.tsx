"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-context";

interface AddToCartButtonProps {
  productId: string;
  size?: "sm" | "lg";
  label?: string;
}

export function AddToCartButton({
  productId,
  size = "sm",
  label,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleClick = () => {
    addItem(productId);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  };

  const sizeClasses =
    size === "lg"
      ? "px-6 py-3 text-base rounded-2xl"
      : "px-3.5 py-1.5 text-sm rounded-xl";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`tactile font-semibold shadow-card ${sizeClasses} ${
        added
          ? "bg-mint text-ink"
          : "bg-ink text-cream hover:bg-blue hover:text-white"
      }`}
    >
      {added ? "Added" : label ?? (size === "lg" ? "Add to cart" : "Buy")}
    </button>
  );
}
