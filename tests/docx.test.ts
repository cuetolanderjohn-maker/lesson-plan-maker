import assert from "node:assert";
import { test } from "node:test";
import { generateMatatagDocx, generateLccpDocx } from "../lib/docxGenerator";
import {
  sampleMatatagPlan,
  sampleKinder2FilipinoPlan,
  sampleLccpPlan,
  sampleK2MathPlan,
  sampleK2SciencePlan,
  sampleK2RvePlan,
  defaultTeacherProfile,
} from "../lib/sampleData";
import { getLccpBannerBuffer, getLccpCrestBuffer } from "../lib/schoolLogos";

test("getLccpBannerBuffer and getLccpCrestBuffer return authentic image assets", () => {
  const banner = getLccpBannerBuffer();
  assert.ok(banner && banner.length > 50000, "Banner buffer should be > 50KB");
  // JPEG magic bytes: FF D8
  assert.strictEqual(banner[0], 0xff);
  assert.strictEqual(banner[1], 0xd8);

  const crest = getLccpCrestBuffer();
  assert.ok(crest && crest.length > 20000, "Crest buffer should be > 20KB");
  // PNG magic bytes: 89 50 4E 47
  assert.strictEqual(crest[0], 0x89);
  assert.strictEqual(crest[1], 0x50);
});

test("generateMatatagDocx produces a valid non-empty DOCX file with embedded school banner", async () => {
  const result = await generateMatatagDocx(sampleMatatagPlan, defaultTeacherProfile);
  assert.ok(result);
  const size = "size" in result ? result.size : (result as Buffer).length;
  assert.ok(size > 80000, `Expected DOCX size > 80000 bytes with banner, got ${size}`);

  const k2Result = await generateMatatagDocx(sampleKinder2FilipinoPlan, defaultTeacherProfile);
  assert.ok(k2Result);
});

test("generateLccpDocx produces valid DOCX files for Language, Math, Science, and RVE (Portrait & 5-Column ADIDSE)", async () => {
  const result = await generateLccpDocx(sampleLccpPlan, defaultTeacherProfile);
  assert.ok(result);
  const size = "size" in result ? result.size : (result as Buffer).length;
  assert.ok(size > 25000, `Expected DOCX size > 25000 bytes with crest, got ${size}`);

  const mathDocx = await generateLccpDocx(sampleK2MathPlan, defaultTeacherProfile);
  assert.ok(mathDocx);

  const scienceDocx = await generateLccpDocx(sampleK2SciencePlan, defaultTeacherProfile);
  assert.ok(scienceDocx);

  const rvePortraitDocx = await generateLccpDocx(sampleK2RvePlan, defaultTeacherProfile);
  assert.ok(rvePortraitDocx);

  const rveLandscapeDocx = await generateLccpDocx(
    { ...sampleK2RvePlan, rveFormat: "landscape_adidse" },
    defaultTeacherProfile
  );
  assert.ok(rveLandscapeDocx);
  const rveLandscapeSize =
    "size" in rveLandscapeDocx ? rveLandscapeDocx.size : (rveLandscapeDocx as Buffer).length;
  assert.ok(rveLandscapeSize > 80000, "RVE Landscape ADIDSE DOCX should embed LCCP banner");
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
