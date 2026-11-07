import assert from "node:assert";
import { test } from "node:test";
import {
  sampleMatatagPlan,
  sampleKinder2FilipinoPlan,
  sampleLccpPlan,
  sampleK2MathPlan,
  sampleK2SciencePlan,
  sampleK2RvePlan,
  defaultTeacherProfile,
  getInternalGeminiKey,
  getInternalGroqKey,
} from "../lib/sampleData";
import type { MatatagLessonPlan, LccpLearningPlan, TeacherProfile } from "../lib/types";

test("MatatagLessonPlan samples satisfy Kat's exact Grade 1 & Kinder 2 Banghay-Aralin schema", () => {
  const plan: MatatagLessonPlan = sampleMatatagPlan;
  assert.strictEqual(plan.templateType, "matatag");
  assert.ok(plan.schoolYear.includes("2026-2027"));
  assert.strictEqual(plan.subject, "FILIPINO");
  assert.strictEqual(plan.gradeSection, "Grade 1 - OLOPH & OLOG");
  assert.ok(plan.objectives.length >= 3);
  assert.strictEqual(plan.subjectMatter.paksa, "Iyan ang lider");
  assert.strictEqual(plan.subjectMatter.sanggunian, "Gr.1 Dawani");
  assert.ok(plan.subjectMatter.aiDeclaration.includes("DO 3 s 2026 Annex"));
  assert.ok(plan.learningCompetencies.startsWith("Naipamamalas ng mga mag-aaral"));
  assert.ok(plan.integrations.laudatoSi.length > 0);
  assert.ok(plan.integrations.justiceAndPeace.length > 0);
  assert.ok(plan.integrations.genderAndDevelopment.length > 0);
  assert.ok(plan.integrations.lccpCare.length > 0);
  assert.ok(plan.integrations.interdisciplinary.includes("Values Ed:"));
  assert.strictEqual(plan.integrations.techTeaching, "Canva presentasyon");
  assert.ok(plan.procedures.discussion.guideQuestions.length >= 3);
  assert.strictEqual(plan.assessment.summativeItems.length, 5);
  assert.strictEqual(plan.remarks, "");
  assert.strictEqual(plan.signatories.preparedBy, "Bb. Kathrynn Ross L. Acola");
  assert.strictEqual(plan.signatories.checkedBy, "Bb. Sta. Ana Florence");

  const k2Fil: MatatagLessonPlan = sampleKinder2FilipinoPlan;
  assert.strictEqual(k2Fil.gradeSection, "Kinder 2");
  assert.ok(k2Fil.subjectMatter.sanggunian.includes("Masayang Mag-aaral ng Filipino"));
  assert.strictEqual(k2Fil.signatories.preparedBy, "Acola, Kathrynn Ross L.");
  assert.strictEqual(k2Fil.signatories.checkedBy, "Emma P. Dunque, LPT.");
});

test("LccpLearningPlan samples satisfy Kat's exact LCCP and RVE ADIDSE schemas", () => {
  const plan: LccpLearningPlan = sampleLccpPlan;
  assert.strictEqual(plan.templateType, "lccp");
  assert.ok(plan.header.institution.includes("LA CONSOLACION COLLEGE-PASIG"));
  assert.ok(plan.objectives.length >= 2);
  assert.ok(plan.subjectMatter.lesson.length > 0);
  assert.ok(plan.valuesStatement.includes("God"));
  assert.ok(plan.procedures.routineActivities.length >= 2);
  assert.ok(plan.procedures.learningStrategies.length > 0);
  assert.ok(plan.assessment.length > 0);
  assert.strictEqual(plan.remarks, "");
  assert.ok(plan.signatories.preparedBy.includes("Acola"));

  assert.strictEqual(sampleK2MathPlan.subject, "Mathematics");
  assert.ok(sampleK2MathPlan.subjectMatter.references.includes("Early Beginnings: Mathematics"));
  assert.strictEqual(sampleK2SciencePlan.subject, "Science");
  assert.ok(sampleK2SciencePlan.subjectMatter.references.includes("Early Beginnings: Science"));
  assert.strictEqual(sampleK2RvePlan.subject, "RVE");
  assert.ok(sampleK2RvePlan.valuesStatement.startsWith("Bible verse:"));
  assert.ok(sampleK2RvePlan.adidse !== undefined);
});

test("defaultTeacherProfile contains Kat's official school settings and hides API keys from user state", () => {
  const profile: TeacherProfile = defaultTeacherProfile;
  assert.strictEqual(profile.schoolName, "LA CONSOLACION COLLEGE-PASIG");
  assert.ok(profile.teacherName.includes("Kathrynn Ross L. Acola"));
  assert.strictEqual(profile.schoolYear, "S.Y. 2026-2027");
  assert.ok(profile.coordinatorKinder.includes("Emma P. Dunque"));
  assert.ok(profile.coordinatorGrade1.includes("Sta. Ana Florence"));
  assert.strictEqual(profile.aiProvider, "gemini");
  assert.strictEqual(profile.geminiApiKey, undefined);
  assert.strictEqual(profile.groqApiKey, undefined);

  const geminiKey = getInternalGeminiKey();
  assert.strictEqual(geminiKey.length, 53);
  assert.ok(geminiKey.startsWith("AQ."));

  const groqKey = getInternalGroqKey();
  assert.strictEqual(groqKey.length, 56);
});
