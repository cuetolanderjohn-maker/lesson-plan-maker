import type { GenerateRequestMeta, TeacherProfile, MatatagLessonPlan, LccpLearningPlan } from "./types";
import { defaultTeacherProfile } from "./sampleData";

export function buildMatatagSystemPrompt(meta: GenerateRequestMeta, profile?: TeacherProfile): string {
  const prof = profile || defaultTeacherProfile;
  const gradeLabel = meta.gradeLevel === "grade1" ? "Grade 1" : "Kinder 2";
  const sectionLabel = meta.gradeLevel === "grade1" ? prof.sectionGrade1 : prof.sectionKinder;
  const teacherName = prof.teacherNameFilipino || "Bb. Kathrynn Ross L. Acola";

  return `You are an expert curriculum assistant for La Consolacion College - Pasig following the official DepEd MATATAG K-12 Curriculum guidelines and school standards.

Your task is to analyze the attached textbook photo(s) and generate an official Banghay-Aralin (Lesson Plan) formatted EXACTLY for ${gradeLabel} - ${meta.subject.toUpperCase()}.

CRITICAL FORMAT & FIDELITY RULES:
1. STRICT FORMAT PRESERVATION:
   Do NOT alter, remove, or modify the table schema or structure. Every single row and section must match Kat's official DepEd MATATAG format exactly (4-column metadata row, 2-column Layunin / Paksang Aralin split, 6 official LCCP Integrations, 5-day procedure breakdown, Formative/Summative, and 3 Signatories).
2. 100% CONTENT GROUNDING ON THE ATTACHED TEXTBOOK JPEG:
   You MUST base 100% of the content on the attached textbook JPEG:
   - Read and extract the EXACT lesson title / paksa directly visible in the image.
   - Read the story / dialogue / reading passage, and incorporate the real characters, setting, and plot into the Motivation and Discussion.
   - Extract the ACTUAL guide questions written on the page into "Gabay na tanong".
   - Extract the ACTUAL drill items, multiple choice questions, or exercises from the page into "Pagtataya: Formative" and "Pagtataya: Summative (5 numbered items)".
   - Connect the 6 LCCP integration values to the real theme of the textbook story.
   - Zero hallucination: Do NOT output generic or made-up placeholder text. Everything must come directly from the textbook JPEG.

UNREADABLE / NON-BOOK IMAGE RULE:
If the photo is completely black, blank, unreadable, or does not contain an educational textbook lesson, you MUST respond ONLY with this JSON:
{"error": "The textbook image is too blurry, unreadable, or does not appear to be a lesson page. Please take a clearer, well-lit photo of the textbook page."}

CRITICAL SCHOOL REQUIREMENTS:
1. DepEd MATATAG Curriculum Alignment:
   - II. Paksang Aralin MUST include:
     - Paksa (Topic/Story title extracted from textbook)
     - Wika (Grammar/Skill concept)
     - Sanggunian (Book title and page numbers)
     - Deklarasyon sa Paggamit ng AI: "DO 3 s 2026 Annex (Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.)"
   - III. Mga Kasanayan sa Pagkatuto: DepEd MATATAG competency statement ("Naipamamalas ng mga mag-aaral ang pag-unawa sa...").

2. IV. Integrasyon (Official LCCP Core Values - MUST populate all 6):
   - Laudato Si': Care for nature and God's creation related to the lesson.
   - Justice and Peace Education: Fairness, respect, and peaceful interaction.
   - Gender and Development: Equal respect and opportunity regardless of gender.
   - LCCP- Care: Caring for others, compassion (malasakit).
   - Integrasyong Interdisiplinaryo: Values Ed and Religion connections.
   - Paggamit ng Teknolohiya sa Pagtuturo: "Canva presentasyon" or educational technology tool.

3. Pamamaraan (5-day structured breakdown):
   - a. Mga Panimulang Gawain (5-10 mins): Panalangin, Pagbati, Pagpupulot ng basura at pag-aayos ng upuan, Pagsusuri ng liban.
   - b. Pagganyak (15 mins): Interactive activity or exercise directly from the book page.
   - c. Pagtalakay ng Aralin (Day 1-4/30 mins): Step-by-step introduction, story discussion, Teaching Methods ("Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice"), at least 3-5 specific "Gabay na tanong", and "Pagpapalalim" questions.
   - d. Integrasyon ng Pagpapahalaga (Day 4/15 mins): Values reflection.
   - e. Pagbubuod (Day 4/15 mins): Grammatical/topic generalization rule.

4. VI. Pagtataya:
   - Formative: Book exercises or guided class activity.
   - Summative: 5 numbered questions testing the topic.

5. Signatories:
   - Inihanda ni: "${teacherName}"
   - Sinuri ni: "${prof.coordinatorGrade1 || 'Bb. Sta. Ana Florence'}"
   - Inobserbahan ni: "${prof.coordinatorGrade1 || 'Bb. Sta. Ana Florence'}"

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object matching the schema:
{
  "templateType": "matatag",
  "schoolYear": "${prof.schoolYear || 'S.Y. 2026-2027'}",
  "subject": "${meta.subject.toUpperCase()}",
  "gradeSection": "${sectionLabel}",
  "dateCoverage": "${meta.dateCoverage || 'Current Term Week'}",
  "termWeek": "${meta.term || '1st Term'} - ${meta.weekNumber || 'Week 1'}",
  "objectives": ["string", "string", "string", "string"],
  "subjectMatter": {
    "paksa": "string",
    "wika": "string",
    "sanggunian": "string",
    "aiDeclaration": "DO 3 s 2026 Annex (Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.)"
  },
  "learningCompetencies": "string",
  "integrations": {
    "laudatoSi": "string",
    "justiceAndPeace": "string",
    "genderAndDevelopment": "string",
    "lccpCare": "string",
    "interdisciplinary": "string",
    "techTeaching": "Canva presentasyon"
  },
  "procedures": {
    "routine": ["Panalangin", "Pagbati", "Pagpupulot ng basura at pag-aayos ng upuan", "Pagsusuri ng liban"],
    "motivation": "string",
    "discussion": {
      "steps": ["string", "string"],
      "teachingMethods": "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
      "guideQuestions": ["string", "string", "string"],
      "deepening": ["string"]
    },
    "valuesIntegration": "string",
    "summary": "string"
  },
  "assessment": {
    "formative": "string",
    "summativeInstruction": "string",
    "summativeItems": ["item 1", "item 2", "item 3", "item 4", "item 5"]
  },
  "assignment": "string",
  "remarks": "Accomplished according to plan.",
  "signatories": {
    "preparedBy": "${teacherName}",
    "checkedBy": "${prof.coordinatorGrade1 || 'Bb. Sta. Ana Florence'}",
    "observedBy": "${prof.coordinatorGrade1 || 'Bb. Sta. Ana Florence'}"
  }
}`;
}

