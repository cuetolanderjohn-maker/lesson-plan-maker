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
import {
  getLccpBannerBuffer,
  getLccpCrestBuffer,
  getLccpPaascuBuffer,
  dataUriToUint8Array,
} from "../lib/schoolLogos";
import {
  pickNextDesignAndStyle,
  extractIllustrationContent,
  buildGeminiIllustrationPrompt,
  sanitizeGeminiSvg,
  generateFallbackPngDataUri,
} from "../lib/lessonIllustrationGenerator";

test("getLccpBannerBuffer, getLccpCrestBuffer, and getLccpPaascuBuffer return authentic image assets", () => {
  const banner = getLccpBannerBuffer();
  assert.ok(banner && banner.length > 50000, "Banner buffer should be > 50KB");
  assert.strictEqual(banner[0], 0xff);
  assert.strictEqual(banner[1], 0xd8);

  const crest = getLccpCrestBuffer();
  assert.ok(crest && crest.length > 20000, "Crest buffer should be > 20KB");
  assert.strictEqual(crest[0], 0x89);
  assert.strictEqual(crest[1], 0x50);

  const paascu = getLccpPaascuBuffer();
  assert.ok(paascu && paascu.length > 50000, "PAASCU Level II logo buffer should be > 50KB");
  assert.strictEqual(paascu[0], 0x89);
  assert.strictEqual(paascu[1], 0x50);
  assert.strictEqual(paascu[2], 0x4e);
  assert.strictEqual(paascu[3], 0x47);
});

test("Gemini AI illustration engine rotates to a NEW design and NEW style on every generation", () => {
  const first = pickNextDesignAndStyle();
  const second = pickNextDesignAndStyle();
  const third = pickNextDesignAndStyle();

  assert.notStrictEqual(
    first.design.id,
    second.design.id,
    "Consecutive lesson plans must receive a NEW layout design"
  );
  assert.notStrictEqual(
    second.design.id,
    third.design.id,
    "Third lesson plan must also rotate to a NEW layout design"
  );
  assert.notStrictEqual(
    first.artStyle.id,
    second.artStyle.id,
    "Consecutive lesson plans must receive a NEW artistic style"
  );

  const content = extractIllustrationContent(sampleLccpPlan);
  const prompt = buildGeminiIllustrationPrompt(
    content,
    first.design,
    first.artStyle,
    first.generationNonce
  );
  assert.ok(prompt.includes(content.title), "Gemini prompt must include the exact lesson topic");
  assert.ok(prompt.includes(first.design.name), "Gemini prompt must enforce the selected new layout design");
  assert.ok(prompt.includes(first.artStyle.name), "Gemini prompt must enforce the selected new artistic style");

  const sanitized = sanitizeGeminiSvg(
    '```xml\n<svg><rect width="100" height="100"/><text>Read &amp; Learn & Grow</text></svg>\n```'
  );
  assert.ok(sanitized && sanitized.startsWith("<svg"), "Sanitized SVG must start with <svg");
  assert.ok(sanitized.includes('viewBox="0 0 960 540"'), "Sanitized SVG must include 960x540 viewBox");
  assert.ok(sanitized.includes("Read &amp; Learn &amp; Grow"), "Sanitized SVG must escape bare ampersands");

  const fallbackPng = generateFallbackPngDataUri();
  assert.ok(fallbackPng.startsWith("data:image/png;base64,"));
  const pngBytes = dataUriToUint8Array(fallbackPng);
  assert.ok(pngBytes && pngBytes.length > 1000, "Decoded PNG bytes should be > 1KB");
  assert.strictEqual(pngBytes[0], 0x89);
  assert.strictEqual(pngBytes[1], 0x50);
});

test("generateMatatagDocx produces a valid non-empty DOCX file with embedded school banner", async () => {
  const result = await generateMatatagDocx(sampleMatatagPlan, defaultTeacherProfile);
  assert.ok(result);
  const size = "size" in result ? result.size : (result as Buffer).length;
  assert.ok(size > 80000, `Expected DOCX size > 80000 bytes with banner, got ${size}`);

  const k2Result = await generateMatatagDocx(sampleKinder2FilipinoPlan, defaultTeacherProfile);
  assert.ok(k2Result);
});

test("generateLccpDocx produces valid DOCX files with BOTH LCCP Crest & PAASCU Level II logos plus generated illustration", async () => {
  const result = await generateLccpDocx(sampleLccpPlan, defaultTeacherProfile);
  assert.ok(result);
  const size = "size" in result ? result.size : (result as Buffer).length;
  assert.ok(
    size > 85000,
    `Expected DOCX size > 85000 bytes with both LCCP Crest + PAASCU Level II logo + illustration, got ${size}`
  );

  const mathDocx = await generateLccpDocx(sampleK2MathPlan, defaultTeacherProfile);
  assert.ok(mathDocx);
  const mathSize = "size" in mathDocx ? mathDocx.size : (mathDocx as Buffer).length;
  assert.ok(mathSize > 85000, `Expected Math DOCX size > 85000 bytes, got ${mathSize}`);

  const scienceDocx = await generateLccpDocx(sampleK2SciencePlan, defaultTeacherProfile);
  assert.ok(scienceDocx);
  const scienceSize = "size" in scienceDocx ? scienceDocx.size : (scienceDocx as Buffer).length;
  assert.ok(scienceSize > 85000, `Expected Science DOCX size > 85000 bytes, got ${scienceSize}`);

  const rvePortraitDocx = await generateLccpDocx(sampleK2RvePlan, defaultTeacherProfile);
  assert.ok(rvePortraitDocx);
  const rvePortraitSize =
    "size" in rvePortraitDocx ? rvePortraitDocx.size : (rvePortraitDocx as Buffer).length;
  assert.ok(rvePortraitSize > 85000, `Expected RVE Portrait DOCX size > 85000 bytes, got ${rvePortraitSize}`);

  const rveLandscapeDocx = await generateLccpDocx(
    { ...sampleK2RvePlan, rveFormat: "landscape_adidse" },
    defaultTeacherProfile
  );
  assert.ok(rveLandscapeDocx);
  const rveLandscapeSize =
    "size" in rveLandscapeDocx ? rveLandscapeDocx.size : (rveLandscapeDocx as Buffer).length;
  assert.ok(rveLandscapeSize > 85000, "RVE Landscape ADIDSE DOCX should embed LCCP banner and illustration");
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
