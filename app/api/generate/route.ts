import { NextRequest, NextResponse } from "next/server";
import { generateLessonPlanWithGemini, ImageInput } from "@/lib/gemini";
import type { GenerateRequestMeta, TeacherProfile } from "@/lib/types";

export const maxDuration = 60; // 60 seconds timeout for vision processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images, meta, profile, apiKey } = body as {
      images: ImageInput[];
      meta: GenerateRequestMeta;
      profile?: TeacherProfile;
      apiKey?: string;
    };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please attach at least one photo of the lesson." },
        { status: 400 }
      );
    }

    if (!meta || !meta.gradeLevel || !meta.subject) {
      return NextResponse.json(
        { success: false, error: "Missing grade level or subject specification." },
        { status: 400 }
      );
    }

    const plan = await generateLessonPlanWithGemini(images, meta, profile, apiKey);

    return NextResponse.json({
      success: true,
      plan,
      templateType: plan.templateType,
    });
  } catch (error: unknown) {
    console.error("Error in /api/generate:", error);
    const message = error instanceof Error ? error.message : "Failed to generate lesson plan";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
