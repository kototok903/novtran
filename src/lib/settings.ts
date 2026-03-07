import type { ApiKeys, Settings } from "@/lib/types";
import { DEFAULT_MODEL } from "@/lib/models";
import { readLanguage } from "@/lib/languages";

const SETTINGS_KEY = "novtran-settings";
const API_KEYS_KEY = "novtran-api-keys";

export const DEFAULT_SETTINGS: Settings = {
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light",
  defaultSourceLang: "en",
  defaultTargetLang: "uk",
  defaultModel: DEFAULT_MODEL,
};

export function getSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  const parsed = JSON.parse(raw) as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    defaultSourceLang: readLanguage(
      parsed.defaultSourceLang,
      DEFAULT_SETTINGS.defaultSourceLang
    ),
    defaultTargetLang: readLanguage(
      parsed.defaultTargetLang,
      DEFAULT_SETTINGS.defaultTargetLang
    ),
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getApiKeys(): ApiKeys {
  const raw = localStorage.getItem(API_KEYS_KEY);
  if (!raw) return {};
  return JSON.parse(raw);
}

export function getApiKey(provider: keyof ApiKeys): string | undefined {
  return getApiKeys()[provider];
}

export function saveApiKey(provider: keyof ApiKeys, key: string): void {
  const keys = getApiKeys();
  keys[provider] = key;
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
}

export function saveApiKeys(keys: ApiKeys): void {
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
}
