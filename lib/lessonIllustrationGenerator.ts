import type { IllustrationStyle, ImageInput, LessonPlan } from "./types";
import { getInternalGeminiKey, getInternalGroqKey } from "./sampleData";

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
- Top Story Banner: x="18" y="10" width="924" height="46" rx="14" with a warm sunny pill container, bold centered story title, and a smiling cartoon mascot in the top corner.
- 4 Chronological Story Panels (2 rows x 2 columns):
  * Panel 1 (Story Beginning): x="18" y="64" width="452" height="216" rx="16" with character introduction in opening setting and bottom 42px white caption card.
  * Panel 2 (Rising Action / Event): x="490" y="64" width="452" height="216" rx="16" with the character journey/challenge and bottom 42px white caption card.
  * Panel 3 (Climax / Dramatic Moment): x="18" y="288" width="452" height="216" rx="16" with key action/conflict and bottom 42px white caption card.
  * Panel 4 (Resolution & Moral): x="490" y="288" width="452" height="216" rx="16" with resolution, lesson learned, and bottom 42px white caption card.
- Bottom Moral/Takeaway Strip: x="18" y="510" width="924" height="24" rx="8" with encouraging moral text.`,
  },
  {
    id: "kat_concept_question_cards",
    name: "Kat's Concept Question Cards Grid (Ano?, Saan?, Sino?, Kailan? Style)",
    layoutInstructions: `Structure as a concept question board on the 960x540 canvas (modeled on Kat's Filipino PPT question cards):
- Top Header Section (y=10 to y=76):
  * Center: Bubbly puffy cloud badge (x="240" y="10" width="280" height="62" rx="28") with the big friendly lesson/question title surrounded by radiant sunburst sparkles.
  * Top-Left: Cute student mascot figure pointing excitedly toward the title.
  * Top-Right: Soft lavender/blue cloud definition bubble (x="530" y="10" width="412" height="62" rx="18") explaining the lesson concept in child-friendly language.
- 4 Color-Coded Concept Cards (2x2 grid from y=82 to y=528):
  * Card 1 (Pastel Strawberry Pink): x="18" y="82" width="452" height="218" rx="16" with top colored pill title, rich centered illustration, and bottom white question strip.
  * Card 2 (Soft Sky Blue): x="490" y="82" width="452" height="218" rx="16" with top colored pill title, rich centered illustration, and bottom white question strip.
  * Card 3 (Sunny Butter Yellow): x="18" y="308" width="452" height="218" rx="16" with top colored pill title, rich centered illustration, and bottom white question strip.
  * Card 4 (Soft Lavender Purple): x="490" y="308" width="452" height="218" rx="16" with top colored pill title, rich centered illustration, and bottom white question strip.`,
  },
  {
    id: "kat_community_catalog_cards",
    name: "Kat's Community Helpers & Topic Catalog (Different Personnel in School Style)",
    layoutInstructions: `Structure as a 4-card catalog on the 960x540 canvas (modeled on Kat's Language PPT 'Different Personnel in School'):
- Top Title Pill: x="180" y="12" width="600" height="46" rx="23" with bright yellow/amber container, sparkle icons, and bold centered catalog title.
- 4 Labeled Role/Tool Cards (2x2 grid):
  * Card 1: x="18" y="66" width="452" height="226" rx="16" with rich character/tool in authentic setting and bottom colored pill badge.
  * Card 2: x="490" y="66" width="452" height="226" rx="16" with rich character/tool in authentic setting and bottom colored pill badge.
  * Card 3: x="18" y="300" width="452" height="226" rx="16" with rich character/tool in authentic setting and bottom colored pill badge.
  * Card 4: x="490" y="300" width="452" height="226" rx="16" with rich character/tool in authentic setting and bottom colored pill badge.`,
  },
  {
    id: "kat_split_home_story_stage",
    name: "Kat's Split Showcase & Reading Stage (My House & My Family Style)",
    layoutInstructions: `Structure as a split presentation stage on the 960x540 canvas (modeled on Kat's Language Lesson 3 'This is My House'):
- Left Feature Stage (x="18" y="16" width="460" height="508" rx="18"):
  * High-detail, warm illustration of the family, home, school, or story world with sunny blue sky, smiling sun mascot, blooming flowers, and expressive characters.
- Right Reading & Reflection Card (x="492" y="16" width="450" height="508" rx="20"):
  * Warm cream/ivory card with dashed/stitch border outline, pill header tag, 4 cleanly spaced reading sentences/questions with cute accompanying mini-icons (little house, heart, book, star), and bottom reflection text.`,
  },
  {
    id: "kat_cutaway_dollhouse_diagram",
    name: "Kat's Cutaway Architectural Diagram (Things Inside the House Style)",
    layoutInstructions: `Structure as an architectural cutaway diagram on the 960x540 canvas (modeled on Kat's 'Things Inside the House' PPT):
- Top Cloud Title Banner: x="180" y="12" width="600" height="50" rx="25" with colorful puffy cloud shape and lesson title.
- Flanking Student Figures: Smiling child on left (x="12" y="270") and right (x="872" y="270") pointing toward the cross-section rooms.
- 4 Partitioned Rooms/Areas (from x="110" to x="850", y="70 to y="524"):
  * Room 1 (top-left): x="110" y="70" width="360" height="222" with detailed furniture and props.
  * Room 2 (top-right): x="480" y="70" width="360" height="222" with detailed furniture and props.
  * Room 3 (bottom-left): x="110" y="300" width="360" height="222" with detailed furniture and props.
  * Room 4 (bottom-right): x="480" y="300" width="360" height="222" with detailed furniture and props.`,
  },
  {
    id: "kat_action_safety_sequence",
    name: "Kat's Action & Safety Steps Sequence (Stop, Look, and Listen Style)",
    layoutInstructions: `Structure as an action-step sequence on the 960x540 canvas (modeled on Kat's Science Road Safety presentation):
- Top Hero Situation Banner (x="18" y="14" width="924" height="236" rx="16"):
  * Illustrates the main real-world situation (pedestrian crossing, hygiene washing, classroom activity) with complete characters and environment.
- Bottom 4 Step Cards (x="18" to x="942", y="260" to y="524"):
  * Step 1 (Red Card): x="18" y="260" width="220" height="258" rx="14" with bold step title (e.g. 'STOP') and demonstration character pose.
  * Step 2 (Green Card): x="252" y="260" width="220" height="258" rx="14" with bold step title (e.g. 'LOOK LEFT') and demonstration character pose.
  * Step 3 (Blue Card): x="488" y="260" width="220" height="258" rx="14" with bold step title (e.g. 'LOOK RIGHT') and demonstration character pose.
  * Step 4 (Yellow Card): x="724" y="260" width="220" height="258" rx="14" with bold step title (e.g. 'LISTEN') and demonstration character pose.`,
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
      "Warm, expressive Philippine children's book digital art directly modeled on Kat's teaching slides: Filipino schoolchildren with neat uniforms (crisp white collared blouse/polo, blue sailor necktie or vest, blue pleated skirt, pink headband, black hair with shine, rosy cheeks, joyful smiles), authentic Philippine school and community settings (Philippine flag on flagpole, palengke market stalls, lolo with walking cane, canteen, library), clean solid line art, and vibrant sunlit colors.",
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
      "Bright, cheerful primary classroom visual style directly inspired by Kat's Grade 1 Filipino question cards ('Ano?', 'Saan?', 'Sino?', 'Kailan?'): puffy yellow cloud headers with sunburst rays, pastel color-coded cards (pink, sky blue, butter yellow, lavender) with dashed inner frames, clear bold sans-serif text, and cute smiling student mascots.",
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
      "Rich, whimsical anthropomorphic fable illustration inspired by Kat's 'The Ant and the Grasshopper' slide: expressive animal story characters with big emotive eyes, tiny props (musical instruments, leaf umbrellas, harvest baskets, jam jars), cozy underground tree pantries, vibrant weather (sunny flower meadows vs stormy rain skies), and clear narrative storytelling.",
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

const GEMINI_ILLUSTRATION_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

/**
 * Uses Gemini AI to craft an elite, /gpt-taste children's book illustration prompt
 * grounded strictly in the generated lesson plan content.
 */
async function requestGeminiCraftedArtPrompt(
  content: ReturnType<typeof extractIllustrationContent>,
  artStyle: ArtStyleDirection,
  apiKey: string
): Promise<string> {
  const storyDetails = content.hasStory
    ? `Story Title: "${content.storyTitle}". Story narrative: 1) ${content.panels[0]} 2) ${content.panels[1]} 3) ${content.panels[2]} 4) ${content.panels[3]}. Focus entirely on the story characters and their narrative world.`
    : `Lesson Topic: "${content.title}". Key Concepts: 1) ${content.panels[0]} 2) ${content.panels[1]} 3) ${content.panels[2]} 4) ${content.panels[3]}. Focus on Filipino students and teacher exploring this lesson in their classroom, school, or community.`;

  const metaPrompt = `You are an elite children's book art director following the gpt-taste standard (strictly NO AI slop, NO generic stick figures, NO text inside the image).
