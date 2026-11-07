import { IllustrationStyle, ImageInput, LessonPlan } from "./types";

export interface IllustrationGeneratorOptions {
  style?: IllustrationStyle;
  variationSeed?: number;
  customCaption?: string;
}

export type CreativeThemeCategory =
  | "nature_animals"
  | "senses_science"
  | "family_politeness"
  | "faith_rve"
  | "math_numbers"
  | "language_story";

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

/**
 * Detects whether the lesson plan is for Grade 1 or Kinder 2 so character proportions,
 * badges, uniforms, and visual complexity are tailored to the exact grade level.
 */
export function detectGradeTier(plan: LessonPlan): "kinder2" | "grade1" {
  if (plan.templateType === "matatag") {
    return /grade\s*1|baitang\s*1|oloph|olog/i.test(plan.gradeSection || "")
      ? "grade1"
      : "kinder2";
  }
  return /grade\s*1|baitang\s*1/i.test(plan.gradeLevel || "") ? "grade1" : "kinder2";
}

/**
 * Detects the creative visual theme from the lesson's subject and text so the illustration
 * draws topic-matched props, characters, and settings (without ever pasting the textbook photo).
 */
export function detectCreativeTheme(
  plan: LessonPlan,
  title: string,
  subtitle: string,
  panels: string[]
): CreativeThemeCategory {
  const combined = `${plan.subject || ""} ${title} ${subtitle} ${panels.join(" ")}`.toLowerCase();

  if (plan.templateType === "lccp" && (plan.subject || "").toLowerCase().includes("math")) {
    return "math_numbers";
  }
  if (
    plan.templateType === "lccp" &&
    ((plan.subject || "").toLowerCase().includes("rve") ||
      plan.rveFormat === "landscape_adidse")
  ) {
    return "faith_rve";
  }
  if (
    /gamu-gamo|paruparo|hayop|aso|pusa|ibon|halaman|puno|bulaklak|kalikasan|ulan|araw|animal|plant|tree|garden|insect|butterfly|nature|weather|water/i.test(
      combined
    )
  ) {
    return "nature_animals";
  }
  if (
    /pandama|mata|tainga|ilong|dila|balat|katawan|tunog|malakas|mahina|sense|sight|hearing|smell|taste|touch|sound|loud|soft|science|body|healthy/i.test(
      combined
    )
  ) {
    return "senses_science";
  }
  if (
    /magalang|po at opo|pagbati|pamilya|nanay|tatay|kuya|ate|tahanan|kapwa|pagtulong|pagmamahal|polite|family|home|respect|friend|sharing/i.test(
      combined
    )
  ) {
    return "family_politeness";
  }
  if (/diyos|panginoon|panalangin|simbahan|bibliya|god|jesus|bible|prayer|faith|creation|blessing/i.test(combined)) {
    return "faith_rve";
  }
  if (/bilang|numero|hugis|set|more|less|equal|count|number|add|subtract|shape|math/i.test(combined)) {
    return "math_numbers";
  }
  return "language_story";
}

/**
 * Extracts 4 meaningful story/concept panel captions, grade tier, and theme from any LessonPlan.
 */
