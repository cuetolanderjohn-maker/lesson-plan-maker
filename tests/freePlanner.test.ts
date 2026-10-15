import assert from "node:assert";
import { test } from "node:test";
import { generatePlanFromExtractedText } from "../lib/freeLessonPlanner";
import { defaultTeacherProfile } from "../lib/sampleData";

test("generatePlanFromExtractedText produces valid Matatag plan without API key", () => {
  const sampleOcrText = `
    Aralin 5: Ang Munting Gamu-gamo
    Pahina 42
    Basahin at unawain ang maikling kwento.
    Gabay na tanong:
    1. Sino ang lumipad malapit sa apoy?
    2. Bakit nagbilin ang inang gamu-gamo?
    3. Ano ang nangyari sa munting gamu-gamo?
    Pagsasanay:
    1. Bilugan ang tamang sagot.
    2. Isulat ang tsek sa patlang.
  `;

  const plan = generatePlanFromExtractedText(
    sampleOcrText,
    { gradeLevel: "grade1", subject: "filipino", weekNumber: "Week 5" },
    defaultTeacherProfile
  );

  assert.strictEqual(plan.templateType, "matatag");
  assert.ok(plan.subjectMatter.paksa.includes("Gamu-gamo"));
  assert.ok(plan.subjectMatter.sanggunian.includes("42"));
  assert.ok(plan.procedures.discussion.guideQuestions.length >= 3);
  assert.ok(plan.signatories.preparedBy.includes("Acola"));
});

test("generatePlanFromExtractedText produces valid LCCP Kinder 2 plan without API key", () => {
  const sampleOcrText = `
    Unit 2: Things in the Classroom
    Page 18
    Look at the pictures of tables, chairs, and books.
    Questions:
    What things do you see in the room?
    How do you arrange your books?
  `;

  const plan = generatePlanFromExtractedText(
    sampleOcrText,
    { gradeLevel: "kinder2", subject: "science", weekNumber: "Week 2" },
    defaultTeacherProfile
  );

  assert.strictEqual(plan.templateType, "lccp");
  assert.ok(plan.subjectMatter.lesson.includes("Classroom"));
  assert.ok(plan.header.institution.includes("LA CONSOLACION COLLEGE-PASIG"));
  assert.ok(plan.valuesStatement.includes("God"));
  assert.ok(plan.signatories.preparedBy.includes("Acola"));
});
