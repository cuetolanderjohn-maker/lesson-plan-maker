import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildMatatagSystemPrompt, buildLccpSystemPrompt, parseLessonPlanResponse } from "./prompts";
import type { GenerateRequestMeta, TeacherProfile, LessonPlan, TemplateType } from "./types";

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-latest",
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
      .map((m: { name: string }) => m.name.replace(/^models\//, ""));

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
  const apiKey = rawKey.trim();
  const genAI = new GoogleGenerativeAI(apiKey);

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

  // 1. Build ordered list of models to try
  const activeRemoteModels = await discoverAvailableModels(apiKey);
  const modelsToTry: string[] = [];

  // If user specified a preferred model, try that first
  if (profile?.geminiModel && profile.geminiModel !== "auto") {
    modelsToTry.push(profile.geminiModel);
  }

  // Next, try discovered remote models that match our candidate flash models
  for (const candidate of CANDIDATE_MODELS) {
    if (activeRemoteModels.includes(candidate) && !modelsToTry.includes(candidate)) {
      modelsToTry.push(candidate);
    }
  }

  // If remote discovery found other models with generateContent, include them
  for (const rem of activeRemoteModels) {
    if ((rem.includes("flash") || rem.includes("gemini")) && !modelsToTry.includes(rem)) {
      modelsToTry.push(rem);
    }
  }

  // Always append our candidate models as static fallback
  for (const candidate of CANDIDATE_MODELS) {
    if (!modelsToTry.includes(candidate)) {
      modelsToTry.push(candidate);
    }
  }

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini AI] Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(parts);
      const text = result.response.text();
      console.log(`[Gemini AI] Successfully generated plan with model: ${modelName}`);
      return parseLessonPlanResponse(text, templateType);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[Gemini AI] Model ${modelName} failed: ${errMessage}`);
      lastError = error instanceof Error ? error : new Error(errMessage);

      // If it's a 404 / not found / model unsupported error, try the next candidate model
      if (
        errMessage.includes("not found") ||
        errMessage.includes("404") ||
        errMessage.includes("not supported")
      ) {
        continue;
      }

      // If it's an API key invalid or quota error, throw directly so user knows
      if (
        errMessage.includes("API_KEY_INVALID") ||
        errMessage.includes("RESOURCE_EXHAUSTED") ||
        errMessage.includes("quota")
      ) {
        throw error;
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "All Gemini models returned not found. Please verify your API key at https://aistudio.google.com/app/apikey"
    )
  );
}
