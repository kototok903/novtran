import type { ApiKeys, Settings } from "@/lib/types";

const SETTINGS_KEY = "novtran-settings";
const API_KEYS_KEY = "novtran-api-keys";

const DEFAULT_SETTINGS: Settings = {
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light",
  defaultSourceLang: "en",
  defaultTargetLang: "uk",
  defaultModel: "gemini-2.0-flash",
};

export function getSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
