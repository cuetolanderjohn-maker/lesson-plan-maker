import type { IllustrationStyle, ImageInput, LessonPlan } from "./types";
import { getInternalGeminiKey, getInternalGroqKey } from "./sampleData";
import { getDomainRealArtFallback } from "./authenticArtAssets";

export interface IllustrationGeneratorOptions {
  style?: IllustrationStyle;
  variationSeed?: number;
  forceNewGeneration?: boolean;
  customApiKey?: string;
}

export type DesignLayoutId =
  | "kat_storybook_comic_grid"
  | "kat_concept_question_cards"
  | "kat_community_catalog_cards"
  | "kat_split_home_story_stage"
  | "kat_cutaway_dollhouse_diagram"
  | "kat_action_safety_sequence";

export type ArtStyleId =
  | "kat_filipino_storybook_anime"
  | "kat_warm_vibrant_classroom"
  | "kat_cute_fable_anthropomorphic"
  | "kat_dollhouse_cutaway_realism"
  | "kat_concrete_montessori_sets"
  | "kat_ghibli_pastoral_watercolor";

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
    id: "kat_storybook_comic_grid",
    name: "Kat's 4-Panel Storybook Narrative Comic (Ang Araw ni Liza & Ant and Grasshopper Style)",
    layoutInstructions: `Structure as a 4-panel chronological story comic on the 960x540 canvas (modeled on Kat's Grade 1 Filipino & RVE PPT story presentations):
- Top Story Banner: x="18" y="10" width="924" height="46" rx="14" with a warm sunny pill container, bold centered story title.
- 4 Chronological Story Panels (2 rows x 2 columns):
  * Panel 1: x="18" y="64" width="452" height="216" rx="16" with character introduction and bottom white caption card.
  * Panel 2: x="490" y="64" width="452" height="216" rx="16" with character journey and bottom white caption card.
  * Panel 3: x="18" y="288" width="452" height="216" rx="16" with dramatic action and bottom white caption card.
  * Panel 4: x="490" y="288" width="452" height="216" rx="16" with resolution/moral and bottom white caption card.
- Bottom Moral/Takeaway Strip: x="18" y="510" width="924" height="24" rx="8" with encouraging moral text.`,
  },
  {
    id: "kat_concept_question_cards",
    name: "Kat's Concept Question Cards Grid (Ano?, Saan?, Sino?, Kailan? Style)",
    layoutInstructions: `Structure as a concept question board on the 960x540 canvas (modeled on Kat's Filipino PPT question cards):
- Top Header Section (y=10 to y=76) with puffy cloud badge and student mascot.
- 4 Color-Coded Concept Cards (2x2 grid from y=82 to y=528) with rich situational illustrations and guide question strips.`,
  },
  {
    id: "kat_community_catalog_cards",
    name: "Kat's Community Helpers & Topic Catalog (Different Personnel in School Style)",
    layoutInstructions: `Structure as a 4-card catalog on the 960x540 canvas with rich character/tool cards and badge titles.`,
  },
  {
    id: "kat_split_home_story_stage",
    name: "Kat's Split Showcase & Reading Stage (My House & My Family Style)",
    layoutInstructions: `Structure as a split stage with left feature world and right reading card.`,
  },
  {
    id: "kat_cutaway_dollhouse_diagram",
    name: "Kat's Cutaway Architectural Diagram (Things Inside the House Style)",
    layoutInstructions: `Structure as an architectural cutaway diagram with 4 furnished rooms (Living room, bedroom, kitchen, bathroom).`,
  },
  {
    id: "kat_action_safety_sequence",
    name: "Kat's Action & Safety Steps Sequence (Stop, Look, and Listen Style)",
    layoutInstructions: `Structure as an action-step sequence with top situation banner and 4 safety step cards.`,
  },
];

const ART_STYLE_DIRECTIONS: ArtStyleDirection[] = [
  {
    id: "kat_filipino_storybook_anime",
    name: "Kat's Signature Filipino Storybook Anime",
    palette: {
      canvasBg: "#FFFDF7",
      primaryAccent: "#0284C7",
      secondaryAccent: "#FB7185",
      panelBorder: "#0F172A",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#FEF08A",
      captionText: "#0F172A",
    },
    stylePrompt:
      "Warm, expressive Philippine children's book digital art directly modeled on Kat's teaching slides: Filipino schoolchildren with neat uniforms (crisp white collared blouse/polo, blue sailor necktie or vest, blue pleated skirt, black hair with shine, rosy cheeks, joyful smiles), authentic Philippine school and community settings (Philippine flag on flagpole, palengke market stalls, lolo with walking cane, canteen, library), clean solid line art, and vibrant sunlit colors.",
  },
  {
    id: "kat_warm_vibrant_classroom",
    name: "Kat's Sunny Pastel & Primary Classroom Style",
    palette: {
      canvasBg: "#FEF9C3",
      primaryAccent: "#F59E0B",
      secondaryAccent: "#0284C7",
      panelBorder: "#334155",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#E0F2FE",
      captionText: "#0F172A",
    },
    stylePrompt:
      "Bright, cheerful primary classroom visual style directly inspired by Kat's Grade 1 Filipino question cards ('Ano?', 'Saan?', 'Sino?', 'Kailan?'): puffy yellow cloud headers with sunburst rays, pastel color-coded cards with dashed inner frames, clear bold sans-serif text, and cute smiling student mascots.",
  },
  {
    id: "kat_cute_fable_anthropomorphic",
    name: "Kat's Cute Anthropomorphic Storybook Fable",
    palette: {
      canvasBg: "#F0FDF4",
      primaryAccent: "#16A34A",
      secondaryAccent: "#D97706",
      panelBorder: "#1E3A2F",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#DCFCE7",
      captionText: "#14532D",
    },
    stylePrompt:
      "Rich, whimsical anthropomorphic fable illustration inspired by Kat's 'The Ant and the Grasshopper' slide: expressive animal story characters with big emotive eyes, tiny props (musical instruments, leaf umbrellas, harvest baskets, jam jars), cozy underground tree pantries, vibrant weather, and clear narrative storytelling.",
  },
  {
    id: "kat_dollhouse_cutaway_realism",
    name: "Kat's Detailed Architectural Cutaway & Interior Realism",
    palette: {
      canvasBg: "#FDF8F6",
      primaryAccent: "#EA580C",
      secondaryAccent: "#0D9488",
      panelBorder: "#431407",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#FFEDD5",
      captionText: "#29150B",
    },
    stylePrompt:
      "Detailed architectural cutaway and interior realism directly inspired by Kat's 'Things Inside the House' presentation: clear 3D perspective cross-section of home or school rooms (bathroom, bedroom, kitchen, living room, classroom), fully furnished with labeled household appliances, furniture, chalkboards, wall art, and friendly children pointing to the rooms.",
  },
  {
    id: "kat_concrete_montessori_sets",
    name: "Kat's High-Clarity Concrete Object Sets",
    palette: {
      canvasBg: "#F8FAFC",
      primaryAccent: "#2563EB",
      secondaryAccent: "#DC2626",
      panelBorder: "#1E293B",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#E2E8F0",
      captionText: "#0F172A",
    },
    stylePrompt:
      "High-clarity concrete visual sets inspired by Kat's K2 Mathematics slides: realistic, beautifully shaded 3D objects arranged in clear count groups (stacked colorful plates, bowls, glassware, sharpened colored pencils, school backpacks, balls, fresh fruits), crisp outlines, high visual contrast, and clean counting frames.",
  },
  {
    id: "kat_ghibli_pastoral_watercolor",
    name: "Kat's Pastoral Nature & Scenic Watercolor",
    palette: {
      canvasBg: "#F0FDF4",
      primaryAccent: "#059669",
      secondaryAccent: "#0284C7",
      panelBorder: "#064E3B",
      captionBgTop: "#FFFFFF",
      captionBgBottom: "#CFFAFE",
      captionText: "#064E3B",
    },
    stylePrompt:
      "Gentle pastoral nature watercolor and gouache inspired by Kat's Science slides (fruit trees, pine forests, garden flowers, blue skies, sunny mornings): lush foliage gradients, soft organic textures, sunny atmospheric lighting, and peaceful outdoor learning scenes.",
  },
];

