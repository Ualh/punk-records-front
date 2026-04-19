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
  atom_id?: string;
  source_id?: string;
  front: string;
  back: string;
  source_title?: string;
  atom_concept?: string;
  next_review: string;
  interval: number;
  ease_factor: number;
  repetitions?: number;
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

interface BackendSource {
  id: number;
  title: string;
  type: Source["type"];
  created_at: string;
  atom_count?: number;
  card_count?: number;
  tags?: unknown;
}

interface BackendAtom {
  id: number;
  source_id: number;
  concept: string;
  explanation: string;
  tags?: unknown;
}

interface BackendCard {
  id: number;
  atom_id?: number;
  source_id?: number;
  front: string;
  back: string;
  next_review: string;
  interval: number;
  ease_factor: number;
  repetitions?: number;
  source_title?: string;
  atom_concept?: string;
  tags?: unknown;
}

let apiOnline = false;

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof value === "string") {
    if (!value.trim()) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === "string");
      }
    } catch {
      return [value];
    }
  }

  return [];
};

const mapSource = (source: BackendSource): Source => ({
  id: String(source.id),
  title: source.title,
  type: source.type,
  date_added: source.created_at,
  atom_count: source.atom_count ?? 0,
  card_count: source.card_count ?? 0,
  tags: parseTags(source.tags),
});

const mapAtom = (atom: BackendAtom): Atom => ({
  id: String(atom.id),
  source_id: String(atom.source_id),
  concept: atom.concept,
  explanation: atom.explanation,
  tags: parseTags(atom.tags),
});

const mapCard = (card: BackendCard): Card => ({
  id: String(card.id),
  atom_id: card.atom_id !== undefined ? String(card.atom_id) : undefined,
  source_id: card.source_id !== undefined ? String(card.source_id) : undefined,
  front: card.front,
  back: card.back,
  next_review: card.next_review,
  interval: card.interval,
  ease_factor: card.ease_factor,
  repetitions: card.repetitions,
  source_title: card.source_title ?? "",
  atom_concept: card.atom_concept ?? "",
  tags: parseTags(card.tags),
});

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
  const headers = options?.body instanceof FormData
    ? options.headers
    : {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const getSources = () => apiCall<BackendSource[]>("/sources").then((sources) => sources.map(mapSource));

export const uploadSource = async (formData: FormData) => {
  const response = await fetch(`${BASE_URL}/sources/upload`, { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
};

export const getAtomsBySource = (sourceId: string) =>
  apiCall<BackendAtom[]>(`/atoms?source_id=${encodeURIComponent(sourceId)}`).then((atoms) => atoms.map(mapAtom));

export const searchAtoms = (q: string) =>
  apiCall<BackendAtom[]>(`/search?q=${encodeURIComponent(q)}`).then((atoms) => atoms.map(mapAtom));

export const getCardsBySource = (sourceId: string) =>
  apiCall<BackendCard[]>(`/cards?source_id=${encodeURIComponent(sourceId)}`).then((cards) => cards.map(mapCard));

export const getDueCards = () => apiCall<BackendCard[]>("/cards/due").then((cards) => cards.map(mapCard));

export const reviewCard = (id: string, quality: number) =>
  apiCall<BackendCard>(`/cards/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ quality }),
  }).then(mapCard);

export const chatWithAgent = (message: string, context?: string, searchVault?: boolean) =>
  apiCall<ChatMessage>("/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message, context, search_vault: searchVault }),
  });

export const transcribeAudio = (blob: Blob) => {
  const fd = new FormData();
  fd.append("audio", blob);
  return fetch(`${BASE_URL}/voice/transcribe`, { method: "POST", body: fd }).then((r) => r.json());
};

export const saveVoiceNote = (transcript: string, tags: string[]) =>
  apiCall("/voice/save-note", { method: "POST", body: JSON.stringify({ transcript, tags }) });

export const DEMO_VOICE_NOTES: VoiceNote[] = [
  {
    id: "v1",
    transcript:
      "Had an interesting thought about connecting spaced repetition with knowledge graphs. If each atom is a node and review performance is edge weight, you could identify weak clusters and strengthen them. Need to think more about this.",
    tags: ["SRS", "graphs", "idea"],
    timestamp: "2026-03-27T08:30:00Z",
    duration: 45,
  },
  {
    id: "v2",
    transcript:
      "Reading about memory consolidation during sleep. Key insight: the hippocampus replays experiences during slow-wave sleep, essentially re-training the neocortex. This is why sleep after studying is so important.",
    tags: ["neuroscience", "sleep", "memory"],
    timestamp: "2026-03-26T22:15:00Z",
    duration: 32,
  },
];