export function extractIllustrationContent(plan: LessonPlan): {
  title: string;
  subtitle: string;
  questionPrompt: string;
  panels: [string, string, string, string];
  keywords: string[];
  gradeTier: "kinder2" | "grade1";
  gradeLabel: string;
  theme: CreativeThemeCategory;
} {
  const gradeTier = detectGradeTier(plan);
  const gradeLabel =
    gradeTier === "grade1" ? "GRADE 1 • OLOPH & OLOG" : "KINDER 2 • CREATIVE STORYBOOK";

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

    const keywords = [
      title.slice(0, 28),
      subtitle.slice(0, 28),
      "Magalang na Pananalita",
      "Pagmamahal at Malasakit",
    ];

    const theme = detectCreativeTheme(plan, title, subtitle, panels);
    return {
      title,
      subtitle,
      questionPrompt: truncateText(questionPrompt, 110),
      panels,
      keywords,
      gradeTier,
      gradeLabel,
      theme,
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

    const theme = detectCreativeTheme(plan, title, subtitle, panels);
    return {
      title,
      subtitle,
      questionPrompt: truncateText(
        plan.adidse.meditatio?.[0] || "How do we show love and gratitude to God?",
        110
      ),
      panels,
      keywords: [title.slice(0, 26), subtitle.slice(0, 26), "Lectio Divina", "LCCP Core Values"],
      gradeTier,
      gradeLabel,
      theme,
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

  const isMath = (plan.subject || "").toLowerCase().includes("math");
  const keywords = isMath
    ? [
        "Set A: More Objects",
        "Set B: Fewer Objects",
        title.slice(0, 28),
        "Count & Compare Sets",
      ]
    : [
        title.slice(0, 28),
        subtitle,
        plan.procedures.learningStrategies?.[0]?.title || "Discovery",
        "Values Integration",
      ];

  const theme = detectCreativeTheme(plan, title, subtitle, panels);
  return {
    title,
    subtitle,
    questionPrompt: truncateText(questionPrompt, 110),
    panels,
    keywords,
    gradeTier,
    gradeLabel,
    theme,
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
    rawRows.push(0); // filter type 0
    for (let x = 0; x < width; x++) {
      const isBorder =
        x < 2 || x >= width - 2 || y < 2 || y >= height - 2 || x === 24 || y === 16;
      if (isBorder) {
        rawRows.push(30, 58, 138);
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

function selectCreativePalette(seed: number, gradeTier: "kinder2" | "grade1") {
  const kinderPalettes = [
    {
      skyTop: "#DBEAFE",
      skyBottom: "#FEF3C7",
      accentPrimary: "#2563EB",
      accentSecondary: "#F59E0B",
      groundColor: "#86EFAC",
      badgeBg: "#EC4899",
    },
    {
      skyTop: "#FCE7F3",
      skyBottom: "#FEF9C3",
      accentPrimary: "#7C3AED",
      accentSecondary: "#10B981",
      groundColor: "#A7F3D0",
      badgeBg: "#F97316",
    },
    {
      skyTop: "#CCFBF1",
      skyBottom: "#E0F2FE",
      accentPrimary: "#0D9488",
      accentSecondary: "#F43F5E",
      groundColor: "#BEF264",
      badgeBg: "#2563EB",
    },
    {
      skyTop: "#FEF3C7",
      skyBottom: "#FFEDD5",
      accentPrimary: "#D97706",
      accentSecondary: "#3B82F6",
      groundColor: "#86EFAC",
      badgeBg: "#059669",
    },
  ];

  const grade1Palettes = [
    {
      skyTop: "#DBEAFE",
      skyBottom: "#E0E7FF",
      accentPrimary: "#1D4ED8",
      accentSecondary: "#D97706",
      groundColor: "#86EFAC",
      badgeBg: "#1E40AF",
    },
    {
      skyTop: "#E0F2FE",
      skyBottom: "#FEF3C7",
      accentPrimary: "#0369A1",
      accentSecondary: "#E11D48",
      groundColor: "#A7F3D0",
      badgeBg: "#0F766E",
    },
    {
      skyTop: "#EDE9FE",
      skyBottom: "#FCE7F3",
      accentPrimary: "#4338CA",
      accentSecondary: "#059669",
      groundColor: "#BEF264",
      badgeBg: "#6D28D9",
    },
  ];

  const list = gradeTier === "grade1" ? grade1Palettes : kinderPalettes;
  return list[seed % list.length];
}

/**
 * Generates a unique, 100% original creative educational illustration (`data:image/png;base64,...`)
 * tailored to the lesson's topic, subject, and grade level (Kinder 2 vs Grade 1).
 * NEVER embeds or pastes the raw textbook photo into the illustration.
 */
export async function generateUniqueLessonIllustration(
  plan: LessonPlan,
  _textbookImages?: ImageInput[],
  options?: IllustrationGeneratorOptions
): Promise<string> {
  const style = options?.style || getDefaultIllustrationStyle(plan);
  const content = extractIllustrationContent(plan);
  const seed = hashString(
    `${content.title}|${content.subtitle}|${content.gradeTier}|${style}|${options?.variationSeed ?? 0}`,
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

  const palette = selectCreativePalette(seed, content.gradeTier);

  if (style === "pag_uugnay_speech") {
    drawPagUugnaySpeechScene(ctx, canvas.width, canvas.height, content, palette, seed);
  } else if (style === "math_concept_sets") {
    drawMathConceptSetsScene(ctx, canvas.width, canvas.height, content, palette, seed);
  } else {
    drawFourPanelComicScene(ctx, canvas.width, canvas.height, content, palette, seed);
  }

  return canvas.toDataURL("image/png");
}

/**
 * Style 1: Creative 4-Panel Storybook Comic Scene tailored to Kinder 2 or Grade 1
 * (Matches K2 - Week 4 Filipino.docx, K2-SCIENCE-W6.docx, and RVE LESSON 4.docx without any textbook photo crop)
 */
function drawFourPanelComicScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  palette: ReturnType<typeof selectCreativePalette>,
  seed: number
) {
  const isKinder = content.gradeTier === "kinder2";

  // Warm Storybook Canvas Background
  ctx.fillStyle = isKinder ? "#FFFBEB" : "#F8FAFC";
  ctx.fillRect(0, 0, w, h);

  // Decorative Header Banner with Grade-Level Pill
  const headerGrad = ctx.createLinearGradient(0, 0, w, 0);
  headerGrad.addColorStop(0, palette.accentPrimary);
  headerGrad.addColorStop(1, palette.badgeBg);
  ctx.fillStyle = headerGrad;
  drawRoundedRect(ctx, 14, 12, w - 28, 54, 14);
  ctx.fill();

  // Grade-Level Badge on Right of Header
  ctx.fillStyle = "#FEF08A";
  drawRoundedRect(ctx, w - 252, 21, 224, 34, 17);
  ctx.fill();
  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 12px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(content.gradeLabel, w - 140, 42);

  // Lesson Title & Subtitle on Left of Header
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 19px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    `${isKinder ? "🎨" : "📘"} ${truncateText(content.title, 48)}`,
    28,
    37
  );
  ctx.font = "bold 12px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#FDE68A";
  ctx.fillText(truncateText(content.subtitle, 65), 30, 55);

  const panelW = (w - 42) / 2;
  const panelH = (h - 94) / 2;
  const positions = [
    { x: 14, y: 76 },
    { x: 28 + panelW, y: 76 },
    { x: 14, y: 88 + panelH },
    { x: 28 + panelW, y: 88 + panelH },
  ];

  const panelSkies = [
    ["#DBEAFE", "#EFF6FF"],
    ["#FEF3C7", "#FFFBEB"],
    ["#E0F2FE", "#F0F9FF"],
    ["#FCE7F3", "#FDF2F8"],
  ];
  const panelGrounds = ["#86EFAC", "#BEF264", "#6EE7B7", "#FDE68A"];
  const poses: Array<"wave" | "book" | "heart" | "magnify" | "pray"> = [
    "wave",
    "book",
    "magnify",
    "heart",
  ];
  if (content.theme === "faith_rve") {
    poses[2] = "pray";
    poses[3] = "heart";
  }

  positions.forEach((pos, idx) => {
    ctx.save();
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 16);
    ctx.clip();

    // Sky Gradient
    const skyPair = panelSkies[(idx + seed) % panelSkies.length];
    const skyGrad = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + panelH);
    skyGrad.addColorStop(0, skyPair[0]);
    skyGrad.addColorStop(1, skyPair[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(pos.x, pos.y, panelW, panelH);

    // Kinder 2 Rainbow Arc in Panel 1 or 4
    if (isKinder && (idx === 0 || idx === 3)) {
      drawRainbowArc(ctx, pos.x + panelW - 95, pos.y + 115, 75);
    }

    // Smiling Sun & Fluffy Clouds
    drawSmilingSun(ctx, pos.x + panelW - 48, pos.y + 38, isKinder ? 20 : 16);
    drawCloud(ctx, pos.x + 68 + ((idx * 31) % 60), pos.y + 30, 0.85);
    drawCloud(ctx, pos.x + 215, pos.y + 26, 0.72);

    // Rolling Meadow / Classroom Floor
    const groundCol = panelGrounds[(idx + seed) % panelGrounds.length];
    ctx.fillStyle = groundCol;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y + panelH - 80);
    ctx.quadraticCurveTo(
      pos.x + panelW * 0.5,
      pos.y + panelH - 108,
      pos.x + panelW,
      pos.y + panelH - 76
    );
    ctx.lineTo(pos.x + panelW, pos.y + panelH);
    ctx.lineTo(pos.x, pos.y + panelH);
    ctx.closePath();
    ctx.fill();

    // Draw Creative Topic-Specific Scenery & Props on the Right Side of the Panel (NO textbook photo!)
    drawThemePropsInPanel(
      ctx,
      pos.x + panelW - 120,
      pos.y + 98,
      content.theme,
      idx,
      seed,
      isKinder
    );

    // Draw Expressive Grade-Appropriate Students on the Left/Center
    const charColors = ["#2563EB", "#DC2626", "#059669", "#7C3AED", "#EA580C"];
    const studentScale = isKinder ? 0.94 : 1.02;
    drawCartoonStudent(
      ctx,
      pos.x + 92 + (idx % 2) * 14,
      pos.y + 116,
      charColors[(idx + seed) % charColors.length],
      poses[idx % poses.length],
      studentScale,
      isKinder,
      idx % 2 === 0 ? "girl" : "boy"
    );
    drawCartoonStudent(
      ctx,
      pos.x + 188 + (idx % 2) * 10,
      pos.y + 120,
      charColors[(idx + seed + 2) % charColors.length],
      poses[(idx + 1) % poses.length],
      studentScale * 0.96,
      isKinder,
      idx % 2 === 0 ? "boy" : "girl"
    );

    // Mini Dialogue Bubble above characters
    const miniDialogues = getMiniDialogues(content.theme, content.gradeTier);
    drawMiniSpeechBubble(
      ctx,
      pos.x + 140,
      pos.y + 52,
      miniDialogues[(idx + seed) % miniDialogues.length]
    );

    // Panel Number Badge
    ctx.fillStyle = palette.accentPrimary;
    ctx.beginPath();
    ctx.arc(pos.x + 26, pos.y + 26, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(idx + 1), pos.x + 26, pos.y + 31);

    // Rounded White Story Caption Box at bottom
    const capX = pos.x + 10;
    const capY = pos.y + panelH - 60;
    const capW = panelW - 20;
    const capH = 50;
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    drawRoundedRect(ctx, capX, capY, capW, capH, 10);
    ctx.fill();
    ctx.strokeStyle = palette.accentPrimary;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 12.5px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, content.panels[idx], capX + capW / 2, capY + 20, capW - 18, 16, 2);

    ctx.restore();

    // Crisp Panel Frame
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 16);
    ctx.stroke();
  });
}

/**
 * Style 2: Grade 1 / Kinder 2 "PAG-UUGNAY" Student Speech Bubble & Interactive Chalkboard Scene
 * (Matches G1-Filipino-LP-Week 11.docx with creative hand-drawn chalkboard art — NO textbook photo)
 */
function drawPagUugnaySpeechScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  palette: ReturnType<typeof selectCreativePalette>,
  seed: number
) {
  const isKinder = content.gradeTier === "kinder2";

  // Cheerful Classroom / Storybook Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#FEF3C7");
  bgGrad.addColorStop(0.62, "#DBEAFE");
  bgGrad.addColorStop(1, "#86EFAC");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Decorative bunting flags across top right
  drawClassroomBunting(ctx, 355, 18, w - 380);

  // Creative Classroom Chalkboard on Right (with hand-drawn chalk illustrations, NEVER textbook photo)
  const boardX = w - 365;
  const boardY = 78;
  const boardW = 335;
  const boardH = 290;
  ctx.fillStyle = "#14532D";
  drawRoundedRect(ctx, boardX, boardY, boardW, boardH, 16);
  ctx.fill();
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Chalkboard Header & Grade Badge
  ctx.fillStyle = "#FDE68A";
  ctx.font = "bold 13px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`✨ ${content.gradeLabel} ✨`, boardX + boardW / 2, boardY + 28);

  // Chalk-drawn divider line
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(boardX + 24, boardY + 38);
  ctx.lineTo(boardX + boardW - 24, boardY + 38);
  ctx.stroke();

  // Chalk-written Lesson Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px 'Comic Sans MS', 'Segoe UI', sans-serif";
  drawWrappedText(
    ctx,
    content.title,
    boardX + boardW / 2,
    boardY + 62,
    boardW - 36,
    21,
    2
  );

  // Creative Chalkboard Illustration Centerpiece (butterflies, lamp, family, senses, or storybook)
  drawThemePropsInPanel(
    ctx,
    boardX + boardW / 2,
    boardY + 158,
    content.theme,
    seed % 4,
    seed,
    isKinder
  );

  // Chalkboard Bottom Key Concept Note
  ctx.fillStyle = "#A7F3D0";
  ctx.font = "bold 13px 'Segoe UI', sans-serif";
  drawWrappedText(
    ctx,
    content.panels[1],
    boardX + boardW / 2,
    boardY + 236,
    boardW - 36,
    18,
    2
  );

  // Top Pill Banner ("PAG-UUGNAY")
  ctx.fillStyle = palette.accentPrimary;
  drawRoundedRect(ctx, 28, 20, 310, 52, 26);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 25px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PAG-UUGNAY", 183, 54);

  // Large Expressive Speech Bubble with the Motivation / Guide Question
  const bubX = 30;
  const bubY = 88;
  const bubW = 495;
  const bubH = 165;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, bubX, bubY, bubW, bubH, 24);
  ctx.fill();
  ctx.strokeStyle = "#1E3A8A";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Speech bubble pointer towards student
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(bubX + 195, bubY + bubH);
  ctx.lineTo(bubX + 235, bubY + bubH + 36);
  ctx.lineTo(bubX + 265, bubY + bubH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1E3A8A";
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 19px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, content.questionPrompt, bubX + bubW / 2, bubY + 50, bubW - 44, 27, 4);

  // Cheerful Filipino students in LCCP blue/white uniform + animated props
  const scaleMain = isKinder ? 1.22 : 1.32;
  drawCartoonStudent(ctx, 215, 378, "#1D4ED8", "book", scaleMain, isKinder, "girl");
  drawCartoonStudent(ctx, 395, 386, "#0284C7", "wave", scaleMain * 0.94, isKinder, "boy");

  // Mini response bubble from second student
  const miniDialogues = getMiniDialogues(content.theme, content.gradeTier);
  drawMiniSpeechBubble(ctx, 430, 292, miniDialogues[0]);

  // Bottom Callout Cards with Lesson Steps / Values
  const pillColors = ["#EF4444", "#059669", "#7C3AED"];
  [content.panels[0], content.panels[2], content.panels[3]].forEach((txt, i) => {
    const px = 28 + i * 292;
    const py = h - 78;
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, px, py, 276, 58, 14);
    ctx.fill();
    ctx.strokeStyle = pillColors[(i + seed) % pillColors.length];
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 12px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, txt, px + 138, py + 24, 254, 16, 2);
  });

  // Outer Frame
  ctx.strokeStyle = "#1E3A8A";
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 6, 6, w - 12, h - 12, 16);
  ctx.stroke();
}

