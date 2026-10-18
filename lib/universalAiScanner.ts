import { buildMatatagSystemPrompt, buildLccpSystemPrompt, parseLessonPlanResponse } from "./prompts";
import { generateLessonPlanWithGemini } from "./gemini";
import type { GenerateRequestMeta, TeacherProfile, LessonPlan, TemplateType, ImageInput, AIProvider } from "./types";

export interface ScanRequest {
  images: ImageInput[];
  meta: GenerateRequestMeta;
  profile?: TeacherProfile;
  provider?: AIProvider;
}

/**
 * Universal OpenAI-Compatible Vision Caller
 * Works for OpenRouter, Mistral, Kilo Free Gateway, Cloudflare, and custom endpoints from awesome-free-llm-apis
 */
async function callOpenAiCompatibleVision({
  endpointUrl,
  apiKey,
  model,
  images,
  systemInstruction,
  extraHeaders = {},
}: {
  endpointUrl: string;
  apiKey?: string;
  model: string;
  images: ImageInput[];
  systemInstruction: string;
  extraHeaders?: Record<string, string>;
}): Promise<string> {
  const contentArray: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text: `${systemInstruction}\n\nHere are the ${images.length} photo(s) of the lesson from the textbook. Deeply read and analyze the story, headings, vocabulary, guide questions, and exercises, and return the complete lesson plan JSON.`,
    },
  ];

  for (const img of images) {
    const mime = img.mimeType || "image/jpeg";
    const dataUrl = img.base64Data.startsWith("data:")
      ? img.base64Data
      : `data:${mime};base64,${img.base64Data}`;
    contentArray.push({
      type: "image_url",
      image_url: {
        url: dataUrl,
      },
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (apiKey && apiKey.trim()) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  }

  let res: Response;
  try {
    res = await fetch(endpointUrl, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: contentArray,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 4096,
      }),
    });
  } catch (err: unknown) {
    throw new Error(`Network error connecting to ${model}: ${err instanceof Error ? err.message : String(err)}`);
  }

  // If response_format json_object caused 400 on models that don't support schema enforcement, retry without it
  if (!res.ok && res.status === 400) {
    const errorBody = await res.text();
    if (errorBody.includes("response_format") || errorBody.includes("json_object")) {
      console.warn(`[Universal AI] Model ${model} rejected response_format; retrying without it.`);
      try {
        res = await fetch(endpointUrl, {
          method: "POST",
          headers,
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: contentArray,
              },
            ],
            temperature: 0.2,
            max_tokens: 4096,
          }),
        });
      } catch (retryErr: unknown) {
        throw new Error(`Network error on retry to ${model}: ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`);
      }
    } else {
      throw new Error(`HTTP ${res.status} from ${model}: ${errorBody.slice(0, 300)}`);
    }
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`HTTP ${res.status} from ${model}: ${errorBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0]?.message;
  let text = choice?.content;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    if (typeof choice?.reasoning === "string" && choice.reasoning.includes("{")) {
      text = choice.reasoning;
    }
  }
  if (!text || typeof text !== "string") {
    throw new Error("No text output received from vision model.");
  }

  return text;
}

/**
 * Universal Multimodal Lesson Plan Generator
 * Seamlessly routes across:
 * 1. Google Gemini (1500 free requests/day)
 * 2. OpenRouter Free Vision (Gemma 4 31B, Dots Note, Nemotron)
 * 3. Mistral AI Vision (Pixtral 12B)
 * 4. Zero-Key Free Cloud Vision (Kilo Code Gateway from awesome-free-llm-apis)
 * 5. Custom OpenAI-Compatible Provider
 */
export async function generateLessonPlanUniversal(req: ScanRequest): Promise<LessonPlan> {
  const { images, meta, profile } = req;
  const provider: AIProvider = profile?.aiProvider || "gemini";

  const templateType: TemplateType =
    meta.templateType ||
    (meta.gradeLevel === "grade1" || meta.subject === "filipino" ? "matatag" : "lccp");

  const systemInstruction =
    templateType === "matatag"
      ? buildMatatagSystemPrompt(meta, profile)
      : buildLccpSystemPrompt(meta, profile);

  // 1. Google Gemini Provider
  if (provider === "gemini") {
    try {
      return await generateLessonPlanWithGemini(images, meta, profile);
    } catch (err) {
      console.warn("[Universal AI] Gemini failed, attempting automatic Free Cloud Vision failover:", err);
      // Seamless failover to Free Cloud Vision Gateway so the scan succeeds!
      return await generateWithFreeCloud(images, meta, profile, templateType, systemInstruction);
    }
  }

  // 2. OpenRouter Free Tier
  if (provider === "openrouter") {
    const envKey = typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY)
      : undefined;
    const key = profile?.openRouterApiKey?.trim() || envKey;
    if (!key) {
      throw new Error("Missing OpenRouter API Key. Please provide it in Settings or switch to Zero-Key Free Cloud mode.");
    }
    const candidateModels = [
      profile?.openRouterModel || "google/gemma-4-31b-it:free",
      "dots-studio/dots-3-note-preview:free",
      "nvidia/nemotron-3.5-super-vl:free",
      "openrouter/free",
    ];

    let lastError: Error | null = null;
    for (const model of candidateModels) {
      try {
        console.log(`[Universal AI] Attempting OpenRouter model: ${model}`);
        const rawText = await callOpenAiCompatibleVision({
          endpointUrl: "https://openrouter.ai/api/v1/chat/completions",
          apiKey: key,
          model,
          images,
          systemInstruction,
          extraHeaders: {
            "HTTP-Referer": "https://katlessonplan.netlify.app",
            "X-Title": "Lesson Plan Maker (LCCP Edition)",
          },
        });
        return parseLessonPlanResponse(rawText, templateType);
      } catch (err: unknown) {
        console.warn(`[Universal AI] OpenRouter model ${model} failed:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    // Fall back to Free Cloud Vision if OpenRouter models were busy
    console.warn("[Universal AI] OpenRouter models busy, failing over to Free Cloud Vision...");
    return await generateWithFreeCloud(images, meta, profile, templateType, systemInstruction);
  }

  // 3. Mistral AI Vision (Pixtral)
  if (provider === "mistral") {
    const envKey = typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY)
      : undefined;
    const key = profile?.mistralApiKey?.trim() || envKey;
    if (!key) {
      throw new Error("Missing Mistral API Key. Please provide it in Settings.");
    }
    const model = profile?.mistralModel || "pixtral-12b-2409";
    try {
      console.log(`[Universal AI] Attempting Mistral model: ${model}`);
      const rawText = await callOpenAiCompatibleVision({
        endpointUrl: "https://api.mistral.ai/v1/chat/completions",
        apiKey: key,
        model,
        images,
        systemInstruction,
      });
      return parseLessonPlanResponse(rawText, templateType);
    } catch (err) {
      console.warn("[Universal AI] Mistral failed, failing over to Free Cloud Vision:", err);
      return await generateWithFreeCloud(images, meta, profile, templateType, systemInstruction);
    }
  }

  // 4. Zero-Key Free Cloud Vision (awesome-free-llm-apis gateway)
  if (provider === "free_cloud") {
    return await generateWithFreeCloud(images, meta, profile, templateType, systemInstruction);
  }

  // 5. Custom OpenAI-Compatible Provider
  if (provider === "custom_openai") {
    const baseUrl = profile?.customBaseUrl?.trim();
    if (!baseUrl) {
      throw new Error("Missing Custom Base URL in Settings. (e.g. https://api.together.xyz/v1 or https://open.bigmodel.cn/api/paas/v4)");
    }
    const endpoint = baseUrl.endsWith("/chat/completions")
      ? baseUrl
      : `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const model = profile?.customModel?.trim() || "gpt-4o-mini";
    const apiKey = profile?.customApiKey?.trim();

    console.log(`[Universal AI] Calling Custom Provider: ${endpoint} with model ${model}`);
    const rawText = await callOpenAiCompatibleVision({
      endpointUrl: endpoint,
      apiKey,
      model,
      images,
      systemInstruction,
    });
    return parseLessonPlanResponse(rawText, templateType);
  }

  throw new Error(`Unknown AI Provider: ${provider}`);
}

/**
 * Helper to call the Zero-Key Free Cloud Vision Gateway from awesome-free-llm-apis
 * (Kilo Code Gateway - 200 requests/hour free per IP without requiring any API key!)
 */
async function generateWithFreeCloud(
  images: ImageInput[],
  meta: GenerateRequestMeta,
  profile: TeacherProfile | undefined,
  templateType: TemplateType,
  systemInstruction: string
): Promise<LessonPlan> {
  const freeModels = [
    "nvidia/nemotron-3.5-super-vl:free",   // High-capacity multimodal vision model (verified active)
    "dots-studio/dots-3-note-preview:free", // Specialized for textbook notes & diagrams
    "openrouter/free",                     // OpenRouter free multimodal router
    "kilo-auto/free",
  ];

  let lastError: Error | null = null;
  for (const model of freeModels) {
    try {
      console.log(`[Universal AI] Attempting Zero-Key Free Cloud Vision with model: ${model}`);
      const rawText = await callOpenAiCompatibleVision({
        endpointUrl: "https://api.kilo.ai/api/gateway/chat/completions",
        model,
        images,
        systemInstruction,
      });
      return parseLessonPlanResponse(rawText, templateType);
    } catch (err: unknown) {
      console.warn(`[Universal AI] Free Cloud model ${model} failed:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw (
    lastError ||
    new Error("Free Cloud Vision Gateway is temporarily busy. Please try again or switch to Google Gemini in Settings.")
  );
}
