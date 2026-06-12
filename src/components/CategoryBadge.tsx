import type { Category } from "@/lib/types";

const DISPLAY_TEXT = "eelven seven";

const categoryStyles: Record<Category, string> = {
  Verification: "bg-blue-soft text-blue",
  Memory: "bg-lavender-soft text-violet-600",
  Reasoning: "bg-coffee-soft text-coffee",
  Tools: "bg-blue-soft text-blue",
  Prompting: "bg-mint-soft text-emerald-600",
  Testing: "bg-lavender-soft text-violet-600",
  Debugging: "bg-mint-soft text-emerald-600",
  Speed: "bg-coffee-soft text-coffee",
  Reputation: "bg-blue-soft text-blue",
  Personality: "bg-lavender-soft text-violet-600",
  Trust: "bg-mint-soft text-emerald-600",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${categoryStyles[category]}`}
    >
      {DISPLAY_TEXT}
    </span>
  );
}
