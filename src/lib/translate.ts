import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { getApiKey } from "@/lib/settings";

const TranslationResultSchema = z.object({
  translation: z.string(),
  notes: z.string(),
});

interface TranslateParams {
  sourceText: string;
  notes: string;
  context: string;
  sourceLang: string;
  targetLang: string;
  model: string;
}

export async function translateChunk(params: TranslateParams) {
  const { sourceText, notes, context, sourceLang, targetLang, model } = params;

  const apiKey = getApiKey("google");
  if (!apiKey) {
    throw new Error("Google API key not set. Add it in Settings.");
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const prompt = `You are a literary translator. Translate from ${sourceLang} to ${targetLang}.

${context ? `${context}\n\n` : ""}Here are your accumulated notes about this text:
${notes || "(no notes yet)"}

Translate the following text. Return:
1. The translation
2. Updated notes — rewrite the full notes block. Preserve all existing notes. Only add or modify entries, never remove unless explicitly asked.

Source text:
${sourceText}`;

  const { object } = await generateObject({
    model: google(model),
    schema: TranslationResultSchema,
    prompt,
  });

  return object;
}
