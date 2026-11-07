import { buildMatatagSystemPrompt, buildLccpSystemPrompt, parseLessonPlanResponse } from "./prompts";
import { getInternalGeminiKey } from "./sampleData";
import type { GenerateRequestMeta, TeacherProfile, LessonPlan, TemplateType } from "./types";

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

export const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
];

export async function generateLessonPlanWithGemini(
  images: ImageInput[],
  meta: GenerateRequestMeta,
  profile?: TeacherProfile,
  customApiKey?: string
): Promise<LessonPlan> {
  const envKey =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
      : undefined;
  const rawKey =
    customApiKey?.trim() ||
    profile?.geminiApiKey?.trim() ||
    envKey?.trim() ||
    getInternalGeminiKey();

  const candidateKeys = rawKey
    .split(/[\n,;]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 5);

  if (candidateKeys.length === 0) {
    throw new Error("Gemini Vision service is not configured.");
  }

  const templateType: TemplateType =
    meta.templateType ||
    (meta.gradeLevel === "grade1" || meta.subject === "filipino" ? "matatag" : "lccp");

  const systemInstruction =
    templateType === "matatag"
      ? buildMatatagSystemPrompt(meta, profile)
      : buildLccpSystemPrompt(meta, profile);

  const requestParts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [
    { text: systemInstruction },
    {
      text: `Here are ${images.length} photo(s) of the lesson from the textbook. Analyze the images thoroughly, identify the main lesson, story, exercises, and concepts, and generate the full structured lesson plan according to the schema provided.`,
    },
  ];

  for (const img of images) {
    requestParts.push({
      inlineData: {
        data: img.base64Data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, ""),
        mimeType: img.mimeType || "image/jpeg",
      },
    });
  }

  let lastError: Error | null = null;

  for (let keyIndex = 0; keyIndex < candidateKeys.length; keyIndex++) {
    const apiKey = candidateKeys[keyIndex];
    const modelsToTry: string[] = [];

    if (
      profile?.geminiModel &&
      profile.geminiModel !== "auto" &&
      !profile.geminiModel.includes("2.5") &&
      !profile.geminiModel.includes("2.0")
    ) {
      modelsToTry.push(profile.geminiModel);
    }

    for (const candidate of GEMINI_CANDIDATE_MODELS) {
      if (!modelsToTry.includes(candidate)) {
        modelsToTry.push(candidate);
      }
    }

    for (const modelName of modelsToTry) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(25000),
            body: JSON.stringify({
              contents: [{ parts: requestParts }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          }
        );

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`HTTP ${res.status} (${modelName}): ${errBody.slice(0, 200)}`);
        }

        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text || "")
            .join("") || "";

        if (!text.trim()) {
          throw new Error(`Empty response from ${modelName}`);
        }

        return parseLessonPlanResponse(text, templateType);
      } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[Gemini AI] Model ${modelName} attempt failed.`);
        lastError = new Error(errMessage.replace(apiKey, "[REDACTED]"));

        if (errMessage.includes("API_KEY_INVALID")) {
          break;
        }
      }
    }
  }

  throw (
    lastError ||
    new Error("Gemini Vision models are temporarily busy. Failing over to secondary vision engine.")
  );
}
