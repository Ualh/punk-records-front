import { useState, useEffect, useCallback } from "react";
import { CheckCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DEMO_CARDS, Card } from "@/lib/api";
import { TagBadge } from "@/components/TagBadge";
import { useNavigate } from "react-router-dom";

type Phase = "start" | "review" | "complete";

const ratings = [
  { label: "Blackout", key: 1, color: "bg-destructive hover:bg-destructive/80" },
  { label: "Hard", key: 2, color: "bg-primary hover:bg-primary/80" },
  { label: "Good", key: 3, color: "bg-forest hover:bg-forest/80" },
  { label: "Easy", key: 4, color: "bg-blue-600 hover:bg-blue-500" },
];

export default function Review() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("start");
  const [cards] = useState<Card[]>(DEMO_CARDS);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [startTime] = useState(Date.now());

  const flip = useCallback(() => { if (!flipped) setFlipped(true); }, [flipped]);

  const rate = useCallback((r: number) => {
    if (!flipped) return;
    setResults((prev) => [...prev, r]);
    setFlipped(false);
    if (current + 1 >= cards.length) {
      setTimeout(() => setPhase("complete"), 300);
    } else {
      setTimeout(() => setCurrent((c) => c + 1), 300);
    }
  }, [flipped, current, cards.length]);

  useEffect(() => {
    if (phase !== "review") return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); flip(); }
      if (["1", "2", "3", "4"].includes(e.key)) rate(parseInt(e.key));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, flip, rate]);

  const tagBreakdown = cards.reduce<Record<string, number>>((acc, c) => {
    c.tags.forEach((t) => { acc[t] = (acc[t] || 0) + 1; });
    return acc;
  }, {});

  if (phase === "start") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen animate-fade-in">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">You have {cards.length} cards due</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {Object.entries(tagBreakdown).map(([tag, count]) => `${count} ${tag}`).join(" · ")}
            </p>
            <button onClick={() => setPhase("review")} className="gradient-amber text-primary-foreground px-8 py-3 rounded-sm text-sm font-semibold">
              Start Review
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (phase === "complete") {
    const avgRating = results.reduce((a, b) => a + b, 0) / results.length;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen animate-fade-in">
          <div className="text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-forest mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Session complete!</h1>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-6">
              <span>{results.length} reviewed</span>
              <span>Avg: {avgRating.toFixed(1)}</span>
              <span>{elapsed}s</span>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/")} className="bg-muted text-foreground px-4 py-2 rounded-sm text-xs font-medium flex items-center gap-2"><ArrowLeft className="w-3.5 h-3.5" /> Back to Vault</button>
              <button onClick={() => { setCurrent(0); setResults([]); setFlipped(false); setPhase("review"); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-sm text-xs font-medium flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Review again</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const card = cards[current];

  return (
    <Layout>
      <div className="flex flex-col min-h-screen animate-fade-in">
        {/* Progress */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((current + 1) / cards.length) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <span className="text-xs text-muted-foreground mb-6">{current + 1} / {cards.length}</span>

          {/* Flashcard */}
          <div className="flip-card w-full max-w-xl" style={{ height: 320 }} onClick={flip}>
            <div className={`flip-card-inner w-full h-full relative ${flipped ? "flipped" : ""}`}>
              {/* Front */}
              <div className="flip-card-front absolute inset-0 bg-card border border-border rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer">
                <p className="text-base font-semibold text-center leading-relaxed">{card.front}</p>
                <span className="text-[10px] text-muted-foreground mt-6">tap to reveal</span>
              </div>
              {/* Back */}
              <div className="flip-card-back absolute inset-0 bg-card border border-border rounded-lg flex flex-col items-center justify-center p-8">
                <p className="text-sm text-center leading-relaxed">{card.back}</p>
                <div className="mt-4 text-center">
                  <p className="text-[10px] text-muted-foreground">{card.source_title}</p>
                  <p className="text-[10px] text-primary">{card.atom_concept}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          {flipped && (
            <div className="flex gap-3 mt-8 animate-fade-in">
              {ratings.map((r) => (
                <button key={r.key} onClick={() => rate(r.key)} className={`${r.color} text-foreground px-4 py-2 rounded-sm text-xs font-medium transition-colors`}>
                  {r.label} <span className="text-muted-foreground ml-1 text-[10px]">{r.key}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex gap-1.5 mt-6">
            {card.tags.map((t, i) => <TagBadge key={t} tag={t} index={i} />)}
          </div>
        </div>
      </div>
    </Layout>
  );
}
