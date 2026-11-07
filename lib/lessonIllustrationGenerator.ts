import type { IllustrationStyle, ImageInput, LessonPlan } from "./types";
import { getInternalGeminiKey, getInternalGroqKey } from "./sampleData";

export interface IllustrationGeneratorOptions {
  style?: IllustrationStyle;
  variationSeed?: number;
  forceNewGeneration?: boolean;
  customApiKey?: string;
}

export type DesignLayoutId =
  | "panoramic_grid_2x2"
  | "cinematic_hero_triptych"
  | "editorial_split_showcase"
  | "comic_strip_4_columns"
  | "pag_uugnay_interactive_stage"
  | "arched_gallery_quad";

export type ArtStyleId =
  | "pixar_3d_volumetric"
  | "ghibli_watercolor_gouache"
  | "encyclopedia_architectural_realism"
  | "tropical_filipino_storybook"
  | "vibrant_concept_illustration"
  | "classic_golden_book_painting"
  | "tactile_3d_clay_diorama"
  | "cinematic_widescreen_animation";

export interface DesignBlueprint {
  id: DesignLayoutId;
  name: string;
  layoutInstructions: string;
}

export interface ArtStyleDirection {
  id: ArtStyleId;
  name: string;
  palette: {
    canvasBg: string;
    primaryAccent: string;
    secondaryAccent: string;
    panelBorder: string;
    captionBgTop: string;
    captionBgBottom: string;
    captionText: string;
  };
  stylePrompt: string;
}

const DESIGN_BLUEPRINTS: DesignBlueprint[] = [
  {
    id: "panoramic_grid_2x2",
    name: "Panoramic 2x2 Storybook Grid",
    layoutInstructions: `Use a 2x2 grid of 4 rounded panoramic panels on the 960x540 canvas:
- Panel 1 (top-left): x="18" y="18" width="452" height="242" rx="16"
- Panel 2 (top-right): x="490" y="18" width="452" height="242" rx="16"
- Panel 3 (bottom-left): x="18" y="280" width="452" height="242" rx="16"
- Panel 4 (bottom-right): x="490" y="280" width="452" height="242" rx="16"
Inside each panel, reserve the bottom 44px for a clean caption bar displaying that panel's exact caption text, and fill the upper 198px with a rich, realistic 3D-shaded scene.`,
  },
  {
    id: "cinematic_hero_triptych",
    name: "Cinematic Widescreen Hero + 3 Supporting Scenes",
    layoutInstructions: `Use an asymmetric widescreen hero + triptych layout on the 960x540 canvas:
- Panel 1 (Top Cinematic Hero Banner): x="18" y="16" width="924" height="252" rx="18" (wide panoramic scene illustrating Caption 1 and the overall lesson topic, with a bottom 42px caption strip)
- Panel 2 (Bottom-Left Scene): x="18" y="284" width="296" height="240" rx="14" (illustrating Caption 2 with bottom 44px caption strip)
- Panel 3 (Bottom-Center Scene): x="332" y="284" width="296" height="240" rx="14" (illustrating Caption 3 with bottom 44px caption strip)
- Panel 4 (Bottom-Right Scene): x="646" y="284" width="296" height="240" rx="14" (illustrating Caption 4 with bottom 44px caption strip)`,
  },
  {
    id: "editorial_split_showcase",
    name: "Editorial Feature Stage + 3 Discovery Cards",
    layoutInstructions: `Use an editorial magazine split layout on the 960x540 canvas:
- Panel 1 (Left Tall Featured Story Stage): x="18" y="18" width="436" height="504" rx="18" (grand vertical scene illustrating Caption 1 with full-body characters, rich architecture/landscape, and a bottom 54px caption banner)
- Panel 2 (Right-Top Card): x="472" y="18" width="470" height="156" rx="14" (illustrating Caption 2 with bottom 36px caption strip)
- Panel 3 (Right-Middle Card): x="472" y="192" width="470" height="156" rx="14" (illustrating Caption 3 with bottom 36px caption strip)
- Panel 4 (Right-Bottom Card): x="472" y="366" width="470" height="156" rx="14" (illustrating Caption 4 with bottom 36px caption strip)`,
  },
  {
    id: "comic_strip_4_columns",
    name: "4-Column Vertical Storyboard Strip",
    layoutInstructions: `Use 4 tall vertical storyboard columns side-by-side on the 960x540 canvas:
- Panel 1: x="16" y="18" width="220" height="504" rx="16"
- Panel 2: x="252" y="18" width="220" height="504" rx="16"
- Panel 3: x="488" y="18" width="220" height="504" rx="16"
- Panel 4: x="724" y="18" width="220" height="504" rx="16"
Each vertical panel has a numbered badge (1, 2, 3, 4) in its top-left corner, a rich multi-layered realistic vertical scene with full-body characters and environment from y=18 to y=456, and a clean caption card in the bottom 66px.`,
  },
  {
    id: "pag_uugnay_interactive_stage",
    name: "PAG-UUGNAY Interactive Question Stage + Dual Scene Windows",
    layoutInstructions: `Use a split interactive textbook layout on the 960x540 canvas:
- Left Presenter Stage (x="18" y="18" width="376" height="504" rx="18"): Top banner with title, a large rounded white speech bubble containing the Guide Question, and a realistic full-body Filipino student in school uniform (collared shirt, tie, pleated skirt/trousers, socks, shoes) below the speech bubble.
- Right-Top Scene Window (x="412" y="18" width="530" height="244" rx="16"): Detailed realistic scene illustrating Captions 1 & 2 with a bottom caption bar.
- Right-Bottom Scene Window (x="412" y="278" width="530" height="244" rx="16"): Detailed realistic scene illustrating Captions 3 & 4 with a bottom caption bar.`,
  },
  {
    id: "arched_gallery_quad",
    name: "Architectural Gallery Frames with Ribbon Banners",
    layoutInstructions: `Use 4 architectural gallery frames on the 960x540 canvas:
- Frame 1 (top-left): x="20" y="16" width="448" height="244" rx="22"
- Frame 2 (top-right): x="492" y="16" width="448" height="244" rx="22"
- Frame 3 (bottom-left): x="20" y="280" width="448" height="244" rx="22"
- Frame 4 (bottom-right): x="492" y="280" width="448" height="244" rx="22"
Each frame has a warm double border, a 3D perspective room or outdoor landscape filled with topic-accurate objects and full-body characters, and a floating pill-shaped caption banner at the bottom.`,
  },
];

