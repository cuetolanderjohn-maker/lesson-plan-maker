import { IllustrationStyle, ImageInput, LessonPlan } from "./types";

export interface IllustrationGeneratorOptions {
  style?: IllustrationStyle;
  variationSeed?: number;
  customCaption?: string;
}

export type SceneId =
  | "house_roof"
  | "house_walls_rooms"
  | "house_stairs"
  | "house_door"
  | "house_windows"
  | "house_bedroom"
  | "house_kitchen"
  | "house_living_room"
  | "house_bathroom"
  | "house_exterior_family"
  | "moth_oil_lamp"
  | "moth_flame_warning"
  | "moth_garden_lesson"
  | "nature_trees_flowers"
  | "nature_animals_pets"
  | "nature_weather_sky"
  | "nature_care_planting"
  | "sense_sight_observe"
  | "sense_hearing_sounds"
  | "sense_smell_taste"
  | "sense_touch_hygiene"
  | "polite_mano_po"
  | "polite_greeting_school"
  | "polite_sharing_friends"
  | "polite_helping_home"
  | "faith_creation"
  | "faith_prayer_chapel"
  | "storybook_reading_desk";

/**
 * Determines the default illustration style that matches Kat's "sample lesson plan" folder
 * for each subject and grade level.
 */
export function getDefaultIllustrationStyle(plan: LessonPlan): IllustrationStyle {
  if (plan.illustrationStyle) return plan.illustrationStyle;
  if (plan.templateType === "matatag") {
    const isGrade1 = /grade\s*1|baitang\s*1/i.test(plan.gradeSection || "");
    return isGrade1 ? "pag_uugnay_speech" : "comic_story";
  }
  const subj = (plan.subject || "").toLowerCase();
  if (subj.includes("math")) {
    return "math_concept_sets";
  }
  return "comic_story";
}

export function inferIllustrationStyle(plan: {
  templateType: "matatag" | "lccp";
  subject?: string;
  gradeSection?: string;
  gradeLevel?: string;
  illustrationStyle?: IllustrationStyle;
  subjectMatter?: { paksa?: string; lesson?: string };
}): IllustrationStyle {
  if (plan.illustrationStyle) return plan.illustrationStyle;
  if (plan.templateType === "matatag") {
    const isGrade1 = /grade\s*1|baitang\s*1/i.test(plan.gradeSection || "");
    return isGrade1 ? "pag_uugnay_speech" : "comic_story";
  }
  const subj = (plan.subject || "").toLowerCase();
  if (subj.includes("math")) {
    return "math_concept_sets";
  }
  return "comic_story";
}

export function detectGradeTier(plan: LessonPlan): "kinder2" | "grade1" {
  if (plan.templateType === "matatag") {
    return /grade\s*1|baitang\s*1|oloph|olog/i.test(plan.gradeSection || "")
      ? "grade1"
      : "kinder2";
  }
  return /grade\s*1|baitang\s*1/i.test(plan.gradeLevel || "") ? "grade1" : "kinder2";
}

/**
 * Maps a single panel caption + overall lesson context to the most specific visual SceneId
 * so every panel directly illustrates the exact sentence in that panel without generic filler.
 */
export function selectSceneForPanel(
  panelText: string,
  lessonTitle: string,
  subject: string,
  panelIndex: number,
  usedScenes: Set<SceneId>
): SceneId {
  const p = panelText.toLowerCase();
  const t = `${lessonTitle} ${subject}`.toLowerCase();
  const combined = `${p} ${t}`;

  // 1. Specific Part-of-House / Home matches in the panel text itself
  if (/\b(roof|bubong|shingle|chimney|attic)\b/i.test(p)) return "house_roof";
  if (/\b(stair|stairs|hagdan|up and down|upstairs|downstairs|step)\b/i.test(p))
    return "house_stairs";
  if (/\b(door|doors|pinto|pintuan|get in and out|entrance|knock)\b/i.test(p))
    return "house_door";
  if (/\b(window|windows|bintana|curtain|breeze)\b/i.test(p)) return "house_windows";
  if (/\b(bedroom|tulugan|bed|sleep|pillow)\b/i.test(p)) return "house_bedroom";
  if (/\b(kitchen|kusina|cook|stove|fridge|food|dining)\b/i.test(p)) return "house_kitchen";
  if (/\b(bathroom|palikuran|banyo|bath|shower|tub)\b/i.test(p)) return "house_bathroom";
  if (/\b(living room|sala|sofa|couch)\b/i.test(p)) return "house_living_room";
  if (/\b(wall|walls|dingding|divide|different rooms|rooms of the house)\b/i.test(p))
    return "house_walls_rooms";

  // If the overall lesson is about House / Parts of the House / Home
  if (/\b(house|home|bahay|tahanan|rooms|parts of the house)\b/i.test(combined)) {
    const houseSequence: SceneId[] = [
      "house_roof",
      "house_walls_rooms",
      "house_stairs",
      "house_door",
      "house_windows",
      "house_bedroom",
      "house_kitchen",
      "house_living_room",
      "house_exterior_family",
    ];
    for (const candidate of houseSequence) {
      if (!usedScenes.has(candidate)) return candidate;
    }
    return houseSequence[panelIndex % houseSequence.length];
  }

  // 2. Moth / Gamu-gamo / Flame Story matches
  if (/\b(gamu-gamo|moth|lampara|kandila|apoy|ningas|flame|lamp|candle)\b/i.test(combined)) {
    const mothSequence: SceneId[] = [
      "moth_oil_lamp",
      "moth_flame_warning",
      "moth_garden_lesson",
      "polite_helping_home",
    ];
    for (const candidate of mothSequence) {
      if (!usedScenes.has(candidate)) return candidate;
    }
    return mothSequence[panelIndex % mothSequence.length];
  }

  // 3. Science / Senses / Sounds / Body / Hygiene matches
  if (
    /\b(sound|sounds|tunog|huni|loud|soft|malakas|mahina|ear|ears|tainga|hear|hearing|listen|bell|music)\b/i.test(
      p
    )
  )
    return "sense_hearing_sounds";
  if (/\b(eye|eyes|mata|see|sight|look|observe|color|rainbow|paningin)\b/i.test(p))
    return "sense_sight_observe";
  if (
    /\b(nose|ilong|smell|amoy|tongue|dila|taste|panlasa|pang-amoy|sweet|sour|fruit)\b/i.test(p)
  )
    return "sense_smell_taste";
  if (/\b(skin|balat|hand|hands|kamay|touch|pansalat|wash|clean|soap|hygiene)\b/i.test(p))
    return "sense_touch_hygiene";

  if (/\b(sense|senses|pandama|science|body|katawan|sound|tunog)\b/i.test(combined)) {
    const scienceSequence: SceneId[] = [
      "sense_sight_observe",
      "sense_hearing_sounds",
      "sense_smell_taste",
      "sense_touch_hygiene",
    ];
    for (const candidate of scienceSequence) {
      if (!usedScenes.has(candidate)) return candidate;
    }
    return scienceSequence[panelIndex % scienceSequence.length];
  }

  // 4. Nature / Animals / Plants / Weather / Environment
  if (/\b(plant|halaman|tree|puno|flower|bulaklak|seed|garden|leaf|leaves)\b/i.test(p)) {
    return !usedScenes.has("nature_trees_flowers")
      ? "nature_trees_flowers"
      : "nature_care_planting";
  }
  if (/\b(animal|hayop|dog|aso|cat|pusa|bird|ibon|pet|fish|isda|butterfly|paruparo)\b/i.test(p))
    return "nature_animals_pets";
  if (/\b(weather|panahon|rain|ulan|sun|araw|cloud|ulap|wind|hangin)\b/i.test(p))
    return "nature_weather_sky";

  if (
    /\b(nature|kalikasan|animal|hayop|plant|halaman|environment|earth|laudato)\b/i.test(
      combined
    )
  ) {
    const natureSequence: SceneId[] = [
      "nature_trees_flowers",
      "nature_animals_pets",
      "nature_weather_sky",
      "nature_care_planting",
    ];
    for (const candidate of natureSequence) {
      if (!usedScenes.has(candidate)) return candidate;
    }
    return natureSequence[panelIndex % natureSequence.length];
  }

  // 5. Religion / RVE / Faith / God / Prayer
  if (
    /\b(pray|prayer|panalangin|dasal|church|simbahan|chapel|bible|bibliya|oratio|lectio)\b/i.test(
      p
    )
  )
    return "faith_prayer_chapel";
  if (/\b(god|jesus|lord|panginoon|diyos|creation|blessing|faith|rve)\b/i.test(combined)) {
    const faithSequence: SceneId[] = [
      "faith_creation",
      "polite_sharing_friends",
      "faith_prayer_chapel",
      "house_exterior_family",
    ];
    for (const candidate of faithSequence) {
      if (!usedScenes.has(candidate)) return candidate;
    }
    return faithSequence[panelIndex % faithSequence.length];
  }

  // 6. Politeness / Family / Friends / School / Reading Story fallback (Zero random letters!)
  if (/\b(mano|lolo|lola|elder|matanda|po at opo|magalang|respect)\b/i.test(p))
    return "polite_mano_po";
  if (/\b(share|sharing|bahagi|kaibigan|friend|classmate|help|tulong)\b/i.test(p))
    return "polite_sharing_friends";
  if (/\b(school|paaralan|klase|classroom|teacher|guro|read|basa|book|aklat)\b/i.test(p))
    return !usedScenes.has("polite_greeting_school")
      ? "polite_greeting_school"
      : "storybook_reading_desk";

  const generalSequence: SceneId[] = [
    "polite_mano_po",
    "polite_greeting_school",
    "polite_sharing_friends",
    "storybook_reading_desk",
    "polite_helping_home",
    "house_exterior_family",
  ];
  for (const candidate of generalSequence) {
    if (!usedScenes.has(candidate)) return candidate;
  }
  return generalSequence[panelIndex % generalSequence.length];
}

