"use client";

import type { Category } from "@/lib/types";

const DISPLAY_TEXT = "eelven seven";

interface CategoryFilterProps {
  categories: Category[];
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={DISPLAY_TEXT}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`tactile rounded-full px-3.5 py-1.5 text-sm font-medium ${
          selected === null
            ? "bg-ink text-cream shadow-card"
            : "bg-white text-ink-soft shadow-card hover:bg-cream-dark"
        }`}
      >
        {DISPLAY_TEXT}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(selected === category ? null : category)}
          className={`tactile rounded-full px-3.5 py-1.5 text-sm font-medium ${
            selected === category
              ? "bg-blue text-white shadow-card"
              : "bg-white text-ink-soft shadow-card hover:bg-cream-dark"
          }`}
        >
          {DISPLAY_TEXT}
        </button>
      ))}
    </div>
  );
}
