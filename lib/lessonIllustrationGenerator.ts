import { IllustrationStyle, ImageInput, LessonPlan } from "./types";

export interface IllustrationGeneratorOptions {
  style?: IllustrationStyle;
  variationSeed?: number;
  customCaption?: string;
}

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
 * Extracts 4 meaningful story/concept panel captions and a main title from any LessonPlan.
 */
export function extractIllustrationContent(plan: LessonPlan): {
  title: string;
  subtitle: string;
  questionPrompt: string;
  panels: [string, string, string, string];
  keywords: string[];
} {
  if (plan.templateType === "matatag") {
    const title = (plan.subjectMatter.paksa || "Banghay-Aralin sa Filipino").replace(/^Paksa:\s*/i, "").trim();
    const subtitle = (plan.subjectMatter.wika || plan.gradeSection || "Filipino").replace(/^Wika:\s*/i, "").trim();
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
      truncateText(rawPanels[3] || plan.procedures.valuesIntegration || "Pagsasabuhay ng mabuting aral sa araw-araw.", 92),
    ];

    const keywords = [
      title.slice(0, 28),
      subtitle.slice(0, 28),
      "Magalang na Pananalita",
      "Pagmamahal at Malasakit",
    ];

    return { title, subtitle, questionPrompt: truncateText(questionPrompt, 110), panels, keywords };
  }

  // LCCP Learning Plan (Language, Science, Math, RVE)
  if (plan.rveFormat === "landscape_adidse" && plan.adidse) {
    const title = plan.adidse.lessonTitle || plan.subjectMatter.lesson || "Religion Learning Plan";
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
      truncateText(rawPanels[1] || plan.adidse.meditatio?.[0] || "Sharing God's gifts with our friends.", 92),
      truncateText(rawPanels[2] || plan.adidse.meditatio?.[1] || "Helping and caring for one another in school.", 92),
      truncateText(rawPanels[3] || plan.adidse.oratio || "Thank You, Jesus, for Your love and kindness!", 92),
    ];

    return {
      title: truncateText(title, 48),
      subtitle: truncateText(subtitle, 54),
      questionPrompt: truncateText(plan.adidse.meditatio?.[0] || "How do we show love and care for God's creation?", 110),
      panels,
      keywords: [truncateText(title, 26), truncateText(subtitle, 26), "Unitas, Caritas, Veritas", "LCCP Care"],
    };
  }

  const title = (plan.subjectMatter.lesson || `${plan.subject} Learning Plan`).trim();
  const subtitle = `${plan.subject} • ${plan.gradeLevel}`;
  const strategies = plan.procedures.learningStrategies || [];
  const allQuestions = strategies.flatMap((st) => st.questions || []);
  const questionPrompt =
    allQuestions[0] ||
    plan.procedures.motivation ||
    `Let us explore and learn about ${title}!`;

  const rawPanels = [
    ...(plan.illustrationPanels || []),
    plan.procedures.motivation,
    ...strategies.map((s) => `${s.title}: ${s.instructions}`),
    ...allQuestions,
    plan.valuesStatement,
    plan.closure,
  ]
    .map((s) => (s || "").trim())
    .filter((s) => s.length > 4);

  const panels: [string, string, string, string] = [
    truncateText(rawPanels[0] || `1. Motivation: ${title}`, 92),
    truncateText(rawPanels[1] || `2. Exploring ${title} together in class.`, 92),
    truncateText(rawPanels[2] || `3. Guided Activity: ${questionPrompt}`, 92),
    truncateText(rawPanels[3] || `4. Values: ${plan.valuesStatement || "Caring and sharing with our classmates."}`, 92),
  ];

  const keywords = strategies.length >= 2
    ? strategies.slice(0, 4).map((s) => truncateText(s.title.replace(/^[a-z0-9]+[.)]\s*/i, ""), 28))
    : [truncateText(title, 26), "Set of Objects A", "Set of Objects B", "Hands-On Discovery"];

  return {
    title: truncateText(title, 48),
    subtitle: truncateText(subtitle, 54),
    questionPrompt: truncateText(questionPrompt, 110),
    panels,
    keywords,
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

  const rBase = 70 + (seedNumber * 37) % 140;
  const gBase = 110 + (seedNumber * 53) % 120;
  const bBase = 150 + (seedNumber * 29) % 100;

  for (let y = 0; y < height; y++) {
    rawRows.push(0); // filter type 0
    for (let x = 0; x < width; x++) {
      const isBorder = x < 2 || x >= width - 2 || y < 2 || y >= height - 2 || x === 24 || y === 16;
      if (isBorder) {
        rawRows.push(30, 58, 138);
      } else {
        rawRows.push(
          (rBase + x * 2) % 255,
          (gBase + y * 3) % 255,
          bBase
        );
      }
    }
  }

  const rawData = new Uint8Array(rawRows);
  // Build uncompressed zlib block
  const len = rawData.length;
  const zlib = new Uint8Array(2 + 5 + len + 4);
  zlib[0] = 0x78;
  zlib[1] = 0x01;
  zlib[2] = 0x01; // final block, uncompressed
  zlib[3] = len & 0xff;
  zlib[4] = (len >>> 8) & 0xff;
  const nlen = ~len & 0xffff;
  zlib[5] = nlen & 0xff;
  zlib[6] = (nlen >>> 8) & 0xff;
  zlib.set(rawData, 7);

  // Adler-32
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

  const ihdr = new Uint8Array([
    0, 0, 0, width,
    0, 0, 0, height,
    8, // bit depth
    2, // color type RGB
    0, 0, 0,
  ]);

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
  const b64 = typeof Buffer !== "undefined" ? Buffer.from(png).toString("base64") : btoa(binary);
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
 * Loads an ImageInput (attached textbook JPEG/PNG) into an HTMLImageElement in the browser.
 */
async function loadTextbookImage(imageInput?: ImageInput): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined" || typeof Image === "undefined" || !imageInput?.base64Data) {
    return null;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    const src = imageInput.base64Data.startsWith("data:")
      ? imageInput.base64Data
      : `data:${imageInput.mimeType || "image/jpeg"};base64,${imageInput.base64Data}`;
    img.src = src;
  });
}

