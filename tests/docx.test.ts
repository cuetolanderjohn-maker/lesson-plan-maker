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
  generateUniqueLessonIllustration,
  selectSceneForPanel,
  type SceneId,
} from "../lib/lessonIllustrationGenerator";

test("getLccpBannerBuffer, getLccpCrestBuffer, and getLccpPaascuBuffer return authentic image assets", () => {
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

  const paascu = getLccpPaascuBuffer();
  assert.ok(paascu && paascu.length > 50000, "PAASCU Level II logo buffer should be > 50KB");
  // PNG magic bytes: 89 50 4E 47
  assert.strictEqual(paascu[0], 0x89);
  assert.strictEqual(paascu[1], 0x50);
  assert.strictEqual(paascu[2], 0x4e);
  assert.strictEqual(paascu[3], 0x47);
});

test("generateUniqueLessonIllustration creates a valid PNG data URI for every subject style", async () => {
  const g1Art = await generateUniqueLessonIllustration(sampleMatatagPlan);
  assert.ok(g1Art.startsWith("data:image/png;base64,"), "G1 Filipino art should be PNG data URI");
  const g1Bytes = dataUriToUint8Array(g1Art);
  assert.ok(g1Bytes && g1Bytes.length > 1000, "Decoded PNG bytes should be > 1KB");
  assert.strictEqual(g1Bytes[0], 0x89);
  assert.strictEqual(g1Bytes[1], 0x50);

  const mathArt = await generateUniqueLessonIllustration(sampleK2MathPlan, [], {
    style: "math_concept_sets",
  });
  assert.ok(mathArt.startsWith("data:image/png;base64,"));

  const storyArt = await generateUniqueLessonIllustration(sampleK2SciencePlan, [], {
    style: "comic_story",
  });
  assert.ok(storyArt.startsWith("data:image/png;base64,"));

  const used = new Set<SceneId>();
  assert.strictEqual(
    selectSceneForPanel(
      "The roof protects the house from rain and sun.",
      "Learning About Parts of the House",
      "Language",
      0,
      used
    ),
    "house_roof"
  );
  assert.strictEqual(
    selectSceneForPanel(
      "The walls divide the house into different rooms.",
      "Learning About Parts of the House",
      "Language",
      1,
      used
    ),
    "house_walls_rooms"
  );
  assert.strictEqual(
    selectSceneForPanel(
      "The stairs are used to go up and down.",
      "Learning About Parts of the House",
      "Language",
      2,
      used
    ),
    "house_stairs"
  );
  assert.strictEqual(
    selectSceneForPanel(
      "The door is used to get in and out of the house.",
      "Learning About Parts of the House",
      "Language",
      3,
      used
    ),
    "house_door"
  );

  const usedSchool = new Set<SceneId>();
  assert.strictEqual(
    selectSceneForPanel(
      "The classroom is where we study and learn new things.",
      "Places in the School",
      "Language",
      0,
      usedSchool
    ),
    "school_classroom"
  );
  assert.strictEqual(
    selectSceneForPanel(
      "The library is where we read and borrow books.",
      "Places in the School",
      "Language",
      1,
      usedSchool
    ),
    "school_library"
  );
  assert.strictEqual(
    selectSceneForPanel(
      "The canteen is where we eat our meals.",
      "Places in the School",
      "Language",
      2,
      usedSchool
    ),
    "school_canteen"
  );
  assert.strictEqual(
    selectSceneForPanel(
      "The playground is where we play and exercise with friends.",
      "Places in the School",
      "Language",
      3,
      usedSchool
    ),
    "school_playground"
  );
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
