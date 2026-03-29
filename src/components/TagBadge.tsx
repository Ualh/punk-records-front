import { cn } from "@/lib/utils";

const tagColors = [
  "bg-primary/15 text-primary",
  "bg-forest/15 text-forest-foreground",
  "bg-cocoa/20 text-cocoa-foreground",
];

export function TagBadge({ tag, index = 0 }: { tag: string; index?: number }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-medium", tagColors[index % tagColors.length])}>
      {tag}
    </span>
  );
}