const ART_STYLE_DIRECTIONS: ArtStyleDirection[] = [
  {
    id: "pixar_3d_volumetric",
    name: "Pixar-Inspired 3D Volumetric Storybook",
    palette: {
      canvasBg: "#F8F4EC",
      primaryAccent: "#D97706",
      secondaryAccent: "#0284C7",
      panelBorder: "#334155",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#FEF3C7",
      captionText: "#0F172A",
    },
    stylePrompt:
      "Warm Pixar-inspired 3D volumetric digital painting using rich <linearGradient> and <radialGradient> shading, soft drop shadows, sunlit window/sky beams, sculpted 3D depth on furniture/props, and expressive full-body characters.",
  },
  {
    id: "ghibli_watercolor_gouache",
    name: "Studio Ghibli Lush Watercolor & Gouache",
    palette: {
      canvasBg: "#F0F7F4",
      primaryAccent: "#15803D",
      secondaryAccent: "#0369A1",
      panelBorder: "#1E3A2F",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#DCFCE7",
      captionText: "#14532D",
    },
    stylePrompt:
      "Lush Studio Ghibli-inspired gouache and watercolor realism with soft multi-stop sky and wall gradients, rich botanical foliage, warm honey-oak wood grain tones, cozy interior/exterior lighting, and natural full-body characters.",
  },
  {
    id: "encyclopedia_architectural_realism",
    name: "Modern Children's Encyclopedia 3D Realism",
    palette: {
      canvasBg: "#F1F5F9",
      primaryAccent: "#2563EB",
      secondaryAccent: "#DC2626",
      panelBorder: "#1E293B",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#E2E8F0",
      captionText: "#0F172A",
    },
    stylePrompt:
      "High-detail children's visual encyclopedia realism with accurate 3D room perspective lines, baseboard molding, tiled/wooden floors, detailed educational props, and naturally proportioned full-body teachers and students.",
  },
  {
    id: "tropical_filipino_storybook",
    name: "Sunlit Philippine Storybook Realism",
    palette: {
      canvasBg: "#FFFBEB",
      primaryAccent: "#B45309",
      secondaryAccent: "#0D9488",
      panelBorder: "#451A03",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#FDE68A",
      captionText: "#271202",
    },
    stylePrompt:
      "Authentic sunlit Philippine children's book realism featuring warm tropical daylight, narra and mahogany woodwork, capiz-style window panes, lush garden greenery, and full-body Filipino children and teachers.",
  },
  {
    id: "vibrant_concept_illustration",
    name: "Vibrant Contemporary Digital Concept Art",
    palette: {
      canvasBg: "#F5F3FF",
      primaryAccent: "#7C3AED",
      secondaryAccent: "#EA580C",
      panelBorder: "#2E1065",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#EDE9FE",
      captionText: "#1E1B4B",
    },
    stylePrompt:
      "Vibrant modern digital concept illustration with dramatic rim lighting, foreground/midground/background depth planes, rich jewel-toned gradients, and lively full-body characters.",
  },
  {
    id: "classic_golden_book_painting",
    name: "Classic Golden Book Warm Painting",
    palette: {
      canvasBg: "#FDF8F0",
      primaryAccent: "#9A3412",
      secondaryAccent: "#1D4ED8",
      panelBorder: "#431407",
      captionBgTop: "#FFFDF9",
      captionBgBottom: "#FFEDD5",
      captionText: "#2C1810",
    },
    stylePrompt:
      "Classic Golden Book storybook painting with warm amber, sienna, sage, and cobalt gradients, detailed furniture and nature textures, and expressive full-body characters.",
  },
  {
    id: "tactile_3d_clay_diorama",
    name: "Tactile 3D Sculpted Clay & Paper Diorama",
    palette: {
      canvasBg: "#ECFEFF",
      primaryAccent: "#0891B2",
      secondaryAccent: "#E11D48",
      panelBorder: "#164E63",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#CFFAFE",
      captionText: "#083344",
    },
    stylePrompt:
      "Tactile 3D sculpted diorama aesthetic using soft radial specular highlights, layered drop shadows, rounded 3D architectural and environmental props, and full-body articulated figures.",
  },
  {
    id: "cinematic_widescreen_animation",
    name: "Cinematic Feature Animation Frame",
    palette: {
      canvasBg: "#FAF5FF",
      primaryAccent: "#4F46E5",
      secondaryAccent: "#059669",
      panelBorder: "#1E1B4B",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#E0E7FF",
      captionText: "#1E1B4B",
    },
    stylePrompt:
      "Cinematic feature animation frame with three-point lighting gradients, atmospheric depth, detailed environmental storytelling props, and expressive full-body characters in motion.",
  },
];

