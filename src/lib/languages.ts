export const LANGUAGES = [
  "zh",
  "ru",
  "uk",
  "en",
  "ja",
  "ko",
  "de",
  "fr",
  "es",
  "pl",
] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.includes(value as Language);
}

export function readLanguage(value: unknown, fallback: Language): Language {
  return isLanguage(value) ? value : fallback;
}

export const LANG_NAMES: Record<Language, string> = {
  zh: "Chinese",
  ru: "Russian",
  uk: "Ukrainian",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  de: "German",
  fr: "French",
  es: "Spanish",
  pl: "Polish",
};

export function getLangName(code: Language): string {
  return LANG_NAMES[code] ?? code;
}
