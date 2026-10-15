import assert from "node:assert";
import { test } from "node:test";
import { buildMatatagSystemPrompt, buildLccpSystemPrompt, parseLessonPlanResponse } from "../lib/prompts";
import { defaultTeacherProfile, sampleMatatagPlan, sampleLccpPlan } from "../lib/sampleData";

test("buildMatatagSystemPrompt contains all required school mandates", () => {
  const prompt = buildMatatagSystemPrompt(
    { gradeLevel: "grade1", subject: "filipino", weekNumber: "Week 10" },
    defaultTeacherProfile
  );
  assert.ok(prompt.includes("DepEd MATATAG"));
  assert.ok(prompt.includes("DO 3 s 2026"));
  assert.ok(prompt.includes("Laudato Si"));
  assert.ok(prompt.includes("Justice and Peace Education"));
  assert.ok(prompt.includes("LCCP- Care"));
  assert.ok(prompt.includes("JSON"));
});

test("buildLccpSystemPrompt contains LCCP institutional mandates", () => {
  const prompt = buildLccpSystemPrompt(
    { gradeLevel: "kinder2", subject: "science", weekNumber: "Week 6" },
    defaultTeacherProfile
  );
  assert.ok(prompt.includes("LA CONSOLACION COLLEGE-PASIG"));
  assert.ok(prompt.includes("Values Statement"));
  assert.ok(prompt.includes("Learning Strategies"));
  assert.ok(prompt.includes("JSON"));
});

test("parseLessonPlanResponse handles json wrapped in markdown code blocks", () => {
  const wrapped = "```json\n" + JSON.stringify(sampleMatatagPlan) + "\n```";
  const parsed = parseLessonPlanResponse(wrapped, "matatag");
  assert.strictEqual(parsed.templateType, "matatag");
  assert.strictEqual(parsed.subject, "FILIPINO");

  const lccpWrapped = "```\n" + JSON.stringify(sampleLccpPlan) + "\n```";
  const parsedLccp = parseLessonPlanResponse(lccpWrapped, "lccp");
  assert.strictEqual(parsedLccp.templateType, "lccp");
  assert.strictEqual(parsedLccp.subject, "Language");
});

test("parseLessonPlanResponse throws friendly error when model returns an error object", () => {
  const errorJson = JSON.stringify({
    error: "The textbook image is too blurry to read. Please upload a clearer photo.",
  });
  assert.throws(
    () => parseLessonPlanResponse(errorJson, "matatag"),
    /blurry/
  );
});

test("parseLessonPlanResponse throws friendly error when model returns conversational non-json text", () => {
  const nonJson = "I am sorry, but I cannot read this textbook image because it is dark.";
  assert.throws(
    () => parseLessonPlanResponse(nonJson, "matatag"),
    /could not be parsed/
  );
});