let globalGenerationCounter = 0;

/**
 * Selects a NEW Layout Design Blueprint and a NEW Artistic Visual Style on every call
 * so that no two consecutive lesson plans ever share the same design or visual style.
 */
export function pickNextDesignAndStyle(options?: IllustrationGeneratorOptions): {
  design: DesignBlueprint;
  artStyle: ArtStyleDirection;
  generationNonce: number;
} {
  globalGenerationCounter += 1;
  const seedOffset = options?.variationSeed ?? 0;
  const nonce = globalGenerationCounter + seedOffset;

  let designIndex = (nonce - 1) % DESIGN_BLUEPRINTS.length;
  if (options?.style === "pag_uugnay_speech" && seedOffset === 0 && globalGenerationCounter === 1) {
    designIndex = DESIGN_BLUEPRINTS.findIndex((d) => d.id === "pag_uugnay_interactive_stage");
  }

  const styleIndex = (nonce * 3 + seedOffset) % ART_STYLE_DIRECTIONS.length;

  return {
    design: DESIGN_BLUEPRINTS[Math.abs(designIndex) % DESIGN_BLUEPRINTS.length],
    artStyle: ART_STYLE_DIRECTIONS[Math.abs(styleIndex) % ART_STYLE_DIRECTIONS.length],
    generationNonce: Date.now() + nonce * 1000 + Math.floor(Math.random() * 999),
  };
}

export function inferIllustrationStyle(plan: {
  templateType?: string;
  subject?: string;
  gradeSection?: string;
  gradeLevel?: string;
  subjectMatter?: { paksa?: string; lesson?: string };
  illustrationStyle?: IllustrationStyle;
}): IllustrationStyle {
  if (plan.illustrationStyle) return plan.illustrationStyle;
  if (plan.templateType === "matatag") {
    return "pag_uugnay_speech";
  }
  const subj = (plan.subject || "").trim().toLowerCase();
  if (subj.includes("math")) return "math_concept_sets";
  return "comic_story";
}

/**
 * Determines the default illustration style metadata tag for a given LessonPlan.
 */
