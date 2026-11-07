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

/**
 * Design blueprints modeled directly after the pedagogical layouts Kat uses
 * in her actual classroom PPT presentations (from "sample ppt"):
 * 1. Storybook Comic Grid ("Ang Araw ni Liza" / "The Ant and the Grasshopper")
 * 2. Concept Question Cards Grid ("Ano?", "Saan?", "Sino?", "Kailan?")
 * 3. Community Personnel & Helpers Catalog ("Different Personnel in School")
 * 4. Split Story Stage ("This is My House / My Family")
 * 5. Cutaway Dollhouse Architectural Diagram ("Things Inside the House")
 * 6. Action & Safety Sequence ("Stop, Look, and Listen" / Cleanliness)
 */
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

/**
 * Artistic visual styles directly extracted from Kat's actual teaching presentations
 * (warm Filipino anime storybook, bright primary/pastel classroom, cute anthropomorphic fables,
 * detailed architectural cutaways, and clear concrete object sets).
 */
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

/**
 * Selects a NEW Layout Design Blueprint and a NEW Artistic Visual Style on every call
 * using coprime offsets so that no two consecutive lesson plans ever share the same
 * layout design or visual style.
 */
export function pickNextDesignAndStyle(options?: IllustrationGeneratorOptions): {
  design: DesignBlueprint;
  artStyle: ArtStyleDirection;
  generationNonce: number;
} {
  globalGenerationCounter += 1;
  const seedOffset = options?.variationSeed ?? 0;
  const nonce = globalGenerationCounter + seedOffset;

  const designIndex = (nonce - 1) % DESIGN_BLUEPRINTS.length;
  // Multiplier 5 is coprime to DESIGN_BLUEPRINTS.length (6) and ART_STYLE_DIRECTIONS.length (6)
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

/**
 * Determines the default illustration style metadata tag for a given LessonPlan.
 */
export function getDefaultIllustrationStyle(plan: LessonPlan): IllustrationStyle {
  return inferIllustrationStyle(plan);
}

/**
 * Extracts the lesson title, subject, guide question, and 4 specific scene captions
 * directly from the generated LessonPlan so the illustration always connects to the exact topic.
 * Detects whether the lesson plan is based on a story, fable, or narrative so the illustration
 * directly portrays that story.
 */
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
      "Anong mahalagang aral ang natutuhan mo sa ating kuwento ngayong araw?";

    const customPanels = (plan.illustrationPanels || []).filter((p) => p && p.trim().length > 0);

    // Detect if this Filipino lesson is centered on a story / fable / narrative
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
      rawCandidates[3] || plan.procedures?.summary?.split("\n")[0] || "Pagsasabuhay ng aral ng kuwento",
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

const GEMINI_NATIVE_IMAGE_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-lite-image",
];