/**
 * Extracts 4 meaningful story/concept panel captions and metadata from any LessonPlan.
 */
export function extractIllustrationContent(plan: LessonPlan): {
  title: string;
  subtitle: string;
  subject: string;
  questionPrompt: string;
  panels: [string, string, string, string];
  gradeTier: "kinder2" | "grade1";
} {
  const gradeTier = detectGradeTier(plan);

  if (plan.templateType === "matatag") {
    const title = (plan.subjectMatter.paksa || "Banghay-Aralin sa Filipino")
      .replace(/^Paksa:\s*/i, "")
      .trim();
    const subtitle = (plan.subjectMatter.wika || plan.gradeSection || "Filipino")
      .replace(/^Wika:\s*/i, "")
      .trim();
    const questionPrompt =
      plan.procedures.discussion.guideQuestions?.[0] ||
      plan.procedures.motivation ||
      "Anong mahalagang aral ang natutuhan mo sa ating kuwento ngayong araw?";

    const rawPanels = [
      ...(plan.illustrationPanels || []),
      ...(plan.procedures.discussion.steps || []),
      ...(plan.procedures.discussion.guideQuestions || []),
      ...(plan.procedures.discussion.deepening || []),
      plan.procedures.valuesIntegration,
      plan.procedures.summary,
    ]
      .map((s) => (s || "").replace(/^[0-9]+[.)]\s*/, "").trim())
      .filter((s) => s.length > 4);

    const panels: [string, string, string, string] = [
      truncateText(rawPanels[0] || `Simula ng Kuwento: ${title}`, 92),
      truncateText(rawPanels[1] || `Pagkilala sa mga Tauhan at Pangyayari (${subtitle})`, 92),
      truncateText(rawPanels[2] || questionPrompt, 92),
      truncateText(
        rawPanels[3] ||
          plan.procedures.valuesIntegration ||
          "Pagsasabuhay ng mabuting aral sa araw-araw.",
        92
      ),
    ];

    return {
      title,
      subtitle,
      subject: plan.subject || "Filipino",
      questionPrompt: truncateText(questionPrompt, 110),
      panels,
      gradeTier,
    };
  }

  // LCCP Learning Plan (Language, Science, Math, RVE)
  if (plan.rveFormat === "landscape_adidse" && plan.adidse) {
    const title =
      plan.adidse.lessonTitle || plan.subjectMatter.lesson || "Religion Learning Plan";
    const subtitle = plan.adidse.valueFocus || "Augustinian Lectio Divina (ADIDSE)";
    const lectioSentences = (plan.adidse.lectio || "")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);

    const rawPanels = [
      ...(plan.illustrationPanels || []),
      ...lectioSentences,
      ...(plan.adidse.meditatio || []),
      plan.adidse.inputDeepening,
    ].filter((s) => s && s.trim().length > 4);

    const panels: [string, string, string, string] = [
      truncateText(rawPanels[0] || `Lectio: ${title}`, 92),
      truncateText(
        rawPanels[1] || plan.adidse.meditatio?.[0] || "Sharing God's gifts with our friends.",
        92
      ),
      truncateText(rawPanels[2] || plan.adidse.oratio || "Praying and thanking God with love.", 92),
      truncateText(
        rawPanels[3] || plan.adidse.contemplatio || "Living out God's love at home and in school.",
        92
      ),
    ];

    return {
      title,
      subtitle,
      subject: plan.subject || "RVE",
      questionPrompt: truncateText(
        plan.adidse.meditatio?.[0] || "How do we show love and gratitude to God?",
        110
      ),
      panels,
      gradeTier,
    };
  }

  const title = plan.subjectMatter.lesson || `${plan.subject} Learning Plan`;
  const subtitle = `${plan.subject} • ${plan.gradeLevel || "Kinder 2"}`;
  const strategyQuestions =
    plan.procedures.learningStrategies?.flatMap((st) => st.questions || []) || [];
  const questionPrompt =
    strategyQuestions[0] ||
    plan.objectives?.[0] ||
    `What can we discover and learn from ${title}?`;

  const rawPanels = [
    ...(plan.illustrationPanels || []),
    ...strategyQuestions,
    ...(plan.procedures.learningStrategies?.map((st) => `${st.title}: ${st.instructions}`) || []),
    ...(plan.objectives || []),
    plan.valuesStatement,
    plan.closure,
  ]
    .map((s) => (s || "").replace(/^[0-9]+[.)]\s*/, "").trim())
    .filter((s) => s.length > 4);

  const panels: [string, string, string, string] = [
    truncateText(rawPanels[0] || `Exploring ${title}`, 92),
    truncateText(rawPanels[1] || `Guided Activity: ${subtitle}`, 92),
    truncateText(rawPanels[2] || questionPrompt, 92),
    truncateText(
      rawPanels[3] || plan.valuesStatement || "Sharing and learning together in class.",
      92
    ),
  ];

  return {
    title,
    subtitle,
    subject: plan.subject || "Language",
    questionPrompt: truncateText(questionPrompt, 110),
    panels,
    gradeTier,
  };
}

function truncateText(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).trimEnd() + "…";
}

