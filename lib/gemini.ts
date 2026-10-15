import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildMatatagSystemPrompt, buildLccpSystemPrompt, parseLessonPlanResponse } from "./prompts";
import type { GenerateRequestMeta, TeacherProfile, LessonPlan, TemplateType } from "./types";

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

export async function generateLessonPlanWithGemini(
  images: ImageInput[],
  meta: GenerateRequestMeta,
  profile?: TeacherProfile,
  customApiKey?: string
): Promise<LessonPlan> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API Key. Please provide a key in Settings or set GEMINI_API_KEY in .env.local"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to gemini-2.5-flash with fallback to gemini-1.5-flash
  const modelName = "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

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

  try {
    const result = await model.generateContent(parts);
    const text = result.response.text();
    return parseLessonPlanResponse(text, templateType);
  } catch (error: unknown) {
    // If gemini-2.5-flash has an error or is not found in the region, retry with gemini-1.5-flash
    const errMessage = error instanceof Error ? error.message : String(error);
    if (errMessage.includes("not found") || errMessage.includes("404")) {
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const fallbackResult = await fallbackModel.generateContent(parts);
      return parseLessonPlanResponse(fallbackResult.response.text(), templateType);
    }
    throw error;
  }
}