/**
 * Samples accent colors from the attached textbook JPEG so the generated illustration
 * harmonizes with the uploaded textbook scan.
 */
function sampleTextbookPalette(img: HTMLImageElement | null, seed: number): {
  skyTop: string;
  skyBottom: string;
  accentPrimary: string;
  accentSecondary: string;
  groundColor: string;
} {
  const palettes = [
    {
      skyTop: "#DBEAFE",
      skyBottom: "#FEF3C7",
      accentPrimary: "#1D4ED8",
      accentSecondary: "#F59E0B",
      groundColor: "#86EFAC",
    },
    {
      skyTop: "#E0E7FF",
      skyBottom: "#FCE7F3",
      accentPrimary: "#4338CA",
      accentSecondary: "#EC4899",
      groundColor: "#A7F3D0",
    },
    {
      skyTop: "#CCFBF1",
      skyBottom: "#FEF9C3",
      accentPrimary: "#0F766E",
      accentSecondary: "#EA580C",
      groundColor: "#BEF264",
    },
    {
      skyTop: "#FFEDD5",
      skyBottom: "#E0F2FE",
      accentPrimary: "#9A3412",
      accentSecondary: "#0284C7",
      groundColor: "#BBF7D0",
    },
  ];

  const base = palettes[seed % palettes.length];
  if (!img || typeof document === "undefined") return base;

  try {
    const probe = document.createElement("canvas");
    probe.width = 16;
    probe.height = 16;
    const pctx = probe.getContext("2d");
    if (!pctx) return base;
    pctx.drawImage(img, 0, 0, 16, 16);
    const data = pctx.getImageData(4, 4, 8, 8).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Ignore near-white paper pixels
      if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }
    if (count > 4) {
      r = Math.min(200, Math.max(30, Math.round(r / count)));
      g = Math.min(190, Math.max(30, Math.round(g / count)));
      b = Math.min(210, Math.max(40, Math.round(b / count)));
      return {
        ...base,
        accentPrimary: `rgb(${r}, ${g}, ${b})`,
      };
    }
  } catch {
    // Fallback to preset palette
  }
  return base;
}

