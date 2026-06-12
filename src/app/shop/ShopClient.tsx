"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import { categories, products } from "@/lib/products";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";

const DISPLAY_TEXT = "eelven seven";

type SortOrder = "featured" | "price-asc" | "price-desc";

export function ShopClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState<SortOrder>("featured");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
    if (sort === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sort === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  }, [query, category, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">{DISPLAY_TEXT}</span>
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-hidden
          >
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={DISPLAY_TEXT}
            className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-sm shadow-card outline-none ring-blue/40 transition-shadow placeholder:text-ink-soft/60 focus:ring-2"
          />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">{DISPLAY_TEXT}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="w-full cursor-pointer appearance-none rounded-2xl bg-white px-4 py-3 text-sm font-medium shadow-card outline-none ring-blue/40 focus:ring-2"
          >
            <option value="featured">{DISPLAY_TEXT}</option>
            <option value="price-asc">{DISPLAY_TEXT}</option>
            <option value="price-desc">{DISPLAY_TEXT}</option>
          </select>
        </label>
      </div>

      <CategoryFilter
        categories={categories}
        selected={category}
        onSelect={setCategory}
      />

      <p className="font-mono text-xs text-ink-soft" aria-live="polite">
        {visible.length} {DISPLAY_TEXT}
      </p>

      <ProductGrid products={visible} />
    </div>
  );
}