Create a rich, single cohesive image generation prompt for this educational lesson plan:
- Grade Level: ${content.gradeTier === "kinder2" ? "Kinder 2" : "Grade 1"}
- Subject: ${content.subject}
- Lesson Details: ${storyDetails}
- Style Direction: ${artStyle.stylePrompt}

Strict Rules:
1. Describe a joyful, warm, award-winning storybook illustration capturing this exact lesson.
2. Specify: Authentic Filipino characters, warm morning sunlight, charming Studio Ghibli anime storybook style, expressive happy faces, rich detail, masterpiece.
3. Must end with: "masterpiece, award-winning children's book illustration, warm lighting, rich details, no text, no letters, no watermark".
4. Output ONLY the prompt string (max 45 words). No preamble, no quotes.`;

  for (const model of GEMINI_ILLUSTRATION_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: metaPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 120 },
          }),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 20) {
        return text.replace(/^["']|["']$/g, "").trim();
      }
    } catch {
      // Try next Gemini model
    }
  }

  return `Award-winning children's book illustration in Studio Ghibli style: ${content.title}, Filipino students and teacher in warm sunny classroom, joyful expressions, rich pastel colors, masterpiece, highly detailed, no text, no watermark`;
}

/**
 * Downloads a high-resolution neural artwork from the Pollinations Turbo diffusion engine.
 * Full CORS enabled (Access-Control-Allow-Origin: *), free, fast, and high quality.
 */
