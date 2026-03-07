import { getLangName, type Language } from "@/lib/languages";

const TARGET_GUIDELINES: Partial<Record<Language, string>> = {
  ru: `Target language conventions:
- Use — (em dash) for spoken dialogue.
- Use «» (guillemets) for internal thoughts.
- Track character gender in notes (grammatical gender).
- Use the letter ё where standard orthography requires it.`,

  uk: `Target language conventions:
- Use — (em dash) for spoken dialogue.
- Use «» (guillemets) for internal thoughts.
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
2. Updated notes — a concise glossary for translation consistency ONLY:
   - Character names (original → translation/transliteration)
   - Recurring terms, titles, honorifics and chosen equivalents
   - Made-up or domain-specific terms
   - Ambiguous terms where you made a specific choice
   Format as a readable markdown list. Do NOT include summaries, analysis, or plot descriptions.`,

    `Source text:
${sourceText}`,
  ];

  return sections.filter(Boolean).join("\n\n");
}
