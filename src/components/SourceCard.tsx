import { FileText, StickyNote, Mic, PenTool, Atom, CreditCard } from "lucide-react";
import { Source } from "@/lib/api";
import { TagBadge } from "./TagBadge";

const typeIcons = {
  pdf: FileText,
  note: StickyNote,
  voice: Mic,
  handwritten: PenTool,
};

export function SourceCard({ source, onClick }: { source: Source; onClick: () => void }) {
  const Icon = typeIcons[source.type];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-lg p-4 card-hover cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{source.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {source.author || new Date(source.date_added).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Atom className="w-3 h-3" /> {source.atom_count} atoms
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <CreditCard className="w-3 h-3" /> {source.card_count} cards
        </span>
      </div>

      <div className="flex gap-1.5 mt-3 flex-wrap">
        {source.tags.slice(0, 3).map((tag, i) => (
          <TagBadge key={tag} tag={tag} index={i} />
        ))}
      </div>
    </button>
  );
}
