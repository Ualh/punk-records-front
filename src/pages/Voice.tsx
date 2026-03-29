import { useState } from "react";
import { Mic, Square, Volume2, Save, Trash2, Play } from "lucide-react";
import { Layout } from "@/components/Layout";
import { TypingIndicator } from "@/components/TypingIndicator";
import { DEMO_VOICE_NOTES, VoiceNote } from "@/lib/api";
import { TagBadge } from "@/components/TagBadge";
import { toast } from "sonner";

type Mode = "note" | "chat";
type RecordState = "idle" | "recording" | "processing";

interface VoiceChatMsg { id: string; role: "user" | "agent"; content: string; }

export default function Voice() {
  const [mode, setMode] = useState<Mode>("note");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [transcript, setTranscript] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pastNotes] = useState<VoiceNote[]>(DEMO_VOICE_NOTES);
  const [chatMessages, setChatMessages] = useState<VoiceChatMsg[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const toggleRecord = () => {
    if (recordState === "idle") {
      setRecordState("recording");
    } else if (recordState === "recording") {
      setRecordState("processing");
      setTimeout(() => {
        setRecordState("idle");
        if (mode === "note") {
          setTranscript("Had an interesting thought about the relationship between active recall and elaborative encoding. When you force yourself to retrieve information, you're actually creating new connections...");
        } else {
          const userMsg: VoiceChatMsg = { id: Date.now().toString(), role: "user", content: "Tell me about the spacing effect and how it relates to memory consolidation." };
          setChatMessages((m) => [...m, userMsg]);
          setChatLoading(true);
          setTimeout(() => {
            setChatMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: "agent", content: "The spacing effect is deeply connected to memory consolidation. When you space out your learning sessions, you give your hippocampus time to replay and consolidate memories during sleep. Each review session after a delay forces active retrieval, which strengthens the memory trace." }]);
            setChatLoading(false);
          }, 2000);
        }
      }, 1500);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        {/* Mode tabs */}
        <div className="flex bg-muted rounded-md p-1 mb-8">
          {(["note", "chat"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-xs font-medium rounded-sm capitalize transition-colors ${mode === m ? "bg-card text-foreground" : "text-muted-foreground"}`}>
              Voice {m === "note" ? "Note" : "Chat"}
            </button>
          ))}
        </div>

        {/* Chat history (voice chat mode) */}
        {mode === "chat" && chatMessages.length > 0 && (
          <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto">
            {chatMessages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2.5 rounded-md text-xs ${m.role === "user" ? "bg-secondary" : "bg-muted"}`}>
                  {m.role === "agent" && <span className="text-[10px] text-primary font-medium block mb-1">Agent</span>}
                  {m.content}
                  {m.role === "agent" && (
                    <button className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-foreground"><Volume2 className="w-3 h-3" /> Read aloud</button>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && <TypingIndicator />}
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center py-8">
          <button
            onClick={toggleRecord}
            className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all ${
              recordState === "recording" ? "border-destructive pulse-ring bg-destructive/10" :
              recordState === "processing" ? "border-muted-foreground bg-muted" :
              "border-primary bg-primary/5 hover:bg-primary/10"
            }`}
          >
            {recordState === "recording" ? <Square className="w-8 h-8 text-destructive" /> :
             recordState === "processing" ? <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" /> :
             <Mic className="w-8 h-8 text-primary" />}
          </button>
          <span className="text-xs text-muted-foreground mt-3">
            {recordState === "idle" ? "Tap to record" : recordState === "recording" ? "Recording..." : "Transcribing..."}
          </span>

          {/* Waveform */}
          {recordState === "recording" && (
            <div className="flex items-center gap-1 mt-4 h-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-1 bg-primary rounded-full waveform-bar" style={{ animationDelay: `${i * 0.05}s`, height: `${8 + Math.random() * 24}px` }} />
              ))}
            </div>
          )}
        </div>

        {/* Voice Note transcript */}
        {mode === "note" && transcript && (
          <div className="bg-card border border-border rounded-lg p-4 mb-4 animate-fade-in">
            <p className="text-xs leading-relaxed">{transcript}</p>
            <div className="mt-3 flex gap-2 items-center">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Add tags..."
                className="bg-muted rounded-sm px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary w-32"
              />
              <div className="flex gap-1">{tags.map((t, i) => <TagBadge key={t} tag={t} index={i} />)}</div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { toast.success("Note saved to vault"); setTranscript(""); setTags([]); }} className="gradient-amber text-primary-foreground px-3 py-1.5 rounded-sm text-[11px] font-medium flex items-center gap-1.5"><Save className="w-3 h-3" /> Save to Vault</button>
              <button onClick={() => { setTranscript(""); setTags([]); }} className="bg-muted text-muted-foreground px-3 py-1.5 rounded-sm text-[11px] font-medium flex items-center gap-1.5"><Trash2 className="w-3 h-3" /> Discard</button>
            </div>
          </div>
        )}

        {/* Voice Chat end session */}
        {mode === "chat" && chatMessages.length > 0 && (
          <div className="flex justify-center mt-4">
            <button onClick={() => { toast.success("Session saved to vault"); setChatMessages([]); }} className="bg-muted text-foreground px-4 py-2 rounded-sm text-xs font-medium">
              End session & save
            </button>
          </div>
        )}

        {/* Past voice notes */}
        {mode === "note" && (
          <div className="mt-8 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">Past voice notes</h3>
            {pastNotes.map((n) => (
              <div key={n.id} className="bg-card border border-border rounded-md p-3">
                <div className="flex items-start justify-between">
                  <p className="text-xs leading-relaxed flex-1">{n.transcript.slice(0, 120)}...</p>
                  <button className="p-1 hover:bg-muted rounded-sm ml-2"><Play className="w-3 h-3 text-muted-foreground" /></button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleDateString()} · {n.duration}s</span>
                  <div className="flex gap-1">{n.tags.map((t, i) => <TagBadge key={t} tag={t} index={i} />)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