export function getDefaultIllustrationStyle(plan: LessonPlan): IllustrationStyle {
  return inferIllustrationStyle(plan);
}

/**
 * Extracts the lesson title, subject, guide question, and 4 specific scene captions
 * directly from the generated LessonPlan so the illustration always connects to the exact topic.
 */
export function extractIllustrationContent(plan: LessonPlan): {
  title: string;
  subtitle: string;
  subject: string;
  questionPrompt: string;
  panels: [string, string, string, string];
  gradeTier: "kinder2" | "grade1";
} {
  const gradeStr =
    plan.templateType === "matatag"
      ? (plan.gradeSection || "").toLowerCase()
      : (plan.gradeLevel || "").toLowerCase();
  const gradeTier: "kinder2" | "grade1" = gradeStr.includes("kinder") ? "kinder2" : "grade1";

  if (plan.templateType === "matatag") {
    const title = (plan.subjectMatter.paksa || "Banghay-Aralin sa Filipino")
      .replace(/^Paksa:\s*/i, "")
      .trim();
    const subtitle = (plan.subjectMatter.wika || plan.gradeSection || "Filipino")
      .replace(/^Wika:\s*/i, "")
      .trim();
    const questionPrompt =
      plan.procedures?.discussion?.guideQuestions?.[0] ||
      plan.procedures?.motivation ||
      "Anong mahalagang aral ang natutuhan mo sa ating kuwento ngayong araw?";

    const customPanels = (plan.illustrationPanels || []).filter((p) => p && p.trim().length > 0);
    const rawCandidates = [
      ...customPanels,
      ...(plan.procedures?.discussion?.guideQuestions || []),
      ...(plan.procedures?.discussion?.steps || []),
      ...(plan.objectives || []),
    ]
      .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((s) => s.length > 6);

    const panels: [string, string, string, string] = [
      rawCandidates[0] || `Unang Tagpo: ${title}`,
      rawCandidates[1] || `Ikalawang Tagpo: ${subtitle}`,
      rawCandidates[2] || plan.procedures?.valuesIntegration || "Pagpapakita ng mabuting asal",
      rawCandidates[3] || plan.procedures?.summary?.split("\n")[0] || "Pagsasabuhay ng natutuhang aral",
    ];

    return {
      title,
      subtitle,
      subject: "Filipino",
      questionPrompt: truncateText(questionPrompt, 120),
      panels: [
        truncateText(panels[0], 78),
        truncateText(panels[1], 78),
        truncateText(panels[2], 78),
        truncateText(panels[3], 78),
      ],
      gradeTier,
    };
  }

  const title = (
    plan.subjectMatter?.lesson ||
    plan.adidse?.lessonTitle ||
    `${plan.subject} Lesson`
  ).trim();
  const subtitle = `${plan.subject} • ${plan.gradeLevel}`;
  const customPanels = (plan.illustrationPanels || []).filter((p) => p && p.trim().length > 0);

  const strategyLines: string[] = [];
  const strategyQuestions: string[] = [];
  for (const strat of plan.procedures?.learningStrategies || []) {
    if (strat.instructions) strategyLines.push(strat.instructions);
    if (strat.questions) strategyQuestions.push(...strat.questions);
  }

  const rawLines = [
    ...customPanels,
    ...strategyQuestions,
    ...strategyLines,
    ...(plan.adidse?.meditatio || []),
    ...(plan.objectives || []),
  ]
    .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter(
      (s) =>
        s.length > 8 &&
        !/^(let's|listen to|look at the picture|answer the|teacher will|good morning)/i.test(s)
    );

  const questionPrompt =
    strategyQuestions.find((line) => line.includes("?")) ||
    (plan.adidse?.meditatio || []).find((line) => line.includes("?")) ||
    `What important lesson did we discover about ${title}?`;

  const panels: [string, string, string, string] = [
    rawLines[0] || `${title} — Scene 1`,
    rawLines[1] || `${title} — Scene 2`,
    rawLines[2] || plan.valuesStatement || `${title} — Scene 3`,
    rawLines[3] || (plan.assessment || [])[0] || plan.closure || `${title} — Scene 4`,
  ];

  return {
    title,
    subtitle,
    subject: plan.subject,
    questionPrompt: truncateText(questionPrompt, 120),
    panels: [
      truncateText(panels[0], 78),
      truncateText(panels[1], 78),
      truncateText(panels[2], 78),
      truncateText(panels[3], 78),
    ],
    gradeTier,
  };
}

function truncateText(str: string, maxLen: number): string {
  const clean = str.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).trim() + "…";
}

