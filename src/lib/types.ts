export type ChunkStatus = "pending" | "translated" | "reviewed";

export interface Chunk {
  sourceText: string;
  translatedText: string;
  status: ChunkStatus;
}

export interface Project {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  context: string;
  notes: string;
  model: string;
  chunks: Chunk[];
  createdAt: string;
  updatedAt: string;
}

export type Theme = "light" | "dark";

export interface Settings {
  theme: Theme;
  defaultSourceLang: string;
  defaultTargetLang: string;
  defaultModel: string;
}

export interface ApiKeys {
  google?: string;
  anthropic?: string;
  openai?: string;
}