/**
 * Generates a unique, colorful educational illustration (`data:image/png;base64,...`)
 * based on the LessonPlan and attached textbook JPEG (`ImageInput[]`), matching the
 * visual patterns in Kat's "sample lesson plan" folder.
 */
export async function generateUniqueLessonIllustration(
  plan: LessonPlan,
  textbookImages?: ImageInput[],
  options?: IllustrationGeneratorOptions
): Promise<string> {
  const style = options?.style || getDefaultIllustrationStyle(plan);
  const content = extractIllustrationContent(plan);
  const seed = hashString(
    `${content.title}|${content.subtitle}|${style}|${options?.variationSeed ?? 0}`,
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

  const primaryImg = await loadTextbookImage(textbookImages?.[0]);
  const secondaryImg = await loadTextbookImage(textbookImages?.[1] || textbookImages?.[0]);
  const palette = sampleTextbookPalette(primaryImg, seed);

  if (style === "pag_uugnay_speech") {
    drawPagUugnaySpeechScene(ctx, canvas.width, canvas.height, content, palette, primaryImg, seed);
  } else if (style === "math_concept_sets") {
    drawMathConceptSetsScene(ctx, canvas.width, canvas.height, content, palette, primaryImg, seed);
  } else {
    drawFourPanelComicScene(ctx, canvas.width, canvas.height, content, palette, primaryImg, secondaryImg, seed);
  }

  return canvas.toDataURL("image/png");
}

function drawFourPanelComicScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  palette: ReturnType<typeof sampleTextbookPalette>,
  primaryImg: HTMLImageElement | null,
  secondaryImg: HTMLImageElement | null,
  seed: number
) {
  // Outer card background
  ctx.fillStyle = "#FFFBEB";
  ctx.fillRect(0, 0, w, h);

  // Header Banner
  const headerGrad = ctx.createLinearGradient(0, 0, w, 0);
  headerGrad.addColorStop(0, palette.accentPrimary);
  headerGrad.addColorStop(1, "#1E40AF");
  ctx.fillStyle = headerGrad;
  drawRoundedRect(ctx, 14, 12, w - 28, 52, 12);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`📚 ${content.title}`, 28, 38);
  ctx.font = "bold 12px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#FDE68A";
  ctx.fillText(content.subtitle, 30, 56);

  const panelW = (w - 42) / 2;
  const panelH = (h - 92) / 2;
  const positions = [
    { x: 14, y: 74 },
    { x: 28 + panelW, y: 74 },
    { x: 14, y: 86 + panelH },
    { x: 28 + panelW, y: 86 + panelH },
  ];

  const panelSkies = ["#DBEAFE", "#FEF3C7", "#E0F2FE", "#FCE7F3"];
  const panelGrounds = ["#86EFAC", "#BEF264", "#A7F3D0", "#FDE68A"];

  positions.forEach((pos, idx) => {
    ctx.save();
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 14);
    ctx.clip();

    // Sky
    const skyIdx = (idx + seed) % panelSkies.length;
    ctx.fillStyle = panelSkies[skyIdx];
    ctx.fillRect(pos.x, pos.y, panelW, panelH);

    // Sun & Clouds
    ctx.fillStyle = "#FBBF24";
    ctx.beginPath();
    ctx.arc(pos.x + panelW - 48, pos.y + 36, 18, 0, Math.PI * 2);
    ctx.fill();
    drawCloud(ctx, pos.x + 65 + ((idx * 25) % 60), pos.y + 30, 0.85);
    drawCloud(ctx, pos.x + 210, pos.y + 26, 0.7);

    // Hills / Ground
    ctx.fillStyle = panelGrounds[skyIdx];
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y + panelH - 72);
    ctx.quadraticCurveTo(pos.x + panelW * 0.5, pos.y + panelH - 96, pos.x + panelW, pos.y + panelH - 68);
    ctx.lineTo(pos.x + panelW, pos.y + panelH);
    ctx.lineTo(pos.x, pos.y + panelH);
    ctx.closePath();
    ctx.fill();

    // If textbook JPEG is attached, embed a stylized storybook window / visual crop from different regions of the textbook page
    const sourceImg = idx % 2 === 0 ? primaryImg : secondaryImg;
    if (sourceImg && sourceImg.width > 20 && sourceImg.height > 20) {
      const cropRegions = [
        { sx: 0.06, sy: 0.08, sw: 0.44, sh: 0.38 },
        { sx: 0.45, sy: 0.08, sw: 0.46, sh: 0.38 },
        { sx: 0.08, sy: 0.46, sw: 0.44, sh: 0.40 },
        { sx: 0.44, sy: 0.46, sw: 0.46, sh: 0.40 },
      ];
      const reg = cropRegions[(idx + seed) % cropRegions.length];
      const thumbX = pos.x + panelW - 148;
      const thumbY = pos.y + 16;
      const thumbW = 132;
      const thumbH = 104;

      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, thumbX - 4, thumbY - 4, thumbW + 8, thumbH + 8, 8);
      ctx.fill();
      ctx.strokeStyle = palette.accentPrimary;
      ctx.lineWidth = 2;
      ctx.stroke();

      drawRoundedRect(ctx, thumbX, thumbY, thumbW, thumbH, 6);
      ctx.clip();
      ctx.drawImage(
        sourceImg,
        sourceImg.width * reg.sx,
        sourceImg.height * reg.sy,
        sourceImg.width * reg.sw,
        sourceImg.height * reg.sh,
        thumbX,
        thumbY,
        thumbW,
        thumbH
      );
      ctx.restore();
    }

    // Draw custom illustrated characters & props per panel
    const charColors = ["#2563EB", "#DC2626", "#059669", "#7C3AED"];
    drawCartoonStudent(
      ctx,
      pos.x + 88 + (idx % 2) * 18,
      pos.y + 112,
      charColors[(idx + seed) % charColors.length],
      idx % 2 === 0 ? "wave" : "book"
    );
    drawCartoonStudent(
      ctx,
      pos.x + 178 + (idx % 2) * 12,
      pos.y + 116,
      charColors[(idx + seed + 2) % charColors.length],
      idx % 2 === 1 ? "wave" : "heart"
    );

    // Panel Number Badge
    ctx.fillStyle = palette.accentPrimary;
    ctx.beginPath();
    ctx.arc(pos.x + 24, pos.y + 24, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(idx + 1), pos.x + 24, pos.y + 29);

    // Rounded White Caption Box at bottom (just like K2 Filipino & K2 Science sample lesson plans)
    const capX = pos.x + 10;
    const capY = pos.y + panelH - 60;
    const capW = panelW - 20;
    const capH = 50;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    drawRoundedRect(ctx, capX, capY, capW, capH, 10);
    ctx.fill();
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 12.5px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, content.panels[idx], capX + capW / 2, capY + 20, capW - 18, 16, 2);

    ctx.restore();

    // Panel Border
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, pos.x, pos.y, panelW, panelH, 14);
    ctx.stroke();
  });
}