function hashString(str: string, seed = 0): number {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/**
 * Generates a valid uncompressed RGB PNG data URI in pure TypeScript (for Node/Vitest or fallback)
 * so that `generatedIllustrationUrl` is always a real PNG with valid magic bytes.
 */
export function generateFallbackPngDataUri(seedInput: number | string = 1): string {
  const seedNumber =
    typeof seedInput === "number" ? seedInput : hashString(String(seedInput));
  const width = 48;
  const height = 32;
  const rawRows: number[] = [];

  const rBase = 70 + ((seedNumber * 37) % 140);
  const gBase = 110 + ((seedNumber * 53) % 120);
  const bBase = 150 + ((seedNumber * 29) % 100);

  for (let y = 0; y < height; y++) {
    rawRows.push(0);
    for (let x = 0; x < width; x++) {
      const isBorder =
        x < 2 || x >= width - 2 || y < 2 || y >= height - 2 || x === 24 || y === 16;
      if (isBorder) {
        rawRows.push(44, 24, 16);
      } else {
        rawRows.push((rBase + x * 2) % 255, (gBase + y * 3) % 255, bBase);
      }
    }
  }

  const rawData = new Uint8Array(rawRows);
  const len = rawData.length;
  const zlib = new Uint8Array(2 + 5 + len + 4);
  zlib[0] = 0x78;
  zlib[1] = 0x01;
  zlib[2] = 0x01;
  zlib[3] = len & 0xff;
  zlib[4] = (len >>> 8) & 0xff;
  const nlen = ~len & 0xffff;
  zlib[5] = nlen & 0xff;
  zlib[6] = (nlen >>> 8) & 0xff;
  zlib.set(rawData, 7);

  let a = 1;
  let b = 0;
  for (let i = 0; i < len; i++) {
    a = (a + rawData[i]) % 65521;
    b = (b + a) % 65521;
  }
  const adler = ((b << 16) | a) >>> 0;
  zlib[7 + len] = (adler >>> 24) & 0xff;
  zlib[7 + len + 1] = (adler >>> 16) & 0xff;
  zlib[7 + len + 2] = (adler >>> 8) & 0xff;
  zlib[7 + len + 3] = adler & 0xff;

  const ihdr = new Uint8Array([0, 0, 0, width, 0, 0, 0, height, 8, 2, 0, 0, 0]);
  const chunks = [
    makePngChunk("IHDR", ihdr),
    makePngChunk("IDAT", zlib),
    makePngChunk("IEND", new Uint8Array(0)),
  ];

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const totalLen = signature.length + chunks.reduce((acc, c) => acc + c.length, 0);
  const png = new Uint8Array(totalLen);
  png.set(signature, 0);
  let offset = signature.length;
  for (const c of chunks) {
    png.set(c, offset);
    offset += c.length;
  }

  let binary = "";
  for (let i = 0; i < png.length; i++) {
    binary += String.fromCharCode(png[i]);
  }
  const b64 =
    typeof Buffer !== "undefined" ? Buffer.from(png).toString("base64") : btoa(binary);
  return `data:image/png;base64,${b64}`;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  const len = data.length;
  chunk[0] = (len >>> 24) & 0xff;
  chunk[1] = (len >>> 16) & 0xff;
  chunk[2] = (len >>> 8) & 0xff;
  chunk[3] = len & 0xff;
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + data.length));
  const end = 8 + data.length;
  chunk[end] = (crc >>> 24) & 0xff;
  chunk[end + 1] = (crc >>> 16) & 0xff;
  chunk[end + 2] = (crc >>> 8) & 0xff;
  chunk[end + 3] = crc & 0xff;
  return chunk;
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Generates a cohesive, high-craft storybook illustration (`data:image/png;base64,...`)
 * where every panel/element directly depicts the exact subject matter of the lesson
 * with zero random letters, zero generic speech bubbles, and zero textbook photo crops.
 */
export async function generateUniqueLessonIllustration(
  plan: LessonPlan,
  _textbookImages?: ImageInput[],
  options?: IllustrationGeneratorOptions
): Promise<string> {
  const style = options?.style || getDefaultIllustrationStyle(plan);
  const content = extractIllustrationContent(plan);
  const seed = hashString(
    `${content.title}|${content.panels.join("|")}|${style}|${options?.variationSeed ?? 0}`,
    options?.variationSeed ?? 0
  );

  if (typeof document === "undefined") {
    return generateFallbackPngDataUri(seed);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 920;
  canvas.height = 580;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return generateFallbackPngDataUri(seed);
  }

  if (style === "pag_uugnay_speech") {
    drawPagUugnaySpeechScene(ctx, canvas.width, canvas.height, content, seed);
  } else if (style === "math_concept_sets") {
    drawMathConceptSetsScene(ctx, canvas.width, canvas.height, content, seed);
  } else {
    drawFourPanelStorybookScene(ctx, canvas.width, canvas.height, content, seed);
  }

  return canvas.toDataURL("image/png");
}

/**
 * Style 1: Clean 4-Panel Children's Storybook Illustration
 * Each panel renders a distinct, detailed architectural or storybook scene matching
 * that exact panel's caption (e.g., Roof, Walls/Rooms, Stairs, Door for Parts of the House).
 * No noisy header bar, no random floating letters, no generic speech bubbles.
 */
function drawFourPanelStorybookScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  seed: number
) {
  ctx.fillStyle = "#FFFDF9";
  ctx.fillRect(0, 0, w, h);

  const gap = 14;
  const pad = 14;
  const panelW = (w - pad * 2 - gap) / 2;
  const panelH = (h - pad * 2 - gap) / 2;

  const positions = [
    { x: pad, y: pad },
    { x: pad + panelW + gap, y: pad },
    { x: pad, y: pad + panelH + gap },
    { x: pad + panelW + gap, y: pad + panelH + gap },
  ];

  const usedScenes = new Set<SceneId>();

  positions.forEach((pos, idx) => {
    const caption = content.panels[idx];
    const sceneId = selectSceneForPanel(
      caption,
      content.title,
      content.subject,
      idx + (seed % 2),
      usedScenes
    );
    usedScenes.add(sceneId);

    ctx.save();
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 16);
    ctx.clip();

    // Render the dedicated storybook scene filling this panel
    renderSceneInRect(ctx, pos.x, pos.y, panelW, panelH - 54, sceneId, seed + idx);

    // Clean Cream Storybook Caption Strip at the bottom of the panel
    const capH = 58;
    const capY = pos.y + panelH - capH;
    ctx.fillStyle = "#FFFDF7";
    ctx.fillRect(pos.x, capY, panelW, capH);

    // Subtle top border on caption strip
    ctx.strokeStyle = "#D6C7B2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x, capY);
    ctx.lineTo(pos.x + panelW, capY);
    ctx.stroke();

    ctx.fillStyle = "#2C1810";
    ctx.font = "bold 13.5px 'Georgia', 'Segoe UI', serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, caption, pos.x + panelW / 2, capY + 23, panelW - 28, 18, 2);

    ctx.restore();

    // Warm dark-brown storybook ink frame around each panel
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 16);
    ctx.stroke();
  });
}

/**
 * Style 2: Grade 1 / Kinder 2 "PAG-UUGNAY" Scene
 * Combines the PAG-UUGNAY question bubble on the left with a large, richly illustrated
 * storybook scene window on the right depicting the exact lesson topic.
 */
function drawPagUugnaySpeechScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  seed: number
) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#FFFBEB");
  bg.addColorStop(1, "#FEF3C7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Left: "PAG-UUGNAY" Header Pill (Matches G1-Filipino-LP-Week 11.docx)
  ctx.fillStyle = "#1E40AF";
  drawRoundedRect(ctx, 26, 22, 260, 48, 24);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 23px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PAG-UUGNAY", 156, 53);

  // Left: Clean Storybook Speech Bubble with the Lesson's Guide Question
  const bubX = 26;
  const bubY = 86;
  const bubW = 420;
  const bubH = 175;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, bubX, bubY, bubW, bubH, 22);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Speech pointer
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(bubX + 145, bubY + bubH);
  ctx.lineTo(bubX + 175, bubY + bubH + 30);
  ctx.lineTo(bubX + 205, bubY + bubH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 18px 'Georgia', 'Segoe UI', serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, content.questionPrompt, bubX + bubW / 2, bubY + 52, bubW - 44, 26, 4);

  // Left Bottom: Warm Storybook Illustrated Filipino Student Reading the Lesson Book
  drawStorybookChild(ctx, 195, 420, "#1E40AF", "#3E2723", 1.25);

  // Right: Large Dedicated Lesson Scene Window (illustrating the exact lesson topic!)
  const winX = 468;
  const winY = 24;
  const winW = w - winX - 24;
  const winH = h - 48;

  const primaryScene = selectSceneForPanel(
    `${content.title} ${content.panels[0]}`,
    content.title,
    content.subject,
    0,
    new Set()
  );

  ctx.save();
  drawRoundedRect(ctx, winX, winY, winW, winH, 20);
  ctx.clip();
  renderSceneInRect(ctx, winX, winY, winW, winH - 76, primaryScene, seed);

  // Bottom Title & Lesson Summary inside Scene Window
  ctx.fillStyle = "#FFFDF7";
  ctx.fillRect(winX, winY + winH - 76, winW, 76);
  ctx.strokeStyle = "#D6C7B2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH - 76);
  ctx.lineTo(winX + winW, winY + winH - 76);
  ctx.stroke();

  ctx.fillStyle = "#2C1810";
  ctx.font = "bold 15px 'Georgia', 'Segoe UI', serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, content.title, winX + winW / 2, winY + winH - 48, winW - 32, 20, 1);
  ctx.fillStyle = "#57534E";
  ctx.font = "13px 'Segoe UI', sans-serif";
  drawWrappedText(ctx, content.panels[0], winX + winW / 2, winY + winH - 24, winW - 32, 17, 1);
  ctx.restore();

  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3.5;
  drawRoundedRect(ctx, winX, winY, winW, winH, 20);
  ctx.stroke();

  // Outer Frame
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 8, 8, w - 16, h - 16, 18);
  ctx.stroke();
}

