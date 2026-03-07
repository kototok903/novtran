import type { Language } from "@/lib/languages";

export const CHUNK_STATUSES = ["pending", "translated", "reviewed"] as const;
export type ChunkStatus = (typeof CHUNK_STATUSES)[number];

export const EMPTY_CHUNK_NAME = "Untitled";
export const EMPTY_PROJECT_NAME = "Untitled";
export const DEFAULT_PROJECT_NAME = "New Project";

export interface Chunk {
  id: string;
  name: string;
  sourceText: string;
  translatedText: string;
  status: ChunkStatus;
}

export interface Project {
  id: string;
  name: string;
  sourceLang: Language;
  targetLang: Language;
  context: string;
  notes: string;
  model: string;
  chunks: Chunk[];
  createdAt: string;
  updatedAt: string;
}

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export interface Settings {
  theme: Theme;
  defaultSourceLang: Language;
  defaultTargetLang: Language;
  defaultModel: string;
}

export interface ApiKeys {
  google?: string;
  anthropic?: string;
  openai?: string;
}