async function fetchNeuralArtImage(prompt: string, seed: number): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=960&height=540&model=turbo&nologo=true&seed=${seed}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(24000) });
    if (!res.ok) return null;
    const blob = await res.blob();

    if (typeof FileReader !== "undefined") {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else if (typeof Buffer !== "undefined") {
      const buf = Buffer.from(await blob.arrayBuffer());
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    }
    return null;
  } catch (err) {
    console.warn("Neural diffusion art fetch failed:", err);
    return null;
  }
}

/**
 * Composites the neural artwork into Kat's authentic presentation card:
 * - 960x540 canvas with soft cream canvas background
 * - Crops bottom 24px of the artwork to eliminate any external watermark
 * - Renders rounded border around artwork
 * - Draws top yellow title pill (Kat's PPT style)
 * - Draws bottom educational caption bar (Kat's PPT style)
 * - Returns clean PNG Data URI.
 */
async function compositeArtWithEducationalFrame(
  dataUri: string,
  content: ReturnType<typeof extractIllustrationContent>
): Promise<string> {
  if (typeof document === "undefined" || typeof Image === "undefined") {
    return dataUri;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUri);
          return;
        }

        // 1. Background: soft cream canvas
        ctx.fillStyle = "#FFFDF7";
        ctx.fillRect(0, 0, 960, 540);

        // 2. Main artwork: crop 24px from bottom to eliminate any watermark
        const cropBottom = 24;
        const srcW = img.naturalWidth || 960;
        const srcH = Math.max(10, (img.naturalHeight || 540) - cropBottom);
        const artX = 16;
        const artY = 56;
        const artW = 928;
        const artH = 432;

        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(artX, artY, artW, artH, 16);
        } else {
          ctx.rect(artX, artY, artW, artH);
        }
        ctx.clip();
        ctx.drawImage(img, 0, 0, srcW, srcH, artX, artY, artW, artH);
        ctx.restore();

        // 3. Border around artwork
        ctx.strokeStyle = "#0F172A";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(artX, artY, artW, artH, 16);
        } else {
          ctx.strokeRect(artX, artY, artW, artH);
        }
        ctx.stroke();

        // 4. Top yellow pill header (Kat's PPT style)
        const headerX = 200;
        const headerY = 8;
        const headerW = 560;
        const headerH = 40;
        ctx.fillStyle = "#FEF08A";
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(headerX, headerY, headerW, headerH, 20);
        } else {
          ctx.fillRect(headerX, headerY, headerW, headerH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(content.title, 480, headerY + headerH / 2);

        // 5. Bottom caption strip (Kat's PPT style)
        const capX = 16;
        const capY = 496;
        const capW = 928;
        const capH = 36;
        ctx.fillStyle = "#FEF9C3";
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(capX, capY, capW, capH, 10);
        } else {
          ctx.fillRect(capX, capY, capW, capH);
        }
        ctx.fill();
        ctx.stroke();

        const subtitleText = `${content.gradeTier === "kinder2" ? "Kinder 2" : "Grade 1"} ${content.subject} • ${content.subtitle || content.title}`;
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.fillText(subtitleText, 480, capY + capH / 2);

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Canvas compositing failed, using raw data URI:", err);
        resolve(dataUri);
      }
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
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

  // 1. Primary High-Taste Engine: Gemini Vision Prompt Synthesizer + Neural Diffusion (Pollinations Turbo)
  try {
    const artPrompt = await requestGeminiCraftedArtPrompt(content, artStyle, apiKey);
    const neuralDataUri = await fetchNeuralArtImage(artPrompt, generationNonce);
    if (neuralDataUri) {
      const compositedUri = await compositeArtWithEducationalFrame(neuralDataUri, content);
      return { rasterDataUri: compositedUri, design, artStyle };
    }
  } catch (err) {
    console.warn("Neural image pipeline failed, falling back to dynamic SVG:", err);
  }

  // 2. High-Taste Scenic SVG Fallback (Zero stick figures, zero cone bodies)
  const dynamicSvg = buildOfflineDynamicSvg(content, design, artStyle, generationNonce);
  return { svg: dynamicSvg, design, artStyle };
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
    img.crossOrigin = "anonymous";
    const encodedSvg = encodeURIComponent(svgString)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

    const timeoutId = setTimeout(() => resolve(generateFallbackPngDataUri()), 8000);

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
 * High-taste painterly scenic SVG fallback:
 * Beautiful lush rolling hills, palm trees, sunlit skies, and Kat's presentation framing.
 * Strictly BANS stick figures and cone bodies.
 */
function buildOfflineDynamicSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  _design: DesignBlueprint,
  artStyle: ArtStyleDirection,
  nonce: number
): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const p = artStyle.palette;
  const hue = (nonce * 47) % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="sky_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${(hue + 195) % 360}, 85%, 82%)"/>
      <stop offset="60%" stop-color="hsl(${(hue + 45) % 360}, 90%, 92%)"/>
      <stop offset="100%" stop-color="#FFFDF7"/>
    </linearGradient>
    <linearGradient id="hill1_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${(hue + 130) % 360}, 48%, 42%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 110) % 360}, 55%, 28%)"/>
    </linearGradient>
    <linearGradient id="hill2_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${(hue + 140) % 360}, 58%, 52%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 120) % 360}, 62%, 35%)"/>
    </linearGradient>
    <clipPath id="frameClip_${nonce}">
      <rect x="16" y="56" width="928" height="432" rx="16"/>
    </clipPath>
  </defs>

  <!-- Master Canvas Background -->
  <rect width="960" height="540" fill="${p.canvasBg}"/>

  <!-- Main Scenery Inside Frame -->
  <g clip-path="url(#frameClip_${nonce})">
    <!-- Sunlit Sky -->
    <rect x="16" y="56" width="928" height="432" fill="url(#sky_${nonce})"/>

    <!-- Radiant Sun & Soft Clouds -->
    <circle cx="820" cy="140" r="50" fill="#FDE047" opacity="0.9"/>
    <ellipse cx="260" cy="120" rx="90" ry="26" fill="#FFFFFF" opacity="0.8"/>
    <ellipse cx="320" cy="110" rx="70" ry="32" fill="#FFFFFF" opacity="0.85"/>
    <ellipse cx="640" cy="150" rx="80" ry="24" fill="#FFFFFF" opacity="0.75"/>

    <!-- Rolling Tropical Mountains & Hills -->
    <path d="M 0,380 Q 240,240 520,320 T 960,260 L 960,540 L 0,540 Z" fill="url(#hill1_${nonce})"/>
    <path d="M 0,420 Q 360,300 700,380 T 960,340 L 960,540 L 0,540 Z" fill="url(#hill2_${nonce})"/>

    <!-- Lush Tropical Coconut Palms & Trees -->
    <path d="M 80,480 Q 95,360 120,290" stroke="#78350F" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 120,290 Q 60,270 20,300" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 120,290 Q 140,230 180,250" stroke="#16A34A" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 120,290 Q 180,280 220,320" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>

    <path d="M 860,480 Q 840,370 810,300" stroke="#78350F" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 810,300 Q 760,260 710,290" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 810,300 Q 830,240 880,260" stroke="#16A34A" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 810,300 Q 870,290 910,330" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>

    <!-- School Building & Flag in Community Center -->
    <g transform="translate(410, 310)">
      <rect x="0" y="30" width="140" height="90" rx="4" fill="#FEF3C7" stroke="#0F172A" stroke-width="2.5"/>
      <polygon points="70,0 -10,32 150,32" fill="#DC2626" stroke="#0F172A" stroke-width="2.5"/>
      <rect x="52" y="66" width="36" height="54" fill="#1E293B"/>
      <rect x="18" y="46" width="24" height="24" rx="2" fill="#93C5FD" stroke="#0F172A" stroke-width="1.5"/>
      <rect x="98" y="46" width="24" height="24" rx="2" fill="#93C5FD" stroke="#0F172A" stroke-width="1.5"/>
      <!-- Flagpole & Philippine Flag -->
      <line x1="-30" y1="120" x2="-30" y2="10" stroke="#64748B" stroke-width="3"/>
      <rect x="-30" y="10" width="36" height="12" fill="#2563EB"/>
      <rect x="-30" y="22" width="36" height="12" fill="#DC2626"/>
      <polygon points="-30,10 -30,34 -12,22" fill="#FFFFFF"/>
    </g>
  </g>

  <!-- Frame Border -->
  <rect x="16" y="56" width="928" height="432" rx="16" fill="none" stroke="#0F172A" stroke-width="2.5"/>

  <!-- Top Yellow Cloud Title Header -->
  <g transform="translate(200, 8)">
    <rect x="0" y="0" width="560" height="40" rx="20" fill="#FEF08A" stroke="#F59E0B" stroke-width="2"/>
    <text x="280" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#0F172A" text-anchor="middle">${esc(
      content.title
    )}</text>
  </g>

  <!-- Bottom Educational Caption Strip -->
  <g transform="translate(16, 496)">
    <rect x="0" y="0" width="928" height="36" rx="10" fill="#FEF9C3" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="464" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0F172A" text-anchor="middle">
      ${esc(content.gradeTier === "kinder2" ? "Kinder 2" : "Grade 1")} ${esc(content.subject)} • ${esc(
    content.subtitle || content.title
  )}
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