/**
 * Style 3: Kinder 2 / Grade 1 Mathematics Playful Visual Set Cards
 * (Matches K2 -WEEK 6 - MATHEMATICS.docx with creative countable illustrations — NO textbook photo)
 */
function drawMathConceptSetsScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  _palette: ReturnType<typeof selectCreativePalette>,
  seed: number
) {
  const isKinder = content.gradeTier === "kinder2";
  ctx.fillStyle = "#FFFBEB";
  ctx.fillRect(0, 0, w, h);

  // Top Title Bar with Grade Badge
  ctx.fillStyle = "#1E3A8A";
  drawRoundedRect(ctx, 18, 14, w - 36, 54, 14);
  ctx.fill();

  ctx.fillStyle = "#FDE047";
  drawRoundedRect(ctx, w - 246, 23, 214, 36, 18);
  ctx.fill();
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 12px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    isKinder ? "🧸 KINDER 2 MATH PLAY" : "📐 GRADE 1 MATH LAB",
    w - 139,
    45
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`🔢 ${truncateText(content.title, 46)}`, 34, 48);

  const cardW = (w - 56) / 2;
  const cardH = 376;
  const leftX = 18;
  const rightX = 38 + cardW;
  const cardY = 82;

  const shapePool: Array<"car" | "star" | "apple" | "butterfly" | "cupcake"> = [
    "car",
    "star",
    "apple",
    "butterfly",
    "cupcake",
  ];
  const shapeA = shapePool[seed % shapePool.length];
  const shapeB = shapePool[(seed + 2) % shapePool.length];
  const countA = 5 + (seed % 3); // 5 to 7 objects
  const countB = 2 + (seed % 3); // 2 to 4 objects

  const setConfigs = [
    {
      x: leftX,
      borderColor: "#E11D48",
      bgColor: "#FFF1F2",
      label: `Set A (${countA} Objects)`,
      count: countA,
      shape: shapeA,
      caption: content.panels[0],
    },
    {
      x: rightX,
      borderColor: "#0284C7",
      bgColor: "#F0F9FF",
      label: `Set B (${countB} Objects)`,
      count: countB,
      shape: shapeB,
      caption: content.panels[1],
    },
  ];

  setConfigs.forEach((cfg) => {
    ctx.fillStyle = cfg.bgColor;
    drawRoundedRect(ctx, cfg.x, cardY, cardW, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = cfg.borderColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Set Title Pill
    ctx.fillStyle = cfg.borderColor;
    drawRoundedRect(ctx, cfg.x + 24, cardY + 16, cardW - 48, 42, 21);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 17px 'Comic Sans MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cfg.label, cfg.x + cardW / 2, cardY + 43);

    // Draw countable illustrated objects in a neat grid with number tags
    const cols = 3;
    for (let i = 0; i < cfg.count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = cfg.x + 86 + col * 126;
      const oy = cardY + 115 + row * 92;
      drawCountableObject(ctx, ox, oy, cfg.shape, i + seed);

      // Tiny counting number badge next to each object for Kinder 2 / Grade 1 learners
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(ox + 26, oy - 20, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cfg.borderColor;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = cfg.borderColor;
      ctx.font = "bold 11px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), ox + 26, oy - 16);
    }

    // Bottom caption inside set card
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, cfg.x + 16, cardY + cardH - 56, cardW - 32, 42, 10);
    ctx.fill();
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 12.5px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(
      ctx,
      cfg.caption,
      cfg.x + cardW / 2,
      cardY + cardH - 31,
      cardW - 48,
      15,
      2
    );
  });

  // Center Comparison Badge between Set A and Set B
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(w / 2, cardY + cardH / 2, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("VS", w / 2, cardY + cardH / 2 + 6);

  // Footer Summary Prompt Bar with Cheerful Mascot
  ctx.fillStyle = "#FEF3C7";
  drawRoundedRect(ctx, 18, h - 104, w - 36, 86, 16);
  ctx.fill();
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#92400E";
  ctx.font = "bold 15.5px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  drawWrappedText(
    ctx,
    `💡 Guided Discovery: ${content.questionPrompt}`,
    w / 2,
    h - 68,
    w - 80,
    22,
    2
  );
}