/**
 * Style 3: Clean Kinder 2 / Grade 1 Mathematics Set Cards
 * Matches K2 -WEEK 6 - MATHEMATICS.docx: Two clean, side-by-side rounded Set A & Set B
 * cards on a pure white background with crisp vector objects matching the lesson.
 */
function drawMathConceptSetsScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  seed: number
) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  const cardW = (w - 64) / 2;
  const cardH = h - 96;
  const leftX = 22;
  const rightX = 42 + cardW;
  const cardY = 22;

  const combinedText = `${content.title} ${content.panels.join(" ")}`.toLowerCase();
  type MathItemShape = "car" | "apple" | "star" | "butterfly" | "cupcake" | "house";
  let shapeA: MathItemShape = "car";
  let shapeB: MathItemShape = "star";

  if (/apple|fruit|mansanas|prutas/i.test(combinedText)) {
    shapeA = "apple";
    shapeB = "cupcake";
  } else if (/butterfly|insect|flower|garden|paruparo/i.test(combinedText)) {
    shapeA = "butterfly";
    shapeB = "apple";
  } else if (/house|home|bahay/i.test(combinedText)) {
    shapeA = "house";
    shapeB = "star";
  } else {
    const pool: MathItemShape[] = ["car", "apple", "star", "butterfly", "cupcake"];
    shapeA = pool[seed % pool.length];
    shapeB = pool[(seed + 2) % pool.length];
  }

  const countA = 5 + (seed % 2); // 5 or 6
  const countB = 3 + (seed % 2); // 3 or 4

  const sets = [
    {
      x: leftX,
      border: "#E11D48",
      fill: "#FFF5F5",
      title: "Set A",
      count: countA,
      shape: shapeA,
      caption: content.panels[0],
    },
    {
      x: rightX,
      border: "#2563EB",
      fill: "#F0F7FF",
      title: "Set B",
      count: countB,
      shape: shapeB,
      caption: content.panels[1],
    },
  ];

  sets.forEach((s) => {
    ctx.fillStyle = s.fill;
    drawRoundedRect(ctx, s.x, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.strokeStyle = s.border;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Clean Set Header
    ctx.fillStyle = s.border;
    ctx.font = "bold 24px 'Georgia', 'Segoe UI', serif";
    ctx.textAlign = "center";
    ctx.fillText(s.title, s.x + cardW / 2, cardY + 44);

    // Draw crisp countable objects in a balanced 3-column grid
    const cols = 3;
    for (let i = 0; i < s.count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = s.x + 88 + col * 124;
      const oy = cardY + 135 + row * 125;
      drawCrispMathObject(ctx, ox, oy, s.shape, i + seed);
    }

    // Bottom description inside card
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, s.x + 20, cardY + cardH - 68, cardW - 40, 48, 12);
    ctx.fill();
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, s.caption, s.x + cardW / 2, cardY + cardH - 40, cardW - 56, 17, 2);
  });

  // Clean Lesson Title Caption at bottom
  ctx.fillStyle = "#2C1810";
  ctx.font = "bold 16px 'Georgia', 'Segoe UI', serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${content.title} — Compare Set A (${countA}) and Set B (${countB})`,
    w / 2,
    h - 28
  );
}

/* ============================================================================
 * DEDICATED ARCHITECTURAL & STORYBOOK SCENE RENDERERS
 * Inspired by k2_image2.jpeg and k2_image3.jpeg — warm cel-shaded fills,
 * crisp #3E2723 dark-brown outlines, glass reflections, furniture props,
 * and direct depiction of the exact lesson topic.
 * ========================================================================== */
function renderSceneInRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  sceneId: SceneId,
  seed: number
) {
  ctx.save();
  ctx.translate(x, y);

  switch (sceneId) {
    case "house_roof":
      drawSceneHouseRoof(ctx, w, h);
      break;
    case "house_walls_rooms":
      drawSceneHouseCutawayRooms(ctx, w, h);
      break;
    case "house_stairs":
      drawSceneHouseStairs(ctx, w, h);
      break;
    case "house_door":
      drawSceneHouseDoor(ctx, w, h);
      break;
    case "house_windows":
      drawSceneHouseWindows(ctx, w, h);
      break;
    case "house_bedroom":
      drawSceneSingleRoom(ctx, w, h, "bedroom");
      break;
    case "house_kitchen":
      drawSceneSingleRoom(ctx, w, h, "kitchen");
      break;
    case "house_living_room":
      drawSceneSingleRoom(ctx, w, h, "living");
      break;
    case "house_bathroom":
      drawSceneSingleRoom(ctx, w, h, "bathroom");
      break;
    case "house_exterior_family":
      drawSceneHouseExteriorFamily(ctx, w, h);
      break;
    case "moth_oil_lamp":
      drawSceneMothOilLamp(ctx, w, h, false);
      break;
    case "moth_flame_warning":
      drawSceneMothOilLamp(ctx, w, h, true);
      break;
    case "moth_garden_lesson":
    case "nature_trees_flowers":
      drawSceneNatureGarden(ctx, w, h);
      break;
    case "nature_animals_pets":
      drawSceneAnimalsMeadow(ctx, w, h);
      break;
    case "nature_weather_sky":
      drawSceneWeatherSky(ctx, w, h);
      break;
    case "nature_care_planting":
      drawScenePlantingCare(ctx, w, h);
      break;
    case "sense_sight_observe":
      drawSceneSenseSight(ctx, w, h);
      break;
    case "sense_hearing_sounds":
      drawSceneSenseHearing(ctx, w, h);
      break;
    case "sense_smell_taste":
      drawSceneSenseSmellTaste(ctx, w, h);
      break;
    case "sense_touch_hygiene":
      drawSceneSenseTouchHygiene(ctx, w, h);
      break;
    case "polite_mano_po":
      drawScenePoliteManoPo(ctx, w, h);
      break;
    case "polite_greeting_school":
      drawSceneClassroomLearning(ctx, w, h);
      break;
    case "polite_sharing_friends":
      drawSceneSharingTable(ctx, w, h);
      break;
    case "polite_helping_home":
      drawSceneSingleRoom(ctx, w, h, "living");
      break;
    case "faith_creation":
      drawSceneFaithCreation(ctx, w, h);
      break;
    case "faith_prayer_chapel":
      drawSceneFaithChapel(ctx, w, h);
      break;
    case "storybook_reading_desk":
    default:
      drawSceneStorybookDesk(ctx, w, h, seed);
      break;
  }

  ctx.restore();
}

/**
 * 1. THE ROOF: Detailed architectural roof with terracotta shingles, timber eaves,
 * chimney, and attic study room (like k2_image3.jpeg) protecting from sun and rain.
 */
