import { Output, streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { getModelProvider, MODEL_PROVIDER_LABELS } from "@/lib/models";
import { getApiKey } from "@/lib/settings";
import { buildTranslationPrompt } from "@/lib/prompts";
import type { Language } from "@/lib/languages";

const TranslationResultSchema = z.object({
  translation: z.string(),
  notes: z.string(),
});

interface TranslateParams {
  sourceText: string;
  notes: string;
  context: string;
  sourceLang: Language;
  targetLang: Language;
  model: string;
  onTranslation?: (translation: string) => void;
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
  const {
    sourceText,
    notes,
    context,
    sourceLang,
    targetLang,
    model,
    onTranslation,
  } = params;

  const prompt = buildTranslationPrompt({
    sourceText,
    sourceLang,
    targetLang,
    context,
    notes,
  });

  const result = streamText({
    model: getTranslationModel(model),
    output: Output.object({ schema: TranslationResultSchema }),
    prompt,
  });

  for await (const partial of result.partialOutputStream) {
    if (typeof partial.translation === "string") {
      onTranslation?.(partial.translation);
    }
  }

  const output = await result.output;
  if (import.meta.env.DEV) console.log("translateChunk result:", result);

  return output;
}