let globalGenerationCounter = 0;

export function pickNextDesignAndStyle(options?: IllustrationGeneratorOptions): {
  design: DesignBlueprint;
  artStyle: ArtStyleDirection;
  generationNonce: number;
} {
  globalGenerationCounter += 1;
  const seedOffset = options?.variationSeed ?? 0;
  const nonce = globalGenerationCounter + seedOffset;

  const designIndex = (nonce - 1) % DESIGN_BLUEPRINTS.length;
  const styleIndex = (nonce * 5 + seedOffset) % ART_STYLE_DIRECTIONS.length;

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

export function getDefaultIllustrationStyle(plan: LessonPlan): IllustrationStyle {
  return inferIllustrationStyle(plan);
}

export function extractIllustrationContent(plan: LessonPlan): {
  title: string;
  subtitle: string;
  subject: string;
  questionPrompt: string;
  panels: [string, string, string, string];
  gradeTier: "kinder2" | "grade1";
  hasStory: boolean;
  storyTitle: string;
  storySummary: string;
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
      "Anong mahalagang aral ang natutuhan mo sa ating aralin ngayong araw?";

    const customPanels = (plan.illustrationPanels || []).filter((p) => p && p.trim().length > 0);

    const matatagSignals = [
      title,
      plan.procedures?.motivation || "",
      ...(plan.procedures?.discussion?.steps || []),
      ...(plan.procedures?.discussion?.guideQuestions || []),
    ].join(" ");

    let hasStory = /\b(kuwento|kwento|story|fable|pabula|parabula|alamat|tauhan|lider|gamu-gamo|siso|leon|daga|pagong|matsing)\b/i.test(
      matatagSignals
    );
    let storyTitle = title;

    const stepWithStory = (plan.procedures?.discussion?.steps || []).find((s) =>
      /kuwentong\s+babasahin|kwento|story/i.test(s)
    );
    if (stepWithStory) {
      hasStory = true;
      const match = stepWithStory.match(/“([^”"]+)”|"([^"]+)"|‘([^’']+)’/);
      if (match) {
        storyTitle = match[1] || match[2] || match[3] || title;
      }
    }

    const rawCandidates = [
      ...customPanels,
      ...(plan.procedures?.discussion?.guideQuestions || []),
      ...(plan.procedures?.discussion?.steps || []),
      ...(plan.objectives || []),
    ]
      .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((s) => s.length > 6);

    const panels: [string, string, string, string] = [
      rawCandidates[0] || (hasStory ? `Simula ng kuwento: ${storyTitle}` : `Unang Tagpo: ${title}`),
      rawCandidates[1] || (hasStory ? `Pangyayari sa kuwento: ${subtitle}` : `Ikalawang Tagpo: ${subtitle}`),
      rawCandidates[2] || plan.procedures?.valuesIntegration || "Pagpapakita ng mabuting asal",
      rawCandidates[3] || plan.procedures?.summary?.split("\n")[0] || "Pagsasabuhay ng aral ng aralin",
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
      hasStory,
      storyTitle,
      storySummary: (plan.procedures?.discussion?.guideQuestions || []).slice(0, 3).join("; "),
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

  const lccpSignals = [
    title,
    plan.procedures?.motivation || "",
    ...strategyLines,
    ...strategyQuestions,
  ].join(" ");

  const hasStory = /\b(story|fable|tale|parable|rhyme|poem|character|plot|myth)\b/i.test(lccpSignals);
  const storyTitle = title;

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
    rawLines[0] || (hasStory ? `${storyTitle} — Beginning` : `${title} — Scene 1`),
    rawLines[1] || (hasStory ? `${storyTitle} — Event` : `${title} — Scene 2`),
    rawLines[2] || plan.valuesStatement || (hasStory ? `${storyTitle} — Climax` : `${title} — Scene 3`),
    rawLines[3] || (plan.assessment || [])[0] || plan.closure || (hasStory ? `${storyTitle} — Moral` : `${title} — Scene 4`),
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
    hasStory,
    storyTitle,
    storySummary: strategyQuestions.slice(0, 3).join("; "),
  };
}

function truncateText(str: string, maxLen: number): string {
  const clean = str.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).trim() + "…";
}

export function buildGeminiIllustrationPrompt(
  content: ReturnType<typeof extractIllustrationContent>,
  design: DesignBlueprint,
  artStyle: ArtStyleDirection,
  generationNonce: number
): string {
  const xmlSafeTitle = content.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `Educational illustration for ${content.gradeTier === "kinder2" ? "Kinder 2" : "Grade 1"} ${content.subject} on "${xmlSafeTitle}".
Layout: ${design.name} (${design.id}).
Art Style: ${artStyle.name}. ${artStyle.stylePrompt}.
Nonce: ${generationNonce}.`;
}

export function sanitizeGeminiSvg(rawText: string): string | null {
  if (!rawText || typeof rawText !== "string") return null;
  const stripped = rawText.replace(/```(?:xml|svg|html)?/gi, "").replace(/```/g, "").trim();
  const startIdx = stripped.search(/<svg\b/i);
  if (startIdx === -1) return null;
  let svg = stripped.slice(startIdx);
  const endMatch = svg.match(/<\/svg\s*>/i);
  if (endMatch && typeof endMatch.index === "number") {
    svg = svg.slice(0, endMatch.index + endMatch[0].length);
  } else {
    svg += "</svg>";
  }
  svg = svg.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    let updated = attrs;
    if (!/xmlns\s*=/i.test(updated)) updated += ' xmlns="http://www.w3.org/2000/svg"';
    if (!/viewBox\s*=/i.test(updated)) updated += ' viewBox="0 0 960 540"';
    if (!/\bwidth\s*=/i.test(updated)) updated += ' width="960"';
    if (!/\bheight\s*=/i.test(updated)) updated += ' height="540"';
    return `<svg${updated}>`;
  });
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  svg = svg.replace(/<image\b[^>]*\/?>/gi, "");
  svg = svg.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;");
  return svg;
}

const GEMINI_ILLUSTRATION_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-pro-latest",
];

/**
 * Educational Presentation Card Framer
 * Embeds a real AI-generated illustration into Kat's signature presentation slide:
 * - 960x540 canvas
 * - Top yellow pill banner with the lesson topic
 * - Main 924x430 card with 2.5px solid border, clipping bottom 26px to remove any logo/watermark
 * - Bottom yellow caption strip with grade level, subject, and learning point
 * STRICTLY ZERO STICK FIGURES, ZERO CONE BODIES, ZERO CLIPART.
 */
export function buildFramedEducationalSvg(
  imageDataUri: string,
  content: ReturnType<typeof extractIllustrationContent>
): string {
  const esc = (s: string) =>
    (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const titleText = esc(content.title || "Lesson Presentation");
  const captionText = esc(`${content.subtitle} • ${content.panels[0] || "Key Learning Scene"}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <clipPath id="cardClip">
      <rect x="18" y="60" width="924" height="430" rx="18"/>
    </clipPath>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="960" height="540" fill="#FFFDF7"/>

  <!-- Main Realistic AI Image Card with Watermark Crop -->
  <g filter="url(#cardShadow)">
    <rect x="18" y="60" width="924" height="430" rx="18" fill="#E2E8F0"/>
    <g clip-path="url(#cardClip)">
      <image href="${imageDataUri}" x="18" y="60" width="924" height="458" preserveAspectRatio="xMidYMin slice"/>
    </g>
    <rect x="18" y="60" width="924" height="430" rx="18" fill="none" stroke="#0F172A" stroke-width="2.5"/>
  </g>

  <!-- Top Yellow Title Banner (Kat's Presentation Header) -->
  <g filter="url(#cardShadow)">
    <rect x="180" y="10" width="600" height="42" rx="21" fill="#FEF08A" stroke="#F59E0B" stroke-width="2.5"/>
    <text x="480" y="37" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">
      ${titleText}
    </text>
  </g>

  <!-- Bottom Yellow Caption Strip -->
  <g>
    <rect x="18" y="498" width="924" height="34" rx="10" fill="#FEF9C3" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="480" y="520" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">
      ${captionText}
    </text>
  </g>
</svg>`;
}

/**
 * Gemini Prompt Synthesis Engine:
 * Analyzes the generated lesson plan, grade tier, story narrative, and pedagogical concepts
 * to craft a targeted, descriptive neural art prompt for a real, painted/photographic children's book illustration.
 */
export async function requestGeminiCraftedArtPrompt(
  content: ReturnType<typeof extractIllustrationContent>,
  artStyle: ArtStyleDirection,
  apiKey: string
): Promise<string> {
  const storyInfo = content.hasStory
    ? `Story Title: "${content.storyTitle}". Story arc: ${content.panels.join("; ")}.`
    : `Topic: "${content.title}" (${content.subtitle}). Key elements: ${content.panels.join("; ")}.`;

  const instruction = `You are an art director for elementary school educational presentation slides (Kinder 2 & Grade 1).
Craft ONE single concise, highly descriptive prompt (under 220 characters) for a realistic, warm children's book / fine art illustration.
STRICT CONSTRAINTS:
- ZERO clipart, ZERO cartoons, ZERO stick figures, ZERO cone bodies.
- ZERO floating text, ZERO letters, ZERO logos, ZERO split panels.
FOCUS ON:
- Realistic characters (Filipino schoolchildren or story characters), natural facial expressions.
- Authentic environment (classroom, village, nature, home), warm golden sunlight, rich painted textures.
Output ONLY the raw prompt text, no quotes or explanations.`;

  const models = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
  ];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${instruction}\n\nContext:\n${storyInfo}` }] }],
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
          }),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (rawText && rawText.length > 20) {
        return rawText.replace(/[\r\n]+/g, " ").replace(/^["']|["']$/g, "").trim().slice(0, 240);
      }
    } catch {
      // try next
    }
  }

  // Deterministic fallback prompt directly connected to the lesson plan topic and specific scenes
  const sceneSnippet = content.panels[0] ? `, featuring ${content.panels[0]}` : "";
  if (content.hasStory) {
    return `Charming realistic storybook painting of "${content.storyTitle}"${sceneSnippet}, warm natural sunlight, rich painted details, beautiful colors, no text, no clipart`.slice(0, 240);
  }
  return `Charming realistic educational illustration of ${content.title}${sceneSnippet}, warm natural sunlight, authentic details, beautiful colors, no text, no clipart`.slice(0, 240);
}

/**
 * Fetches a real AI-generated image via neural diffusion.
 * Returns base64 data URI or null if rate-limited or offline.
 */
export async function fetchNeuralArtImage(
  prompt: string,
  seed: number
): Promise<string | null> {
  const cleanPrompt = encodeURIComponent(prompt.trim());
  const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=960&height=540&nologo=true&seed=${seed}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(16000) });
    if (!res.ok) return null;

    if (typeof window !== "undefined" && typeof FileReader !== "undefined") {
      const blob = await res.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(blob);
      });
    }

    if (typeof Buffer !== "undefined") {
      const arrayBuffer = await res.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function requestGeminiIllustration(
  plan: LessonPlan,
  _sourceImages?: ImageInput[],
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

  // 1. Primary Engine: Gemini AI Synthesizes a Bespoke, Topic-Grounded Prompt
  let artPrompt = "";
  try {
    artPrompt = await requestGeminiCraftedArtPrompt(content, artStyle, apiKey);
  } catch {
    const sceneSnippet = content.panels[0] ? `, featuring ${content.panels[0]}` : "";
    artPrompt = content.hasStory
      ? `Charming realistic storybook painting of "${content.storyTitle}"${sceneSnippet}, warm natural sunlight, rich painted details, beautiful colors, no text, no clipart`
      : `Charming realistic educational illustration of ${content.title}${sceneSnippet}, warm natural sunlight, authentic details, beautiful colors, no text, no clipart`;
  }

  // 2. Fetch High-Quality Neural AI Image (via Pollinations / Diffusion)
  let rawImageDataUri: string | null = null;
  try {
    rawImageDataUri = await fetchNeuralArtImage(artPrompt, generationNonce);
  } catch (err) {
    console.warn("Neural image generation fetch warning:", err);
  }

  // 3. Guaranteed High-Taste Fallback (Zero clipart, zero stick figures, zero cone bodies)
  if (!rawImageDataUri) {
    rawImageDataUri = getDomainRealArtFallback(content.subject, content.title, content.hasStory, content.panels);
  }

  // 4. Frame the AI Image with Kat's signature Presentation Card (Top Banner & Caption, watermark cropped)
  const framedSvg = buildFramedEducationalSvg(rawImageDataUri, content);

  return { svg: framedSvg, design, artStyle };
}

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
    const encodedSvg = encodeURIComponent(svgString)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

    const timeoutId = setTimeout(() => resolve(generateFallbackPngDataUri()), 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
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

export async function generateUniqueLessonIllustration(
  plan: LessonPlan,
  sourceImages?: ImageInput[],
  options?: IllustrationGeneratorOptions
): Promise<string> {
  const result = await requestGeminiIllustration(plan, sourceImages, options);

  if (result.rasterDataUri) {
    return result.rasterDataUri;
  }

  if (result.svg) {
    return await rasterizeSvgToPngDataUri(result.svg, 960, 540);
  }

  return generateFallbackPngDataUri();
}

/**
 * High-Taste Pedagogical Vector Artwork Engine
 * Modeled directly on Kat's authentic classroom presentations in "sample ppt":
 * 1. Storybook 4-Panel Comic (Arts in the Community, Ang Araw ni Liza, Fables)
 * 2. Montessori 3D Concrete Sets Grid (Mathematics)
 * 3. 4-Room Dollhouse Architectural Cutaway (Language / Things Inside the House)
 * 4. Interactive PAG-UUGNAY Speech Stage (Filipino question cards)
 * 5. Road Safety & Action Sequence (Science / Stop Look Listen)
 *
 * STRICTLY BANS STICK FIGURES, CONE BODIES, AND RANDOM LETTERS.
 */
export function buildOfflineDynamicSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  _design: DesignBlueprint,
  _artStyle: ArtStyleDirection,
  _nonce: number
): string {
  const fallbackRealArt = getDomainRealArtFallback(content.subject, content.title, content.hasStory, content.panels);
  return buildFramedEducationalSvg(fallbackRealArt, content);
}

/**
 * 1. Community Arts & Story Showcase
 * High-taste educational artwork directly modeled on Kat's sample PPT slides:
 * Features a friendly Filipino art teacher/student with palette and brush,
 * alongside an authentic community arts showcase (Carabao wood carving,
 * Mayon landscape painting on easel, and native woven flower basket).
 * STRICTLY ZERO STICK FIGURES, ZERO CONE BODIES, ZERO RANDOM LETTERS.
 */
function buildStoryComicGridSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  nonce: number
): string {
  const esc = (s: string) =>
    (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const titleText = esc(content.title || "Arts in the Community");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="bgGrad_${nonce}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9E6"/>
      <stop offset="50%" stop-color="#E8F8F5"/>
      <stop offset="100%" stop-color="#EBF5FB"/>
    </linearGradient>
    <linearGradient id="bannerGrad_${nonce}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFD166"/>
      <stop offset="50%" stop-color="#FFB703"/>
      <stop offset="100%" stop-color="#FB8500"/>
    </linearGradient>
    <linearGradient id="woodGrad_${nonce}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4A373"/>
      <stop offset="50%" stop-color="#BC6C25"/>
      <stop offset="100%" stop-color="#8B4513"/>
    </linearGradient>
    <linearGradient id="skyGrad_${nonce}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#FFF0F5"/>
    </linearGradient>
    <linearGradient id="hillGrad_${nonce}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#52B788"/>
      <stop offset="100%" stop-color="#2D6A4F"/>
    </linearGradient>
    <linearGradient id="basketGrad_${nonce}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4A261"/>
      <stop offset="100%" stop-color="#E76F51"/>
    </linearGradient>
    <linearGradient id="blouseGrad_${nonce}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#FF8E53"/>
    </linearGradient>
    <filter id="dropShadow_${nonce}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Master Canvas Background -->
  <rect width="960" height="540" fill="url(#bgGrad_${nonce})"/>

  <!-- Decorative Background Art Sparkles -->
  <g opacity="0.35">
    <circle cx="80" cy="120" r="35" fill="#FFD166"/>
    <circle cx="880" cy="480" r="45" fill="#B5E2FA"/>
    <path d="M 50,480 Q 80,440 120,480" fill="none" stroke="#52B788" stroke-width="4" stroke-linecap="round"/>
    <path d="M 830,100 Q 860,65 900,100" fill="none" stroke="#FFB703" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Top Yellow Title Banner (Kat's Signature Presentation Header) -->
  <g filter="url(#dropShadow_${nonce})">
    <rect x="160" y="22" width="640" height="62" rx="31" fill="url(#bannerGrad_${nonce})" stroke="#FFFFFF" stroke-width="3.5"/>
    <text x="480" y="61" font-family="'Comic Sans MS', 'Arial Rounded MT Bold', system-ui, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${titleText}
    </text>
  </g>

  <!-- LEFT: Friendly Filipino Art Teacher with Palette & Brush -->
  <g transform="translate(45, 95)" filter="url(#dropShadow_${nonce})">
    <!-- Shadow -->
    <ellipse cx="140" cy="420" rx="55" ry="14" fill="#000000" opacity="0.1"/>
    <!-- Dress / Torso -->
    <path d="M 95 300 Q 140 280 185 300 L 205 425 Q 140 435 75 425 Z" fill="url(#blouseGrad_${nonce})"/>
    <path d="M 120 285 L 140 310 L 160 285 Z" fill="#FFFFFF"/>
    <circle cx="140" cy="330" r="4" fill="#FFE600"/>
    <circle cx="140" cy="355" r="4" fill="#FFE600"/>
    <!-- Neck -->
    <rect x="128" y="245" width="24" height="45" rx="8" fill="#F8D5C4"/>
    <!-- Head -->
    <circle cx="140" cy="195" r="50" fill="#F8D5C4"/>
    <!-- Hair with Cute Bun -->
    <path d="M 88 185 C 88 135, 192 135, 192 185 C 192 210, 182 220, 172 205 C 158 155, 122 155, 108 205 C 98 220, 88 210, 88 185 Z" fill="#2B2D42"/>
    <circle cx="140" cy="135" r="20" fill="#2B2D42"/>
    <!-- Eyes with Highlights -->
    <circle cx="124" cy="190" r="5.5" fill="#2B2D42"/>
    <circle cx="156" cy="190" r="5.5" fill="#2B2D42"/>
    <circle cx="126" cy="188" r="2" fill="#FFFFFF"/>
    <circle cx="158" cy="188" r="2" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M 116 180 Q 124 175 132 181" fill="none" stroke="#2B2D42" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 148 181 Q 156 175 164 180" fill="none" stroke="#2B2D42" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Smile & Cheeks -->
    <path d="M 132 210 Q 140 219 148 210" fill="none" stroke="#D90429" stroke-width="3" stroke-linecap="round"/>
    <circle cx="114" cy="204" r="7" fill="#FF8FA3" opacity="0.6"/>
    <circle cx="166" cy="204" r="7" fill="#FF8FA3" opacity="0.6"/>
    <!-- Left Arm & Palette -->
    <path d="M 95 310 Q 60 350 80 390" fill="none" stroke="#F8D5C4" stroke-width="16" stroke-linecap="round"/>
    <g transform="translate(38, 360) rotate(-15)">
      <ellipse cx="50" cy="40" rx="52" ry="38" fill="#DEB887" stroke="#8B4513" stroke-width="2.5"/>
      <ellipse cx="30" cy="50" rx="8" ry="11" fill="#FFF9E6" stroke="#8B4513" stroke-width="2"/>
      <circle cx="26" cy="22" r="7.5" fill="#FF595E"/>
      <circle cx="48" cy="17" r="7.5" fill="#FFCA3A"/>
      <circle cx="72" cy="26" r="7.5" fill="#8AC926"/>
      <circle cx="82" cy="48" r="7.5" fill="#1982C4"/>
      <circle cx="64" cy="62" r="7.5" fill="#6A4C93"/>
    </g>
    <!-- Right Arm & Brush -->
    <path d="M 185 310 Q 215 340 198 380" fill="none" stroke="#F8D5C4" stroke-width="16" stroke-linecap="round"/>
    <g transform="translate(190, 370) rotate(45)">
      <rect x="0" y="0" width="8" height="65" rx="4" fill="#CD853F" stroke="#8B4513" stroke-width="1.5"/>
      <rect x="0" y="0" width="8" height="14" fill="#C0C0C0"/>
      <path d="M 0 0 Q 4 -14 8 0 Z" fill="#FF595E"/>
    </g>
  </g>

  <!-- RIGHT: Community Arts Showcase Platform -->
  <g transform="translate(460, 355)" filter="url(#dropShadow_${nonce})">
    <rect x="0" y="42" width="455" height="24" rx="5" fill="#A47148"/>
    <rect x="25" y="66" width="38" height="88" fill="#8B5A2B"/>
    <rect x="392" y="66" width="38" height="88" fill="#8B5A2B"/>
    <ellipse cx="227" cy="42" rx="228" ry="12" fill="#D4A373"/>
  </g>

  <!-- 1. Wood Carving Craft (Philippine Folk Carabao) -->
  <g transform="translate(485, 240)" filter="url(#dropShadow_${nonce})">
    <rect x="-10" y="110" width="130" height="20" rx="5" fill="#654321"/>
    <g fill="url(#woodGrad_${nonce})" stroke="#5C3A21" stroke-width="2">
      <ellipse cx="60" cy="75" rx="44" ry="29"/>
      <path d="M 25 65 C 10 65, 0 80, 5 90 C 10 95, 20 90, 30 80 Z"/>
      <path d="M 15 70 C -5 60, -10 35, 10 30 C 25 25, 25 50, 25 65" fill="none" stroke="#3D2314" stroke-width="5.5" stroke-linecap="round"/>
      <rect x="30" y="95" width="10" height="24" rx="4"/>
      <rect x="80" y="95" width="10" height="24" rx="4"/>
      <path d="M 100 65 Q 115 80 110 100" fill="none" stroke="#3D2314" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <rect x="15" y="134" width="80" height="22" rx="5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="55" y="149" font-family="'Comic Sans MS', sans-serif" font-size="11" font-weight="bold" fill="#5C3A21" text-anchor="middle">Wood Craft</text>
  </g>

  <!-- 2. Scenic Painting on Easel (Mayon & Rice Fields) -->
  <g transform="translate(630, 140)" filter="url(#dropShadow_${nonce})">
    <polygon points="75,0 85,0 120,225 100,225" fill="#A47148"/>
    <polygon points="85,0 75,0 40,225 60,225" fill="#A47148"/>
    <rect x="76" y="-15" width="8" height="240" fill="#8B5A2B"/>
    <rect x="10" y="178" width="140" height="12" rx="3" fill="#A47148"/>
    <!-- Canvas Frame -->
    <rect x="15" y="30" width="130" height="150" rx="5" fill="#FFFFFF" stroke="#8B5A2B" stroke-width="5"/>
    <!-- Inner Painting -->
    <g clip-path="url(#easelClip_${nonce})">
      <clipPath id="easelClip_${nonce}">
        <rect x="20" y="35" width="120" height="140" rx="3"/>
      </clipPath>
      <rect x="20" y="35" width="120" height="140" fill="url(#skyGrad_${nonce})"/>
      <circle cx="115" cy="65" r="14" fill="#FFB703"/>
      <polygon points="80,75 130,138 30,138" fill="#C8B6A6"/>
      <polygon points="80,75 90,98 70,98" fill="#FFFFFF"/>
      <polygon points="80,75 130,138 80,138" fill="#A39181"/>
      <path d="M 20 118 Q 50 100 80 118 Q 110 138 140 114 L 140 175 L 20 175 Z" fill="url(#hillGrad_${nonce})"/>
      <polygon points="45,128 55,120 65,128" fill="#A52A2A"/>
      <rect x="48" y="128" width="14" height="10" fill="#DEB887"/>
    </g>
    <rect x="40" y="196" width="80" height="22" rx="5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="80" y="211" font-family="'Comic Sans MS', sans-serif" font-size="11" font-weight="bold" fill="#2D6A4F" text-anchor="middle">Landscape</text>
  </g>

  <!-- 3. Handcrafted Woven Basket with Flowers -->
  <g transform="translate(805, 255)" filter="url(#dropShadow_${nonce})">
    <ellipse cx="50" cy="115" rx="34" ry="10" fill="#000000" opacity="0.15"/>
    <path d="M 20 50 L 80 50 L 95 110 C 95 115, 85 120, 50 120 C 15 120, 5 115, 5 110 Z" fill="url(#basketGrad_${nonce})" stroke="#A52A2A" stroke-width="2"/>
    <path d="M 12 65 L 88 65 M 10 80 L 90 80 M 8 95 L 92 95" fill="none" stroke="#D94E34" stroke-width="2.5" stroke-dasharray="5,4"/>
    <ellipse cx="50" cy="50" rx="30" ry="8" fill="#F4A261" stroke="#A52A2A" stroke-width="2"/>
    <!-- Flowers Spilling Out -->
    <g transform="translate(50, 45)">
      <path d="M 0 0 Q -18 -28 -8 -38 Q 4 -28 0 0" fill="#52B788"/>
      <path d="M 0 0 Q 22 -22 18 -32 Q 4 -22 0 0" fill="#74C69D"/>
      <circle cx="-5" cy="-24" r="7.5" fill="#FF595E"/>
      <circle cx="-5" cy="-24" r="3" fill="#FFCA3A"/>
      <circle cx="12" cy="-18" r="6.5" fill="#FFB703"/>
      <circle cx="3" cy="-33" r="7.5" fill="#FF6B6B"/>
      <circle cx="3" cy="-33" r="3" fill="#FFE66D"/>
    </g>
    <rect x="10" y="130" width="80" height="22" rx="5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="50" y="145" font-family="'Comic Sans MS', sans-serif" font-size="11" font-weight="bold" fill="#E76F51" text-anchor="middle">Handicrafts</text>
  </g>

  <!-- Bottom Educational Footer Strip -->
  <g transform="translate(160, 498)">
    <rect width="640" height="28" rx="14" fill="#FEF08A" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="320" y="19" font-family="'Comic Sans MS', system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0F172A" text-anchor="middle">
      Kat's Community Art Showcase • Appreciating Filipino Art, Culture &amp; Craftsmanship
    </text>
  </g>
</svg>`;
}

/**
 * 2. Montessori 3D Concrete Sets Grid (Mathematics)
 * Modeled on Kat's K2 Mathematics "Numbers Add to 10" & Set Theory PPT slides.
 */
function buildMathMontessoriSetsSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  nonce: number
): string {
  const esc = (s: string) =>
    (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="mathBg_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#DBEAFE"/>
    </linearGradient>
  </defs>

  <rect width="960" height="540" fill="url(#mathBg_${nonce})"/>

  <!-- Top Title Banner -->
  <g transform="translate(180, 8)">
    <rect width="600" height="42" rx="21" fill="#FEF08A" stroke="#F59E0B" stroke-width="2.5"/>
    <text x="300" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">
      ${esc(content.title)}
    </text>
  </g>

  <!-- 4 Concrete Sets Trays -->
  <!-- Set 1: Set of Toy Cars -->
  <g transform="translate(18, 60)">
    <rect width="452" height="216" rx="16" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect x="16" y="14" width="180" height="28" rx="8" fill="#DBEAFE"/>
    <text x="106" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#1E40AF" text-anchor="middle">Set of Cars (3)</text>
    <!-- 3 Illustrated 3D Toy Cars -->
    <g transform="translate(60, 95)">
      <rect x="0" y="14" width="70" height="26" rx="6" fill="#EF4444"/>
      <path d="M 12,14 L 22,0 L 52,0 L 60,14 Z" fill="#DC2626"/>
      <circle cx="16" cy="40" r="10" fill="#0F172A"/>
      <circle cx="16" cy="40" r="4" fill="#E2E8F0"/>
      <circle cx="54" cy="40" r="10" fill="#0F172A"/>
      <circle cx="54" cy="40" r="4" fill="#E2E8F0"/>
    </g>
    <g transform="translate(185, 95)">
      <rect x="0" y="14" width="70" height="26" rx="6" fill="#3B82F6"/>
      <path d="M 12,14 L 22,0 L 52,0 L 60,14 Z" fill="#2563EB"/>
      <circle cx="16" cy="40" r="10" fill="#0F172A"/>
      <circle cx="16" cy="40" r="4" fill="#E2E8F0"/>
      <circle cx="54" cy="40" r="10" fill="#0F172A"/>
      <circle cx="54" cy="40" r="4" fill="#E2E8F0"/>
    </g>
    <g transform="translate(310, 95)">
      <rect x="0" y="14" width="70" height="26" rx="6" fill="#EAB308"/>
      <path d="M 12,14 L 22,0 L 52,0 L 60,14 Z" fill="#CA8A04"/>
      <circle cx="16" cy="40" r="10" fill="#0F172A"/>
      <circle cx="16" cy="40" r="4" fill="#E2E8F0"/>
      <circle cx="54" cy="40" r="10" fill="#0F172A"/>
      <circle cx="54" cy="40" r="4" fill="#E2E8F0"/>
    </g>
    <rect x="16" y="160" width="420" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="226" y="186" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">Count and identify: There are 3 toy cars in this group.</text>
  </g>

  <!-- Set 2: Set of Toy Trains -->
  <g transform="translate(490, 60)">
    <rect width="452" height="216" rx="16" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
    <rect x="16" y="14" width="180" height="28" rx="8" fill="#D1FAE5"/>
    <text x="106" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#065F46" text-anchor="middle">Set of Trains (2)</text>
    <!-- Steam Locomotive & Carriage -->
    <g transform="translate(90, 85)">
      <rect x="0" y="20" width="110" height="40" rx="6" fill="#059669"/>
      <rect x="15" y="0" width="30" height="25" fill="#047857"/>
      <rect x="70" y="5" width="40" height="25" fill="#FDE047"/>
      <circle cx="25" cy="62" r="12" fill="#0F172A"/>
      <circle cx="55" cy="62" r="12" fill="#0F172A"/>
      <circle cx="85" cy="62" r="12" fill="#0F172A"/>
    </g>
    <g transform="translate(240, 95)">
      <rect x="0" y="10" width="90" height="40" rx="6" fill="#EA580C"/>
      <circle cx="25" cy="52" r="12" fill="#0F172A"/>
      <circle cx="65" cy="52" r="12" fill="#0F172A"/>
    </g>
    <rect x="16" y="160" width="420" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="226" y="186" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">Group comparison: 3 cars is greater than 2 trains.</text>
  </g>

  <!-- Set 3: Counting Blocks & Cubes -->
  <g transform="translate(18, 286)">
    <rect width="452" height="216" rx="16" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
    <rect x="16" y="14" width="190" height="28" rx="8" fill="#FEF3C7"/>
    <text x="111" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#92400E" text-anchor="middle">Set of Counting Cubes</text>
    <!-- Stack of Colorful 3D Blocks -->
    <g transform="translate(140, 80)">
      <rect x="0" y="36" width="36" height="36" rx="4" fill="#EF4444" stroke="#991B1B" stroke-width="2"/>
      <rect x="42" y="36" width="36" height="36" rx="4" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
      <rect x="84" y="36" width="36" height="36" rx="4" fill="#10B981" stroke="#047857" stroke-width="2"/>
      <rect x="126" y="36" width="36" height="36" rx="4" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
      <rect x="42" y="-4" width="36" height="36" rx="4" fill="#8B5CF6" stroke="#6D28D9" stroke-width="2"/>
      <rect x="84" y="-4" width="36" height="36" rx="4" fill="#EC4899" stroke="#BE185D" stroke-width="2"/>
    </g>
    <rect x="16" y="160" width="420" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="226" y="186" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">Combining sets: 4 base cubes + 2 top cubes = 6 cubes.</text>
  </g>

  <!-- Set 4: Fresh Fruit Basket -->
  <g transform="translate(490, 286)">
    <rect width="452" height="216" rx="16" fill="#FFFFFF" stroke="#7C3AED" stroke-width="2"/>
    <rect x="16" y="14" width="180" height="28" rx="8" fill="#EDE9FE"/>
    <text x="106" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#5B21B6" text-anchor="middle">Set of Fresh Fruits</text>
    <!-- Fresh Fruits in Woven Basket -->
    <g transform="translate(170, 75)">
      <ellipse cx="60" cy="55" rx="55" ry="24" fill="#D97706"/>
      <circle cx="40" cy="40" r="16" fill="#EF4444"/>
      <circle cx="75" cy="38" r="16" fill="#F97316"/>
      <ellipse cx="60" cy="28" rx="22" ry="10" fill="#FACC15" transform="rotate(-15 60 28)"/>
    </g>
    <rect x="16" y="160" width="420" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="226" y="186" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">Math Concept: Equal sets, one-to-one correspondence.</text>
  </g>

  <!-- Bottom Strip -->
  <g transform="translate(18, 510)">
    <rect width="924" height="24" rx="8" fill="#FEF08A" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="462" y="17" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">
      Kat's Concrete Mathematics • Learning Numbers with Joy and Understanding
    </text>
  </g>
</svg>`;
}

/**
 * 3. 4-Room Dollhouse Architectural Cutaway (Language / Things Inside the House)
 * Modeled on Kat's Language Lesson 3 "This is My House" & "Things Inside the House" PPT.
 */
function buildHouseCutawayDiagramSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  nonce: number
): string {
  const esc = (s: string) =>
    (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="houseBg_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FEF9C3"/>
      <stop offset="100%" stop-color="#FEF08A"/>
    </linearGradient>
  </defs>

  <rect width="960" height="540" fill="url(#houseBg_${nonce})"/>

  <!-- Top Yellow Cloud Title -->
  <g transform="translate(180, 8)">
    <rect width="600" height="42" rx="21" fill="#FEF08A" stroke="#F59E0B" stroke-width="2.5"/>
    <text x="300" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">
      ${esc(content.title)}
    </text>
  </g>

  <!-- House Outline Frame -->
  <rect x="28" y="58" width="904" height="444" rx="18" fill="#FFFFFF" stroke="#78350F" stroke-width="4"/>
  <!-- Central Partition Cross -->
  <line x1="480" y1="58" x2="480" y2="502" stroke="#78350F" stroke-width="4"/>
  <line x1="28" y1="280" x2="932" y2="280" stroke="#78350F" stroke-width="4"/>

  <!-- ROOM 1: Living Room (Top-Left) -->
  <g transform="translate(36, 66)">
    <rect x="12" y="10" width="130" height="26" rx="8" fill="#DBEAFE"/>
    <text x="77" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#1E40AF" text-anchor="middle">LIVING ROOM</text>
    <!-- Comfy Sofa & Floor Lamp -->
    <g transform="translate(120, 75)">
      <rect x="0" y="20" width="160" height="65" rx="10" fill="#EAB308" stroke="#CA8A04" stroke-width="2"/>
      <rect x="20" y="0" width="120" height="40" rx="8" fill="#FACC15"/>
      <rect x="-10" y="15" width="25" height="50" rx="6" fill="#CA8A04"/>
      <rect x="145" y="15" width="25" height="50" rx="6" fill="#CA8A04"/>
      <!-- Coffee Table & Book -->
      <rect x="40" y="80" width="80" height="20" rx="4" fill="#92400E"/>
      <rect x="65" y="74" width="28" height="8" rx="2" fill="#3B82F6"/>
      <!-- Floor Lamp -->
      <line x1="200" y1="20" x2="200" y2="105" stroke="#64748B" stroke-width="3"/>
      <polygon points="185,25 215,25 200,0" fill="#FB7185"/>
    </g>
    <rect x="12" y="170" width="416" height="34" rx="8" fill="#F1F5F9"/>
    <text x="220" y="192" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">The living room is where we relax and talk with family.</text>
  </g>

  <!-- ROOM 2: Bedroom (Top-Right) -->
  <g transform="translate(488, 66)">
    <rect x="12" y="10" width="120" height="26" rx="8" fill="#FCE7F3"/>
    <text x="72" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#BE185D" text-anchor="middle">BEDROOM</text>
    <!-- Comfy Bed & Nightstand -->
    <g transform="translate(130, 60)">
      <rect x="0" y="30" width="150" height="75" rx="8" fill="#93C5FD" stroke="#3B82F6" stroke-width="2"/>
      <rect x="0" y="0" width="150" height="35" rx="6" fill="#78350F"/>
      <rect x="15" y="10" width="45" height="22" rx="4" fill="#FFFFFF"/>
      <rect x="85" y="10" width="45" height="22" rx="4" fill="#FFFFFF"/>
      <!-- Nightstand & Reading Lamp -->
      <rect x="165" y="55" width="40" height="45" rx="4" fill="#78350F"/>
      <circle cx="185" cy="45" r="10" fill="#FEF08A"/>
    </g>
    <rect x="12" y="170" width="416" height="34" rx="8" fill="#F1F5F9"/>
    <text x="220" y="192" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">The bedroom is where we sleep and rest peacefully.</text>
  </g>

  <!-- ROOM 3: Kitchen & Dining (Bottom-Left) -->
  <g transform="translate(36, 288)">
    <rect x="12" y="10" width="120" height="26" rx="8" fill="#FEF3C7"/>
    <text x="72" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#B45309" text-anchor="middle">KITCHEN</text>
    <!-- Stove, Refrigerator & Table -->
    <g transform="translate(70, 50)">
      <!-- Refrigerator -->
      <rect x="0" y="0" width="55" height="105" rx="6" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
      <line x1="0" y1="40" x2="55" y2="40" stroke="#94A3B8" stroke-width="2"/>
      <!-- Cooking Stove -->
      <rect x="75" y="45" width="70" height="60" rx="4" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
      <circle cx="95" cy="52" r="8" fill="#334155"/>
      <circle cx="125" cy="52" r="8" fill="#334155"/>
      <!-- Dining Table with Food Bowl -->
      <rect x="175" y="65" width="110" height="25" rx="4" fill="#78350F"/>
      <ellipse cx="230" cy="58" rx="20" ry="8" fill="#EF4444"/>
    </g>
    <rect x="12" y="170" width="416" height="34" rx="8" fill="#F1F5F9"/>
    <text x="220" y="192" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">The kitchen is where we prepare and eat delicious meals.</text>
  </g>

  <!-- ROOM 4: Bathroom (Bottom-Right) -->
  <g transform="translate(488, 288)">
    <rect x="12" y="10" width="130" height="26" rx="8" fill="#CCFBF1"/>
    <text x="77" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#0F766E" text-anchor="middle">BATHROOM</text>
    <!-- Bathtub & Sink -->
    <g transform="translate(100, 55)">
      <!-- Bathtub -->
      <rect x="0" y="40" width="130" height="55" rx="16" fill="#F8FAFC" stroke="#0D9488" stroke-width="2.5"/>
      <ellipse cx="65" cy="40" rx="60" ry="12" fill="#99F6E4"/>
      <!-- Vanity Mirror & Sink -->
      <rect x="160" y="0" width="45" height="55" rx="6" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>
      <rect x="155" y="60" width="55" height="35" rx="4" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
    </g>
    <rect x="12" y="170" width="416" height="34" rx="8" fill="#F1F5F9"/>
    <text x="220" y="192" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">The bathroom is where we wash, bathe, and stay clean.</text>
  </g>

  <!-- Bottom Strip -->
  <g transform="translate(18, 510)">
    <rect width="924" height="24" rx="8" fill="#FEF08A" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="462" y="17" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">
      Kat's Language Lesson • We take care of our home and the things inside it with love
    </text>
  </g>
</svg>`;
}

/**
 * 4. Road Safety & Action Sequence (Science / Stop, Look, and Listen)
 */
function buildRoadSafetySequenceSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  nonce: number
): string {
  const esc = (s: string) =>
    (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="safetyBg_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F0FDF4"/>
      <stop offset="100%" stop-color="#DCFCE7"/>
    </linearGradient>
  </defs>

  <rect width="960" height="540" fill="url(#safetyBg_${nonce})"/>

  <g transform="translate(180, 8)">
    <rect width="600" height="42" rx="21" fill="#FEF08A" stroke="#F59E0B" stroke-width="2.5"/>
    <text x="300" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">
      ${esc(content.title)}
    </text>
  </g>

  <!-- Top Hero Situation Banner: Pedestrian Zebra Crossing -->
  <g transform="translate(18, 58)">
    <rect width="924" height="190" rx="16" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
    <!-- Road Surface & White Stripes -->
    <rect x="0" y="70" width="924" height="120" fill="#334155"/>
    <rect x="60" y="90" width="90" height="24" rx="4" fill="#FFFFFF"/>
    <rect x="200" y="90" width="90" height="24" rx="4" fill="#FFFFFF"/>
    <rect x="340" y="90" width="90" height="24" rx="4" fill="#FFFFFF"/>
    <rect x="480" y="90" width="90" height="24" rx="4" fill="#FFFFFF"/>
    <rect x="620" y="90" width="90" height="24" rx="4" fill="#FFFFFF"/>
    <rect x="760" y="90" width="90" height="24" rx="4" fill="#FFFFFF"/>
    <!-- Traffic Light on Post -->
    <rect x="850" y="10" width="34" height="75" rx="6" fill="#0F172A"/>
    <circle cx="867" cy="24" r="8" fill="#EF4444"/>
    <circle cx="867" cy="46" r="8" fill="#F59E0B"/>
    <circle cx="867" cy="68" r="8" fill="#10B981"/>
    <!-- Students Crossing Safely Hand-in-Hand with Teacher -->
    <text x="462" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#0F172A" text-anchor="middle">
      Pedestrian Safety Rule: Always cross on the pedestrian lane with an adult
    </text>
  </g>

  <!-- 4 Action Cards -->
  <!-- Card 1: STOP -->
  <g transform="translate(18, 260)">
    <rect width="218" height="236" rx="14" fill="#FFFFFF" stroke="#DC2626" stroke-width="2.5"/>
    <rect x="14" y="14" width="190" height="36" rx="18" fill="#FEE2E2"/>
    <text x="109" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900" fill="#DC2626" text-anchor="middle">1. STOP</text>
    <circle cx="109" cy="115" r="42" fill="#FEF2F2" stroke="#EF4444" stroke-width="2"/>
    <polygon points="109,85 135,100 135,130 109,145 83,130 83,100" fill="#DC2626"/>
    <text x="109" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">STOP</text>
    <text x="109" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#0F172A" text-anchor="middle">Stop before the curb</text>
    <text x="109" y="202" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">Never run into the road</text>
  </g>

  <!-- Card 2: LOOK LEFT -->
  <g transform="translate(252, 260)">
    <rect width="218" height="236" rx="14" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.5"/>
    <rect x="14" y="14" width="190" height="36" rx="18" fill="#E0F2FE"/>
    <text x="109" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900" fill="#0369A1" text-anchor="middle">2. LOOK LEFT</text>
    <circle cx="109" cy="115" r="42" fill="#F0F9FF" stroke="#0284C7" stroke-width="2"/>
    <path d="M 125,115 L 90,115 M 102,103 L 90,115 L 102,127" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
    <text x="109" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#0F172A" text-anchor="middle">Look to your left</text>
    <text x="109" y="202" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">Check oncoming traffic</text>
  </g>

  <!-- Card 3: LOOK RIGHT -->
  <g transform="translate(488, 260)">
    <rect width="218" height="236" rx="14" fill="#FFFFFF" stroke="#059669" stroke-width="2.5"/>
    <rect x="14" y="14" width="190" height="36" rx="18" fill="#DCFCE7"/>
    <text x="109" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900" fill="#15803D" text-anchor="middle">3. LOOK RIGHT</text>
    <circle cx="109" cy="115" r="42" fill="#F0FDF4" stroke="#059669" stroke-width="2"/>
    <path d="M 93,115 L 128,115 M 116,103 L 128,115 L 116,127" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
    <text x="109" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#0F172A" text-anchor="middle">Look to your right</text>
    <text x="109" y="202" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">Ensure no turning cars</text>
  </g>

  <!-- Card 4: LISTEN -->
  <g transform="translate(724, 260)">
    <rect width="218" height="236" rx="14" fill="#FFFFFF" stroke="#D97706" stroke-width="2.5"/>
    <rect x="14" y="14" width="190" height="36" rx="18" fill="#FEF3C7"/>
    <text x="109" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900" fill="#B45309" text-anchor="middle">4. LISTEN</text>
    <circle cx="109" cy="115" r="42" fill="#FFFBEB" stroke="#D97706" stroke-width="2"/>
    <path d="M 98,105 Q 115,100 115,115 Q 115,130 98,125" stroke="#D97706" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M 122,98 Q 135,115 122,132" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <text x="109" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#0F172A" text-anchor="middle">Listen for horns</text>
    <text x="109" y="202" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">Cross when clear &amp; safe</text>
  </g>

  <!-- Bottom Strip -->
  <g transform="translate(18, 510)">
    <rect width="924" height="24" rx="8" fill="#FEF08A" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="462" y="17" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0F172A" text-anchor="middle">
      Kat's Science Lesson • Safety First, Mindful of Our Surroundings Every Day
    </text>
  </g>
</svg>`;
}

export function generateFallbackPngDataUri(_seedText?: string | number): string {
  const width = 400;
  const height = 220;
  const rawData: number[] = [];

  for (let y = 0; y < height; y++) {
    rawData.push(0);
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
  blocks.push((adler >>> 24) & 0xff, (adler >>> 16) & 0xff, (adler >>> 8) & 0xff, adler & 0xff);

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

  const total = sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
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
    typeof Buffer !== "undefined" ? Buffer.from(png).toString("base64") : btoa(binary);
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