const GEMINI_ILLUSTRATION_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

const GEMINI_NATIVE_IMAGE_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-lite-image",
];

/**
 * Builds the Gemini AI Art Director & SVG Synthesizer prompt for a specific lesson topic,
 * enforcing a brand-new layout design and brand-new visual style on every generation.
 */
export function buildGeminiIllustrationPrompt(
  content: ReturnType<typeof extractIllustrationContent>,
  design: DesignBlueprint,
  artStyle: ArtStyleDirection,
  generationNonce: number
): string {
  const xmlSafeCaptions = content.panels.map((c) =>
    c
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  );
  const xmlSafeTitle = content.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const xmlSafeQuestion = content.questionPrompt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `You are a master educational textbook illustrator creating a brand-new, original illustration for a ${
    content.gradeTier === "kinder2" ? "Kinder 2" : "Grade 1"
  } ${content.subject} lesson plan.

GENERATION ID: ${generationNonce} (Must be a 100% NEW visual design and NEW artistic style — never reuse preset templates)
LESSON TOPIC: "${xmlSafeTitle}" (${content.subtitle})
GUIDE QUESTION: "${xmlSafeQuestion}"

SCENES TO ILLUSTRATE (Must directly depict the exact subject, objects, setting, and actions in each sentence):
- Scene 1: "${xmlSafeCaptions[0]}"
- Scene 2: "${xmlSafeCaptions[1]}"
- Scene 3: "${xmlSafeCaptions[2]}"
- Scene 4: "${xmlSafeCaptions[3]}"

MANDATORY NEW LAYOUT DESIGN FOR THIS GENERATION:
Layout Name: ${design.name} (${design.id})
${design.layoutInstructions}

MANDATORY NEW ARTISTIC VISUAL STYLE FOR THIS GENERATION:
Style Name: ${artStyle.name}
Style Direction: ${artStyle.stylePrompt}
Color Palette:
- Master Canvas Background: ${artStyle.palette.canvasBg}
- Primary Accent: ${artStyle.palette.primaryAccent}
- Secondary Accent: ${artStyle.palette.secondaryAccent}
- Panel Border: ${artStyle.palette.panelBorder}
- Caption Box Gradient: ${artStyle.palette.captionBgTop} to ${artStyle.palette.captionBgBottom}
- Caption Text Color: ${artStyle.palette.captionText}

STRICT REALISM & COMPLETENESS REQUIREMENTS:
1. CONNECT TO THE EXACT LESSON TOPIC: Every scene must depict all necessary real-world elements for that specific sentence (e.g., if about a room or school place, draw 3D perspective walls, floor planks/tiles, windows, furniture, books, boards, tables, trees, playground equipment; if about nature/animals/plants/science/math/values, draw the exact animals, plants, lamps, objects, and setting in rich detail).
2. FULL-BODY PROPORTIONED HUMAN FIGURES: Whenever children, students, teachers, or family members appear, draw complete, naturally proportioned human figures with shaded head, hair volume, eyes, warm smile, neck, collared shirt/dress, articulated arms & hands interacting with the scene, skirt/trousers, legs, socks, and shoes. NEVER draw armless blobs or stick figures.
3. NO RANDOM LETTERS OR AI SLOP: Do NOT place random floating alphabet letters in the background unless the lesson caption explicitly teaches those letters. Do NOT include watermarks.
4. XML-VALID STANDALONE SVG:
   - Output ONLY a single valid <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">...</svg> element.
   - Use <defs> with <linearGradient>, <radialGradient>, <filter id="dropShadow">, and <clipPath> for each panel so artwork stays crisply inside its rounded panel border.
   - Always escape ampersands as &amp; inside <text> elements.
   - Keep total SVG length between 7,500 and 14,500 characters so the closing </svg> tag is 100% complete.`;
}

/**
 * Sanitizes and repairs raw SVG markup returned by Gemini AI so it is guaranteed
 * to be valid XML that renders cleanly into an HTML5 Canvas and PNG Data URI.
 */