/**
 * Style 2: Grade 1 Filipino "PAG-UUGNAY" Student Speech Bubble & Expression Scene
 * (Matches G1-Filipino-LP-Week 11.docx image2.jpeg)
 */
function drawPagUugnaySpeechScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  palette: ReturnType<typeof sampleTextbookPalette>,
  primaryImg: HTMLImageElement | null,
  seed: number
) {
  // Warm radial/linear background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#FEF3C7");
  bgGrad.addColorStop(0.65, "#DBEAFE");
  bgGrad.addColorStop(1, "#86EFAC");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Decorative classroom blackboard / textbook showcase on right
  const boardX = w - 350;
  const boardY = 92;
  const boardW = 316;
  const boardH = 250;
  ctx.fillStyle = "#14532D";
  drawRoundedRect(ctx, boardX, boardY, boardW, boardH, 14);
  ctx.fill();
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = 8;
  ctx.stroke();

  if (primaryImg && primaryImg.width > 20) {
    ctx.save();
    drawRoundedRect(ctx, boardX + 14, boardY + 38, boardW - 28, boardH - 52, 8);
    ctx.clip();
    ctx.drawImage(
      primaryImg,
      0,
      0,
      primaryImg.width,
      primaryImg.height * 0.65,
      boardX + 14,
      boardY + 38,
      boardW - 28,
      boardH - 52
    );
    ctx.restore();
    ctx.fillStyle = "#FDE68A";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📖 Sanggunian mula sa Aklat", boardX + boardW / 2, boardY + 26);
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px 'Comic Sans MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, content.title, boardX + boardW / 2, boardY + 70, boardW - 40, 24, 3);
    ctx.fillStyle = "#FDE68A";
    ctx.font = "14px 'Segoe UI', sans-serif";
    drawWrappedText(ctx, content.panels[1], boardX + boardW / 2, boardY + 150, boardW - 40, 20, 3);
  }

  // Top Banner ("PAG-UUGNAY")
  ctx.fillStyle = "#1D4ED8";
  drawRoundedRect(ctx, 28, 20, 310, 52, 26);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PAG-UUGNAY", 183, 55);

  // Large Speech Bubble with the Motivation / Guide Question
  const bubX = 32;
  const bubY = 92;
  const bubW = 490;
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
  ctx.moveTo(bubX + 210, bubY + bubH);
  ctx.lineTo(bubX + 250, bubY + bubH + 38);
  ctx.lineTo(bubX + 275, bubY + bubH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1E3A8A";
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 20px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, content.questionPrompt, bubX + bubW / 2, bubY + 52, bubW - 44, 28, 4);

  // Cheerful Filipino students in LCCP blue/white uniform
  drawCartoonStudent(ctx, 245, 375, "#1D4ED8", "book", 1.35);
  drawCartoonStudent(ctx, 415, 390, "#0284C7", "wave", 1.25);

  // Bottom Callout Pills with Lesson Steps / Values
  const pillColors = ["#EF4444", "#059669", "#7C3AED"];
  [content.panels[0], content.panels[2], content.panels[3]].forEach((txt, i) => {
    const px = 28 + i * 292;
    const py = h - 76;
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, px, py, 276, 56, 12);
    ctx.fill();
    ctx.strokeStyle = pillColors[(i + seed) % pillColors.length];
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 12px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, txt, px + 138, py + 23, 254, 16, 2);
  });

  // Outer Frame
  ctx.strokeStyle = "#1E3A8A";
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 6, 6, w - 12, h - 12, 16);
  ctx.stroke();
}