function drawSceneHouseRoof(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Split sky: warm sunny sky on left, gentle raincloud sky on right
  const sky = ctx.createLinearGradient(0, 0, w, 0);
  sky.addColorStop(0, "#BAE6FD");
  sky.addColorStop(0.55, "#E0F2FE");
  sky.addColorStop(1, "#CBD5E1");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Soft white cloud on left
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(135, 34, 14, 0, Math.PI * 2);
  ctx.arc(152, 30, 18, 0, Math.PI * 2);
  ctx.arc(170, 35, 13, 0, Math.PI * 2);
  ctx.fill();

  // Warm Golden Sun on left
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(54, 42, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(54 + Math.cos(a) * 27, 42 + Math.sin(a) * 27);
    ctx.lineTo(54 + Math.cos(a) * 36, 42 + Math.sin(a) * 36);
    ctx.stroke();
  }

  // Raincloud & raindrops on right deflected by the roof
  ctx.fillStyle = "#94A3B8";
  ctx.beginPath();
  ctx.arc(w - 96, 34, 18, 0, Math.PI * 2);
  ctx.arc(w - 72, 28, 22, 0, Math.PI * 2);
  ctx.arc(w - 48, 36, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0284C7";
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 6; i++) {
    const rx = w - 106 + i * 13;
    const ry = 60 + (i % 2) * 11;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 5, ry + 11);
    ctx.stroke();
  }

  // Brick Chimney with Mortar Lines
  const houseW = w * 0.78;
  const houseX = (w - houseW) / 2;
  ctx.fillStyle = "#B45309";
  ctx.fillRect(houseX + houseW - 78, h * 0.16, 36, 68);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(houseX + houseW - 78, h * 0.16, 36, 68);
  ctx.fillStyle = "#92400E";
  ctx.fillRect(houseX + houseW - 82, h * 0.14, 44, 8);
  ctx.strokeRect(houseX + houseW - 82, h * 0.14, 44, 8);

  // Lower House Wall Trim
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(houseX + 14, h * 0.72, houseW - 28, h * 0.28);
  ctx.strokeRect(houseX + 14, h * 0.72, houseW - 28, h * 0.28);

  // Outer Red Roof Beam (k2_image3.jpeg style)
  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(houseX - 18, h * 0.74);
  ctx.lineTo(w / 2, h * 0.08);
  ctx.lineTo(houseX + houseW + 18, h * 0.74);
  ctx.lineTo(houseX + houseW + 4, h * 0.8);
  ctx.lineTo(w / 2, h * 0.17);
  ctx.lineTo(houseX - 4, h * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner Timber Gable Triangle (Lavender Attic Study Room like k2_image3.jpeg!)
  ctx.fillStyle = "#EDE9FE";
  ctx.beginPath();
  ctx.moveTo(houseX + 22, h * 0.72);
  ctx.lineTo(w / 2, h * 0.2);
  ctx.lineTo(houseX + houseW - 22, h * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Attic Study Desk, Laptop, Lamp & Bookshelf inside the Roof Gable
  const deskY = h * 0.56;
  ctx.fillStyle = "#D97706";
  ctx.fillRect(w / 2 - 54, deskY, 96, 8);
  ctx.strokeRect(w / 2 - 54, deskY, 96, 8);
  ctx.fillRect(w / 2 - 48, deskY + 8, 10, 24);
  ctx.strokeRect(w / 2 - 48, deskY + 8, 10, 24);
  ctx.fillRect(w / 2 + 26, deskY + 8, 10, 24);
  ctx.strokeRect(w / 2 + 26, deskY + 8, 10, 24);

  // Laptop on attic desk
  ctx.fillStyle = "#64748B";
  ctx.fillRect(w / 2 - 18, deskY - 20, 32, 20);
  ctx.strokeRect(w / 2 - 18, deskY - 20, 32, 20);
  ctx.fillStyle = "#94A3B8";
  ctx.fillRect(w / 2 - 14, deskY - 17, 24, 14);

  // Purple Study Chair on right of desk
  ctx.fillStyle = "#8B5CF6";
  drawRoundedRect(ctx, w / 2 + 52, deskY - 12, 20, 24, 4);
  ctx.fill();
  ctx.stroke();
}

/**
 * 2. THE WALLS & ROOMS: Cutaway Dollhouse Cross-Section (Modeled after k2_image3.jpeg!)
 * Shows interior walls dividing Bathroom, Bedroom, Kitchen, and Living Room with rich furniture.
 */
function drawSceneHouseCutawayRooms(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, w, h);

  const marginX = 28;
  const topY = 10;
  const houseW = w - marginX * 2;
  const houseH = h - 16;
  const midX = marginX + houseW / 2;
  const midY = topY + houseH * 0.48;
  const rw = houseW / 2;
  const rhTop = houseH * 0.48;
  const rhBot = houseH * 0.52;

  // 1. Top-Left: Bathroom (Sky Blue Tile Grid)
  ctx.fillStyle = "#E0F2FE";
  ctx.fillRect(marginX, topY, rw, rhTop);
  ctx.strokeStyle = "rgba(14, 165, 233, 0.15)";
  ctx.lineWidth = 1;
  for (let gx = marginX + 18; gx < midX; gx += 18) {
    ctx.beginPath();
    ctx.moveTo(gx, topY);
    ctx.lineTo(gx, midY);
    ctx.stroke();
  }
  // Clawfoot Tub + Blue Towel + Mirror + Vanity Sink + Toilet
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 1.8;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, marginX + 12, midY - 30, 72, 24, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(marginX + 52, midY - 30, 14, 16);
  ctx.strokeRect(marginX + 52, midY - 30, 14, 16);
  // Mirror & Sink
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(marginX + 96, topY + 14, 32, 34);
  ctx.strokeRect(marginX + 96, topY + 14, 32, 34);
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(marginX + 94, midY - 30, 36, 24);
  ctx.strokeRect(marginX + 94, midY - 30, 36, 24);
  // Toilet
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, marginX + 142, midY - 40, 24, 18, 3);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, marginX + 144, midY - 22, 20, 16, 6);
  ctx.fill();
  ctx.stroke();

  // 2. Top-Right: Bedroom (Warm Buttercream + Landscape Painting + Tufted Bed + Lamps)
  ctx.fillStyle = "#FEF9C3";
  ctx.fillRect(midX, topY, rw, rhTop);
  // Framed landscape painting above bed
  ctx.fillStyle = "#B45309";
  ctx.fillRect(midX + rw / 2 - 28, topY + 8, 56, 26);
  ctx.strokeRect(midX + rw / 2 - 28, topY + 8, 56, 26);
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(midX + rw / 2 - 24, topY + 11, 48, 20);
  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.moveTo(midX + rw / 2 - 24, topY + 31);
  ctx.quadraticCurveTo(midX + rw / 2, topY + 20, midX + rw / 2 + 24, topY + 31);
  ctx.fill();
  // Headboard & Bed
  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, midX + 42, midY - 48, 102, 42, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#FEF08A";
  drawRoundedRect(ctx, midX + 52, midY - 38, 36, 13, 3);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, midX + 98, midY - 38, 36, 13, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#86EFAC";
  ctx.fillRect(midX + 42, midY - 24, 102, 18);
  ctx.strokeRect(midX + 42, midY - 24, 102, 18);
  // Nightstands
  ctx.fillStyle = "#B45309";
  ctx.fillRect(midX + 14, midY - 26, 22, 20);
  ctx.strokeRect(midX + 14, midY - 26, 22, 20);
  ctx.fillRect(midX + 150, midY - 26, 22, 20);
  ctx.strokeRect(midX + 150, midY - 26, 22, 20);

  // 3. Bottom-Left: Kitchen (Pastel Pink + Blue Fridge + Range Hood + Stove + Pot)
  ctx.fillStyle = "#FCE7F3";
  ctx.fillRect(marginX, midY, rw, rhBot);
  // Two-door Blue Fridge
  ctx.fillStyle = "#BFDBFE";
  drawRoundedRect(ctx, marginX + 14, midY + 18, 46, rhBot - 24, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(marginX + 14, midY + 52);
  ctx.lineTo(marginX + 60, midY + 52);
  ctx.stroke();
  // Sticky note on fridge
  ctx.fillStyle = "#FEF08A";
  ctx.fillRect(marginX + 30, midY + 34, 10, 10);
  // Kitchen Counter & Oven
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(marginX + 66, topY + houseH - 48, 108, 42);
  ctx.strokeRect(marginX + 66, topY + houseH - 48, 108, 42);
  ctx.fillStyle = "#475569";
  ctx.fillRect(marginX + 92, topY + houseH - 36, 44, 26);
  ctx.strokeRect(marginX + 92, topY + houseH - 36, 44, 26);
  // Pink Cooking Pot & Range Hood
  ctx.fillStyle = "#F43F5E";
  ctx.fillRect(marginX + 96, topY + houseH - 58, 22, 10);
  ctx.strokeRect(marginX + 96, topY + houseH - 58, 22, 10);
  ctx.fillStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.moveTo(marginX + 104, midY + 4);
  ctx.lineTo(marginX + 124, midY + 4);
  ctx.lineTo(marginX + 138, midY + 28);
  ctx.lineTo(marginX + 90, midY + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Bottom-Right: Living Room (Soft Sage + Bookcase + Green Sofa + Coffee Table + Rug)
  ctx.fillStyle = "#D1FAE5";
  ctx.fillRect(midX, midY, rw, rhBot);
  // Bookcase with colorful books
  ctx.fillStyle = "#92400E";
  ctx.fillRect(midX + 14, midY + 20, 44, rhBot - 26);
  ctx.strokeRect(midX + 14, midY + 20, 44, rhBot - 26);
  const bookCols = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  for (let b = 0; b < 4; b++) {
    ctx.fillStyle = bookCols[b];
    ctx.fillRect(midX + 19 + b * 8, midY + 26, 6, 16);
    ctx.fillRect(midX + 19 + b * 8, midY + 48, 6, 16);
  }
  // Plush Green Sofa & Yellow Pillow
  ctx.fillStyle = "#10B981";
  drawRoundedRect(ctx, midX + 70, topY + houseH - 52, 104, 44, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#FACC15";
  drawRoundedRect(ctx, midX + 148, topY + houseH - 44, 18, 18, 4);
  ctx.fill();
  ctx.stroke();
  // Blue Rug & Coffee Table
  ctx.fillStyle = "#38BDF8";
  ctx.beginPath();
  ctx.ellipse(midX + 116, topY + houseH - 6, 36, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bold Timber Walls Dividing the Rooms
  ctx.strokeStyle = "#D97706";
  ctx.lineWidth = 8;
  ctx.strokeRect(marginX, topY, houseW, houseH);
  ctx.beginPath();
  ctx.moveTo(midX, topY);
  ctx.lineTo(midX, topY + houseH);
  ctx.moveTo(marginX, midY);
  ctx.lineTo(marginX + houseW, midY);
  ctx.stroke();

  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(marginX - 4, topY - 4, houseW + 8, houseH + 8);
}

/**
 * 3. THE STAIRS: Interior wooden staircase with turned balusters, oak handrail,
 * wainscot wall paneling, upstairs bedroom door, framed pictures, and floor runner rug.
 */
function drawSceneHouseStairs(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Warm cream hallway wall & wainscot trim
  ctx.fillStyle = "#FEF9C3";
  ctx.fillRect(0, 0, w, h * 0.78);
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(0, h * 0.56, w, h * 0.22);
  ctx.fillStyle = "#B45309";
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;

  // Ascending Framed Landscape Pictures along the Staircase Wall
  [
    { x: 52, y: 98, c: "#BAE6FD" },
    { x: 112, y: 66, c: "#BBF7D0" },
    { x: 172, y: 34, c: "#FBCFE8" },
  ].forEach((fr) => {
    ctx.fillStyle = "#78350F";
    ctx.fillRect(fr.x - 4, fr.y - 4, 44, 34);
    ctx.strokeRect(fr.x - 4, fr.y - 4, 44, 34);
    ctx.fillStyle = fr.c;
    ctx.fillRect(fr.x, fr.y, 36, 26);
  });

  // Upstairs Landing & Paneled Bedroom Door on Top Right
  const steps = 6;
  const startX = 86;
  const startY = h * 0.82;
  const stepW = 40;
  const stepH = 21;
  const topLandingX = startX + steps * stepW;
  const topLandingY = startY - steps * stepH;

  ctx.fillStyle = "#92400E";
  ctx.fillRect(topLandingX - 4, topLandingY, w - topLandingX + 10, startY - topLandingY);
  ctx.strokeRect(topLandingX - 4, topLandingY, w - topLandingX + 10, startY - topLandingY);

  // Upstairs Door
  ctx.fillStyle = "#D97706";
  ctx.fillRect(topLandingX + 22, 16, 48, topLandingY - 16);
  ctx.strokeRect(topLandingX + 22, 16, 48, topLandingY - 16);
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(topLandingX + 60, 44, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Wooden Staircase Steps rising from bottom-left to top-right
  for (let i = 0; i < steps; i++) {
    const sx = startX + i * stepW;
    const sy = startY - (i + 1) * stepH;
    const sh = (i + 1) * stepH;
    ctx.fillStyle = "#B45309";
    ctx.fillRect(sx, sy, stepW + 2, sh);
    ctx.strokeRect(sx, sy, stepW + 2, sh);

    // Golden Oak Step Tread
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(sx - 3, sy, stepW + 6, 7);
    ctx.strokeRect(sx - 3, sy, stepW + 6, 7);

    // Turned White Baluster Post
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(sx + 16, sy - 40, 6, 40);
    ctx.strokeRect(sx + 16, sy - 40, 6, 40);
  }

  // Newel Posts & Diagonal Handrail Banister
  ctx.fillStyle = "#78350F";
  ctx.fillRect(startX - 6, startY - stepH - 48, 14, 52);
  ctx.strokeRect(startX - 6, startY - stepH - 48, 14, 52);

  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY - stepH - 42);
  ctx.lineTo(topLandingX + 8, topLandingY - 40);
  ctx.stroke();

  // Cozy Rug at foot of stairs
  ctx.fillStyle = "#10B981";
  ctx.beginPath();
  ctx.ellipse(54, h * 0.88, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * 4. THE DOOR: Inviting front porch entrance with 6-panel oak door, arched fanlight window,
 * brass doorknob, white picket fence, lantern, welcome mat, and blooming flowerpots.
 */
function drawSceneHouseDoor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Exterior Cream Clapboard Wall & Lush Green Lawn
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, w, h * 0.74);
  ctx.strokeStyle = "rgba(217, 119, 6, 0.18)";
  ctx.lineWidth = 1.5;
  for (let sy = 18; sy < h * 0.74; sy += 16) {
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(w, sy);
    ctx.stroke();
  }

  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(0, h * 0.74, w, h * 0.26);

  // White Picket Fence & Green Bushes on Left and Right
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;
  for (const sideX of [16, w - 118]) {
    for (let p = 0; p < 4; p++) {
      const px = sideX + p * 24;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(px, h * 0.52, 16, h * 0.24);
      ctx.strokeRect(px, h * 0.52, 16, h * 0.24);
    }
    ctx.fillStyle = "#22C55E";
    ctx.beginPath();
    ctx.arc(sideX + 24, h * 0.72, 24, 0, Math.PI * 2);
    ctx.arc(sideX + 58, h * 0.73, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Stone Pathway & Welcome Mat
  ctx.fillStyle = "#E7E5E4";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 46, h * 0.74);
  ctx.lineTo(w / 2 + 46, h * 0.74);
  ctx.lineTo(w / 2 + 74, h);
  ctx.lineTo(w / 2 - 74, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Terracotta Welcome Doormat
  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, w / 2 - 38, h * 0.77, 76, 18, 4);
  ctx.fill();
  ctx.stroke();

  // Door Frame & Paneled Wooden Front Door
  const doorW = 92;
  const doorH = 142;
  const doorX = (w - doorW) / 2;
  const doorY = h * 0.74 - doorH;

  ctx.fillStyle = "#78350F";
  ctx.fillRect(doorX - 9, doorY - 9, doorW + 18, doorH + 9);
  ctx.strokeRect(doorX - 9, doorY - 9, doorW + 18, doorH + 9);

  ctx.fillStyle = "#B45309";
  ctx.fillRect(doorX, doorY, doorW, doorH);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.strokeRect(doorX, doorY, doorW, doorH);

  // Arched Fanlight Glass Window with Sunburst Muntins
  ctx.fillStyle = "#BAE6FD";
  ctx.beginPath();
  ctx.arc(w / 2, doorY + 34, 28, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, doorY + 34);
  ctx.lineTo(w / 2, doorY + 6);
  ctx.moveTo(w / 2, doorY + 34);
  ctx.lineTo(w / 2 - 20, doorY + 14);
  ctx.moveTo(w / 2, doorY + 34);
  ctx.lineTo(w / 2 + 20, doorY + 14);
  ctx.stroke();

  // Recessed Wooden Door Panels
  ctx.fillStyle = "#92400E";
  [
    [doorX + 14, doorY + 46, 26, 36],
    [doorX + 52, doorY + 46, 26, 36],
    [doorX + 14, doorY + 92, 26, 36],
    [doorX + 52, doorY + 92, 26, 36],
  ].forEach(([rx, ry, rw, rh]) => {
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);
  });

  // Golden Doorknob & Keyhole Plate
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(doorX + doorW - 13, doorY + 84, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Potted Flowering Plants flanking the front door
  [doorX - 38, doorX + doorW + 38].forEach((px) => {
    ctx.fillStyle = "#EA580C";
    ctx.fillRect(px - 15, h * 0.74 - 28, 30, 28);
    ctx.strokeRect(px - 15, h * 0.74 - 28, 30, 28);
    ctx.fillStyle = "#16A34A";
    ctx.beginPath();
    ctx.arc(px, h * 0.74 - 42, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#F43F5E";
    ctx.beginPath();
    ctx.arc(px - 6, h * 0.74 - 46, 5, 0, Math.PI * 2);
    ctx.arc(px + 7, h * 0.74 - 38, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSceneHouseWindows(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, w, h);

  const winW = 150;
  const winH = 118;
  const winX = (w - winW) / 2;
  const winY = 24;

  // Sky & hills visible through open window
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(winX, winY, winW, winH);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(winX, winY + winH - 28, winW, 28);
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(winX + 38, winY + 32, 16, 0, Math.PI * 2);
  ctx.fill();

  // Window panes & curtains
  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 6;
  ctx.strokeRect(winX, winY, winW, winH);
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH / 2);
  ctx.lineTo(winX + winW, winY + winH / 2);
  ctx.stroke();

  // Window Flowerbox with pink & yellow blooms
  ctx.fillStyle = "#B45309";
  ctx.fillRect(winX - 12, winY + winH, winW + 24, 24);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(winX - 12, winY + winH, winW + 24, 24);
  for (let fx = winX + 12; fx < winX + winW - 8; fx += 28) {
    ctx.fillStyle = "#22C55E";
    ctx.beginPath();
    ctx.arc(fx, winY + winH - 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#F43F5E";
    ctx.beginPath();
    ctx.arc(fx, winY + winH - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSceneSingleRoom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  room: "bedroom" | "kitchen" | "living" | "bathroom"
) {
  const wallColors = {
    bedroom: "#FEF3C7",
    kitchen: "#FCE7F3",
    living: "#D1FAE5",
    bathroom: "#E0F2FE",
  };
  ctx.fillStyle = wallColors[room];
  ctx.fillRect(0, 0, w, h * 0.78);
  ctx.fillStyle = "#D97706";
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;

  if (room === "bedroom") {
    ctx.fillStyle = "#92400E";
    drawRoundedRect(ctx, w / 2 - 90, h * 0.36, 180, 82, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FEF08A";
    drawRoundedRect(ctx, w / 2 - 72, h * 0.44, 58, 22, 6);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, w / 2 + 14, h * 0.44, 58, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#86EFAC";
    ctx.fillRect(w / 2 - 90, h * 0.58, 180, 38);
    ctx.strokeRect(w / 2 - 90, h * 0.58, 180, 38);
  } else if (room === "kitchen") {
    ctx.fillStyle = "#BFDBFE";
    ctx.fillRect(72, h * 0.24, 68, h * 0.54);
    ctx.strokeRect(72, h * 0.24, 68, h * 0.54);
    ctx.fillStyle = "#FDE68A";
    ctx.fillRect(156, h * 0.46, 180, h * 0.32);
    ctx.strokeRect(156, h * 0.46, 180, h * 0.32);
    ctx.fillStyle = "#334155";
    ctx.fillRect(188, h * 0.54, 64, h * 0.2);
  } else if (room === "bathroom") {
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, 64, h * 0.5, 130, 48, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#BAE6FD";
    ctx.fillRect(236, h * 0.2, 62, 56);
    ctx.strokeRect(236, h * 0.2, 62, 56);
  } else {
    ctx.fillStyle = "#92400E";
    ctx.fillRect(58, h * 0.22, 64, h * 0.56);
    ctx.strokeRect(58, h * 0.22, 64, h * 0.56);
    ctx.fillStyle = "#10B981";
    drawRoundedRect(ctx, 152, h * 0.44, 195, 64, 14);
    ctx.fill();
    ctx.stroke();
  }
}

function drawSceneHouseExteriorFamily(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(0, 0, w, h * 0.72);
  ctx.fillStyle = "#86EFAC";
  ctx.fillRect(0, h * 0.72, w, h * 0.28);

  const hx = w / 2 - 110;
  const hy = h * 0.34;
  const hw = 220;
  const hh = h * 0.42;

  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(hx, hy, hw, hh);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.strokeRect(hx, hy, hw, hh);

  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(hx - 22, hy + 4);
  ctx.lineTo(w / 2, hy - 58);
  ctx.lineTo(hx + hw + 22, hy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#92400E";
  ctx.fillRect(w / 2 - 20, hy + hh - 54, 40, 54);
  ctx.strokeRect(w / 2 - 20, hy + hh - 54, 40, 54);

  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(hx + 22, hy + 20, 44, 38);
  ctx.strokeRect(hx + 22, hy + 20, 44, 38);
  ctx.fillRect(hx + hw - 66, hy + 20, 44, 38);
  ctx.strokeRect(hx + hw - 66, hy + 20, 44, 38);
}

/**
 * 5. ANG MUNTING GAMU-GAMO: Glowing vintage oil lamp on table with Mother Moth & Little Moth.
 */
function drawSceneMothOilLamp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  closeToFlame: boolean
) {
  const bg = ctx.createRadialGradient(w / 2, h * 0.42, 16, w / 2, h * 0.42, w * 0.65);
  bg.addColorStop(0, "#FEF08A");
  bg.addColorStop(0.5, "#FDBA74");
  bg.addColorStop(1, "#7C2D12");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#78350F";
  ctx.fillRect(0, h * 0.76, w, h * 0.24);

  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, w / 2 - 36, h * 0.58, 72, 34, 12);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.24);
  ctx.quadraticCurveTo(w / 2 + 22, h * 0.44, w / 2, h * 0.56);
  ctx.quadraticCurveTo(w / 2 - 22, h * 0.44, w / 2, h * 0.24);
  ctx.fill();

  ctx.fillStyle = "#FEF08A";
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.32);
  ctx.quadraticCurveTo(w / 2 + 10, h * 0.46, w / 2, h * 0.54);
  ctx.quadraticCurveTo(w / 2 - 10, h * 0.46, w / 2, h * 0.32);
  ctx.fill();

  drawDetailedButterfly(ctx, w / 2 - 105, h * 0.38, "#F59E0B", "#92400E", 1.15);
  drawDetailedButterfly(
    ctx,
    closeToFlame ? w / 2 + 44 : w / 2 + 95,
    closeToFlame ? h * 0.32 : h * 0.44,
    "#FDE047",
    "#EA580C",
    0.82
  );
}

function drawSceneNatureGarden(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#DBEAFE";
  ctx.fillRect(0, 0, w, h * 0.72);
  ctx.fillStyle = "#86EFAC";
  ctx.fillRect(0, h * 0.72, w, h * 0.28);

  ctx.fillStyle = "#78350F";
  ctx.fillRect(88, h * 0.42, 28, h * 0.34);
  ctx.fillStyle = "#16A34A";
  ctx.beginPath();
  ctx.arc(102, h * 0.34, 48, 0, Math.PI * 2);
  ctx.arc(68, h * 0.42, 34, 0, Math.PI * 2);
  ctx.arc(136, h * 0.42, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  [230, 290, 350].forEach((fx, i) => {
    ctx.strokeStyle = "#15803D";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fx, h * 0.76);
    ctx.lineTo(fx, h * 0.54);
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 ? "#F43F5E" : "#A855F7";
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * 10, h * 0.52 + Math.sin(a) * 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.arc(fx, h * 0.52, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  drawDetailedButterfly(ctx, 275, h * 0.28, "#38BDF8", "#F43F5E", 1);
}

function drawSceneAnimalsMeadow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#E0F2FE";
  ctx.fillRect(0, 0, w, h * 0.7);
  ctx.fillStyle = "#86EFAC";
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(72, h * 0.44, 88, 56);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(72, h * 0.44, 88, 56);
  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(60, h * 0.46);
  ctx.lineTo(116, h * 0.24);
  ctx.lineTo(172, h * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#38BDF8";
  ctx.beginPath();
  ctx.ellipse(w - 125, h * 0.78, 78, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.ellipse(w - 125, h * 0.72, 22, 14, 0, 0, Math.PI * 2);
  ctx.arc(w - 108, h * 0.62, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawSceneWeatherSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(0, 0, w, h * 0.76);
  ctx.fillStyle = "#86EFAC";
  ctx.fillRect(0, h * 0.76, w, h * 0.24);

  const cols = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
  cols.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.76, 110 - i * 7, Math.PI, 0);
    ctx.stroke();
  });
}

function drawScenePlantingCare(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#E0F2FE";
  ctx.fillRect(0, 0, w, h * 0.7);
  ctx.fillStyle = "#A3E635";
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  ctx.fillStyle = "#78350F";
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.76, 46, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = "#15803D";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.72);
  ctx.lineTo(w / 2, h * 0.38);
  ctx.stroke();

  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 22, h * 0.44, 22, 12, -0.4, 0, Math.PI * 2);
  ctx.ellipse(w / 2 + 22, h * 0.4, 22, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSceneSenseSight(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawSceneNatureGarden(ctx, w, h);
  ctx.strokeStyle = "#1E40AF";
  ctx.lineWidth = 6;
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(230, h * 0.5, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(256, h * 0.5 + 26);
  ctx.lineTo(288, h * 0.5 + 58);
  ctx.stroke();
}

function drawSceneSenseHearing(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(135, h * 0.48, 36, Math.PI, 0);
  ctx.lineTo(178, h * 0.66);
  ctx.lineTo(92, h * 0.66);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "#EA580C";
  ctx.lineWidth = 3;
  [48, 62].forEach((r) => {
    ctx.beginPath();
    ctx.arc(135, h * 0.48, r, -0.6, 0.6);
    ctx.stroke();
  });

  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w - 190, h * 0.62);
  ctx.lineTo(w - 60, h * 0.56);
  ctx.stroke();

  ctx.fillStyle = "#38BDF8";
  ctx.beginPath();
  ctx.ellipse(w - 130, h * 0.5, 26, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function drawSceneSenseSmellTaste(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FFFBEB";
  ctx.fillRect(0, 0, w, h * 0.68);
  ctx.fillStyle = "#D97706";
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(w / 2 - 40, h * 0.64, 52, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  drawCrispMathObject(ctx, w / 2 - 62, h * 0.54, "apple", 0);
  drawCrispMathObject(ctx, w / 2 - 18, h * 0.56, "cupcake", 1);
}

function drawSceneSenseTouchHygiene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#E0F2FE";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, w / 2 - 95, h * 0.54, 190, 56, 20);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "#64748B";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.54);
  ctx.lineTo(w / 2, h * 0.32);
  ctx.lineTo(w / 2 + 28, h * 0.32);
  ctx.stroke();

  ctx.fillStyle = "#F472B6";
  drawRoundedRect(ctx, w / 2 - 75, h * 0.44, 42, 22, 8);
  ctx.fill();
}

function drawScenePoliteManoPo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawSceneSingleRoom(ctx, w, h, "living");
  drawStorybookChild(ctx, w / 2 - 48, h * 0.68, "#2563EB", "#92400E", 0.95);
  drawStorybookChild(ctx, w / 2 + 48, h * 0.72, "#E11D48", "#1E293B", 0.82);
}

function drawSceneClassroomLearning(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, w, h * 0.75);
  ctx.fillStyle = "#D97706";
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  ctx.fillStyle = "#14532D";
  drawRoundedRect(ctx, w / 2 - 125, 22, 250, 105, 8);
  ctx.fill();
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 30, 66, 60, 42);
  ctx.beginPath();
  ctx.moveTo(w / 2 - 38, 66);
  ctx.lineTo(w / 2, 40);
  ctx.lineTo(w / 2 + 38, 66);
  ctx.closePath();
  ctx.stroke();
}

function drawSceneSharingTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FEF9C3";
  ctx.fillRect(0, 0, w, h * 0.72);
  ctx.fillStyle = "#B45309";
  ctx.fillRect(48, h * 0.64, w - 96, h * 0.36);

  drawStorybookChild(ctx, w / 2 - 75, h * 0.56, "#0284C7", "#1E293B", 0.88);
  drawStorybookChild(ctx, w / 2 + 75, h * 0.56, "#E11D48", "#78350F", 0.88);
  drawCrispMathObject(ctx, w / 2 - 22, h * 0.56, "apple", 0);
  drawCrispMathObject(ctx, w / 2 + 22, h * 0.56, "cupcake", 1);
}

function drawSceneFaithCreation(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawSceneWeatherSky(ctx, w, h);
  drawSceneNatureGarden(ctx, w, h);
}

function drawSceneFaithChapel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#BAE6FD";
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.45, 58, Math.PI, 0);
  ctx.lineTo(w / 2 + 58, h * 0.78);
  ctx.lineTo(w / 2 - 58, h * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, w / 2 - 7, h * 0.22, 14, 78, 4);
  ctx.fill();
  drawRoundedRect(ctx, w / 2 - 28, h * 0.38, 56, 14, 4);
  ctx.fill();
}

function drawSceneStorybookDesk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number
) {
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, w, h * 0.68);
  ctx.fillStyle = "#92400E";
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, w / 2 - 110, h * 0.32, 220, 96, 8);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.32);
  ctx.lineTo(w / 2, h * 0.32 + 96);
  ctx.stroke();

  drawCrispMathObject(ctx, w / 2 - 55, h * 0.52, "house", seed);
  drawCrispMathObject(ctx, w / 2 + 55, h * 0.52, "star", seed + 1);
}

/**
 * Draws a warm, storybook-style Filipino child character (inspired by k2_image2.jpeg)
 */
function drawStorybookChild(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  shirtColor: string,
  hairColor: string,
  scale = 1
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.fillStyle = shirtColor;
  drawRoundedRect(ctx, -26, 14, 52, 54, 14);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(-14, 15);
  ctx.lineTo(0, 28);
  ctx.lineTo(14, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FCD392";
  ctx.beginPath();
  ctx.arc(0, -10, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -16, 27, Math.PI * 0.92, Math.PI * 2.08);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#2C1810";
  ctx.beginPath();
  ctx.arc(-9, -8, 3.8, 0, Math.PI * 2);
  ctx.arc(9, -8, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(-10, -9.5, 1.4, 0, Math.PI * 2);
  ctx.arc(8, -9.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#E11D48";
  ctx.beginPath();
  ctx.arc(0, -1, 7, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawDetailedButterfly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wingOuter: string,
  wingInner: string,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = wingOuter;
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(-12, -7, 13, 9, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(12, -7, 13, 9, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = wingInner;
  ctx.beginPath();
  ctx.arc(-12, -7, 4.5, 0, Math.PI * 2);
  ctx.arc(12, -7, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3E2723";
  drawRoundedRect(ctx, -2.5, -12, 5, 22, 2.5);
  ctx.fill();
  ctx.restore();
}

function drawCrispMathObject(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shape: "car" | "apple" | "star" | "butterfly" | "cupcake" | "house",
  colorIndex: number
) {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
  const col = colors[colorIndex % colors.length];
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.2;

  if (shape === "car") {
    ctx.fillStyle = col;
    drawRoundedRect(ctx, -30, -6, 60, 20, 7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -6, 17, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(-15, 14, 7.5, 0, Math.PI * 2);
    ctx.arc(15, 14, 7.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "apple") {
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(-7, 2, 15, 0, Math.PI * 2);
    ctx.arc(7, 2, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#16A34A";
    ctx.beginPath();
    ctx.ellipse(6, -15, 8, 4.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "butterfly") {
    drawDetailedButterfly(ctx, 0, 0, col, "#FDE047", 1);
  } else if (shape === "cupcake") {
    ctx.fillStyle = "#F59E0B";
    drawRoundedRect(ctx, -14, 2, 28, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#F472B6";
    ctx.beginPath();
    ctx.arc(0, 2, 16, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else if (shape === "house") {
    ctx.fillStyle = "#FEF3C7";
    ctx.fillRect(-18, -2, 36, 24);
    ctx.strokeRect(-18, -2, 36, 24);
    ctx.fillStyle = "#DC2626";
    ctx.beginPath();
    ctx.moveTo(-22, -2);
    ctx.lineTo(0, -20);
    ctx.lineTo(22, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = ((i * 72 - 90) * Math.PI) / 180;
      const innerAngle = ((i * 72 + 36 - 90) * Math.PI) / 180;
      const ox = Math.cos(outerAngle) * 24;
      const oy = Math.sin(outerAngle) * 24;
      const ix = Math.cos(innerAngle) * 11;
      const iy = Math.sin(innerAngle) * 11;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });
}
