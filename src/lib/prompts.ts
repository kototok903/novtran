import { getLangName, type Language } from "@/lib/languages";

const TARGET_GUIDELINES: Partial<Record<Language, string>> = {
  ru: `Target language conventions:
- Use — for spoken dialogue.
- Use «» for blocks of internal thought (wrap the entire thought sequence, not each line individually).
- Track character gender in notes (grammatical gender).
- Use the letter ё where standard orthography requires it.`,

  uk: `Target language conventions:
- Use — for spoken dialogue.
- Use «» for blocks of internal thought (wrap the entire thought sequence, not each line individually).
- Track character gender in notes (grammatical gender).`,
};

const SOURCE_GUIDELINES: Partial<Record<Language, string>> = {
  zh: `Source language notes:
- Break long compound sentences into shorter, natural ones in the target language where appropriate.
- Transliterate names using the standard system for the target language.`,
};

export function buildTranslationPrompt(params: {
  sourceText: string;
  sourceLang: Language;
  targetLang: Language;
  context: string;
  notes: string;
}): string {
  const { sourceText, sourceLang, targetLang, context, notes } = params;
  const targetName = getLangName(targetLang);
  const sourceName = getLangName(sourceLang);

  const sections = [
    `You are an expert literary translator. Translate from ${sourceName} to ${targetName}.`,

    `Guidelines:
- Prioritize natural, fluent ${targetName}. The translation should read as if originally written in ${targetName}.
- Adapt sentence structure to sound natural — do not preserve source-language patterns that sound awkward.
- Preserve the author's tone and register. If the original uses slang or profanity, use equivalent expressions rather than sanitizing.
- Preserve paragraph breaks and formatting.`,

    TARGET_GUIDELINES[targetLang],
    SOURCE_GUIDELINES[sourceLang],
    context,

    `Here are your accumulated notes about this text:
${notes || "(no notes yet)"}`,

    `Translate the following text. Return:
1. The translation
2. Updated notes — ONLY items that could cause inconsistency between chunks:
   - Character names (original → translation/transliteration)
   - Non-obvious translation choices you made
   - Recurring invented/domain-specific terms and chosen equivalents
   Format: original → equivalent. Keep it short. No obvious vocabulary, no explanations, no meta-commentary.`,

    `Source text:
${sourceText}`,
  ];

  return sections.filter(Boolean).join("\n\n");
}
