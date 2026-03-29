import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Search, Copy, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { TypingIndicator } from "@/components/TypingIndicator";
import { toast } from "sonner";

interface Msg {
  id: string;
  role: "user" | "agent";
  content: string;
  citations?: { title: string; id: string }[];
}

const suggestedPrompts = [
  "What do I know about memory consolidation?",
  "Quiz me on my weakest cards",
  "Summarize everything I've learned this week",
  "Connect these two ideas: spacing effect and sleep",
  "Create 5 flashcards about cognitive biases",
];

export default function Agent() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchVault, setSearchVault] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg: Msg = { id: Date.now().toString(), role: "user", content: msg };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    setTimeout(() => {
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Based on your vault, memory consolidation is the process where short-term memories are stabilized into long-term ones. Your notes from 'The Neuroscience of Memory Consolidation' highlight the hippocampal replay during sleep as the key mechanism. You also noted connections to spaced repetition — each review session essentially triggers a mini-consolidation event.",
        citations: [
          { title: "The Neuroscience of Memory Consolidation", id: "2" },
          { title: "Notes on Spaced Repetition Systems", id: "3" },
        ],
      }]);
      setLoading(false);
    }, 2000);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen animate-fade-in">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto">
              <h2 className="text-lg font-bold mb-2">Ask your second brain</h2>
              <p className="text-xs text-muted-foreground mb-6 text-center">Chat with an AI agent grounded in your knowledge vault.</p>
              <div className="space-y-2 w-full">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="w-full text-left bg-card border border-border rounded-md px-4 py-3 text-xs hover:border-primary/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-lg text-xs leading-relaxed ${m.role === "user" ? "bg-cocoa text-cocoa-foreground" : "bg-card border border-border"}`}>
                    {m.content}
                    {m.citations && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {m.citations.map((c) => (
                          <span key={c.id} className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm text-[10px] cursor-pointer hover:bg-primary/20">
                            [{c.title}]
                          </span>
                        ))}
                      </div>
                    )}
                    {m.role === "agent" && (
                      <button onClick={() => copyMessage(m.id, m.content)} className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                        {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === m.id ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEnd} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-4">
          <div className="max-w-2xl mx-auto flex items-end gap-2">
            <button className="p-2 hover:bg-muted rounded-sm shrink-0"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask anything..."
                rows={1}
                className="w-full bg-muted rounded-md px-4 py-2.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => { setSearchVault(!searchVault); toast.info(searchVault ? "General knowledge mode" : "Vault search mode"); }}
              className={`p-2 rounded-sm shrink-0 transition-colors ${searchVault ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              title={searchVault ? "Searching vault" : "General knowledge"}
            >
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => sendMessage()} className="p-2.5 rounded-sm gradient-amber shrink-0"><Send className="w-4 h-4 text-primary-foreground" /></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
