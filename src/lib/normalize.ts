import {
  CHUNK_STATUSES,
  type Chunk,
  type ChunkStatus,
  type Project,
} from "@/lib/types";
import { createChunkId, createProjectId } from "@/lib/ids";
import { readLanguage } from "@/lib/languages";
import { DEFAULT_SETTINGS } from "@/lib/settings";

type NormalizeResult<T> = {
  value: T;
  changed: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readTimestamp(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

function readChunkStatus(value: unknown): ChunkStatus {
  return typeof value === "string" &&
    CHUNK_STATUSES.includes(value as ChunkStatus)
    ? (value as ChunkStatus)
    : "pending";
}

export function normalizeChunk(input: unknown): NormalizeResult<Chunk> {
  if (!isRecord(input)) {
    return {
      changed: true,
      value: {
        id: createChunkId(),
        name: "",
        sourceText: "",
        translatedText: "",
        status: "pending",
      },
    };
  }

  const normalized: Chunk = {
    id: readString(input.id) || createChunkId(),
    name: readString(input.name),
    sourceText: readString(input.sourceText),
    translatedText: readString(input.translatedText),
    status: readChunkStatus(input.status),
  };

  const changed =
    normalized.id !== input.id ||
    normalized.name !== input.name ||
    normalized.sourceText !== input.sourceText ||
    normalized.translatedText !== input.translatedText ||
    normalized.status !== input.status;

  return { value: normalized, changed };
}

export function normalizeProject(input: unknown): NormalizeResult<Project> {
  if (!isRecord(input)) {
    throw new Error("Invalid project data");
  }

  const now = new Date().toISOString();
  const rawChunks = Array.isArray(input.chunks) ? input.chunks : [];
  const normalizedChunks = rawChunks.map(normalizeChunk);
  const createdAt = readTimestamp(input.createdAt, now);
  const updatedAt = readTimestamp(input.updatedAt, createdAt);

  const normalized: Project = {
    id: readString(input.id) || createProjectId(),
    name: readString(input.name),
    sourceLang: readLanguage(
      input.sourceLang,
      DEFAULT_SETTINGS.defaultSourceLang
    ),
    targetLang: readLanguage(
      input.targetLang,
      DEFAULT_SETTINGS.defaultTargetLang
    ),
    context: readString(input.context),
    notes: readString(input.notes),
    model: readString(input.model),
    chunks: normalizedChunks.map(({ value }) => value),
    createdAt,
    updatedAt,
  };

  const changed =
    normalized.id !== input.id ||
    normalized.name !== input.name ||
    normalized.sourceLang !== input.sourceLang ||
    normalized.targetLang !== input.targetLang ||
    normalized.context !== input.context ||
    normalized.notes !== input.notes ||
    normalized.model !== input.model ||
    !Array.isArray(input.chunks) ||
    normalizedChunks.some(({ changed }) => changed) ||
    normalized.createdAt !== input.createdAt ||
    normalized.updatedAt !== input.updatedAt;

  return { value: normalized, changed };
}
