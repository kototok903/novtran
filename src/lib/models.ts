export const MODEL_PROVIDERS = ["google", "anthropic", "openai"] as const;
export type ModelProvider = (typeof MODEL_PROVIDERS)[number];

export const MODEL_PROVIDER_LABELS: Record<ModelProvider, string> = {
  google: "Google",
  anthropic: "Anthropic",
  openai: "OpenAI",
};

export const DEFAULT_MODEL = "gemini-3-flash-preview";

export const MODEL_GROUPS = [
  {
    provider: "google",
    label: MODEL_PROVIDER_LABELS.google,
    models: [
      "gemini-3.1-pro-preview",
      "gemini-3-flash-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ],
  },
  {
    provider: "anthropic",
    label: MODEL_PROVIDER_LABELS.anthropic,
    models: [
      "claude-opus-4-6",
      "claude-opus-4-5-20251101",
      "claude-sonnet-4-6",
      "claude-sonnet-4-5-20250929",
      "claude-sonnet-4-20250514",
      "claude-haiku-4-5-20251001",
    ],
  },
  {
    provider: "openai",
    label: MODEL_PROVIDER_LABELS.openai,
    models: [
      "gpt-5.4",
      "gpt-5.3-instant",
      "gpt-5.3-codex",
      "gpt-5.2",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "gpt-4o",
      "gpt-4o-mini",
    ],
  },
] as const;

export const MODEL_LABELS: Record<string, string> = {
  "gemini-3.1-pro-preview": "Gemini 3.1 Pro",
  "gemini-3-flash-preview": "Gemini 3 Flash",
  "gemini-3.1-flash-lite-preview": "Gemini 3.1 Flash Lite",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "claude-opus-4-6": "Claude Opus 4.6",
  "claude-opus-4-5-20251101": "Claude Opus 4.5",
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "claude-sonnet-4-5-20250929": "Claude Sonnet 4.5",
  "claude-sonnet-4-20250514": "Claude Sonnet 4",
  "claude-haiku-4-5-20251001": "Claude Haiku 4.5",
  "gpt-5.4": "GPT-5.4",
  "gpt-5.3-instant": "GPT-5.3 Instant",
  "gpt-5.3-codex": "GPT-5.3 Codex",
  "gpt-5.2": "GPT-5.2",
  "gpt-5": "GPT-5",
  "gpt-5-mini": "GPT-5 Mini",
  "gpt-5-nano": "GPT-5 Nano",
  "gpt-4.1": "GPT-4.1",
  "gpt-4.1-mini": "GPT-4.1 Mini",
  "gpt-4.1-nano": "GPT-4.1 Nano",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
};

export const MODEL_PROVIDER_BY_ID: Record<string, ModelProvider> =
  Object.fromEntries(
    MODEL_GROUPS.flatMap((group) =>
      group.models.map((model) => [model, group.provider])
    )
  ) as Record<string, ModelProvider>;

export function getModelLabel(model: string): string {
  return MODEL_LABELS[model] ?? model;
}

export function getModelProvider(model: string): ModelProvider | null {
  const exactMatch = MODEL_PROVIDER_BY_ID[model];
  if (exactMatch) return exactMatch;

  const normalized = model.trim().toLowerCase();
  if (normalized.startsWith("gemini-")) return "google";
  if (normalized.startsWith("claude-")) return "anthropic";
  if (
    normalized.startsWith("gpt-") ||
    normalized.startsWith("o1") ||
    normalized.startsWith("o3") ||
    normalized.startsWith("o4")
  ) {
    return "openai";
  }

  return null;
}