/**
 * Style 3: Kinder 2 Mathematics Rounded Set Cards
 * (Matches K2 -WEEK 6 - MATHEMATICS.docx image2.png / image3.png)
 */
function drawMathConceptSetsScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ReturnType<typeof extractIllustrationContent>,
  palette: ReturnType<typeof sampleTextbookPalette>,
  primaryImg: HTMLImageElement | null,
  seed: number
) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  // Top Title Bar
  ctx.fillStyle = "#1E3A8A";
  drawRoundedRect(ctx, 18, 14, w - 36, 54, 14);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 21px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`🔢 ${content.title} (${content.subtitle})`, w / 2, 48);

  const cardW = (w - 56) / 2;
  const cardH = 380;
  const leftX = 18;
  const rightX = 38 + cardW;
  const cardY = 82;

  const setConfigs = [
    {
      x: leftX,
      borderColor: "#E11D48",
      bgColor: "#FFF1F2",
      label: content.keywords[0] || "Set A: Group of Objects",
      count: 4 + (seed % 3),
      shape: "car" as const,
      caption: content.panels[0],
    },
    {
      x: rightX,
      borderColor: "#0284C7",
      bgColor: "#F0F9FF",
      label: content.keywords[1] || "Set B: Group of Objects",
      count: 3 + ((seed + 1) % 4),
      shape: "star" as const,
      caption: content.panels[1],
    },
  ];

  setConfigs.forEach((cfg, idx) => {
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

    // Draw countable illustrated objects in a neat grid
    const cols = 3;
    for (let i = 0; i < cfg.count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = cfg.x + 88 + col * 125;
      const oy = cardY + 125 + row * 105;
      drawCountableObject(ctx, ox, oy, cfg.shape, i + seed);
    }

    // Optional textbook reference thumbnail in corner
    if (primaryImg && primaryImg.width > 20) {
      const tx = cfg.x + cardW - 108;
      const ty = cardY + cardH - 128;
      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, tx - 3, ty - 3, 94, 68, 8);
      ctx.fill();
      ctx.strokeStyle = cfg.borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      drawRoundedRect(ctx, tx, ty, 88, 62, 6);
      ctx.clip();
      ctx.drawImage(
        primaryImg,
        idx === 0 ? 0 : primaryImg.width * 0.4,
        primaryImg.height * 0.15,
        primaryImg.width * 0.55,
        primaryImg.height * 0.55,
        tx,
        ty,
        88,
        62
      );
      ctx.restore();
    }

    // Bottom caption inside set card
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, cfg.x + 16, cardY + cardH - 54, cardW - 32, 40, 10);
    ctx.fill();
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 12.5px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    drawWrappedText(ctx, cfg.caption, cfg.x + cardW / 2, cardY + cardH - 30, cardW - 48, 15, 2);
  });

  // Footer Summary Prompt Bar
  ctx.fillStyle = "#FEF3C7";
  drawRoundedRect(ctx, 18, h - 102, w - 36, 84, 16);
  ctx.fill();
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#92400E";
  ctx.font = "bold 16px 'Comic Sans MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, `💡 Guided Question: ${content.questionPrompt}`, w / 2, h - 66, w - 76, 22, 2);
}

