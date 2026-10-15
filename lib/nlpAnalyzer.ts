export interface LearnedTextbookContent {
  topic: string;
  pageNumber?: string;
  vocabulary: string[];
  readingPassage: string;
  guideQuestions: string[];
  exerciseItems: string[];
  instructions: string[];
  theme: string;
  rawText: string;
  confidenceScore: number;
}

/**
 * Stopwords to ignore when detecting topics and vocabulary
 */
const STOP_WORDS = new Set([
  "ang", "mga", "ng", "sa", "ay", "si", "sina", "ni", "nina", "kay", "kina",
  "at", "o", "nang", "may", "mayroon", "ito", "iyon", "iyan", "dito", "diyan",
  "doon", "ako", "ikaw", "siya", "kami", "tayo", "kayo", "sila", "ko", "mo",
  "niya", "namin", "natin", "ninyo", "nila", "kung", "kapag", "upang", "dahil",
  "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with",
  "is", "are", "was", "were", "be", "been", "by", "from", "that", "this", "it",
  "page", "pahina", "unit", "yunit", "aralin", "lesson", "chapter", "kabanata"
]);

/**
 * Intelligent NLP Analyzer for textbook pages
 * Extracts lesson title, key vocabulary, comprehension questions,
 * exercise items, and reading passages from raw OCR text.
 */