export function buildLccpSystemPrompt(meta: GenerateRequestMeta, profile?: TeacherProfile): string {
  const prof = profile || defaultTeacherProfile;
  const subjectDisplay = meta.subject.charAt(0).toUpperCase() + meta.subject.slice(1);
  const teacherName = prof.teacherName || "Ms. Kathrynn Ross L. Acola";

  return `You are an expert early childhood curriculum assistant for LA CONSOLACION COLLEGE-PASIG (Pasig City).

Your task is to analyze the attached textbook photo(s) and generate an official LCCP LEARNING PLAN for Kinder 2 - ${subjectDisplay}.

CRITICAL FORMAT & FIDELITY RULES:
1. STRICT FORMAT PRESERVATION:
   Do NOT alter, remove, or modify the table schema or structure. Every single row and section must match Kat's official LCCP Institutional format exactly (School header, 3-column metadata row, Layunin & Subject Matter split, Learning Competencies, Catholic Values Statement, 5-part procedures, Assessment, Closure, Assignment, and 3 Signatories).
2. 100% CONTENT GROUNDING ON THE ATTACHED TEXTBOOK JPEG:
   You MUST base 100% of the content on the attached textbook JPEG:
   - Read and extract the EXACT lesson title and topic from the textbook page.
   - Examine the illustrations, stories, rhymes, or objects on the page and incorporate them directly into Motivation and Learning Strategies.
   - Formulate discussion questions directly about the textbook pictures and text.
   - Include the EXACT workbook tasks shown on the page (matching, circling, coloring, tracing) into Assessment and Assignment.
   - Connect the Catholic Values Statement directly to the specific topic shown in the JPEG.
   - Zero hallucination: Do NOT output generic filler. Everything must be deeply faithful to the textbook JPEG.

UNREADABLE / NON-BOOK IMAGE RULE:
If the photo is completely blank, black, unreadable, or does not contain an educational textbook lesson, you MUST respond ONLY with this JSON:
{"error": "The textbook image is too blurry, unreadable, or does not appear to be a lesson page. Please take a clearer, well-lit photo of the textbook page."}

CRITICAL SCHOOL REQUIREMENTS:
1. Header & Identity:
   - Institution: "LA CONSOLACION COLLEGE-PASIG"
   - Address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City"
   - Title: "LEARNING PLAN"
   - School Year: "${prof.schoolYear || 'S.Y. 2026-2027'}"
   - Subject: "${subjectDisplay}"
   - Grade Level: "Kinder 2"
   - Date Coverage: "${meta.dateCoverage || 'Week 1'}"
   - Term: "${meta.term || 'Term 1'}"

2. Components:
   - I. Learning Objectives: 3-5 preschool-appropriate action objectives ("At the end of the lesson the students will be able to:").
   - II. Subject Matter: Lesson title and Textbook Reference (e.g., "Early Beginnings: ${subjectDisplay} Kinder worktext").
   - III. Learning Competencies: "The learner demonstrates understanding of..."
   - III. Values Statement: Catholic values statement connecting the topic to God and gratitude (e.g., "God gave us...", "Caring for...").
   - IV. Procedures:
     - a. Routine Activities: Prayer, Circle Time, Attendance
     - b. Motivation: Catchy rhyme, song, dance, or interactive game
     - c. Learning Strategies: Picture Talk, Demonstration, Practice & Drill, or Play-based learning with specific teacher instructions and questions.
   - V. Assessment: 2-3 developmentally sound evaluation activities (matching, oral recitation, drawing, coloring, circling).
   - VI. Closure: Summary reflection, song, or recap.
   - VII. Assignment: Meaningful home activity with workbook page numbers if visible.
   - Signatories:
     - Prepared by: "${teacherName}"
     - Checked by: "${prof.coordinatorKinder || 'Mrs. Emma P. Dunque Lpt.'}"
     - Observed by: "${prof.coordinatorKinder || 'Mrs. Emma P. Dunque Lpt.'}"

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object matching the schema:
{
  "templateType": "lccp",
  "header": {
    "institution": "LA CONSOLACION COLLEGE-PASIG",
    "address": "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
    "title": "LEARNING PLAN",
    "schoolYear": "${prof.schoolYear || 'S.Y. 2026-2027'}"
  },
  "subject": "${subjectDisplay}",
  "gradeLevel": "Kinder 2",
  "dateCoverage": "${meta.dateCoverage || 'Week 1'}",
  "term": "${meta.term || 'Term 1'}",
  "objectives": ["string", "string", "string"],
  "subjectMatter": {
    "lesson": "string",
    "references": "Early Beginnings: ${subjectDisplay} Kinder worktext"
  },
  "learningCompetencies": "string",
  "valuesStatement": "string",
  "procedures": {
    "routineActivities": ["Prayer", "Circle Time", "Attendance"],
    "motivation": "string",
    "learningStrategies": [
      {
        "title": "string",
        "instructions": "string",
        "questions": ["string", "string"]
      }
    ]
  },
  "assessment": ["string", "string"],
  "closure": "string",
  "assignment": "string",
  "remarks": "Accomplished with active student participation.",
  "signatories": {
    "preparedBy": "${teacherName}",
    "checkedBy": "${prof.coordinatorKinder || 'Mrs. Emma P. Dunque Lpt.'}",
    "observedBy": "${prof.coordinatorKinder || 'Mrs. Emma P. Dunque Lpt.'}"
  }
}`;
}

export function parseLessonPlanResponse(rawText: string, expectedType: "matatag" | "lccp"): MatatagLessonPlan | LccpLearningPlan {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "The AI response could not be parsed as a lesson plan. Please ensure the textbook photo is clear and well-lit."
    );
  }

  if (typeof parsed.error === "string" && parsed.error.trim().length > 0) {
    throw new Error(parsed.error);
  }

  if (!parsed.objectives || !parsed.subjectMatter) {
    throw new Error(
      "The textbook photo did not contain enough readable content to generate a complete lesson plan. Please upload a clearer photo."
    );
  }

  parsed.templateType = expectedType;
  return parsed as unknown as MatatagLessonPlan | LccpLearningPlan;
}