export function sanitizeGeminiSvg(rawText: string): string | null {
  if (!rawText || typeof rawText !== "string") return null;

  const stripped = rawText
    .replace(/```(?:xml|svg|html)?/gi, "")
    .replace(/```/g, "")
    .trim();

  const startIdx = stripped.search(/<svg\b/i);
  if (startIdx === -1) return null;

  let svg = stripped.slice(startIdx);
  const endMatch = svg.match(/<\/svg\s*>/i);
  if (endMatch && typeof endMatch.index === "number") {
    svg = svg.slice(0, endMatch.index + endMatch[0].length);
  } else {
    svg += "</svg>";
  }

  // Ensure root <svg> has required namespaces and dimensions for Canvas rasterization
  svg = svg.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    let updated = attrs;
    if (!/xmlns\s*=/i.test(updated)) {
      updated += ' xmlns="http://www.w3.org/2000/svg"';
    }
    if (!/viewBox\s*=/i.test(updated)) {
      updated += ' viewBox="0 0 960 540"';
    }
    if (!/\bwidth\s*=/i.test(updated)) {
      updated += ' width="960"';
    }
    if (!/\bheight\s*=/i.test(updated)) {
      updated += ' height="540"';
    }
    return `<svg${updated}>`;
  });

  // Remove any external <script> or external <image> tags that would taint HTML5 canvas
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  svg = svg.replace(/<image\b[^>]*\/?>/gi, "");

  // Escape any bare '&' not part of a valid XML entity
  svg = svg.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;");

  return svg;
}

/**
 * Calls Google Gemini AI (using the built-in hidden key or custom key) to generate
 * a brand-new, topic-specific illustration with a NEW design and NEW style.
 */
export async function requestGeminiIllustration(
  plan: LessonPlan,
  sourceImages?: ImageInput[],
  options?: IllustrationGeneratorOptions
): Promise<{
  svg?: string;
  rasterDataUri?: string;
  design: DesignBlueprint;
  artStyle: ArtStyleDirection;
}> {
  const content = extractIllustrationContent(plan);
  const { design, artStyle, generationNonce } = pickNextDesignAndStyle(options);

  const envKey =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
      : undefined;
  const apiKey = (options?.customApiKey || envKey || getInternalGeminiKey()).trim();

  // Prepare multimodal parts (attach textbook JPEG if provided so Gemini connects directly to the book lesson)
  const promptText = buildGeminiIllustrationPrompt(content, design, artStyle, generationNonce);
  const parts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [{ text: promptText }];

  if (sourceImages && sourceImages.length > 0 && sourceImages[0].base64Data) {
    const rawB64 = sourceImages[0].base64Data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
    if (rawB64.length > 100) {
      parts.push({
        text: "Attached below is the textbook page photo for this lesson. Connect the visual scenes, objects, and concepts in your new illustration directly to this lesson (do NOT copy raw page text blocks or random background letters):",
      });
      parts.push({
        inlineData: {
          data: rawB64,
          mimeType: sourceImages[0].mimeType || "image/jpeg",
        },
      });
    }
  }

  // 1. Try Gemini Multimodal SVG / Visual Synthesis across active Gemini models
  for (const modelName of GEMINI_ILLUSTRATION_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(24000),
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const candidateParts = data?.candidates?.[0]?.content?.parts || [];

      for (const part of candidateParts) {
        if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("image/")) {
          return {
            rasterDataUri: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            design,
            artStyle,
          };
        }
      }

      const textOutput = candidateParts.map((p: { text?: string }) => p.text || "").join("");
      const cleanSvg = sanitizeGeminiSvg(textOutput);
      if (cleanSvg && cleanSvg.length > 800) {
        return { svg: cleanSvg, design, artStyle };
      }
    } catch {
      // Try next Gemini model
    }
  }

  // 2. Try Gemini Native Image Generation Models if available
  for (const imgModel of GEMINI_NATIVE_IMAGE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${imgModel}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(20000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Create a realistic, child-friendly educational textbook illustration (${artStyle.name}, ${design.name}) for the ${content.subject} lesson "${content.title}": 1) ${content.panels[0]} 2) ${content.panels[1]} 3) ${content.panels[2]} 4) ${content.panels[3]}. Include all necessary scene elements and full-body characters, no random letters.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
            },
          }),
        }
      );

      if (!res.ok) continue;
      const data = await res.json();
      const candidateParts = data?.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("image/")) {
          return {
            rasterDataUri: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            design,
            artStyle,
          };
        }
      }
    } catch {
      // Continue to failover
    }
  }

  // 3. Secondary AI failover via Groq LLM SVG synthesis if Gemini is unreachable
  try {
    const groqKey = getInternalGroqKey();
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.85,
        max_tokens: 6000,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || "";
      const cleanSvg = sanitizeGeminiSvg(raw);
      if (cleanSvg && cleanSvg.length > 800) {
        return { svg: cleanSvg, design, artStyle };
      }
    }
  } catch {
    // Ignore
  }

  // 4. Dynamic Algorithmic SVG Synthesis (only if completely offline / in airgapped tests)
  const dynamicOfflineSvg = buildOfflineDynamicSvg(content, design, artStyle, generationNonce);
  return { svg: dynamicOfflineSvg, design, artStyle };
}

