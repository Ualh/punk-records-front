import { useState } from "react";
import { Search, Filter, Upload, StickyNote, X, Atom, CreditCard, Calendar, FileText, Mic, PenTool } from "lucide-react";
import { DEMO_SOURCES, Source } from "@/lib/api";
import { SourceCard } from "@/components/SourceCard";
import { TagBadge } from "@/components/TagBadge";
import { Layout } from "@/components/Layout";

const filters = ["All", "PDF", "Note", "Voice", "Handwritten"] as const;
type FilterType = typeof filters[number];

const typeIcons = { pdf: FileText, note: StickyNote, voice: Mic, handwritten: PenTool };

function SourceDetail({ source, onClose }: { source: Source; onClose: () => void }) {
  const [tab, setTab] = useState<"atoms" | "cards" | "notes">("atoms");
  const Icon = typeIcons[source.type];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">{source.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {source.author && `${source.author} · `}Added {new Date(source.date_added).toLocaleDateString()}
                </p>
                <div className="flex gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Atom className="w-3 h-3" /> {source.atom_count}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><CreditCard className="w-3 h-3" /> {source.card_count}</span>
                </div>
                <div className="flex gap-1.5 mt-2">{source.tags.map((t, i) => <TagBadge key={t} tag={t} index={i} />)}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["atoms", "cards", "notes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {tab === "atoms" && Array.from({ length: source.atom_count }, (_, i) => (
            <div key={i} className="p-3 bg-muted rounded-md">
              <p className="text-xs font-semibold">Concept {i + 1}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Extracted concept explanation placeholder for this atom.</p>
            </div>
          )).slice(0, 6)}
          {tab === "cards" && Array.from({ length: source.card_count }, (_, i) => (
            <div key={i} className="p-3 bg-muted rounded-md">
              <p className="text-xs font-semibold">Q: Sample question {i + 1}?</p>
              <p className="text-[11px] text-muted-foreground mt-1">A: Sample answer for this flashcard.</p>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Next review: Apr {i + 1}</p>
            </div>
          )).slice(0, 6)}
          {tab === "notes" && (
            <p className="text-xs text-muted-foreground">No study notes yet. Open this source in the Study workspace to start taking notes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Vault() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [selected, setSelected] = useState<Source | null>(null);

  const filtered = DEMO_SOURCES.filter((s) => {
    if (filter !== "All" && s.type !== filter.toLowerCase()) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold">Vault</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sources and atoms..."
              className="w-full bg-muted rounded-sm pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {f === "All" && <Filter className="w-3 h-3 inline mr-1" />}
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <SourceCard key={s.id} source={s} onClick={() => setSelected(s)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-muted-foreground mb-4">Your vault is empty. Upload a PDF or write a note to get started.</p>
            <div className="flex gap-3">
              <button className="gradient-amber text-primary-foreground px-4 py-2 rounded-sm text-xs font-medium flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Upload PDF</button>
              <button className="bg-muted text-foreground px-4 py-2 rounded-sm text-xs font-medium flex items-center gap-2"><StickyNote className="w-3.5 h-3.5" /> Write a note</button>
            </div>
          </div>
        )}
      </div>

      {selected && <SourceDetail source={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
