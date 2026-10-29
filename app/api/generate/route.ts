import { NextRequest, NextResponse } from "next/server";
import { generateLessonPlanUniversal } from "@/lib/universalAiScanner";
import type { GenerateRequestMeta, TeacherProfile, ImageInput } from "@/lib/types";
import { loki } from "@/lib/loki";
import crypto from "crypto";

export const maxDuration = 60; // 60 seconds timeout for vision processing

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const traceId = req.headers.get("x-trace-id") || crypto.randomUUID();

  try {
    const body = await req.json();
    const { images, meta, profile } = body as {
      images: ImageInput[];
      meta: GenerateRequestMeta;
      profile?: TeacherProfile;
    };

    const provider = profile?.aiProvider || "groq";

    loki.info("Lesson plan generation API called", {
      trace_id: traceId,
      provider,
      image_count: images?.length || 0,
      grade_level: meta?.gradeLevel,
      subject: meta?.subject,
    }, traceId);

    if (!images || !Array.isArray(images) || images.length === 0) {
      loki.warn("Validation failed: missing textbook images", { trace_id: traceId }, traceId);
      await loki.flush();
      return NextResponse.json(
        { success: false, error: "Please attach at least one photo of the lesson.", traceId },
        { status: 400 }
      );
    }

    if (!meta || !meta.gradeLevel || !meta.subject) {
      loki.warn("Validation failed: missing curriculum metadata", { trace_id: traceId }, traceId);
      await loki.flush();
      return NextResponse.json(
        { success: false, error: "Missing grade level or subject specification.", traceId },
        { status: 400 }
      );
    }

    const plan = await generateLessonPlanUniversal({ images, meta, profile });
    const durationMs = Date.now() - startTime;

    loki.info("Lesson plan generated successfully", {
      trace_id: traceId,
      duration_ms: durationMs,
      provider,
      template_type: plan.templateType,
    }, traceId);

    await loki.flush();

    return NextResponse.json({
      success: true,
      plan,
      templateType: plan.templateType,
      traceId,
      durationMs,
    });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Failed to generate lesson plan";

    loki.error("Lesson plan generation failed", error, {
      trace_id: traceId,
      duration_ms: durationMs,
      error_message: message,
    }, traceId);

    await loki.flush();

    return NextResponse.json(
      { success: false, error: message, traceId, durationMs },
      { status: 500 }
    );
  }
}