/**
 * Converts a sanitized SVG string into a high-resolution 960x540 PNG Data URI
 * (`data:image/png;base64,...`) in the browser so it displays in previews and
 * embeds cleanly into Microsoft Word (.docx) files.
 */
async function rasterizeSvgToPngDataUri(svgString: string, width = 960, height = 540): Promise<string> {
  if (typeof document === "undefined" || typeof Image === "undefined") {
    return generateFallbackPngDataUri();
  }

  return new Promise<string>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(generateFallbackPngDataUri());
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    const encodedSvg = encodeURIComponent(svgString)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

    const timeoutId = setTimeout(() => {
      resolve(generateFallbackPngDataUri());
    }, 8000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL("image/png");
        resolve(pngUrl);
      } catch {
        resolve(generateFallbackPngDataUri());
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(generateFallbackPngDataUri());
    };

    img.src = svgDataUrl;
  });
}

/**
 * Normalizes any image data URI to a clean 960x540 PNG Data URI in the browser.
 */
async function normalizeImageToPngDataUri(dataUri: string, width = 960, height = 540): Promise<string> {
  if (typeof document === "undefined" || typeof Image === "undefined") {
    return dataUri.startsWith("data:image/png;base64,") ? dataUri : generateFallbackPngDataUri();
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUri);
          return;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(dataUri);
      }
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
}

/**
 * Main Entry Point:
 * Every time a lesson plan is generated (or "Regenerate Art" is clicked),
 * calls Gemini AI to synthesize a brand-new illustration corresponding to the lesson topic
 * with a NEW layout design and NEW artistic style.
 */
export async function generateUniqueLessonIllustration(
  plan: LessonPlan,
  sourceImages?: ImageInput[],
  options?: IllustrationGeneratorOptions
): Promise<string> {
  const result = await requestGeminiIllustration(plan, sourceImages, options);

  if (result.rasterDataUri) {
    return await normalizeImageToPngDataUri(result.rasterDataUri, 960, 540);
  }

  if (result.svg) {
    return await rasterizeSvgToPngDataUri(result.svg, 960, 540);
  }

  return generateFallbackPngDataUri();
}

/**
 * Generates a dynamic, parameterized SVG when running completely offline or in airgapped tests,
 * still respecting the unique `DesignBlueprint`, `ArtStyleDirection`, and `generationNonce`.
 */
function buildOfflineDynamicSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  design: DesignBlueprint,
  artStyle: ArtStyleDirection,
  nonce: number
): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const p = artStyle.palette;
  const hueShift = nonce % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="bg_${nonce}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.canvasBg}"/>
      <stop offset="100%" stop-color="${p.captionBgBottom}"/>
    </linearGradient>
    <linearGradient id="sky_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${(hueShift + 200) % 360}, 78%, 84%)"/>
      <stop offset="100%" stop-color="hsl(${(hueShift + 45) % 360}, 88%, 94%)"/>
    </linearGradient>
    <linearGradient id="ground_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${(hueShift + 110) % 360}, 45%, 62%)"/>
      <stop offset="100%" stop-color="hsl(${(hueShift + 30) % 360}, 52%, 44%)"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="url(#bg_${nonce})"/>
  ${[0, 1, 2, 3]
    .map((idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 18 + col * 472;
      const y = 18 + row * 262;
      return `<g transform="translate(${x}, ${y})">
        <rect width="452" height="242" rx="16" fill="url(#sky_${nonce})" stroke="${p.panelBorder}" stroke-width="3"/>
        <rect y="148" width="452" height="50" fill="url(#ground_${nonce})"/>
        <circle cx="${90 + idx * 35}" cy="52" r="22" fill="${p.primaryAccent}" opacity="0.85"/>
        <g transform="translate(210, 95)">
          <circle cx="0" cy="-22" r="14" fill="#F5C693" stroke="#2C1810" stroke-width="2"/>
          <rect x="-14" y="-8" width="28" height="32" rx="6" fill="${
            idx % 2 === 0 ? p.primaryAccent : p.secondaryAccent
          }" stroke="#2C1810" stroke-width="2"/>
          <line x1="-14" y1="-2" x2="-26" y2="14" stroke="#F5C693" stroke-width="6" stroke-linecap="round"/>
          <line x1="14" y1="-2" x2="26" y2="-14" stroke="#F5C693" stroke-width="6" stroke-linecap="round"/>
          <rect x="-11" y="24" width="9" height="24" fill="#1E293B"/>
          <rect x="2" y="24" width="9" height="24" fill="#1E293B"/>
        </g>
        <rect y="196" width="452" height="46" rx="8" fill="${p.captionBgTop}" stroke="${p.panelBorder}" stroke-width="1.5"/>
        <text x="226" y="224" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="${p.captionText}" text-anchor="middle">${esc(
        content.panels[idx]
      )}</text>
      </g>`;
    })
    .join("\n")}
