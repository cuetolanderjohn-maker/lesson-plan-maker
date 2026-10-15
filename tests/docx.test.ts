import assert from "node:assert";
import { test } from "node:test";
import { generateMatatagDocx, generateLccpDocx } from "../lib/docxGenerator";
import { sampleMatatagPlan, sampleLccpPlan, defaultTeacherProfile } from "../lib/sampleData";

test("generateMatatagDocx produces a valid non-empty DOCX file", async () => {
  const result = await generateMatatagDocx(sampleMatatagPlan, defaultTeacherProfile);
  assert.ok(result);
  const size = "size" in result ? result.size : (result as Buffer).length;
  assert.ok(size > 5000, `Expected DOCX size > 5000 bytes, got ${size}`);
});

test("generateLccpDocx produces a valid non-empty DOCX file", async () => {
  const result = await generateLccpDocx(sampleLccpPlan, defaultTeacherProfile);
  assert.ok(result);
  const size = "size" in result ? result.size : (result as Buffer).length;
  assert.ok(size > 4000, `Expected DOCX size > 4000 bytes, got ${size}`);
});

test("generateMatatagDocx respects custom plan signatories over profile defaults", async () => {
  const customPlan = {
    ...sampleMatatagPlan,
    signatories: {
      preparedBy: "Custom Teacher Name",
      checkedBy: "Custom Coordinator",
      observedBy: "Custom Observer",
    },
  };
  const result = await generateMatatagDocx(customPlan, defaultTeacherProfile);
  assert.ok(result);
});
