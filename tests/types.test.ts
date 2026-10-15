import assert from "node:assert";
import { test } from "node:test";
import { sampleMatatagPlan, sampleLccpPlan, defaultTeacherProfile } from "../lib/sampleData";
import type { MatatagLessonPlan, LccpLearningPlan, TeacherProfile } from "../lib/types";

test("MatatagLessonPlan sample satisfies required DepEd MATATAG schema", () => {
  const plan: MatatagLessonPlan = sampleMatatagPlan;
  assert.strictEqual(plan.templateType, "matatag");
  assert.ok(plan.schoolYear.includes("2026-2027"));
  assert.ok(plan.subject.length > 0);
  assert.ok(plan.gradeSection.length > 0);
  assert.ok(plan.objectives.length >= 3);
  assert.ok(plan.subjectMatter.paksa.length > 0);
  assert.ok(plan.subjectMatter.aiDeclaration.includes("DO 3 s 2026"));
  assert.ok(plan.learningCompetencies.length > 0);
  assert.ok(plan.integrations.laudatoSi !== undefined);
  assert.ok(plan.integrations.justiceAndPeace.length > 0);
  assert.ok(plan.integrations.genderAndDevelopment.length > 0);
  assert.ok(plan.integrations.lccpCare.length > 0);
  assert.ok(plan.integrations.interdisciplinary.length > 0);
  assert.ok(plan.procedures.discussion.guideQuestions.length >= 3);
  assert.ok(plan.assessment.summativeItems.length >= 3);
  assert.ok(plan.signatories.preparedBy.length > 0);
});

test("LccpLearningPlan sample satisfies official LCCP institutional schema", () => {
  const plan: LccpLearningPlan = sampleLccpPlan;
  assert.strictEqual(plan.templateType, "lccp");
  assert.ok(plan.header.institution.includes("LA CONSOLACION COLLEGE-PASIG"));
  assert.ok(plan.objectives.length >= 2);
  assert.ok(plan.subjectMatter.lesson.length > 0);
  assert.ok(plan.valuesStatement.includes("God"));
  assert.ok(plan.procedures.routineActivities.length >= 2);
  assert.ok(plan.procedures.learningStrategies.length > 0);
  assert.ok(plan.assessment.length > 0);
  assert.ok(plan.signatories.preparedBy.includes("Acola"));
});

test("defaultTeacherProfile contains Kat's official school settings", () => {
  const profile: TeacherProfile = defaultTeacherProfile;
  assert.strictEqual(profile.schoolName, "LA CONSOLACION COLLEGE-PASIG");
  assert.ok(profile.teacherName.includes("Kathrynn Ross L. Acola"));
  assert.strictEqual(profile.schoolYear, "S.Y. 2026-2027");
  assert.ok(profile.coordinatorKinder.includes("Emma P. Dunque"));
  assert.ok(profile.coordinatorGrade1.includes("Sta. Ana Florence"));
});