</svg>`;
}

/**
 * Generates a valid, non-empty PNG data URI for Node.js / SSR environments where DOM canvas is unavailable.
 */
export function generateFallbackPngDataUri(_seedText?: string | number): string {
  const width = 400;
  const height = 220;
  const rawData: number[] = [];

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter type 0
    for (let x = 0; x < width; x++) {
      const isBorder = x < 6 || x >= width - 6 || y < 6 || y >= height - 6;
      const isHeader = y < 44;
      if (isBorder) {
        rawData.push(58, 107, 76, 255);
      } else if (isHeader) {
        rawData.push(217, 119, 6, 255);
      } else {
        const grad = Math.floor((y / height) * 18);
        rawData.push(254 - grad, 251 - grad, 243 - grad, 255);
      }
    }
  }

  return encodeRgbaToUncompressedPngDataUri(width, height, new Uint8Array(rawData));
}

function encodeRgbaToUncompressedPngDataUri(
  width: number,
  height: number,
  filteredRows: Uint8Array
): string {
  const blocks: number[] = [0x78, 0x01];
  const maxBlock = 65535;
  let offset = 0;
  while (offset < filteredRows.length) {
    const len = Math.min(maxBlock, filteredRows.length - offset);
    const isLast = offset + len >= filteredRows.length ? 1 : 0;
    blocks.push(isLast);
    blocks.push(len & 0xff, (len >> 8) & 0xff);
    const nlen = ~len & 0xffff;
    blocks.push(nlen & 0xff, (nlen >> 8) & 0xff);
    for (let i = 0; i < len; i++) {
      blocks.push(filteredRows[offset + i]);
    }
    offset += len;
  }

  let s1 = 1;
  let s2 = 0;
  for (let i = 0; i < filteredRows.length; i++) {
    s1 = (s1 + filteredRows[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  const adler = ((s2 << 16) | s1) >>> 0;
  blocks.push(
    (adler >>> 24) & 0xff,
    (adler >>> 16) & 0xff,
    (adler >>> 8) & 0xff,
    adler & 0xff
  );

  const idatData = new Uint8Array(blocks);

  const ihdr = new Uint8Array(13);
  writeUint32BE(ihdr, 0, width);
  writeUint32BE(ihdr, 4, height);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makePngChunk("IHDR", ihdr);
  const idatChunk = makePngChunk("IDAT", idatData);
  const iendChunk = makePngChunk("IEND", new Uint8Array(0));

  const total =
    sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const png = new Uint8Array(total);
  let pos = 0;
  for (const arr of [sig, ihdrChunk, idatChunk, iendChunk]) {
    png.set(arr, pos);
    pos += arr.length;
  }

  let binary = "";
  for (let i = 0; i < png.length; i++) {
    binary += String.fromCharCode(png[i]);
  }
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(png).toString("base64")
      : btoa(binary);
  return `data:image/png;base64,${b64}`;
}

function writeUint32BE(buf: Uint8Array, pos: number, val: number) {
  buf[pos] = (val >>> 24) & 0xff;
  buf[pos + 1] = (val >>> 16) & 0xff;
  buf[pos + 2] = (val >>> 8) & 0xff;
  buf[pos + 3] = val & 0xff;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  writeUint32BE(chunk, 0, data.length);
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + data.length));
  writeUint32BE(chunk, 8 + data.length, crc);
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
