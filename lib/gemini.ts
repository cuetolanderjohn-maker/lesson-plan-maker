import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildMatatagSystemPrompt, buildLccpSystemPrompt, parseLessonPlanResponse } from "./prompts";
import type { GenerateRequestMeta, TeacherProfile, LessonPlan, TemplateType } from "./types";

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

function isCleanVisionModel(name: string): boolean {
  const lower = name.toLowerCase();
  // Strictly filter out non-multimodal, audio, TTS, embeddings, and experimental preview tts models
  if (
    lower.includes("tts") ||
    lower.includes("embed") ||
    lower.includes("audio") ||
    lower.includes("realtime") ||
    lower.includes("imagen") ||
    lower.includes("bison") ||
    lower.includes("learnlm")
  ) {
    return false;
  }
  return true;
}

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

/**
 * Dynamically queries Google Generative AI to discover which models are active for this API key
 */
async function discoverAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return [];

    const available = data.models
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: { name: string }) => m.name.replace(/^models\//, ""))
      .filter(isCleanVisionModel);

    return available;
  } catch (err) {
    console.warn("Unable to fetch remote model list:", err);
    return [];
  }
}

export async function generateLessonPlanWithGemini(
  images: ImageInput[],
  meta: GenerateRequestMeta,
  profile?: TeacherProfile,
  customApiKey?: string
): Promise<LessonPlan> {
  const rawKey = customApiKey || profile?.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!rawKey || !rawKey.trim()) {
    throw new Error(
      "Missing Gemini API Key. Please provide your key in Settings or enter it on the page."
    );
  }

  // Support multiple API keys (separated by commas or newlines) for automatic quota pooling and rotation
  const candidateKeys = rawKey
    .split(/[\n,;]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 5);

  if (candidateKeys.length === 0) {
    throw new Error("Invalid API Key format. Please enter a valid Gemini API Key.");
  }

  const templateType: TemplateType =
    meta.templateType ||
    (meta.gradeLevel === "grade1" || meta.subject === "filipino" ? "matatag" : "lccp");

  const systemInstruction =
    templateType === "matatag"
      ? buildMatatagSystemPrompt(meta, profile)
      : buildLccpSystemPrompt(meta, profile);

  const parts: (string | { inlineData: { data: string; mimeType: string } })[] = [
    systemInstruction,
    `Here are ${images.length} photo(s) of the lesson from the textbook. Analyze the images thoroughly, identify the main lesson, story, exercises, and concepts, and generate the full structured lesson plan according to the schema provided.`,
  ];

  for (const img of images) {
    parts.push({
      inlineData: {
        data: img.base64Data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, ""),
        mimeType: img.mimeType || "image/jpeg",
      },
    });
  }

  let lastError: Error | null = null;

  // Try each API key in the pool (automatic quota rotation)
  for (let keyIndex = 0; keyIndex < candidateKeys.length; keyIndex++) {
    const apiKey = candidateKeys[keyIndex];
    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Build ordered list of models to try for this key
    const activeRemoteModels = await discoverAvailableModels(apiKey);
    const modelsToTry: string[] = [];

    // If user specified a preferred model, try that first
    if (profile?.geminiModel && profile.geminiModel !== "auto") {
      modelsToTry.push(profile.geminiModel);
    }

    // Next, try discovered remote models that match our candidate models in priority order
    for (const candidate of CANDIDATE_MODELS) {
      if (activeRemoteModels.includes(candidate) && !modelsToTry.includes(candidate)) {
        modelsToTry.push(candidate);
      }
    }

    // Always append our candidate models as static fallback
    for (const candidate of CANDIDATE_MODELS) {
      if (!modelsToTry.includes(candidate)) {
        modelsToTry.push(candidate);
      }
    }

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini AI] Key #${keyIndex + 1}/${candidateKeys.length}, model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const result = await model.generateContent(parts);
        const text = result.response.text();
        console.log(`[Gemini AI] Successfully generated plan with model: ${modelName} (Key #${keyIndex + 1})`);
        return parseLessonPlanResponse(text, templateType);
      } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[Gemini AI] Key #${keyIndex + 1}, model ${modelName} failed: ${errMessage}`);
        lastError = error instanceof Error ? error : new Error(errMessage);

        // If it's a 404 / not found / model unsupported or quota/rate-limit error (429), try the next candidate model
        if (
          errMessage.includes("not found") ||
          errMessage.includes("404") ||
          errMessage.includes("not supported") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("quota") ||
          errMessage.includes("429") ||
          errMessage.includes("limit: 0")
        ) {
          console.warn(`[Gemini AI] Model ${modelName} rate-limited. Trying next candidate model...`);
          continue;
        }

        // If it's an API key invalid error on this key, move to next key in pool
        if (errMessage.includes("API_KEY_INVALID")) {
          console.warn(`[Gemini AI] Key #${keyIndex + 1} invalid, moving to next key in pool...`);
          break;
        }
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "All Gemini models/keys exceeded quota or returned not found. Please verify your keys at https://aistudio.google.com/app/apikey"
    )
  );
}