export function analyzeTextbookText(
  extractedText: string,
  subjectHint: string = "filipino",
  gradeHint: string = "grade1"
): LearnedTextbookContent {
  const cleanRaw = extractedText.replace(/\r/g, "").trim();
  const lines = cleanRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Extract Page Number
  let pageNumber: string | undefined;
  const pageMatch = cleanRaw.match(/(?:page|pahina|p\.|pp\.)\s*(\d+(?:\s*-\s*\d+)?)/i);
  if (pageMatch) {
    pageNumber = `p. ${pageMatch[1].trim()}`;
  }

  // 2. Extract Lesson Topic / Title
  let detectedTopic = "";
  
  // Strategy A: Explicit Lesson/Aralin/Unit markers
  for (const line of lines) {
    const markerMatch = line.match(
      /^(?:aralin|lesson|yunit|unit|kabanata|chapter|paksa)\s*(?:\d+|[ivxlcdm]+)?\s*[:\.\-–]\s*(.+)$/i
    );
    if (markerMatch && markerMatch[1].trim().length > 2) {
      detectedTopic = markerMatch[1].trim().replace(/^["']|["']$/g, "");
      break;
    }
  }

  // Strategy B: Prominent title near top (lines 0 to 6)
  if (!detectedTopic) {
    for (const line of lines.slice(0, 8)) {
      const stripped = line.replace(/^[0-9\.\-\–\s]+/, "").trim();
      // Skip pure page numbers, pure headers, or short gibberish
      if (
        stripped.length >= 4 &&
        stripped.length <= 60 &&
        !/^(?:page|pahina|deped|matatag|la consolacion|worktext|textbook|name|petsa|pangalan|grade)/i.test(stripped) &&
        !stripped.endsWith("?") &&
        !stripped.includes("...")
      ) {
        // Look for Title Case or ALL CAPS or significant phrase
        const words = stripped.split(/\s+/);
        if (words.length >= 1 && words.length <= 8) {
          detectedTopic = stripped.replace(/^["']|["']$/g, "");
          break;
        }
      }
    }
  }

  // Fallback topic if still empty
  if (!detectedTopic) {
    detectedTopic =
      subjectHint === "filipino"
        ? "Pagbasa at Pag-unawa sa Aralin"
        : subjectHint === "science"
        ? "Exploring Our World and Senses"
        : subjectHint === "math"
        ? "Numbers, Patterns, and Shapes"
        : "Foundational Language and Reading";
  }

  // 3. Extract Questions (lines with question marks or starting with question words)
  const questionWordsRegex = /^(?:sino|ano|saan|kailan|bakit|paano|alin|gaano|what|who|where|when|why|how|which|can you|do you)\b/i;
  const guideQuestions: string[] = [];

  for (const line of lines) {
    const trimmed = line.replace(/^\d+[\.\)]\s*/, "").trim();
    if (
      (trimmed.includes("?") || questionWordsRegex.test(trimmed)) &&
      trimmed.length > 8 &&
      trimmed.length < 160
    ) {
      // Normalize ending
      const normalizedQ = trimmed.endsWith("?") ? trimmed : `${trimmed}?`;
      if (!guideQuestions.includes(normalizedQ)) {
        guideQuestions.push(normalizedQ);
      }
    }
  }

  // 4. Extract Exercise / Activity Items (numbered lines or items under instructions)
  const exerciseItems: string[] = [];
  const instructions: string[] = [];
  const instructionRegex = /^(?:panuto|panuto:|piliin|isulat|tukuyin|bilugan|salungguhitan|pag-ugnayin|sagutin|punan|directions|instructions|choose|write|identify|circle|underline|match|complete|answer)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is an instruction
    if (instructionRegex.test(line) && line.length < 150) {
      if (!instructions.includes(line)) {
        instructions.push(line);
      }
      continue;
    }

    // Check if line is a numbered / bulleted exercise item
    const itemMatch = line.match(/^(\d+|[a-e])[\.\)]\s+(.+)$/i);
    if (itemMatch && itemMatch[2].length > 3) {
      const itemText = itemMatch[2].trim();
      if (!exerciseItems.includes(itemText)) {
        exerciseItems.push(itemText);
      }
    }
  }

  // 5. Extract Key Vocabulary and Concepts
  const vocabulary: string[] = [];
  const seenWords = new Set<string>();

  // Look for words in quotes ("salita"), words before colons, or bold/distinctive words
  const quotedMatches = cleanRaw.match(/["“]([^"”]{3,30})["”]/g);
  if (quotedMatches) {
    for (const q of quotedMatches) {
      const word = q.replace(/["“”]/g, "").trim();
      const lower = word.toLowerCase();
      if (!STOP_WORDS.has(lower) && word.length > 2 && !seenWords.has(lower)) {
        seenWords.add(lower);
        vocabulary.push(word);
      }
    }
  }

  // Look for capitalized content words throughout the text
  for (const line of lines) {
    // Skip all-caps heading lines
    if (line === line.toUpperCase() && line.length > 20) continue;

    const words = line.split(/[\s,\.\!;\:\(\)]+/);
    for (const w of words) {
      const cleanW = w.trim();
      const lower = cleanW.toLowerCase();
      if (
        cleanW.length >= 4 &&
        cleanW.length <= 20 &&
        /^[A-Z][a-z]+$/.test(cleanW) &&
        !STOP_WORDS.has(lower) &&
        !seenWords.has(lower) &&
        vocabulary.length < 10
      ) {
        seenWords.add(lower);
        vocabulary.push(cleanW);
      }
    }
  }

  // 6. Extract Reading Passage (find the longest coherent paragraphs)
  const paragraphCandidates = lines.filter(
    (l) =>
      l.length > 40 &&
      !instructionRegex.test(l) &&
      !/^\d+[\.\)]/.test(l) &&
      !l.endsWith("?")
  );

  const readingPassage =
    paragraphCandidates.slice(0, 3).join("\n") ||
    `Binasa at sinuri ng klase ang aralin tungkol sa "${detectedTopic}" mula sa batayang aklat.`;

  // 7. Infer Theme
  let theme = "Pagpapahalaga sa Sarili at Kapwa";
  const lowerText = cleanRaw.toLowerCase();
  if (
    lowerText.includes("pamilya") ||
    lowerText.includes("tatay") ||
    lowerText.includes("nanay") ||
    lowerText.includes("magulang") ||
    lowerText.includes("family")
  ) {
    theme = "Pagmamahal at Paggalang sa Pamilya (LCCP Care & Compassion)";
  } else if (
    lowerText.includes("kalikasan") ||
    lowerText.includes("halaman") ||
    lowerText.includes("hayop") ||
    lowerText.includes("nature") ||
    lowerText.includes("environment") ||
    lowerText.includes("plants")
  ) {
    theme = "Pangangalaga sa Kalikasan at Sangnilikha (Laudato Si')";
  } else if (
    lowerText.includes("kaibigan") ||
    lowerText.includes("kapwa") ||
    lowerText.includes("tulungan") ||
    lowerText.includes("share") ||
    lowerText.includes("friends")
  ) {
    theme = "Pagkakaibigan at Katarungan (Justice and Peace)";
  } else if (
    lowerText.includes("diyos") ||
    lowerText.includes("dasal") ||
    lowerText.includes("panalangin") ||
    lowerText.includes("god") ||
    lowerText.includes("prayer")
  ) {
    theme = "Pananampalataya at Pasasalamat sa Panginoon";
  }

  // Confidence calculation
  let score = 50;
  if (detectedTopic && detectedTopic.length > 3) score += 20;
  if (guideQuestions.length > 0) score += 10;
  if (exerciseItems.length > 0) score += 10;
  if (vocabulary.length >= 2) score += 10;

  return {
    topic: detectedTopic,
    pageNumber,
    vocabulary,
    readingPassage,
    guideQuestions,
    exerciseItems,
    instructions,
    theme,
    rawText: cleanRaw,
    confidenceScore: Math.min(score, 100),
  };
}