/**
 * Draws rich, topic-specific illustrated props and scenery (animals, butterflies, glowing lamp,
 * senses icons, family house, faith cross/dove, or alphabet blocks) — 100% original vector art.
 */
function drawThemePropsInPanel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: CreativeThemeCategory,
  panelIdx: number,
  seed: number,
  isKinder: boolean
) {
  ctx.save();
  ctx.translate(cx, cy);
  if (isKinder) {
    ctx.scale(1.06, 1.06);
  }

  if (theme === "nature_animals") {
    // Draw a lush tree or garden flowers + fluttering butterflies / gamu-gamo
    drawTreeAndFlowers(ctx, 18, 22);
    drawButterfly(ctx, -32, -26, "#F59E0B", "#EC4899");
    drawButterfly(ctx, 24, -36, "#3B82F6", "#A855F7");
    if (panelIdx % 2 === 0) {
      // Glowing warm candle/lamp for "Ang Munting Gamu-gamo" or story light
      drawGlowingLamp(ctx, -28, 22);
    }
  } else if (theme === "senses_science") {
    // Draw Science / Five Senses discovery badges (musical notes, magnifying glass, flower, rainbow star)
    drawScienceDiscoveryCluster(ctx, panelIdx, seed);
  } else if (theme === "family_politeness") {
    // Draw cozy Filipino home, floating hearts, and "Po at Opo" respect stars
    drawCozyHomeAndHearts(ctx, panelIdx);
  } else if (theme === "faith_rve") {
    // Draw glowing cross, peaceful dove, open Bible, and sharing heart
    drawFaithAndPeaceCluster(ctx, panelIdx);
  } else {
    // Language / Reading Story: 3D Alphabet Blocks (A, B, K), magical open book, and stars
    drawAlphabetAndStoryCluster(ctx, panelIdx, seed);
  }

  ctx.restore();
}

