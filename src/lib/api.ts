const BASE_URL = "http://localhost:8000";

export interface Source {
  id: string;
  title: string;
  type: "pdf" | "note" | "voice" | "handwritten";
  author?: string;
  date_added: string;
  atom_count: number;
  card_count: number;
  tags: string[];
}

export interface Atom {
  id: string;
  concept: string;
  explanation: string;
  tags: string[];
  source_id: string;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  source_title: string;
  atom_concept: string;
  next_review: string;
  interval: number;
  ease_factor: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  citations?: { title: string; id: string }[];
  timestamp: string;
}

export interface VoiceNote {
  id: string;
  transcript: string;
  tags: string[];
  timestamp: string;
  duration: number;
}

let apiOnline = false;

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    apiOnline = res.ok;
    return res.ok;
  } catch {
    apiOnline = false;
    return false;
  }
};

export const isApiOnline = () => apiOnline;

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const getSources = () => apiCall<Source[]>("/sources");
export const uploadSource = (formData: FormData) =>
  fetch(`${BASE_URL}/sources/upload`, { method: "POST", body: formData }).then(r => r.json());
export const getDueCards = () => apiCall<{ cards: Card[]; count: number }>("/cards/due");
export const reviewCard = (id: string, rating: number) =>
  apiCall(`/cards/${id}/review`, { method: "POST", body: JSON.stringify({ rating }) });
export const chatWithAgent = (message: string, context?: string, searchVault?: boolean) =>
  apiCall<ChatMessage>("/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message, context, search_vault: searchVault }),
  });
export const transcribeAudio = (blob: Blob) => {
  const fd = new FormData();
  fd.append("audio", blob);
  return fetch(`${BASE_URL}/voice/transcribe`, { method: "POST", body: fd }).then(r => r.json());
};
export const saveVoiceNote = (transcript: string, tags: string[]) =>
  apiCall("/voice/save-note", { method: "POST", body: JSON.stringify({ transcript, tags }) });

// Placeholder data
export const DEMO_SOURCES: Source[] = [
  { id: "1", title: "Thinking, Fast and Slow", type: "pdf", author: "Daniel Kahneman", date_added: "2026-03-15", atom_count: 24, card_count: 18, tags: ["cognition", "decision-making", "psychology"] },
  { id: "2", title: "The Neuroscience of Memory Consolidation", type: "pdf", author: "L. Squire et al.", date_added: "2026-03-20", atom_count: 15, card_count: 12, tags: ["neuroscience", "memory", "sleep"] },
  { id: "3", title: "Notes on Spaced Repetition Systems", type: "note", date_added: "2026-03-22", atom_count: 8, card_count: 6, tags: ["learning", "SRS", "memory"] },
  { id: "4", title: "Ideas for Knowledge Graph Architecture", type: "note", date_added: "2026-03-25", atom_count: 5, card_count: 3, tags: ["architecture", "graphs", "AI"] },
  { id: "5", title: "Morning Reflection — Flow States", type: "voice", date_added: "2026-03-27", atom_count: 3, card_count: 2, tags: ["flow", "productivity", "reflection"] },
  { id: "6", title: "Sketch: Dual Process Theory Diagram", type: "handwritten", date_added: "2026-03-28", atom_count: 4, card_count: 4, tags: ["cognition", "dual-process", "diagram"] },
];

export const DEMO_CARDS: Card[] = [
  { id: "c1", front: "What are System 1 and System 2 in Kahneman's framework?", back: "System 1 is fast, automatic, intuitive thinking. System 2 is slow, deliberate, analytical thinking. Most of our daily decisions use System 1.", source_title: "Thinking, Fast and Slow", atom_concept: "Dual Process Theory", next_review: "2026-03-29", interval: 1, ease_factor: 2.5, tags: ["cognition"] },
  { id: "c2", front: "What is memory consolidation?", back: "The process by which short-term memories are stabilized into long-term memories, primarily occurring during sleep through hippocampal replay.", source_title: "The Neuroscience of Memory Consolidation", atom_concept: "Memory Consolidation", next_review: "2026-03-29", interval: 3, ease_factor: 2.3, tags: ["neuroscience", "memory"] },
  { id: "c3", front: "What is the spacing effect?", back: "Learning is more effective when study sessions are spaced out over time rather than massed together. This is the foundational principle behind spaced repetition systems.", source_title: "Notes on Spaced Repetition Systems", atom_concept: "Spacing Effect", next_review: "2026-03-29", interval: 1, ease_factor: 2.5, tags: ["learning"] },
  { id: "c4", front: "What is the anchoring bias?", back: "A cognitive bias where people rely too heavily on the first piece of information (the 'anchor') when making decisions, even if the anchor is irrelevant.", source_title: "Thinking, Fast and Slow", atom_concept: "Anchoring Bias", next_review: "2026-03-29", interval: 2, ease_factor: 2.1, tags: ["cognition", "decision-making"] },
  { id: "c5", front: "What role does the hippocampus play in memory?", back: "The hippocampus acts as a temporary store for new memories and facilitates their transfer to the neocortex for long-term storage during sleep.", source_title: "The Neuroscience of Memory Consolidation", atom_concept: "Hippocampal Function", next_review: "2026-03-29", interval: 5, ease_factor: 2.6, tags: ["neuroscience"] },
  { id: "c6", front: "What is the optimal interval growth factor in SM-2?", back: "The SM-2 algorithm uses an ease factor (typically starting at 2.5) to multiply the previous interval. After a correct review: new_interval = old_interval × ease_factor.", source_title: "Notes on Spaced Repetition Systems", atom_concept: "SM-2 Algorithm", next_review: "2026-03-29", interval: 1, ease_factor: 2.5, tags: ["SRS", "learning"] },
  { id: "c7", front: "What is a knowledge graph?", back: "A data structure that represents knowledge as a network of entities (nodes) and their relationships (edges), enabling semantic queries and reasoning across connected information.", source_title: "Ideas for Knowledge Graph Architecture", atom_concept: "Knowledge Graphs", next_review: "2026-03-29", interval: 4, ease_factor: 2.4, tags: ["architecture", "graphs"] },
  { id: "c8", front: "What are the three conditions for entering a flow state?", back: "1) Clear goals, 2) Immediate feedback, 3) A balance between perceived challenge and perceived skill level.", source_title: "Morning Reflection — Flow States", atom_concept: "Flow Conditions", next_review: "2026-03-29", interval: 2, ease_factor: 2.5, tags: ["flow", "productivity"] },
];

export const DEMO_VOICE_NOTES: VoiceNote[] = [
  { id: "v1", transcript: "Had an interesting thought about connecting spaced repetition with knowledge graphs. If each atom is a node and review performance is edge weight, you could identify weak clusters and strengthen them. Need to think more about this.", tags: ["SRS", "graphs", "idea"], timestamp: "2026-03-27T08:30:00Z", duration: 45 },
  { id: "v2", transcript: "Reading about memory consolidation during sleep. Key insight: the hippocampus replays experiences during slow-wave sleep, essentially re-training the neocortex. This is why sleep after studying is so important.", tags: ["neuroscience", "sleep", "memory"], timestamp: "2026-03-26T22:15:00Z", duration: 32 },
];
