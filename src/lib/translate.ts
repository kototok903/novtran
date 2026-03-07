import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { getModelProvider, MODEL_PROVIDER_LABELS } from "@/lib/models";
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

function getTranslationModel(model: string) {
  const provider = getModelProvider(model);
  if (!provider) {
    throw new Error(`Unsupported model: ${model}`);
  }

  const apiKey = getApiKey(provider);
  if (!apiKey) {
    throw new Error(
      `${MODEL_PROVIDER_LABELS[provider]} API key not set. Add it in Settings.`
    );
  }

  switch (provider) {
    case "google":
      return createGoogleGenerativeAI({ apiKey })(model);
    case "anthropic":
      return createAnthropic({
        apiKey,
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
        },
      })(model);
    case "openai":
      return createOpenAI({ apiKey })(model);
  }
}

export async function translateChunk(params: TranslateParams) {
  const { sourceText, notes, context, sourceLang, targetLang, model } = params;

  const prompt = `You are a literary translator. Translate from ${sourceLang} to ${targetLang}.

${context ? `${context}\n\n` : ""}Here are your accumulated notes about this text:
${notes || "(no notes yet)"}

Translate the following text. Return:
1. The translation
2. Updated notes — rewrite the full notes block. Preserve all existing notes. Only add or modify entries, never remove unless explicitly asked.

Source text:
${sourceText}`;

  const result = await generateText({
    model: getTranslationModel(model),
    output: Output.object({ schema: TranslationResultSchema }),
    prompt,
  });
  if (import.meta.env.DEV) console.log("translateChunk result:", result);

  return result.output;
}
