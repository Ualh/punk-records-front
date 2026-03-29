import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, FileText, Image, FileType, Bold, Italic, List, Code, Send, Zap, CreditCard } from "lucide-react";
import { Layout } from "@/components/Layout";
import { TypingIndicator } from "@/components/TypingIndicator";
import { toast } from "sonner";

interface AgentMsg {
  id: string;
  role: "user" | "agent";
  content: string;
}

export default function Study() {
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMsg[]>([
    { id: "0", role: "agent", content: "I'm ready to help you understand this source. Ask me anything." },
  ]);
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const chatEnd = useRef<HTMLDivElement>(null);

  // Auto-save notes
  useEffect(() => {
    if (!notes) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 3000);
    return () => clearTimeout(saveTimer.current);
  }, [notes]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setSourceLoaded(true);
    toast.success("Source uploaded");
  }, []);

  const sendAgentMessage = () => {
    if (!agentInput.trim()) return;
    const userMsg: AgentMsg = { id: Date.now().toString(), role: "user", content: agentInput };
    setAgentMessages((m) => [...m, userMsg]);
    setAgentInput("");
    setAgentLoading(true);
    setTimeout(() => {
      setAgentMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Based on the source material, this concept relates to how memory consolidation works during sleep. The hippocampus replays recently encoded information, strengthening neural pathways in the neocortex.",
      }]);
      setAgentLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-var(--banner-h,0px))] flex flex-col animate-fade-in">
        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs text-muted-foreground">
            {sourceLoaded ? "Thinking, Fast and Slow — PDF" : "No source loaded"}
          </span>
          <div className="flex gap-2">
            <button onClick={() => toast.info("Analyzing source...")} className="gradient-amber text-primary-foreground px-3 py-1.5 rounded-sm text-[11px] font-medium flex items-center gap-1.5"><Zap className="w-3 h-3" /> Analyze source</button>
            <button onClick={() => toast.success("Cards generated!")} className="bg-muted text-foreground px-3 py-1.5 rounded-sm text-[11px] font-medium flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Generate cards</button>
          </div>
        </div>

        {/* Split panels */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left — Source viewer */}
          <div className="flex-1 lg:w-[55%] p-4 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border">
            {!sourceLoaded ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Drop PDF, image, or paste text here</p>
                <div className="flex gap-3 mt-3">
                  {[{ icon: FileText, label: "PDF" }, { icon: Image, label: "IMG" }, { icon: FileType, label: "TXT" }].map(({ icon: I, label }) => (
                    <span key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground"><I className="w-3 h-3" /> {label}</span>
                  ))}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={() => { setSourceLoaded(true); toast.success("Source uploaded"); }} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-6 min-h-[400px]">
                  <p className="text-xs text-muted-foreground mb-4">PDF Viewer Placeholder</p>
                  <div className="space-y-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-3 bg-surface-light rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <button className="hover:text-foreground">← Prev</button>
                  <span>Page 1 / 24</span>
                  <button className="hover:text-foreground">Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Right — Notes + Agent */}
          <div className="flex-1 lg:w-[45%] flex flex-col overflow-hidden">
            {/* Notes */}
            <div className="flex-1 flex flex-col p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  {[Bold, Italic, List, Code].map((I, i) => (
                    <button key={i} className="p-1.5 rounded-sm hover:bg-muted"><I className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  ))}
                </div>
                {saved && <span className="text-[10px] text-forest animate-fade-in">Saved</span>}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start taking notes... your thoughts will be saved here."
                className="flex-1 bg-transparent resize-none text-xs focus:outline-none placeholder:text-muted-foreground min-h-[120px]"
              />
              <button onClick={() => toast.success("Notes processed — 3 atoms extracted!")} className="self-start mt-2 bg-muted text-foreground px-3 py-1.5 rounded-sm text-[11px] font-medium hover:bg-surface-light transition-colors">
                Process notes
              </button>
            </div>

            {/* Agent Q&A */}
            <div className="flex-1 flex flex-col max-h-[50%]">
              <div className="px-4 py-2 border-b border-border">
                <span className="text-[10px] text-muted-foreground">Ask about this source</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {agentMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-md text-xs ${m.role === "user" ? "bg-secondary text-foreground" : "bg-muted"}`}>
                      {m.role === "agent" && <span className="text-[10px] text-primary font-medium block mb-1">Agent</span>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {agentLoading && <TypingIndicator />}
                <div ref={chatEnd} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAgentMessage())}
                  placeholder="Ask a question..."
                  className="flex-1 bg-muted rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={sendAgentMessage} className="p-2 rounded-sm gradient-amber"><Send className="w-3.5 h-3.5 text-primary-foreground" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
