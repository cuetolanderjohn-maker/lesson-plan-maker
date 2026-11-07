import { IllustrationStyle, ImageInput, LessonPlan } from "./types";

export interface IllustrationGeneratorOptions {
  style?: IllustrationStyle;
  variationSeed?: number;
  customCaption?: string;
}

export type SceneId =
  | "school_classroom"
  | "school_library"
  | "school_canteen"
  | "school_playground"
  | "school_clinic"
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
  | "nature_trees_flowers"
  | "nature_animals_pets"
  | "nature_weather_sky"
  | "nature_care_planting"
  | "sense_sight_observe"
  | "sense_hearing_sounds"
  | "sense_smell_taste"
  | "sense_touch_hygiene"
  | "polite_mano_po"
  | "polite_sharing_friends"
  | "faith_creation"
  | "faith_prayer_chapel";

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
 * Maps a single panel caption + overall lesson context to the exact SceneId
 * so every panel directly depicts all necessary elements of that sentence.
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

  // 1. Places in the School / Community matches in panel text
  if (/\b(library|silid-aklatan|borrow books|bookshelf|librarian)\b/i.test(p))
    return "school_library";
  if (/\b(canteen|cafeteria|kantina|eat our meals|lunch|snack|tray)\b/i.test(p))
    return "school_canteen";
  if (
    /\b(playground|palaruan|play and exercise|slide|swing|seesaw|park|outdoor play)\b/i.test(
      p
    )
  )
    return "school_playground";
  if (/\b(clinic|klinika|nurse|doctor|medicine|first aid|sick)\b/i.test(p))
    return "school_clinic";
  if (/\b(classroom|silid-aralan|study and learn|chalkboard|blackboard|teacher)\b/i.test(p))
    return "school_classroom";

  // 2. Parts of the House / Rooms of the House matches in panel text
  if (/\b(roof|bubong|shingle|chimney|attic)\b/i.test(p)) return "house_roof";
  if (/\b(stair|stairs|hagdan|up and down|upstairs|downstairs)\b/i.test(p))
    return "house_stairs";
  if (/\b(door|doors|pinto|pintuan|get in and out|entrance|knock)\b/i.test(p))
    return "house_door";
  if (/\b(window|windows|bintana|curtain|breeze)\b/i.test(p)) return "house_windows";
  if (/\b(bedroom|tulugan|bed|sleep|pillow)\b/i.test(p)) return "house_bedroom";
  if (/\b(kitchen|kusina|cook|stove|fridge)\b/i.test(p)) return "house_kitchen";
  if (/\b(bathroom|palikuran|banyo|bath|shower|tub)\b/i.test(p)) return "house_bathroom";
  if (/\b(living room|sala|sofa|couch)\b/i.test(p)) return "house_living_room";
  if (/\b(wall|walls|dingding|divide|different rooms|rooms of the house)\b/i.test(p))
    return "house_walls_rooms";

  // If overall lesson is about School Places
  if (/\b(places in the school|school|paaralan|campus)\b/i.test(t)) {
    const schoolSeq: SceneId[] = [
      "school_classroom",
      "school_library",
      "school_canteen",
      "school_playground",
      "school_clinic",
    ];
    for (const c of schoolSeq) {
      if (!usedScenes.has(c)) return c;
    }
    return schoolSeq[panelIndex % schoolSeq.length];
  }

  // If overall lesson is about House / Parts of the House / Home
  if (/\b(house|home|bahay|tahanan|rooms|parts of the house)\b/i.test(combined)) {
    const houseSeq: SceneId[] = [
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
    for (const c of houseSeq) {
      if (!usedScenes.has(c)) return c;
    }
    return houseSeq[panelIndex % houseSeq.length];
  }

  // 3. Moth / Gamu-gamo / Flame Story matches
  if (/\b(gamu-gamo|moth|lampara|kandila|apoy|ningas|flame|lamp|candle)\b/i.test(combined)) {
    const mothSeq: SceneId[] = [
      "moth_oil_lamp",
      "moth_flame_warning",
      "nature_trees_flowers",
      "house_living_room",
    ];
    for (const c of mothSeq) {
      if (!usedScenes.has(c)) return c;
    }
    return mothSeq[panelIndex % mothSeq.length];
  }

  // 4. Science / Senses / Sounds / Body / Hygiene matches
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
    const sciSeq: SceneId[] = [
      "sense_sight_observe",
      "sense_hearing_sounds",
      "sense_smell_taste",
      "sense_touch_hygiene",
    ];
    for (const c of sciSeq) {
      if (!usedScenes.has(c)) return c;
    }
    return sciSeq[panelIndex % sciSeq.length];
  }

  // 5. Nature / Animals / Plants / Weather / Environment
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
    const natSeq: SceneId[] = [
      "nature_trees_flowers",
      "nature_animals_pets",
      "nature_weather_sky",
      "nature_care_planting",
    ];
    for (const c of natSeq) {
      if (!usedScenes.has(c)) return c;
    }
    return natSeq[panelIndex % natSeq.length];
  }

  // 6. Religion / RVE / Faith / God / Prayer
  if (
    /\b(pray|prayer|panalangin|dasal|church|simbahan|chapel|bible|bibliya|oratio|lectio)\b/i.test(
      p
    )
  )
    return "faith_prayer_chapel";
  if (/\b(god|jesus|lord|panginoon|diyos|creation|blessing|faith|rve)\b/i.test(combined)) {
    const faithSeq: SceneId[] = [
      "faith_creation",
      "polite_sharing_friends",
      "faith_prayer_chapel",
      "house_exterior_family",
    ];
    for (const c of faithSeq) {
      if (!usedScenes.has(c)) return c;
    }
    return faithSeq[panelIndex % faithSeq.length];
  }

  // 7. Politeness / Family / Friends / School general sequence
  if (/\b(mano|lolo|lola|elder|matanda|po at opo|magalang|respect)\b/i.test(p))
    return "polite_mano_po";
  if (/\b(share|sharing|bahagi|kaibigan|friend|classmate|help|tulong)\b/i.test(p))
    return "polite_sharing_friends";
  if (/\b(read|basa|book|aklat|story|kwento)\b/i.test(p)) return "school_library";

  const generalSeq: SceneId[] = [
    "school_classroom",
    "school_library",
    "polite_mano_po",
    "polite_sharing_friends",
    "school_playground",
    "house_exterior_family",
  ];
  for (const c of generalSeq) {
    if (!usedScenes.has(c)) return c;
  }
  return generalSeq[panelIndex % generalSeq.length];
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
 * Generates a realistic-shaded, richly populated educational illustration (`data:image/png;base64,...`)
 * where every panel depicts all necessary architectural, environmental, and human elements
 * of that exact lesson sentence.
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
  canvas.width = 960;
  canvas.height = 600;
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

function drawFourPanelStorybookScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  seed: number
) {
  ctx.fillStyle = "#F8F6F0";
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
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 14);
    ctx.clip();

    const capH = 54;
    renderSceneInRect(ctx, pos.x, pos.y, panelW, panelH - capH, sceneId, seed + idx);

    // Clean Warm Caption Strip at the bottom of the panel
    const capY = pos.y + panelH - capH;
    const capGrad = ctx.createLinearGradient(pos.x, capY, pos.x, pos.y + panelH);
    capGrad.addColorStop(0, "#FFFFFF");
    capGrad.addColorStop(1, "#F5F2EB");
    ctx.fillStyle = capGrad;
    ctx.fillRect(pos.x, capY, panelW, capH);

    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pos.x, capY);
    ctx.lineTo(pos.x + panelW, capY);
    ctx.stroke();

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 13.5px 'Georgia', 'Segoe UI', serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, caption, pos.x + panelW / 2, capY + 21, panelW - 28, 17, 2);

    ctx.restore();

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 14);
    ctx.stroke();
  });
}

/**
 * Style 2: Grade 1 / Kinder 2 "PAG-UUGNAY" Scene
 * Replicates G1-Filipino-LP-Week 11.docx with realistic full-body Filipino student in uniform,
 * speech bubbles, and a detailed scene window of the lesson topic.
 */
function drawPagUugnaySpeechScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  seed: number
) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#FFFDF9");
  bg.addColorStop(1, "#FEF3C7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Top-Left Red/Orange Header Banner ("PAG-UUGNAY: Mabigyang ang Pananabik" like G1-Filipino-LP-Week 11.docx)
  ctx.fillStyle = "#DC2626";
  ctx.fillRect(28, 22, 16, 12);
  ctx.fillRect(46, 28, 16, 12);
  ctx.fillRect(28, 38, 16, 12);
  ctx.fillStyle = "#B91C1C";
  ctx.font = "bold 24px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("PAG-UUGNAY", 70, 38);
  ctx.font = "italic 14px 'Georgia', serif";
  ctx.fillText("Mabigyang ang Pananabik", 70, 56);

  // Speech Bubble with Guide Question
  const bubX = 28;
  const bubY = 78;
  const bubW = 415;
  const bubH = 155;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, bubX, bubY, bubW, bubH, 24);
  ctx.fill();
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(bubX + 185, bubY + bubH);
  ctx.lineTo(bubX + 210, bubY + bubH + 28);
  ctx.lineTo(bubX + 235, bubY + bubH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 17px 'Georgia', 'Segoe UI', serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, content.questionPrompt, bubX + bubW / 2, bubY + 46, bubW - 40, 24, 4);

  // Full-body Realistic Filipino Schoolgirl in White Blouse, Tie, Pleated Skirt, Socks & Shoes
  drawRealisticPerson(ctx, 225, 425, {
    role: "student_girl",
    shirtColor: "#FFFFFF",
    bottomColor: "#7C2D12",
    hairColor: "#1E1B18",
    scale: 1.45,
    pose: "thinking",
  });

  // Right: Large Realistic Scene Window depicting the lesson
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
  drawRoundedRect(ctx, winX, winY, winW, winH, 18);
  ctx.clip();
  renderSceneInRect(ctx, winX, winY, winW, winH - 74, primaryScene, seed);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(winX, winY + winH - 74, winW, 74);
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH - 74);
  ctx.lineTo(winX + winW, winY + winH - 74);
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 15px 'Georgia', serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, content.title, winX + winW / 2, winY + winH - 46, winW - 32, 20, 1);
  ctx.fillStyle = "#475569";
  ctx.font = "13px 'Segoe UI', sans-serif";
  drawWrappedText(ctx, content.panels[0], winX + winW / 2, winY + winH - 22, winW - 32, 17, 1);
  ctx.restore();

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, winX, winY, winW, winH, 18);
  ctx.stroke();
}

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
  const cardH = h - 92;
  const leftX = 22;
  const rightX = 42 + cardW;
  const cardY = 20;

  const combinedText = `${content.title} ${content.panels.join(" ")}`.toLowerCase();
  type MathItemShape = "car" | "apple" | "star" | "butterfly" | "cupcake" | "house";
  let shapeA: MathItemShape = "car";
  let shapeB: MathItemShape = "apple";

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

  const countA = 5 + (seed % 2);
  const countB = 3 + (seed % 2);

  const sets = [
    {
      x: leftX,
      border: "#DC2626",
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
    drawRoundedRect(ctx, s.x, cardY, cardW, cardH, 26);
    ctx.fill();
    ctx.strokeStyle = s.border;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = s.border;
    ctx.font = "bold 24px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.fillText(s.title, s.x + cardW / 2, cardY + 42);

    const cols = 3;
    for (let i = 0; i < s.count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = s.x + 92 + col * 130;
      const oy = cardY + 140 + row * 128;
      drawCrispMathObject(ctx, ox, oy, s.shape, i + seed);
    }

    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, s.x + 20, cardY + cardH - 66, cardW - 40, 48, 12);
    ctx.fill();
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, s.caption, s.x + cardW / 2, cardY + cardH - 38, cardW - 56, 17, 2);
  });

  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 16px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${content.title} — Compare Set A (${countA}) and Set B (${countB})`,
    w / 2,
    h - 26
  );
}

/* ============================================================================
 * REALISTIC-SHADED, FULLY POPULATED ARCHITECTURAL & ENVIRONMENTAL SCENES
 * Every scene includes 3D room/outdoor perspective, lighting gradients,
 * full-body articulated human figures, and all necessary furniture/props.
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
    case "school_classroom":
      drawSceneSchoolClassroom(ctx, w, h);
      break;
    case "school_library":
      drawSceneSchoolLibrary(ctx, w, h);
      break;
    case "school_canteen":
      drawSceneSchoolCanteen(ctx, w, h);
      break;
    case "school_playground":
      drawSceneSchoolPlayground(ctx, w, h);
      break;
    case "school_clinic":
      drawSceneSchoolClinic(ctx, w, h);
      break;
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
    case "polite_sharing_friends":
      drawSceneSharingTable(ctx, w, h);
      break;
    case "faith_creation":
      drawSceneFaithCreation(ctx, w, h);
      break;
    case "faith_prayer_chapel":
      drawSceneFaithChapel(ctx, w, h);
      break;
    default:
      drawSceneSchoolClassroom(ctx, w, h);
      break;
  }

  ctx.restore();
}

/**
 * Draws a 3D perspective room background with back wall, side wall depth, baseboard,
 * and perspective floor tiles/planks.
 */
function drawPerspectiveRoomShell(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  wallTop: string,
  wallBot: string,
  floorTop: string,
  floorBot: string,
  floorGridColor = "rgba(120, 53, 15, 0.16)"
) {
  const floorY = h * 0.66;
  const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
  wallGrad.addColorStop(0, wallTop);
  wallGrad.addColorStop(1, wallBot);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, floorY);

  // Baseboard molding
  ctx.fillStyle = "#78350F";
  ctx.fillRect(0, floorY - 6, w, 6);

  // Floor gradient
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  floorGrad.addColorStop(0, floorTop);
  floorGrad.addColorStop(1, floorBot);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, w, h - floorY);

  // Perspective floor lines
  ctx.strokeStyle = floorGridColor;
  ctx.lineWidth = 1.2;
  for (let i = -3; i <= 9; i++) {
    const topX = (w / 6) * i;
    const botX = w / 2 + (topX - w / 2) * 1.65;
    ctx.beginPath();
    ctx.moveTo(topX, floorY);
    ctx.lineTo(botX, h);
    ctx.stroke();
  }
  for (let r = 1; r <= 3; r++) {
    const ry = floorY + ((h - floorY) * (r * r)) / 10;
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(w, ry);
    ctx.stroke();
  }
}

/**
 * SCENE A1: SCHOOL CLASSROOM
 * Includes sunlit window, chalkboard with diagrams & math, wall clock, teacher's desk with globe,
 * full-body teacher pointing at board, and seated students at wooden desks with notebooks.
 */
function drawSceneSchoolClassroom(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPerspectiveRoomShell(ctx, w, h, "#FEF9E7", "#FDE68A", "#D97706", "#B45309");

  // Left Wall Window with sky, tree & curtains
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(16, 22, 68, 78);
  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.arc(38, 86, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 22, 68, 78);
  ctx.beginPath();
  ctx.moveTo(50, 22);
  ctx.lineTo(50, 100);
  ctx.moveTo(16, 61);
  ctx.lineTo(84, 61);
  ctx.stroke();

  // Large Green Chalkboard with Oak Frame, Chalk Tray, and Real Lesson Writing
  const bx = 112;
  const by = 18;
  const bw = 215;
  const bh = 96;
  const boardGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  boardGrad.addColorStop(0, "#14532D");
  boardGrad.addColorStop(1, "#064E3B");
  ctx.fillStyle = boardGrad;
  drawRoundedRect(ctx, bx, by, bw, bh, 6);
  ctx.fill();
  ctx.strokeStyle = "#92400E";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Chalkboard writing & diagrams
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 13px 'Georgia', serif";
  ctx.textAlign = "left";
  ctx.fillText("Aa  Bb  Cc   1 + 2 = 3", bx + 16, by + 26);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.8;
  // Chalk diagram of book & sun
  ctx.strokeRect(bx + 20, by + 40, 48, 34);
  ctx.beginPath();
  ctx.arc(bx + 155, by + 56, 16, 0, Math.PI * 2);
  ctx.stroke();

  // Wall Clock & Bulletin Board on Right
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(w - 52, 36, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w - 52, 36);
  ctx.lineTo(w - 52, 26);
  ctx.moveTo(w - 52, 36);
  ctx.lineTo(w - 44, 36);
  ctx.stroke();

  ctx.fillStyle = "#D97706";
  ctx.fillRect(w - 86, 62, 66, 48);
  ctx.strokeStyle = "#78350F";
  ctx.strokeRect(w - 86, 62, 66, 48);
  ctx.fillStyle = "#FEF08A";
  ctx.fillRect(w - 78, 70, 22, 16);
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(w - 48, 72, 20, 18);

  // Teacher (Full-body) standing beside board with pointer
  drawRealisticPerson(ctx, 108, h * 0.56, {
    role: "teacher",
    shirtColor: "#0284C7",
    bottomColor: "#1E293B",
    hairColor: "#2C1810",
    scale: 0.92,
    pose: "pointing",
  });

  // Teacher's Desk with World Globe & Stack of Books on Left
  ctx.fillStyle = "#92400E";
  ctx.fillRect(28, h * 0.6, 76, 36);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, h * 0.6, 76, 36);
  // Globe on desk
  ctx.fillStyle = "#38BDF8";
  ctx.beginPath();
  ctx.arc(50, h * 0.6 - 14, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Two Student Desks & Seated Full-Body Students with Open Notebooks
  [195, 325].forEach((dx, idx) => {
    const dy = h * 0.68;
    // Seated student behind desk
    drawRealisticPerson(ctx, dx + 26, dy - 18, {
      role: idx === 0 ? "student_girl" : "student_boy",
      shirtColor: "#FFFFFF",
      bottomColor: "#1E3A8A",
      hairColor: "#1E1B18",
      scale: 0.82,
      pose: idx === 0 ? "raising_hand" : "reading",
    });

    // Wooden Student Desk Top & Legs
    ctx.fillStyle = "#B45309";
    ctx.fillRect(dx - 8, dy, 68, 10);
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 2;
    ctx.strokeRect(dx - 8, dy, 68, 10);
    ctx.fillStyle = "#78350F";
    ctx.fillRect(dx - 4, dy + 10, 6, 34);
    ctx.fillRect(dx + 50, dy + 10, 6, 34);

    // Open white notebook & yellow pencil on desk
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(dx + 12, dy - 6, 28, 7);
    ctx.strokeRect(dx + 12, dy - 6, 28, 7);
  });
}

/**
 * SCENE A2: SCHOOL LIBRARY
 * Tall mahogany bookshelves filled with colorful books, circulation desk, reading table,
 * banker's lamp, and students reading & borrowing books.
 */
function drawSceneSchoolLibrary(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPerspectiveRoomShell(ctx, w, h, "#FEF3C7", "#FDE68A", "#92400E", "#78350F");

  // 3 Tall Wooden Bookcases across the back wall packed with rows of colorful books
  const bookPalette = ["#DC2626", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#0D9488", "#E11D48"];
  [24, 148, 272].forEach((bx, bIdx) => {
    const by = 14;
    const bw = 112;
    const bh = h * 0.52;
    ctx.fillStyle = "#78350F";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, bw, bh);

    // 3 shelves per bookcase
    for (let s = 0; s < 3; s++) {
      const sy = by + 8 + s * (bh / 3);
      const sh = bh / 3 - 10;
      ctx.fillStyle = "#451A03";
      ctx.fillRect(bx + 6, sy, bw - 12, sh);

      // Individual books standing on the shelf
      let curX = bx + 8;
      let k = 0;
      while (curX < bx + bw - 16) {
        const bookW = 7 + ((bIdx + s + k) % 4) * 2;
        const bookH = sh - 2 - ((k + s) % 3) * 2;
        ctx.fillStyle = bookPalette[(bIdx * 5 + s * 3 + k) % bookPalette.length];
        ctx.fillRect(curX, sy + (sh - bookH), bookW, bookH);
        ctx.strokeStyle = "#1E293B";
        ctx.lineWidth = 1;
        ctx.strokeRect(curX, sy + (sh - bookH), bookW, bookH);
        curX += bookW + 1;
        k++;
      }
    }
  });

  // Arched Window on Far Right
  ctx.fillStyle = "#BAE6FD";
  ctx.beginPath();
  ctx.arc(w - 38, 54, 22, Math.PI, 0);
  ctx.lineTo(w - 16, 105);
  ctx.lineTo(w - 60, 105);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Students Seated at Foreground Library Reading Table with Open Books & Green Lamp
  drawRealisticPerson(ctx, w / 2 - 68, h * 0.64, {
    role: "student_boy",
    shirtColor: "#FFFFFF",
    bottomColor: "#1E3A8A",
    hairColor: "#1E1B18",
    scale: 0.86,
    pose: "reading",
  });
  drawRealisticPerson(ctx, w / 2 + 68, h * 0.64, {
    role: "student_girl",
    shirtColor: "#FFFFFF",
    bottomColor: "#1E3A8A",
    hairColor: "#2C1810",
    scale: 0.86,
    pose: "reading",
  });

  // Large Oak Library Reading Table
  const tx = w / 2 - 125;
  const ty = h * 0.68;
  const tw = 250;
  ctx.fillStyle = "#B45309";
  drawRoundedRect(ctx, tx, ty, tw, 16, 4);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#78350F";
  ctx.fillRect(tx + 16, ty + 16, 12, 38);
  ctx.fillRect(tx + tw - 28, ty + 16, 12, 38);

  // Open Hardcover Books & Green Library Lamp on Table
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(w / 2 - 88, ty - 8, 42, 9);
  ctx.strokeRect(w / 2 - 88, ty - 8, 42, 9);
  ctx.fillRect(w / 2 + 46, ty - 8, 42, 9);
  ctx.strokeRect(w / 2 + 46, ty - 8, 42, 9);

  // Stack of borrowed books in center + Green Lamp
  ctx.fillStyle = "#DC2626";
  ctx.fillRect(w / 2 - 22, ty - 8, 36, 8);
  ctx.strokeRect(w / 2 - 22, ty - 8, 36, 8);
  ctx.fillStyle = "#2563EB";
  ctx.fillRect(w / 2 - 20, ty - 15, 32, 7);
  ctx.strokeRect(w / 2 - 20, ty - 15, 32, 7);
}

/**
 * SCENE A3: SCHOOL CANTEEN
 * Stainless/wood food serving counter with glass display, menu board, canteen server,
 * cafeteria tables, and students eating nutritious meals from food trays.
 */
function drawSceneSchoolCanteen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPerspectiveRoomShell(
    ctx,
    w,
    h,
    "#ECFDF5",
    "#D1FAE5",
    "#E2E8F0",
    "#CBD5E1",
    "rgba(71, 85, 105, 0.2)"
  );

  // Menu Board & "SCHOOL CANTEEN" Banner on Back Wall
  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, 28, 16, 120, 48, 6);
  ctx.fill();
  ctx.strokeStyle = "#D97706";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#FACC15";
  ctx.font = "bold 11px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TODAY'S MENU", 88, 32);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "10px 'Segoe UI', sans-serif";
  ctx.fillText("• Rice & Chicken", 88, 46);
  ctx.fillText("• Fresh Fruits & Milk", 88, 58);

  // Canteen Server behind Food Counter on Right
  drawRealisticPerson(ctx, w - 115, h * 0.44, {
    role: "teacher",
    shirtColor: "#FFFFFF",
    bottomColor: "#334155",
    hairColor: "#1E1B18",
    scale: 0.84,
    pose: "standing",
  });

  // Food Serving Counter with Glass Display Case
  const cx = w - 210;
  const cy = h * 0.46;
  const cw = 185;
  const ch = 46;
  ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
  ctx.fillRect(cx + 8, cy - 26, cw - 16, 26);
  ctx.strokeStyle = "#64748B";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx + 8, cy - 26, cw - 16, 26);
  // Food pans inside glass counter
  ["#F97316", "#22C55E", "#EAB308"].forEach((fc, i) => {
    ctx.fillStyle = fc;
    ctx.fillRect(cx + 20 + i * 50, cy - 12, 38, 10);
    ctx.strokeRect(cx + 20 + i * 50, cy - 12, 38, 10);
  });

  ctx.fillStyle = "#D97706";
  ctx.fillRect(cx, cy, cw, ch);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cx, cy, cw, ch);

  // Foreground Cafeteria Dining Table with Seated Students Eating Meals from Trays
  drawRealisticPerson(ctx, 130, h * 0.64, {
    role: "student_girl",
    shirtColor: "#F43F5E",
    bottomColor: "#1E3A8A",
    hairColor: "#2C1810",
    scale: 0.88,
    pose: "eating",
  });
  drawRealisticPerson(ctx, 275, h * 0.64, {
    role: "student_boy",
    shirtColor: "#0284C7",
    bottomColor: "#1E3A8A",
    hairColor: "#1E1B18",
    scale: 0.88,
    pose: "eating",
  });

  // Cafeteria Table
  const tx = 68;
  const ty = h * 0.69;
  const tw = 270;
  ctx.fillStyle = "#F8FAFC";
  drawRoundedRect(ctx, tx, ty, tw, 14, 4);
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#64748B";
  ctx.fillRect(tx + 24, ty + 14, 10, 38);
  ctx.fillRect(tx + tw - 34, ty + 14, 10, 38);

  // Two Lunch Trays with Plates, Rice Bowl, Red Apple, and Milk Glass
  [102, 232].forEach((trayX) => {
    ctx.fillStyle = "#94A3B8";
    ctx.fillRect(trayX, ty - 7, 64, 7);
    ctx.strokeRect(trayX, ty - 7, 64, 7);
    // Bowl of warm meal
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.arc(trayX + 18, ty - 7, 9, Math.PI, 0);
    ctx.fill();
    // Red Apple
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(trayX + 38, ty - 11, 6, 0, Math.PI * 2);
    ctx.fill();
    // Glass of milk/juice
    ctx.fillStyle = "#BAE6FD";
    ctx.fillRect(trayX + 50, ty - 18, 9, 12);
    ctx.strokeRect(trayX + 50, ty - 18, 9, 12);
  });
}

/**
 * SCENE A4: SCHOOL PLAYGROUND
 * Outdoor sunny park with slide, swing set, seesaw, soccer ball, trees, school building,
 * and full-body children playing and exercising together.
 */
function drawSceneSchoolPlayground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Realistic Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.56);
  skyGrad.addColorStop(0, "#38BDF8");
  skyGrad.addColorStop(1, "#BAE6FD");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.56);

  // Fluffy Clouds & Sun
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(w - 54, 38, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  [90, 260].forEach((cx) => {
    ctx.beginPath();
    ctx.arc(cx, 34, 14, 0, Math.PI * 2);
    ctx.arc(cx + 16, 30, 18, 0, Math.PI * 2);
    ctx.arc(cx + 34, 35, 13, 0, Math.PI * 2);
    ctx.fill();
  });

  // Distant Trees & Bushes along horizon
  ctx.fillStyle = "#15803D";
  for (let tx = 20; tx < w; tx += 55) {
    ctx.beginPath();
    ctx.arc(tx, h * 0.54, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Textured Green Grass Lawn
  const grassGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
  grassGrad.addColorStop(0, "#4ADE80");
  grassGrad.addColorStop(1, "#16A34A");
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, h * 0.52, w, h * 0.48);

  // 1. Complete Playground Slide on Left (Platform Tower, Canopy Roof, Ladder, Red Slide Chute)
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.2;
  // Tower posts
  ctx.fillStyle = "#D97706";
  ctx.fillRect(36, h * 0.3, 8, h * 0.44);
  ctx.strokeRect(36, h * 0.3, 8, h * 0.44);
  ctx.fillRect(78, h * 0.3, 8, h * 0.44);
  ctx.strokeRect(78, h * 0.3, 8, h * 0.44);
  // Platform deck
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(32, h * 0.44, 58, 8);
  ctx.strokeRect(32, h * 0.44, 58, 8);
  // Red Canopy Roof on Slide Tower
  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(26, h * 0.32);
  ctx.lineTo(61, h * 0.16);
  ctx.lineTo(96, h * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Ladder Rungs on left
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, h * 0.74);
  ctx.lineTo(34, h * 0.46);
  ctx.stroke();
  // Smooth Curved Red Slide Chute sloping down to right
  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.moveTo(84, h * 0.44);
  ctx.quadraticCurveTo(130, h * 0.62, 168, h * 0.78);
  ctx.lineTo(154, h * 0.82);
  ctx.quadraticCurveTo(116, h * 0.66, 78, h * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // 2. Complete Swing Set on Right (Blue Metal A-Frame, Chains, Swing Seats)
  const swX = w - 165;
  const swTopY = h * 0.24;
  const swBotY = h * 0.74;
  ctx.strokeStyle = "#1D4ED8";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(swX, swBotY);
  ctx.lineTo(swX + 24, swTopY);
  ctx.lineTo(swX + 125, swTopY);
  ctx.lineTo(swX + 145, swBotY);
  ctx.stroke();
  // Swing chains & seats
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  [swX + 52, swX + 102].forEach((sx) => {
    ctx.beginPath();
    ctx.moveTo(sx - 8, swTopY + 3);
    ctx.lineTo(sx - 8, swBotY - 24);
    ctx.moveTo(sx + 8, swTopY + 3);
    ctx.lineTo(sx + 8, swBotY - 24);
    ctx.stroke();
    ctx.fillStyle = "#EF4444";
    ctx.fillRect(sx - 12, swBotY - 24, 24, 5);
  });

  // 3. Full-Body Children Playing & Exercising Together
  // Child 1 playing with soccer ball in center
  drawRealisticPerson(ctx, 205, h * 0.68, {
    role: "student_boy",
    shirtColor: "#2563EB",
    bottomColor: "#1E293B",
    hairColor: "#1E1B18",
    scale: 0.78,
    pose: "playing",
  });
  // Child 2 running/playing with friend
  drawRealisticPerson(ctx, 268, h * 0.7, {
    role: "student_girl",
    shirtColor: "#EC4899",
    bottomColor: "#1E3A8A",
    hairColor: "#2C1810",
    scale: 0.78,
    pose: "raising_hand",
  });
  // Child 3 on the swing
  drawRealisticPerson(ctx, swX + 52, swBotY - 38, {
    role: "student_girl",
    shirtColor: "#F59E0B",
    bottomColor: "#1E3A8A",
    hairColor: "#1E1B18",
    scale: 0.68,
    pose: "reading",
  });

  // Soccer Ball on the grass between the friends
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(236, h * 0.85, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.arc(236, h * 0.85, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSceneSchoolClinic(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPerspectiveRoomShell(ctx, w, h, "#F0F9FF", "#E0F2FE", "#E2E8F0", "#CBD5E1");
  // Red Cross Medical Cabinet on Wall
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(42, 26, 56, 62);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 26, 56, 62);
  ctx.fillStyle = "#EF4444";
  ctx.fillRect(65, 40, 10, 32);
  ctx.fillRect(54, 51, 32, 10);

  // Clinic Bed with White Sheet & Pillow
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, w - 210, h * 0.52, 175, 44, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(w - 170, h * 0.56, 135, 36);
  ctx.strokeRect(w - 170, h * 0.56, 135, 36);

  drawRealisticPerson(ctx, 145, h * 0.58, {
    role: "teacher",
    shirtColor: "#FFFFFF",
    bottomColor: "#0284C7",
    hairColor: "#1E1B18",
    scale: 0.9,
    pose: "standing",
  });
}

/**
 * 1. THE ROOF: Detailed architectural roof with terracotta shingles, timber eaves,
 * chimney, and attic study room protecting the house from sun and rain.
 */
function drawSceneHouseRoof(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, w, 0);
  sky.addColorStop(0, "#BAE6FD");
  sky.addColorStop(0.55, "#E0F2FE");
  sky.addColorStop(1, "#CBD5E1");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.arc(135, 34, 14, 0, Math.PI * 2);
  ctx.arc(152, 30, 18, 0, Math.PI * 2);
  ctx.arc(170, 35, 13, 0, Math.PI * 2);
  ctx.fill();

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

  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(houseX + 14, h * 0.72, houseW - 28, h * 0.28);
  ctx.strokeRect(houseX + 14, h * 0.72, houseW - 28, h * 0.28);

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

  const deskY = h * 0.56;
  ctx.fillStyle = "#D97706";
  ctx.fillRect(w / 2 - 54, deskY, 96, 8);
  ctx.strokeRect(w / 2 - 54, deskY, 96, 8);
  ctx.fillRect(w / 2 - 48, deskY + 8, 10, 24);
  ctx.strokeRect(w / 2 - 48, deskY + 8, 10, 24);
  ctx.fillRect(w / 2 + 26, deskY + 8, 10, 24);
  ctx.strokeRect(w / 2 + 26, deskY + 8, 10, 24);

  ctx.fillStyle = "#64748B";
  ctx.fillRect(w / 2 - 18, deskY - 20, 32, 20);
  ctx.strokeRect(w / 2 - 18, deskY - 20, 32, 20);
  ctx.fillStyle = "#94A3B8";
  ctx.fillRect(w / 2 - 14, deskY - 17, 24, 14);

  ctx.fillStyle = "#8B5CF6";
  drawRoundedRect(ctx, w / 2 + 52, deskY - 12, 20, 24, 4);
  ctx.fill();
  ctx.stroke();
}

/**
 * 2. THE WALLS & ROOMS: Cutaway Dollhouse Cross-Section (Bathroom, Bedroom, Kitchen, Living Room)
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
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 1.8;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, marginX + 12, midY - 30, 72, 24, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(marginX + 52, midY - 30, 14, 16);
  ctx.strokeRect(marginX + 52, midY - 30, 14, 16);
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(marginX + 96, topY + 14, 32, 34);
  ctx.strokeRect(marginX + 96, topY + 14, 32, 34);
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(marginX + 94, midY - 30, 36, 24);
  ctx.strokeRect(marginX + 94, midY - 30, 36, 24);
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, marginX + 142, midY - 40, 24, 18, 3);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, marginX + 144, midY - 22, 20, 16, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FEF9C3";
  ctx.fillRect(midX, topY, rw, rhTop);
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
  ctx.fillStyle = "#B45309";
  ctx.fillRect(midX + 14, midY - 26, 22, 20);
  ctx.strokeRect(midX + 14, midY - 26, 22, 20);
  ctx.fillRect(midX + 150, midY - 26, 22, 20);
  ctx.strokeRect(midX + 150, midY - 26, 22, 20);

  ctx.fillStyle = "#FCE7F3";
  ctx.fillRect(marginX, midY, rw, rhBot);
  ctx.fillStyle = "#BFDBFE";
  drawRoundedRect(ctx, marginX + 14, midY + 18, 46, rhBot - 24, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(marginX + 14, midY + 52);
  ctx.lineTo(marginX + 60, midY + 52);
  ctx.stroke();
  ctx.fillStyle = "#FEF08A";
  ctx.fillRect(marginX + 30, midY + 34, 10, 10);
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(marginX + 66, topY + houseH - 48, 108, 42);
  ctx.strokeRect(marginX + 66, topY + houseH - 48, 108, 42);
  ctx.fillStyle = "#475569";
  ctx.fillRect(marginX + 92, topY + houseH - 36, 44, 26);
  ctx.strokeRect(marginX + 92, topY + houseH - 36, 44, 26);
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

  ctx.fillStyle = "#D1FAE5";
  ctx.fillRect(midX, midY, rw, rhBot);
  ctx.fillStyle = "#92400E";
  ctx.fillRect(midX + 14, midY + 20, 44, rhBot - 26);
  ctx.strokeRect(midX + 14, midY + 20, 44, rhBot - 26);
  const bookCols = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  for (let b = 0; b < 4; b++) {
    ctx.fillStyle = bookCols[b];
    ctx.fillRect(midX + 19 + b * 8, midY + 26, 6, 16);
    ctx.fillRect(midX + 19 + b * 8, midY + 48, 6, 16);
  }
  ctx.fillStyle = "#10B981";
  drawRoundedRect(ctx, midX + 70, topY + houseH - 52, 104, 44, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#FACC15";
  drawRoundedRect(ctx, midX + 148, topY + houseH - 44, 18, 18, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#38BDF8";
  ctx.beginPath();
  ctx.ellipse(midX + 116, topY + houseH - 6, 36, 5, 0, 0, Math.PI * 2);
  ctx.fill();

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
 * 3. THE STAIRS: Interior wooden staircase with balusters, oak handrail, wall art,
 * and a full-body child walking safely on the steps.
 */
function drawSceneHouseStairs(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#FEF9C3";
  ctx.fillRect(0, 0, w, h * 0.78);
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(0, h * 0.56, w, h * 0.22);
  ctx.fillStyle = "#B45309";
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;

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

  ctx.fillStyle = "#D97706";
  ctx.fillRect(topLandingX + 22, 16, 48, topLandingY - 16);
  ctx.strokeRect(topLandingX + 22, 16, 48, topLandingY - 16);
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(topLandingX + 60, 44, 3.5, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < steps; i++) {
    const sx = startX + i * stepW;
    const sy = startY - (i + 1) * stepH;
    const sh = (i + 1) * stepH;
    ctx.fillStyle = "#B45309";
    ctx.fillRect(sx, sy, stepW + 2, sh);
    ctx.strokeRect(sx, sy, stepW + 2, sh);

    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(sx - 3, sy, stepW + 6, 7);
    ctx.strokeRect(sx - 3, sy, stepW + 6, 7);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(sx + 16, sy - 40, 6, 40);
    ctx.strokeRect(sx + 16, sy - 40, 6, 40);
  }

  // Full-body child walking safely up the stairs
  drawRealisticPerson(ctx, startX + 2.5 * stepW, startY - 3.5 * stepH - 28, {
    role: "student_boy",
    shirtColor: "#0284C7",
    bottomColor: "#1E293B",
    hairColor: "#1E1B18",
    scale: 0.72,
    pose: "standing",
  });

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

  ctx.fillStyle = "#10B981";
  ctx.beginPath();
  ctx.ellipse(54, h * 0.88, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * 4. THE DOOR: Inviting front porch entrance with 6-panel oak door, fanlight window,
 * picket fence, blooming flowerpots, and a child welcoming at the door.
 */
function drawSceneHouseDoor(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

  ctx.fillStyle = "#E7E5E4";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 46, h * 0.74);
  ctx.lineTo(w / 2 + 46, h * 0.74);
  ctx.lineTo(w / 2 + 74, h);
  ctx.lineTo(w / 2 - 74, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, w / 2 - 38, h * 0.77, 76, 18, 4);
  ctx.fill();
  ctx.stroke();

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

  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(doorX + doorW - 13, doorY + 84, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

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

  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(winX, winY, winW, winH);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(winX, winY + winH - 28, winW, 28);
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(winX + 38, winY + 32, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 6;
  ctx.strokeRect(winX, winY, winW, winH);
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH / 2);
  ctx.lineTo(winX + winW, winY + winH / 2);
  ctx.stroke();

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
    bedroom: ["#FEF9C3", "#FDE68A"],
    kitchen: ["#FCE7F3", "#FBCFE8"],
    living: ["#ECFDF5", "#D1FAE5"],
    bathroom: ["#F0F9FF", "#E0F2FE"],
  };
  drawPerspectiveRoomShell(
    ctx,
    w,
    h,
    wallColors[room][0],
    wallColors[room][1],
    "#D97706",
    "#92400E"
  );

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
    ctx.fillRect(46, h * 0.2, 68, h * 0.52);
    ctx.strokeRect(46, h * 0.2, 68, h * 0.52);
    ctx.fillStyle = "#10B981";
    drawRoundedRect(ctx, 146, h * 0.44, 195, 62, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FACC15";
    drawRoundedRect(ctx, 295, h * 0.5, 28, 28, 6);
    ctx.fill();
    ctx.stroke();
  }
}

function drawSceneHouseExteriorFamily(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(0, 0, w, h * 0.68);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  const hx = w / 2 - 115;
  const hy = h * 0.3;
  const hw = 230;
  const hh = h * 0.42;

  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(hx, hy, hw, hh);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.strokeRect(hx, hy, hw, hh);

  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(hx - 22, hy + 4);
  ctx.lineTo(w / 2, hy - 54);
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

  drawRealisticPerson(ctx, w / 2 - 64, h * 0.68, {
    role: "student_boy",
    shirtColor: "#0284C7",
    bottomColor: "#1E293B",
    hairColor: "#1E1B18",
    scale: 0.72,
    pose: "standing",
  });
  drawRealisticPerson(ctx, w / 2 + 64, h * 0.68, {
    role: "student_girl",
    shirtColor: "#F43F5E",
    bottomColor: "#1E3A8A",
    hairColor: "#2C1810",
    scale: 0.72,
    pose: "raising_hand",
  });
}

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
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(0, 0, w, h * 0.68);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  ctx.fillStyle = "#78350F";
  ctx.fillRect(88, h * 0.38, 28, h * 0.34);
  ctx.fillStyle = "#16A34A";
  ctx.beginPath();
  ctx.arc(102, h * 0.3, 48, 0, Math.PI * 2);
  ctx.arc(68, h * 0.38, 34, 0, Math.PI * 2);
  ctx.arc(136, h * 0.38, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  [230, 290, 350].forEach((fx, i) => {
    ctx.strokeStyle = "#15803D";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fx, h * 0.74);
    ctx.lineTo(fx, h * 0.52);
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 ? "#F43F5E" : "#A855F7";
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * 10, h * 0.5 + Math.sin(a) * 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.arc(fx, h * 0.5, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  drawDetailedButterfly(ctx, 275, h * 0.26, "#38BDF8", "#F43F5E", 1);
}

function drawSceneAnimalsMeadow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(0, 0, w, h * 0.66);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(0, h * 0.66, w, h * 0.34);

  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(62, h * 0.42, 88, 56);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(62, h * 0.42, 88, 56);
  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(50, h * 0.44);
  ctx.lineTo(106, h * 0.22);
  ctx.lineTo(162, h * 0.44);
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
  ctx.fillRect(0, 0, w, h * 0.74);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(0, h * 0.74, w, h * 0.26);

  const cols = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
  cols.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.74, 110 - i * 7, Math.PI, 0);
    ctx.stroke();
  });
}

function drawScenePlantingCare(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#BAE6FD";
  ctx.fillRect(0, 0, w, h * 0.68);
  ctx.fillStyle = "#84CC16";
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

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

  drawRealisticPerson(ctx, w / 2 - 86, h * 0.62, {
    role: "student_girl",
    shirtColor: "#0284C7",
    bottomColor: "#1E3A8A",
    hairColor: "#2C1810",
    scale: 0.78,
    pose: "standing",
  });
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
  drawPerspectiveRoomShell(ctx, w, h, "#FEF9C3", "#FDE68A", "#D97706", "#B45309");

  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(125, h * 0.42, 34, Math.PI, 0);
  ctx.lineTo(166, h * 0.6);
  ctx.lineTo(84, h * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "#EA580C";
  ctx.lineWidth = 3;
  [46, 60].forEach((r) => {
    ctx.beginPath();
    ctx.arc(125, h * 0.42, r, -0.6, 0.6);
    ctx.stroke();
  });

  drawRealisticPerson(ctx, w - 125, h * 0.58, {
    role: "student_boy",
    shirtColor: "#2563EB",
    bottomColor: "#1E293B",
    hairColor: "#1E1B18",
    scale: 0.85,
    pose: "raising_hand",
  });
}

function drawSceneSenseSmellTaste(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawSceneSchoolCanteen(ctx, w, h);
}

function drawSceneSenseTouchHygiene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPerspectiveRoomShell(ctx, w, h, "#F0F9FF", "#E0F2FE", "#CBD5E1", "#94A3B8");

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
  drawRealisticPerson(ctx, w / 2 - 58, h * 0.62, {
    role: "teacher",
    shirtColor: "#0284C7",
    bottomColor: "#334155",
    hairColor: "#475569",
    scale: 0.9,
    pose: "standing",
  });
  drawRealisticPerson(ctx, w / 2 + 36, h * 0.66, {
    role: "student_girl",
    shirtColor: "#F43F5E",
    bottomColor: "#1E3A8A",
    hairColor: "#1E1B18",
    scale: 0.76,
    pose: "raising_hand",
  });
}

function drawSceneSharingTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawSceneSchoolCanteen(ctx, w, h);
}

function drawSceneFaithCreation(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawSceneWeatherSky(ctx, w, h);
  drawSceneNatureGarden(ctx, w, h);
}

function drawSceneFaithChapel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPerspectiveRoomShell(ctx, w, h, "#FEF3C7", "#FDE68A", "#92400E", "#78350F");

  ctx.fillStyle = "#BAE6FD";
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.36, 48, Math.PI, 0);
  ctx.lineTo(w / 2 + 48, h * 0.64);
  ctx.lineTo(w / 2 - 48, h * 0.64);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, w / 2 - 6, h * 0.16, 12, 68, 4);
  ctx.fill();
  drawRoundedRect(ctx, w / 2 - 24, h * 0.3, 48, 12, 4);
  ctx.fill();

  drawRealisticPerson(ctx, w / 2 - 72, h * 0.64, {
    role: "student_girl",
    shirtColor: "#FFFFFF",
    bottomColor: "#1E3A8A",
    hairColor: "#1E1B18",
    scale: 0.8,
    pose: "thinking",
  });
  drawRealisticPerson(ctx, w / 2 + 72, h * 0.64, {
    role: "student_boy",
    shirtColor: "#FFFFFF",
    bottomColor: "#1E3A8A",
    hairColor: "#1E1B18",
    scale: 0.8,
    pose: "thinking",
  });
}

/* ============================================================================
 * REALISTIC-PROPORTIONED FULL-BODY HUMAN FIGURE RENDERER
 * Includes natural head, hair volume, ears, neck, torso, collared uniform/tie,
 * articulated arms & hands, skirt/trousers, legs, socks, shoes, and floor shadow.
 * ========================================================================== */
function drawRealisticPerson(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: {
    role: "student_girl" | "student_boy" | "teacher";
    shirtColor: string;
    bottomColor: string;
    hairColor: string;
    scale?: number;
    pose?: "standing" | "pointing" | "raising_hand" | "reading" | "eating" | "playing" | "thinking";
  }
) {
  const scale = opts.scale ?? 1;
  const pose = opts.pose ?? "standing";
  const isGirl = opts.role === "student_girl" || opts.role === "teacher";

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Soft ground shadow under feet
  ctx.fillStyle = "rgba(15, 23, 42, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 74, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2C1810";
  ctx.lineWidth = 2;

  // Legs, White Socks & Shoes
  [-9, 9].forEach((lx) => {
    // Leg
    ctx.fillStyle = "#F5C693";
    ctx.fillRect(lx - 4.5, 42, 9, 22);
    ctx.strokeRect(lx - 4.5, 42, 9, 22);
    // White sock
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(lx - 4.8, 56, 9.6, 10);
    ctx.strokeRect(lx - 4.8, 56, 9.6, 10);
    // Black school shoe
    ctx.fillStyle = "#1E293B";
    drawRoundedRect(ctx, lx - 6.5, 65, 13, 8, 4);
    ctx.fill();
    ctx.stroke();
  });

  // Pleated Skirt (for girl/teacher) or Trousers (for boy)
  ctx.fillStyle = opts.bottomColor;
  if (isGirl) {
    ctx.beginPath();
    ctx.moveTo(-18, 16);
    ctx.lineTo(18, 16);
    ctx.lineTo(25, 45);
    ctx.lineTo(-25, 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Pleat lines
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(-11, 44);
    ctx.moveTo(0, 18);
    ctx.lineTo(0, 44);
    ctx.moveTo(8, 18);
    ctx.lineTo(11, 44);
    ctx.stroke();
  } else {
    ctx.fillRect(-17, 16, 16, 28);
    ctx.strokeRect(-17, 16, 16, 28);
    ctx.fillRect(1, 16, 16, 28);
    ctx.strokeRect(1, 16, 16, 28);
  }

  // Torso / Collared Uniform Blouse or Shirt
  ctx.fillStyle = opts.shirtColor;
  drawRoundedRect(ctx, -19, -16, 38, 34, 8);
  ctx.fill();
  ctx.stroke();

  // Neck
  ctx.fillStyle = "#F5C693";
  ctx.fillRect(-5, -24, 10, 10);
  ctx.strokeRect(-5, -24, 10, 10);

  // Uniform Collar & Tie
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(-11, -16);
  ctx.lineTo(-3, -8);
  ctx.lineTo(0, -14);
  ctx.lineTo(3, -8);
  ctx.lineTo(11, -16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#991B1B";
  ctx.beginPath();
  ctx.moveTo(-3, -12);
  ctx.lineTo(3, -12);
  ctx.lineTo(4.5, 4);
  ctx.lineTo(0, 8);
  ctx.lineTo(-4.5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Articulated Arms & Hands
  ctx.fillStyle = opts.shirtColor;
  // Left Arm
  ctx.beginPath();
  ctx.moveTo(-18, -13);
  ctx.lineTo(-27, 4);
  ctx.lineTo(-20, 8);
  ctx.lineTo(-15, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Arm (adapts to pose)
  if (pose === "pointing" || pose === "raising_hand") {
    ctx.beginPath();
    ctx.moveTo(18, -13);
    ctx.lineTo(32, -26);
    ctx.lineTo(26, -31);
    ctx.lineTo(14, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Hand
    ctx.fillStyle = "#F5C693";
    ctx.beginPath();
    ctx.arc(31, -29, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (pose === "pointing") {
      // Teacher's wooden pointer stick
      ctx.strokeStyle = "#92400E";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(32, -30);
      ctx.lineTo(58, -54);
      ctx.stroke();
      ctx.strokeStyle = "#2C1810";
      ctx.lineWidth = 2;
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(18, -13);
    ctx.lineTo(26, 4);
    ctx.lineTo(19, 8);
    ctx.lineTo(15, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#F5C693";
    ctx.beginPath();
    ctx.arc(22, 9, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = "#F5C693";
  ctx.beginPath();
  ctx.arc(-23, 9, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Back Hair Volume (for girl/teacher bob cut)
  if (isGirl) {
    ctx.fillStyle = opts.hairColor;
    drawRoundedRect(ctx, -23, -54, 46, 34, 16);
    ctx.fill();
    ctx.stroke();
  }

  // Ears & Natural Head Shape
  ctx.fillStyle = "#F5C693";
  ctx.beginPath();
  ctx.arc(-19, -37, 4.5, 0, Math.PI * 2);
  ctx.arc(19, -37, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const headGrad = ctx.createRadialGradient(-4, -42, 4, 0, -38, 22);
  headGrad.addColorStop(0, "#FDE2B8");
  headGrad.addColorStop(1, "#F3C18A");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -38, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Top Hair & Bangs
  ctx.fillStyle = opts.hairColor;
  ctx.beginPath();
  ctx.arc(0, -42, 20, Math.PI * 0.92, Math.PI * 2.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eyebrows, Expressive Eyes with Irises, Soft Nose, and Warm Smile
  ctx.strokeStyle = "#2C1810";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-10, -43);
  ctx.lineTo(-4, -44);
  ctx.moveTo(4, -44);
  ctx.lineTo(10, -43);
  ctx.stroke();

  ctx.fillStyle = "#1E1B18";
  ctx.beginPath();
  ctx.arc(-7, -38, 2.8, 0, Math.PI * 2);
  ctx.arc(7, -38, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(-8, -39, 1, 0, Math.PI * 2);
  ctx.arc(6, -39, 1, 0, Math.PI * 2);
  ctx.fill();

  // Warm Smile
  ctx.fillStyle = "#E11D48";
  ctx.beginPath();
  ctx.arc(0, -31, 5, 0, Math.PI);
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