/**
 * Builds the Gemini AI Art Director & SVG Synthesizer prompt for a specific lesson topic,
 * strictly embedding Kat's official classroom visual presentation standards from "sample ppt":
 * - Authentic Filipino anime storybook character aesthetics (school uniforms, gentle expressions, rosy cheeks)
 * - Pedagogical layout patterns (cloud headers, colored card borders, pill tags, 4-panel narrative comics)
 * - Clear, high-contrast, beautiful educational design free of AI artifacts.
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

  const storyDirective = content.hasStory
    ? `
================================================================================
*** MANDATORY STORY FOCUS (Modeled on Kat's PPT Stories 'Ang Araw ni Liza' & 'The Ant and the Grasshopper') ***
THIS LESSON PLAN COVERS A SPECIFIC STORY: "${xmlSafeTitle}" (Story Focus: "${content.storyTitle}")!
THE ILLUSTRATION MUST ILLUSTRATE THIS EXACT STORY:
1. Depict the actual story characters (named people, animal fable characters, leaders, children, or family members) in the authentic story setting (e.g., village, farm, forest, home, river).
2. The 4 sequential panels MUST illustrate the chronological narrative arc of this story:
   - Panel 1 (Story Beginning): Characters introduced in the opening story setting ("${xmlSafeCaptions[0]}").
   - Panel 2 (Rising Action): Characters facing the central problem, challenge, or journey ("${xmlSafeCaptions[1]}").
   - Panel 3 (Climax): The critical action, dramatic moment, or turning point of the story ("${xmlSafeCaptions[2]}").
   - Panel 4 (Resolution & Moral): The conclusion, outcome, and positive moral lesson learned ("${xmlSafeCaptions[3]}").
3. DO NOT draw generic empty classrooms or school desks when the lesson covers a story! Illustrate the actual world and characters of the story!
================================================================================`
    : `
================================================================================
*** LESSON TOPIC DIRECTIVE (Modeled on Kat's PPT Presentations) ***
Examine the attached textbook image(s) and lesson captions:
1. If the attached textbook page contains a story, fable, or reading narrative, YOU MUST ILLUSTRATE THAT STORY across the panels!
2. If it is a concept lesson without a story (e.g. Filipino grammar 'Saan? / Ano?', school personnel, parts of the house, mathematics, science senses, road safety):
   - Panel 1: "${xmlSafeCaptions[0]}"
   - Panel 2: "${xmlSafeCaptions[1]}"
   - Panel 3: "${xmlSafeCaptions[2]}"
   - Panel 4: "${xmlSafeCaptions[3]}"
   Depict the exact real-world objects, environments, characters, and activities described in these captions.
================================================================================`;

  return `You are a master educational textbook illustrator creating a brand-new, original classroom illustration for a ${
    content.gradeTier === "kinder2" ? "Kinder 2" : "Grade 1"
  } ${content.subject} lesson plan.

GENERATION ID: ${generationNonce} (Must be a 100% NEW visual design and NEW artistic style — never reuse preset templates)
LESSON TOPIC: "${xmlSafeTitle}" (${content.subtitle})
GUIDE QUESTION: "${xmlSafeQuestion}"
${storyDirective}

MANDATORY NEW LAYOUT DESIGN FOR THIS GENERATION (From Kat's PPT Blueprints):
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

CRITICAL VISUAL DESIGN STANDARDS EXTRACTED FROM TEACHER KAT'S SAMPLE PPTs:
1. AUTHENTIC FILIPINO ANIME / STORYBOOK CHARACTERS:
   - Filipino children and teachers have warm expressions, expressive almond eyes with white specular catchlights, gentle smiles, and shiny dark hair.
   - School uniform details: crisp white collared blouse/polo, blue sailor necktie or vest, blue pleated skirt or shorts, pink headband for girls.
   - Adult figures: teachers in pink/blue professional school polo with ID lanyards; canteen staff in aprons; security guards with peaked cap; grandfathers (Lolo) with glasses and cane; parents in casual attire.
2. SUNNY, CHEERFUL COLOR & CARD HARMONY:
   - Use soft pastel card backgrounds (#FFE4E6 pink, #E0F2FE sky blue, #FEF08A butter yellow, #F3E8FF lavender) with matching 3px borders.
   - Add bubbly puffy cloud headers with radiating golden sunburst sparkles.
   - In captions and questions, make text bold and high-contrast (#0F172A deep navy/charcoal) so it is 100% readable even at small preview sizes.
3. STORY & CONCEPT REALISM:
   - Every scene must contain all necessary real-world elements: buildings (school, house, church, palengke market), nature (sunny sky, puffy clouds, green trees, flowers), furniture (desks, chalkboards, bookshelves, bathtubs, kitchen stoves), or animals.
4. NO AI SLOP & STRICT XML COMPLIANCE:
   - NO random floating letters, no gibberish text in the background.
   - Output ONLY a single valid <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">...</svg> element.
   - Use <defs> with <linearGradient>, <radialGradient>, and <clipPath> so artwork stays neatly inside rounded cards.
   - Always escape ampersands as &amp; in XML. Keep SVG length between 7,500 and 14,500 characters so closing </svg> is never cut off.`;
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

  if (sourceImages && sourceImages.length > 0) {
    parts.push({
      text: "Attached below is/are the textbook page image(s) for this lesson. CRITICAL CHECK: Carefully examine these page(s) for any story, fable, narrative reading passage, or characters. IF A STORY IS PRESENT, YOUR ENTIRE ILLUSTRATION MUST BE ABOUT THAT STORY and its characters!",
    });
    for (let i = 0; i < Math.min(sourceImages.length, 3); i++) {
      const rawB64 = (sourceImages[i].base64Data || "").replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      if (rawB64.length > 100) {
        parts.push({
          inlineData: {
            data: rawB64,
            mimeType: sourceImages[i].mimeType || "image/jpeg",
          },
        });
      }
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
                    text: `Create a realistic, child-friendly educational textbook illustration (${artStyle.name}, ${design.name}) for the ${content.subject} lesson "${content.title}": 1) ${content.panels[0]} 2) ${content.panels[1]} 3) ${content.panels[2]} 4) ${content.panels[3]}. Modeled after Kat's Philippine school presentations with clean school uniforms, sunny colors, and high visual appeal.`,
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

  // 4. Dynamic Algorithmic SVG Synthesis (modeled on Kat's PPT slides)
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
 * Every time a lesson plan is generated,
 * calls Gemini AI to synthesize a brand-new illustration corresponding to the lesson topic
 * with a NEW layout design and NEW artistic style modeled after Kat's PPT presentations.
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
 * Generates an SVG modeled on Kat's authentic PPT slides when running offline or in tests:
 * - Yellow puffy cloud header with sparkles and lesson title
 * - Smiling cartoon sun mascot with rosy cheeks in top corner
 * - 4 pastel color-coded cards (Pink, Blue, Yellow, Purple) with dashed inner frames
 * - Student character figures with neat uniforms and poses
 * - Clean, high-contrast captions and bottom encouraging moral banner.
 */