function drawCartoonStudent(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  shirtColor: string,
  pose: "wave" | "book" | "heart",
  scale = 1
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

  // LCCP Blue Jumper / Vest Accent
  ctx.fillStyle = shirtColor;
  drawRoundedRect(ctx, -20, 26, 40, 44, 8);
  ctx.fill();

  // Necktie / Collar
  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.lineTo(6, 20);
  ctx.lineTo(0, 38);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = "#FDE68A";
  ctx.beginPath();
  ctx.arc(0, -6, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hair
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.arc(0, -12, 27, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes & Smile
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.arc(-9, -6, 3, 0, Math.PI * 2);
  ctx.arc(9, -6, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -1, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
  ctx.beginPath();
  ctx.arc(-15, 0, 4.5, 0, Math.PI * 2);
  ctx.arc(15, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  if (pose === "book") {
    // Open storybook in hands
    ctx.fillStyle = "#F59E0B";
    drawRoundedRect(ctx, -22, 34, 44, 28, 4);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, 36, 40, 24);
  } else if (pose === "heart") {
    ctx.fillStyle = "#EC4899";
    ctx.beginPath();
    ctx.arc(34, -8, 8, 0, Math.PI * 2);
    ctx.fill();
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
  shape: "car" | "star",
  colorIndex: number
) {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
  const col = colors[colorIndex % colors.length];
  ctx.save();
  ctx.translate(x, y);

  if (shape === "car") {
    // Toy Car Body
    ctx.fillStyle = col;
    drawRoundedRect(ctx, -34, -8, 68, 24, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -8, 20, Math.PI, 0);
    ctx.fill();
    // Window
    ctx.fillStyle = "#E0F2FE";
    ctx.beginPath();
    ctx.arc(2, -8, 13, Math.PI, 0);
    ctx.fill();
    // Wheels
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(-18, 16, 9, 0, Math.PI * 2);
    ctx.arc(18, 16, 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Bold Star / Badge Object
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = ((i * 72 - 90) * Math.PI) / 180;
      const innerAngle = (((i * 72 + 36) - 90) * Math.PI) / 180;
      const ox = Math.cos(outerAngle) * 28;
      const oy = Math.sin(outerAngle) * 28;
      const ix = Math.cos(innerAngle) * 13;
      const iy = Math.sin(innerAngle) * 13;
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
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
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