function drawTreeAndFlowers(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  // Trunk
  ctx.fillStyle = "#92400E";
  drawRoundedRect(ctx, -8, -10, 16, 48, 4);
  ctx.fill();
  // Canopy
  ctx.fillStyle = "#16A34A";
  ctx.beginPath();
  ctx.arc(0, -24, 28, 0, Math.PI * 2);
  ctx.arc(-18, -12, 20, 0, Math.PI * 2);
  ctx.arc(18, -12, 20, 0, Math.PI * 2);
  ctx.fill();
  // Flowers on ground
  [-28, 24].forEach((fx, i) => {
    ctx.fillStyle = i === 0 ? "#F43F5E" : "#A855F7";
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * 6, 28 + Math.sin(a) * 6, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.arc(fx, 28, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawButterfly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wingOuter: string,
  wingInner: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  ctx.fillStyle = wingOuter;
  ctx.beginPath();
  ctx.ellipse(-10, -6, 11, 8, -0.4, 0, Math.PI * 2);
  ctx.ellipse(10, -6, 11, 8, 0.4, 0, Math.PI * 2);
  ctx.ellipse(-8, 6, 8, 6, 0.3, 0, Math.PI * 2);
  ctx.ellipse(8, 6, 8, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = wingInner;
  ctx.beginPath();
  ctx.arc(-10, -6, 4, 0, Math.PI * 2);
  ctx.arc(10, -6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, -2, -10, 4, 20, 2);
  ctx.fill();
  ctx.restore();
}

function drawGlowingLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  // Warm glow
  const glow = ctx.createRadialGradient(0, -14, 2, 0, -14, 28);
  glow.addColorStop(0, "rgba(253, 224, 71, 0.9)");
  glow.addColorStop(1, "rgba(253, 224, 71, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, -14, 28, 0, Math.PI * 2);
  ctx.fill();

  // Flame
  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.quadraticCurveTo(10, -14, 0, -6);
  ctx.quadraticCurveTo(-10, -14, 0, -28);
  ctx.fill();

  // Candle/Lamp base
  ctx.fillStyle = "#FDE047";
  drawRoundedRect(ctx, -7, -6, 14, 22, 3);
  ctx.fill();
  ctx.fillStyle = "#B45309";
  drawRoundedRect(ctx, -14, 14, 28, 6, 3);
  ctx.fill();
  ctx.restore();
}

function drawScienceDiscoveryCluster(
  ctx: CanvasRenderingContext2D,
  panelIdx: number,
  seed: number
) {
  // Glowing circular science badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0284C7";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Musical notes / sound waves + magnifying glass + fruit
  ctx.fillStyle = "#E11D48";
  ctx.font = "bold 26px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  const icons = ["🔍 🎵", "👀 🌸", "👂 🔔", "🍎 ✋"];
  ctx.fillText(icons[(panelIdx + seed) % icons.length], 0, 8);
}

function drawCozyHomeAndHearts(ctx: CanvasRenderingContext2D, panelIdx: number) {
  // Cozy Filipino house
  ctx.fillStyle = "#FEF3C7";
  drawRoundedRect(ctx, -34, -4, 68, 46, 6);
  ctx.fill();
  ctx.strokeStyle = "#D97706";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Roof
  ctx.fillStyle = "#DC2626";
  ctx.beginPath();
  ctx.moveTo(-44, -2);
  ctx.lineTo(0, -36);
  ctx.lineTo(44, -2);
  ctx.closePath();
  ctx.fill();

  // Door & Window
  ctx.fillStyle = "#92400E";
  drawRoundedRect(ctx, -8, 14, 16, 28, 3);
  ctx.fill();

  // Floating Heart Badge above roof
  ctx.fillStyle = panelIdx % 2 === 0 ? "#EC4899" : "#EF4444";
  ctx.font = "bold 22px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("💖", 0, -40);
}

function drawFaithAndPeaceCluster(ctx: CanvasRenderingContext2D, panelIdx: number) {
  // Radiant halo
  const halo = ctx.createRadialGradient(0, -6, 4, 0, -6, 46);
  halo.addColorStop(0, "rgba(254, 240, 138, 0.95)");
  halo.addColorStop(1, "rgba(254, 240, 138, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, -6, 46, 0, Math.PI * 2);
  ctx.fill();

  // Cross
  ctx.fillStyle = "#D97706";
  drawRoundedRect(ctx, -5, -34, 10, 52, 3);
  ctx.fill();
  drawRoundedRect(ctx, -20, -20, 40, 10, 3);
  ctx.fill();

  // Dove / Heart symbol
  ctx.font = "bold 22px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(panelIdx % 2 === 0 ? "🕊️" : "🙏", 28, -22);
}

function drawAlphabetAndStoryCluster(
  ctx: CanvasRenderingContext2D,
  panelIdx: number,
  seed: number
) {
  const letters = [
    ["A", "E", "I"],
    ["B", "K", "M"],
    ["O", "U", "S"],
    ["P", "T", "L"],
  ][(panelIdx + seed) % 4];
  const blockColors = ["#EF4444", "#3B82F6", "#10B981"];

  letters.forEach((ltr, i) => {
    const bx = (i - 1) * 32;
    const by = i === 1 ? -22 : 6;
    ctx.fillStyle = blockColors[i % blockColors.length];
    drawRoundedRect(ctx, bx - 14, by - 14, 28, 28, 6);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px 'Comic Sans MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ltr, bx, by + 6);
  });
}

function getMiniDialogues(
  theme: CreativeThemeCategory,
  gradeTier: "kinder2" | "grade1"
): string[] {
  if (theme === "family_politeness") {
    return ["Po at Opo!", "Salamat po!", "Magandang araw po!", "Tulungan po kita!"];
  }
  if (theme === "nature_animals") {
    return ["Ang ganda!", "Ingatan natin!", "Tingnan mo!", "Salamat Panginoon!"];
  }
  if (theme === "senses_science") {
    return ["I can observe!", "Listen closely!", "Five Senses!", "Let's discover!"];
  }
  if (theme === "faith_rve") {
    return ["Thank You, God!", "Share with love!", "God loves us!", "Amen! 🙏"];
  }
  if (theme === "math_numbers") {
    return ["Let's count!", "More or Less!", "1, 2, 3, 4, 5!", "Set A & Set B!"];
  }
  return gradeTier === "grade1"
    ? ["Basahin natin!", "Po at Opo!", "Mag-aral tayo!", "Mahusay!"]
    : ["Let's learn!", "Good job!", "Story time!", "Hooray! 🌟"];
}

function drawMiniSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string
) {
  ctx.save();
  ctx.font = "bold 11.5px 'Comic Sans MS', 'Segoe UI', sans-serif";
  const textW = Math.min(130, Math.max(68, ctx.measureText(text).width + 20));
  const bx = x - textW / 2;
  const by = y - 14;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, bx, by, textW, 26, 13);
  ctx.fill();
  ctx.strokeStyle = "#2563EB";
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = "#1E293B";
  ctx.textAlign = "center";
  ctx.fillText(text, x, by + 17);
  ctx.restore();
}

function drawSmilingSun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3));
    ctx.lineTo(Math.cos(a) * (r + 9), Math.sin(a) * (r + 9));
    ctx.stroke();
  }
  ctx.fillStyle = "#FBBF24";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Cute smile on sun
  ctx.fillStyle = "#92400E";
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.15, 2, 0, Math.PI * 2);
  ctx.arc(r * 0.3, -r * 0.15, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#92400E";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawRainbowArc(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  const colors = [
    "rgba(239, 68, 68, 0.35)",
    "rgba(245, 158, 11, 0.35)",
    "rgba(16, 185, 129, 0.35)",
    "rgba(59, 130, 246, 0.35)",
  ];
  ctx.save();
  ctx.lineWidth = 5;
  colors.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, radius - i * 5, Math.PI, 0);
    ctx.stroke();
  });
  ctx.restore();
}