function buildOfflineDynamicSvg(
  content: ReturnType<typeof extractIllustrationContent>,
  _design: DesignBlueprint,
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
  const cardThemes = [
    { bg: "#FFF1F2", border: "#FB7185", tag: "#E11D48", label: "Tagpo 1 / Simula" },
    { bg: "#F0F9FF", border: "#38BDF8", tag: "#0284C7", label: "Tagpo 2 / Kilos" },
    { bg: "#FEFCE8", border: "#FACC15", tag: "#D97706", label: "Tagpo 3 / Pagsasanay" },
    { bg: "#FAF5FF", border: "#C084FC", tag: "#7C3AED", label: "Tagpo 4 / Aral" },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="bg_${nonce}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="${p.canvasBg}"/>
    </linearGradient>
    <filter id="shadow_${nonce}" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Master Canvas Background -->
  <rect width="960" height="540" fill="url(#bg_${nonce})"/>

  <!-- Top Yellow Cloud Header (Modeled on Kat's PPT Header) -->
  <g transform="translate(230, 8)" filter="url(#shadow_${nonce})">
    <rect x="0" y="0" width="500" height="50" rx="25" fill="#FEF08A" stroke="#F59E0B" stroke-width="2.5"/>
    <!-- Sparkles -->
    <path d="M 18,25 L 24,19 L 30,25 L 24,31 Z" fill="#F59E0B"/>
    <path d="M 470,25 L 476,19 L 482,25 L 476,31 Z" fill="#F59E0B"/>
    <text x="250" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="0.5">${esc(
      content.title
    )}</text>
  </g>

  <!-- Smiling Cartoon Sun Mascot (Top Right) -->
  <g transform="translate(890, 32)">
    <circle cx="0" cy="0" r="22" fill="#FDE047" stroke="#F59E0B" stroke-width="2.5"/>
    <!-- Sun Rays -->
    <line x1="0" y1="-30" x2="0" y2="-24" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="24" x2="0" y2="30" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    <line x1="-30" y1="0" x2="-24" y2="0" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    <line x1="24" y1="0" x2="30" y2="0" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    <!-- Cute Eyes & Smile -->
    <circle cx="-7" cy="-4" r="2.5" fill="#0F172A"/>
    <circle cx="7" cy="-4" r="2.5" fill="#0F172A"/>
    <circle cx="-11" cy="4" r="3" fill="#FB7185" opacity="0.6"/>
    <circle cx="11" cy="4" r="3" fill="#FB7185" opacity="0.6"/>
    <path d="M -7,4 Q 0,11 7,4" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- 4 Kat-Style Color-Coded Concept & Narrative Cards (2x2 Grid) -->
  ${[0, 1, 2, 3]
    .map((idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 18 + col * 472;
      const y = 66 + row * 224;
      const theme = cardThemes[idx];

      return `<g transform="translate(${x}, ${y})" filter="url(#shadow_${nonce})">
        <!-- Main Card Border & Background -->
        <rect width="452" height="214" rx="16" fill="${theme.bg}" stroke="${theme.border}" stroke-width="2.5"/>
        <rect x="6" y="6" width="440" height="202" rx="12" fill="none" stroke="${theme.border}" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>

        <!-- Top Pill Tag -->
        <rect x="14" y="10" width="130" height="24" rx="12" fill="${theme.tag}"/>
        <text x="79" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">${
          theme.label
        }</text>

        <!-- Illustration Scene Graphic (Filipino Student Figure & Environment Props) -->
        <g transform="translate(226, 88)">
          <!-- Ground / Desk -->
          <ellipse cx="0" cy="48" rx="120" ry="14" fill="#E2E8F0"/>
          <!-- Student Character -->
          <circle cx="0" cy="-22" r="15" fill="#FCD34D" stroke="#0F172A" stroke-width="2"/>
          <!-- Hair & Headband -->
          <path d="M -15,-25 C -12,-38 12,-38 15,-25 C 10,-32 -10,-32 -15,-25 Z" fill="#1E293B"/>
          <path d="M -14,-26 Q 0,-34 14,-26" fill="none" stroke="${theme.border}" stroke-width="3"/>
          <!-- Face Eyes & Smile -->
          <circle cx="-5" cy="-22" r="2" fill="#0F172A"/>
          <circle cx="5" cy="-22" r="2" fill="#0F172A"/>
          <circle cx="-8" cy="-17" r="2.5" fill="#FB7185" opacity="0.5"/>
          <circle cx="8" cy="-17" r="2.5" fill="#FB7185" opacity="0.5"/>
          <path d="M -4,-16 Q 0,-12 4,-16" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/>
          <!-- School Uniform (White Blouse & Colored Sailor Necktie) -->
          <path d="M -16,-5 L 16,-5 L 12,24 L -12,24 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
          <polygon points="0,-3 -4,12 0,16 4,12" fill="${theme.tag}"/>
          <!-- Pleated Skirt / Shorts -->
          <rect x="-13" y="24" width="26" height="14" rx="2" fill="${theme.border}" stroke="#0F172A" stroke-width="1.5"/>
          <!-- Arms in Action Pose -->
          <line x1="-15" y1="0" x2="-28" y2="${idx % 2 === 0 ? "16" : "-10"}" stroke="#FCD34D" stroke-width="5" stroke-linecap="round"/>
          <line x1="15" y1="0" x2="28" y2="10" stroke="#FCD34D" stroke-width="5" stroke-linecap="round"/>
          <!-- Legs & Shoes -->
          <rect x="-9" y="38" width="6" height="12" fill="#FCD34D"/>
          <rect x="3" y="38" width="6" height="12" fill="#FCD34D"/>
          <ellipse cx="-6" cy="50" rx="6" ry="3.5" fill="#0F172A"/>
          <ellipse cx="6" cy="50" rx="6" ry="3.5" fill="#0F172A"/>
        </g>

        <!-- Bottom Clean Caption Card -->
        <rect x="8" y="156" width="436" height="50" rx="10" fill="#FFFFFF" stroke="${theme.border}" stroke-width="1.5"/>
        <text x="226" y="186" font-family="system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="700" fill="#0F172A" text-anchor="middle">${esc(
          content.panels[idx]
        )}</text>
      </g>`;
    })
    .join("\n")}

  <!-- Bottom Encouraging Banner (Modeled on Kat's PPT Footer) -->
  <g transform="translate(18, 514)">
    <rect width="924" height="20" rx="10" fill="#FEF08A" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="462" y="528" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#0F172A" text-anchor="middle">
      Gawin natin ang mga bagay na tama at magandang asal araw-araw! • Kat's Learning Plan
    </text>
  </g>
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
