import type { Category } from "@/lib/types";

const categoryStyles: Record<Category, string> = {
  Copywriting: "bg-blue-soft text-blue",
  Research: "bg-lavender-soft text-violet-700",
  Email: "bg-mint-soft text-emerald-700",
  Operations: "bg-coffee-soft text-coffee",
  Data: "bg-blue-soft text-blue",
  "Real Estate": "bg-mint-soft text-emerald-700",
  Strategy: "bg-lavender-soft text-violet-700",
  Utility: "bg-coffee-soft text-coffee",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${categoryStyles[category]}`}
    >
      {category}
    </span>
  );
}