function drawClassroomBunting(
  ctx: CanvasRenderingContext2D,
  startX: number,
  y: number,
  totalWidth: number
) {
  const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
  const count = 9;
  const step = totalWidth / count;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const fx = startX + i * step;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(fx, y);
    ctx.lineTo(fx + step * 0.85, y);
    ctx.lineTo(fx + step * 0.42, y + 22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCartoonStudent(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  shirtColor: string,
  pose: "wave" | "book" | "heart" | "magnify" | "pray",
  scale = 1,
  isKinder = false,
  hairStyle: "girl" | "boy" = "girl"
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Torso / Uniform Shirt
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, -24, 18, 48, 52, 12);
  ctx.fill();
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // LCCP Jumper / Vest Accent
  ctx.fillStyle = shirtColor;
  drawRoundedRect(ctx, -20, 26, 40, 44, 8);
  ctx.fill();

  // Necktie / Kinder Bowtie
  ctx.fillStyle = isKinder ? "#F59E0B" : "#EF4444";
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.lineTo(6, 20);
  ctx.lineTo(0, 36);
  ctx.closePath();
  ctx.fill();

  // Head (Slightly larger & rounder for Kinder 2)
  const headRadius = isKinder ? 28 : 26;
  ctx.fillStyle = "#FDE68A";
  ctx.beginPath();
  ctx.arc(0, -6, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hair (Pigtails for girl, neat cap hair for boy)
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.arc(0, -12, headRadius + 1, Math.PI, Math.PI * 2);
  ctx.fill();
  if (hairStyle === "girl") {
    ctx.beginPath();
    ctx.arc(-headRadius - 2, -10, 9, 0, Math.PI * 2);
    ctx.arc(headRadius + 2, -10, 9, 0, Math.PI * 2);
    ctx.fill();
    // Hair bows
    ctx.fillStyle = "#EC4899";
    ctx.beginPath();
    ctx.arc(-headRadius + 2, -16, 4, 0, Math.PI * 2);
    ctx.arc(headRadius - 2, -16, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Expressive Eyes & Cheerful Smile
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.arc(-9, -6, isKinder ? 3.5 : 3, 0, Math.PI * 2);
  ctx.arc(9, -6, isKinder ? 3.5 : 3, 0, Math.PI * 2);
  ctx.fill();
  // Eye sparkle
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(-10, -7.5, 1.2, 0, Math.PI * 2);
  ctx.arc(8, -7.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -1, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = "rgba(244, 63, 94, 0.38)";
  ctx.beginPath();
  ctx.arc(-15, 0, 4.8, 0, Math.PI * 2);
  ctx.arc(15, 0, 4.8, 0, Math.PI * 2);
  ctx.fill();

  if (pose === "book") {
    ctx.fillStyle = "#F59E0B";
    drawRoundedRect(ctx, -22, 34, 44, 28, 4);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, 36, 40, 24);
  } else if (pose === "magnify") {
    // Holding a magnifying glass for discovery
    ctx.strokeStyle = "#0284C7";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(32, 4, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25, 12);
    ctx.lineTo(18, 24);
    ctx.stroke();
  } else if (pose === "pray") {
    // Praying / grateful hands in front
    ctx.fillStyle = "#FDE68A";
    drawRoundedRect(ctx, -7, 28, 14, 22, 6);
    ctx.fill();
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (pose === "heart") {
    ctx.fillStyle = "#EC4899";
    ctx.font = "bold 20px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❤️", 34, 2);
  } else {
    // Waving hand
    ctx.strokeStyle = "#FDE68A";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(22, 28);
    ctx.lineTo(38, 6);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCountableObject(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shape: "car" | "star" | "apple" | "butterfly" | "cupcake",
  colorIndex: number
) {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
  const col = colors[colorIndex % colors.length];
  ctx.save();
  ctx.translate(x, y);

  if (shape === "car") {
    ctx.fillStyle = col;
    drawRoundedRect(ctx, -32, -8, 64, 22, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -8, 18, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#E0F2FE";
    ctx.beginPath();
    ctx.arc(2, -8, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(-16, 14, 8, 0, Math.PI * 2);
    ctx.arc(16, 14, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "apple") {
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(-8, 2, 16, 0, Math.PI * 2);
    ctx.arc(8, 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#16A34A";
    ctx.beginPath();
    ctx.ellipse(6, -16, 9, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "butterfly") {
    drawButterfly(ctx, 0, 0, col, "#FDE047");
  } else if (shape === "cupcake") {
    ctx.fillStyle = "#F59E0B";
    drawRoundedRect(ctx, -16, 2, 32, 18, 4);
    ctx.fill();
    ctx.fillStyle = "#EC4899";
    ctx.beginPath();
    ctx.arc(0, 0, 18, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(0, -20, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = ((i * 72 - 90) * Math.PI) / 180;
      const innerAngle = ((i * 72 + 36 - 90) * Math.PI) / 180;
      const ox = Math.cos(outerAngle) * 26;
      const oy = Math.sin(outerAngle) * 26;
      const ix = Math.cos(innerAngle) * 12;
      const iy = Math.sin(innerAngle) * 12;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.arc(18, -4, 20, 0, Math.PI * 2);
  ctx.arc(38, 0, 15, 0, Math.PI * 2);
  ctx.fill();
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
