import type {
  GenerateRequestMeta,
  TeacherProfile,
  LessonPlan,
  MatatagLessonPlan,
  LccpLearningPlan,
} from "./types";
import { defaultTeacherProfile } from "./sampleData";
import { generateFallbackPngDataUri, getDefaultIllustrationStyle } from "./lessonIllustrationGenerator";


export function buildMatatagSystemPrompt(
  meta: GenerateRequestMeta,
  profile: TeacherProfile = defaultTeacherProfile
): string {
  const isGrade1 = meta.gradeLevel === "grade1";
  const gradeSection = isGrade1
    ? profile.sectionGrade1 || "Grade 1 - OLOPH & OLOG"
    : profile.sectionKinder || "Kinder 2";
  const defaultBook = isGrade1
    ? "Gr.1 Dawani"
    : "Masayang Mag-aaral ng Filipino";
  const bookRef = meta.bookReference?.trim() || defaultBook;
  const termWeek = `${meta.term || (isGrade1 ? "1st term" : "1st Term")}-${
    meta.weekNumber ? meta.weekNumber.toLowerCase() : "week 1"
  }`;
  const preparedBy = isGrade1
    ? profile.teacherNameFilipino || "Bb. Kathrynn Ross L. Acola"
    : "Acola, Kathrynn Ross L.";
  const coordinator = isGrade1
    ? profile.coordinatorGrade1 || "Bb. Sta. Ana Florence"
    : "Emma P. Dunque, LPT.";

  return `You are an expert Filipino curriculum designer for ${profile.schoolName} (${profile.schoolAddress}), creating a lesson plan that copies the EXACT format and writing style of Teacher Kathrynn Ross L. Acola's official "Banghay- Aralin sa FILIPINO" files.

Analyze the attached textbook/worktext image(s) carefully. Extract the exact story title, characters, grammar/skill focus (Wika) or letter/sound focus (Titik), page numbers, vocabulary words (Talasalitaan), comprehension questions, and exercises shown in the image(s).
NEVER invent generic placeholder content when real titles, stories, or exercises are visible in the image(s).
If the uploaded image is completely unreadable or blank, return ONLY: {"error": "The textbook image is too blurry or dark to read clearly. Please upload a clearer photo of the lesson page."}

Follow Teacher Kat's EXACT Banghay-Aralin work pattern:
1. Header & Metadata:
   - schoolYear: "${profile.schoolYear}"
   - subject: "FILIPINO"
   - gradeSection: "${gradeSection}"
   - dateCoverage: "${meta.dateCoverage || "October 26-30, 2026"}"
   - termWeek: "${termWeek}"
2. I. Mga Layunin sa Pagkatuto (objectives):
   - 3 clear, behavioral learning objectives in Filipino starting with action verbs ("Natutukoy...", "Naiuugnay...", "Nakabubuo...", "Naisusulat...", "Nabibigkas...").
3. II. Paksang Aralin (subjectMatter):
   - paksa: Exact story title or lesson title from the book (e.g., "Iyan ang lider" or "Ang Sinturon at ang Sapatos ni Siso").
   - wika: Exact grammar or language topic from the book (for Grade 1, e.g., "Pantukoy na Ito, Iyan, at Iyon"; for Kinder 2, the target letter/sound e.g. "Titik Ss").
   - sanggunian: "${bookRef}" (append exact page numbers if visible in the photo, e.g. "${bookRef}, pp. 154-157").
   - aiDeclaration: "DO 3 s 2026 Annex (Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)\\nAng banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12."
4. III. Mga Kasanayan sa Pagkatuto (learningCompetencies):
   - Single comprehensive paragraph in Filipino starting with "${
     isGrade1
       ? "Naipamamalas ng mga mag-aaral ang pag-unawa sa"
       : "Naipapakita ng mag-aaral ang pag-unawa sa"
   }..."
5. IV. Integrasyon (integrations):
   - laudatoSi ("Laudato Si"): Specific environmental/stewardship integration connected to the lesson in Filipino (e.g., "Nagpapakita ng pagmamahal sa kalikasan...").
   - justiceAndPeace ("Justice and Peace Education"): Specific peace/fairness integration connected to the story in Filipino (e.g., "Sa kwento ay nagpapakita na...").
   - genderAndDevelopment ("Gender and Development"): Specific gender equality integration in Filipino (e.g., "Nagpapakita na kahit ano pa ang iyong kasarian ay...").
   - lccpCare ("LCCP- Care"): Specific compassion/malasakit integration in Filipino (e.g., "Ipinapakita sa kwento ang pagmamalasakit...").
   - interdisciplinary: "${
     isGrade1
       ? "Values Ed: [specific value learned]\\nReligion: [specific Christian/faith connection]"
       : "Values Ed: [specific value learned]"
   }"
   - techTeaching: "Canva presentasyon"
6. V. Pamamaraan (procedures):
   - routine: ${JSON.stringify(
     isGrade1
       ? [
           "Panalangin",
           "Pagbati",
           "Pagpupulot ng basura at pag aayos ng upuan",
           "Pagsusuri ng liban",
         ]
       : [
           "Pagpupulot ng basura at pag aayos ng upuan",
           "Minuto para gumamit ng comfort room",
         ]
   )}
   - motivation: Specific motivational question, picture prompt, or Talasalitaan activity from the book (include page number if visible).
   - discussion.steps: 4 to 5 bullet steps in Teacher Kat's exact style:
     * "Ipapakilala ng guro ang kuwentong babasahin at ito ay, “[Story Title]”."
     * "Magkakaroon ng katanungan ang guro tungkol sa binasang kwento."
     * "Ipapaliwanag ng guro ang kahulugan ng [Grammar/Wika Concept]."
     * "Magbibigay ng halimbawa ang guro."
     * "Hihingi ang guro ng halimbawa ng pangungusap gamit ang [Concept] sa mga estudyante."
   - discussion.teachingMethods: "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice"
   - discussion.guideQuestions: 3 to 4 comprehension questions based directly on the story ("Sino...", "Ano...", "Bakit...", "Kung ikaw...").
   - discussion.deepening: 2 reflection questions ("Bakit mahalagang matutunan ang ...?", "Ano ang epekto nito sa pakikipag usap sa araw araw na buhay?").
   - valuesIntegration: "Ipapaliwanag ng guro ang kahalagahan ng ..."
   - summary: Concise definitions and examples of each key concept from the lesson (e.g. "[Konsepto] – ginagamit kapag... Halimbawa: ...").
7. VI- Pagtataya (assessment):
   - formative: Specific book page exercises from the photo (e.g., "Sagutan ang pahina 156 (Kulayan ang bilog...)\\nSagutan ang pahina 157 (Isulat sa patlang...)").
   - summativeInstruction: "PAGSASANAY: [Topic]\\nPanuto: [Clear Filipino directions]"
   - summativeItems: 5 numbered test items in Filipino matching the lesson topic.
8. VII- Takdang- Aralin (assignment):
   - Notebook or textbook homework in Teacher Kat's style (e.g. "Gumawa ng tatlong pangungusap gamit ang [Topic] sa Filipino kwaderno at ipapasa sa biyernes.").
9. Mga Tala at Pagninilay (remarks):
   - Set to "" (empty string so Teacher Kat can write handwritten reflections after class).
10. Signatories:
   - preparedBy: "${preparedBy}"
   - checkedBy: "${coordinator}"
   - observedBy: "${coordinator}"

Return ONLY a valid JSON object matching this exact schema:
{
  "templateType": "matatag",
  "schoolYear": "${profile.schoolYear}",
  "subject": "FILIPINO",
  "gradeSection": "${gradeSection}",
  "dateCoverage": "string",
  "termWeek": "${termWeek}",
  "objectives": ["string", "string", "string"],
  "subjectMatter": {
    "paksa": "string",
    "wika": "string",
    "sanggunian": "string",
    "aiDeclaration": "DO 3 s 2026 Annex (Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)\\nAng banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12."
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
    "routine": ["string"],
    "motivation": "string",
    "discussion": {
      "steps": ["string"],
      "teachingMethods": "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
      "guideQuestions": ["string"],
      "deepening": ["string"]
    },
    "valuesIntegration": "string",
    "summary": "string"
  },
  "assessment": {
    "formative": "string",
    "summativeInstruction": "string",
    "summativeItems": ["string", "string", "string", "string", "string"]
  },
  "assignment": "string",
  "remarks": "",
  "signatories": {
    "preparedBy": "${preparedBy}",
    "checkedBy": "${coordinator}",
    "observedBy": "${coordinator}"
  },
  "illustrationCaption": "Short Filipino caption describing the visual story/activity scene from the textbook",
  "illustrationPanels": [
    "Panel 1 story/concept caption in Filipino",
    "Panel 2 story/concept caption in Filipino",
    "Panel 3 story/concept caption in Filipino",
    "Panel 4 story/concept caption in Filipino"
  ]
}`;
}

export function buildLccpSystemPrompt(
  meta: GenerateRequestMeta,
  profile: TeacherProfile = defaultTeacherProfile
): string {
  const subjectMap: Record<string, string> = {
    language: "Language",
    science: "Science",
    math: "Mathematics",
    rve: "RVE",
    filipino: "Filipino",
  };
  const displaySubject = subjectMap[meta.subject] || "Language";

  const defaultReferenceMap: Record<string, string> = {
    language: "Early Beginnings: Language Kinder worktext",
    science: "Early Beginnings: Science Kinder worktext",
    math: "Early Beginnings: Mathematics Kinder worktext",
    rve: "Seed of Faith Christian Life and Character Education Series",
    filipino: "Masayang Mag-aaral ng Filipino",
  };
  const bookRef =
    meta.bookReference?.trim() ||
    defaultReferenceMap[meta.subject] ||
    "Early Beginnings Kinder worktext";

  const weekDate = meta.dateCoverage
    ? `${meta.weekNumber || "Week 6"} – ${meta.dateCoverage}`
    : `${meta.weekNumber || "Week 6"} – August 17-21, 2026`;
  const termLabel = meta.term?.replace(/1st\s+Term/i, "Term 1").replace(/2nd\s+Term/i, "Term 2") || "Term 1";

  return `You are an expert Kinder 2 curriculum designer for ${profile.schoolName} (${profile.schoolAddress}), creating a learning plan that copies the EXACT format and writing style of Teacher Kathrynn Ross L. Acola's official LCCP Learning Plans for ${displaySubject}.

Analyze the attached textbook/worktext image(s) carefully. Extract the exact lesson title, concepts, bible verse (if RVE), examples, and worktext page activities shown in the image(s).
If the uploaded image is completely unreadable or blank, return ONLY: {"error": "The textbook image is too blurry or dark to read clearly. Please upload a clearer photo of the lesson page."}

Follow Teacher Kat's EXACT LCCP Learning Plan work pattern for ${displaySubject}:
1. Header & Metadata:
   - institution: "LA CONSOLACION COLLEGE-PASIG"
   - address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City"
   - title: "LEARNING PLAN"
   - schoolYear: "${profile.schoolYear}"
   - subject: "${displaySubject}"
   - gradeLevel: "Kinder 2"
   - dateCoverage: "${weekDate}"
   - term: "${termLabel}"
2. I Learning Objectives (objectives):
   - 3 clear, child-friendly objectives starting with action verbs ("Identify...", "Color...", "Count...", "Demonstrate...", "Show...").
3. II Subject Matter (subjectMatter):
   - lesson: Exact lesson title from the textbook page.
   - references: "${bookRef}" (include page numbers if visible).
4. III - Learning Competencies (learningCompetencies):
   - For Science/Language: "Demonstrate understanding/awareness of..." (or "" if not applicable).
5. III- Values Statement (valuesStatement):
   - ${
     meta.subject === "rve"
       ? 'For RVE: MUST start with `Bible verse: “[Exact Bible Verse from the lesson]” – [Scripture Reference]`.'
       : meta.subject === "math"
       ? 'For Mathematics: First-person child values statement thanking God (e.g., "I use numbers and shapes to learn and solve problems. I try my best, share with my classmates, and thank God for my mind that helps me count, think, and grow.").'
       : 'God-centered values statement connected to the lesson (e.g., "God gave us... When we take care of..., we show respect and gratitude to God and our family.").'
   }
6. IV- Procedures (procedures):
   - routineActivities: ["Prayer", "Attendance", "Circle Time"]
   - motivation: Engaging song, rhyme, picture talk, or story + optional "Guide Question:\\n1. ...\\n2. ...".
   - learningStrategies ("c. Learning Strategies"): 2 to 3 strategies using Teacher Kat's exact strategy titles:
     * For Mathematics: "Practice and Drill", "Play base"
     * For Science / Language: "Show and Tell", "Demonstration", "Instruction", "Art of questioning", "Play based"
     * For RVE: "Play based (sharing what you have)", "Demonstration (Sharing the message)"
7. V- Assessment (assessment):
   - 2 to 3 specific worktext exercises with page numbers if visible.
8. VI- Closure (closure):
   - 1 to 2 sentences wrapping up the lesson and reinforcing the core value.
9. VII- Assignment (assignment):
   - Home activity, worktext page, or video recitation of the value statement.
10. Remarks (remarks):
   - Set to "" (blank space for handwritten teacher notes).
11. Signatories:
   - preparedBy: "${profile.teacherName || "Ms. Kathrynn Ross L. Acola"}"
   - checkedBy: "${profile.coordinatorKinder || "Mrs. Emma P. Dunque Lpt."}"
   - observedBy: "${profile.coordinatorKinder || "Mrs. Emma P. Dunque Lpt."}"
12. Optional ADIDSE block (adidse):
   - Always populate the "adidse" object when subject is "RVE" (and optionally for other subjects) so the 5-Column Landscape Augustinian Lectio-Divina (ADIDSE) table is also available.

Return ONLY a valid JSON object matching this exact schema:
{
  "templateType": "lccp",
  "rveFormat": "${meta.rveFormat || "portrait"}",
  "header": {
    "institution": "LA CONSOLACION COLLEGE-PASIG",
    "address": "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
    "title": "LEARNING PLAN",
    "schoolYear": "${profile.schoolYear}"
  },
  "subject": "${displaySubject}",
  "gradeLevel": "Kinder 2",
  "dateCoverage": "${weekDate}",
  "term": "${termLabel}",
  "objectives": ["string", "string", "string"],
  "subjectMatter": {
    "lesson": "string",
    "references": "string"
  },
  "learningCompetencies": "string",
  "valuesStatement": "string",
  "procedures": {
    "routineActivities": ["Prayer", "Attendance", "Circle Time"],
    "motivation": "string",
    "learningStrategies": [
      {
        "title": "string",
        "instructions": "string",
        "questions": ["string"]
      }
    ]
  },
  "assessment": ["string", "string"],
  "closure": "string",
  "assignment": "string",
  "remarks": "",
  "signatories": {
    "preparedBy": "${profile.teacherName || "Ms. Kathrynn Ross L. Acola"}",
    "checkedBy": "${profile.coordinatorKinder || "Mrs. Emma P. Dunque Lpt."}",
    "observedBy": "${profile.coordinatorKinder || "Mrs. Emma P. Dunque Lpt."}"
  },
  "adidse": {
    "unitTitle": "FIRST TERM\\nUNIT I: God is good to us",
    "lessonTitle": "string",
    "sectionName": "KINDER 2 – OUR LADY OF CONSOLATION",
    "weekDate": "${weekDate}",
    "valueFocus": "string",
    "references": "Seed of faith, God’s Gift of Character, Bible",
    "materialsNeeded": "Textbook, Crayons, Laptop, Tv",
    "integritas": "Arts – Drawing and Coloring",
    "coreValues": {
      "laudatoSi": "string",
      "justiceAndPeace": "string",
      "genderAndDevelopment": "string",
      "lccpCare": "string"
    },
    "routineActivities": [
      "Opening Prayer",
      "Flag ceremony",
      "What’s the weather today?",
      "Checking of Attendance",
      "Sharing of Feelings"
    ],
    "lectio": "string",
    "meditatio": ["string", "string"],
    "oratio": "string",
    "contemplatio": "string",
    "communicatio": "Sharing the message of faith.",
    "inputDeepening": "string",
    "furtherDiscussion": "string",
    "closingSong": "Closing Song",
    "closingPrayer": "Closing Prayer",
    "synthesis": ["string", "string"],
    "evaluation": ["string", "string"]
  },
  "illustrationCaption": "Short child-friendly caption describing the textbook illustration/story scene",
  "illustrationPanels": [
    "Panel 1 story/concept caption from the textbook",
    "Panel 2 story/concept caption from the textbook",
    "Panel 3 story/concept caption from the textbook",
    "Panel 4 story/concept caption from the textbook"
  ]
}`;
}

export function parseLessonPlanResponse(
  rawText: string,
  expectedTemplate: "matatag" | "lccp"
): LessonPlan {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response from AI vision model.");
  }

  let cleaned = rawText.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "The AI vision response could not be parsed as a structured lesson plan. Please try scanning again."
    );
  }

  if (typeof parsed.error === "string" && parsed.error.trim().length > 0) {
    throw new Error(parsed.error);
  }

  if (expectedTemplate === "matatag" || parsed.templateType === "matatag") {
    const p = parsed as Partial<MatatagLessonPlan>;
    return {
      templateType: "matatag",
      schoolYear: p.schoolYear || "S.Y. 2026-2027",
      subject: p.subject || "FILIPINO",
      gradeSection: p.gradeSection || "Grade 1 - OLOPH & OLOG",
      dateCoverage: p.dateCoverage || "",
      termWeek: p.termWeek || "1st term-week 1",
      objectives: Array.isArray(p.objectives) ? p.objectives : [],
      subjectMatter: {
        paksa: p.subjectMatter?.paksa || "Aralin sa Filipino",
        wika: p.subjectMatter?.wika || "",
        sanggunian: p.subjectMatter?.sanggunian || "Gr.1 Dawani",
        aiDeclaration:
          p.subjectMatter?.aiDeclaration ||
          "DO 3 s 2026 Annex (Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)\nAng banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.",
      },
      learningCompetencies: p.learningCompetencies || "",
      integrations: {
        laudatoSi: p.integrations?.laudatoSi || "",
        justiceAndPeace: p.integrations?.justiceAndPeace || "",
        genderAndDevelopment: p.integrations?.genderAndDevelopment || "",
        lccpCare: p.integrations?.lccpCare || "",
        interdisciplinary: p.integrations?.interdisciplinary || "",
        techTeaching: p.integrations?.techTeaching || "Canva presentasyon",
      },
      procedures: {
        routine: Array.isArray(p.procedures?.routine)
          ? p.procedures.routine
          : [
              "Panalangin",
              "Pagbati",
              "Pagpupulot ng basura at pag aayos ng upuan",
              "Pagsusuri ng liban",
            ],
        motivation: p.procedures?.motivation || "",
        discussion: {
          steps: Array.isArray(p.procedures?.discussion?.steps)
            ? p.procedures.discussion.steps
            : [],
          teachingMethods:
            p.procedures?.discussion?.teachingMethods ||
            "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
          guideQuestions: Array.isArray(p.procedures?.discussion?.guideQuestions)
            ? p.procedures.discussion.guideQuestions
            : [],
          deepening: Array.isArray(p.procedures?.discussion?.deepening)
            ? p.procedures.discussion.deepening
            : [],
        },
        valuesIntegration: p.procedures?.valuesIntegration || "",
        summary: p.procedures?.summary || "",
      },
      assessment: {
        formative: p.assessment?.formative || "",
        summativeInstruction: p.assessment?.summativeInstruction || "",
        summativeItems: Array.isArray(p.assessment?.summativeItems)
          ? p.assessment.summativeItems
          : [],
      },
      assignment: p.assignment || "",
      remarks: typeof p.remarks === "string" ? p.remarks : "",
      signatories: {
        preparedBy: p.signatories?.preparedBy || "Bb. Kathrynn Ross L. Acola",
        checkedBy: p.signatories?.checkedBy || "Bb. Sta. Ana Florence",
        observedBy: p.signatories?.observedBy || "Bb. Sta. Ana Florence",
      },
      generatedIllustrationUrl: p.generatedIllustrationUrl || generateFallbackPngDataUri(11),
      illustrationCaption:
        p.illustrationCaption ||
        `Larawan para sa Aralin: ${p.subjectMatter?.paksa || "Banghay-Aralin sa Filipino"}`,
      illustrationPanels: Array.isArray(p.illustrationPanels) ? p.illustrationPanels : undefined,
      illustrationStyle: p.illustrationStyle,
    };
  }

  const l = parsed as Partial<LccpLearningPlan>;
  const resultPlan: LccpLearningPlan = {
    templateType: "lccp",
    rveFormat: l.rveFormat || "portrait",
    adidse: l.adidse,
    header: {
      institution: l.header?.institution || "LA CONSOLACION COLLEGE-PASIG",
      address:
        l.header?.address || "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
      title: l.header?.title || "LEARNING PLAN",
      schoolYear: l.header?.schoolYear || "S.Y. 2026-2027",
    },
    subject: l.subject || "Language",
    gradeLevel: l.gradeLevel || "Kinder 2",
    dateCoverage: l.dateCoverage || "",
    term: l.term || "Term 1",
    objectives: Array.isArray(l.objectives) ? l.objectives : [],
    subjectMatter: {
      lesson: l.subjectMatter?.lesson || "Lesson",
      references:
        l.subjectMatter?.references ||
        "Early Beginnings Kinder worktext",
    },
    learningCompetencies: l.learningCompetencies || "",
    valuesStatement: l.valuesStatement || "",
    procedures: {
      routineActivities: Array.isArray(l.procedures?.routineActivities)
        ? l.procedures.routineActivities
        : ["Prayer", "Attendance", "Circle Time"],
      motivation: l.procedures?.motivation || "",
      learningStrategies: Array.isArray(l.procedures?.learningStrategies)
        ? l.procedures.learningStrategies
        : [],
    },
    assessment: Array.isArray(l.assessment) ? l.assessment : [],
    closure: l.closure || "",
    assignment: l.assignment || "",
    remarks: typeof l.remarks === "string" ? l.remarks : "",
    signatories: {
      preparedBy: l.signatories?.preparedBy || "Ms. Kathrynn Ross L. Acola",
      checkedBy: l.signatories?.checkedBy || "Mrs. Emma P. Dunque Lpt.",
      observedBy: l.signatories?.observedBy || "Mrs. Emma P. Dunque Lpt.",
    },
    generatedIllustrationUrl: l.generatedIllustrationUrl || generateFallbackPngDataUri(22),
    illustrationCaption:
      l.illustrationCaption ||
      `Lesson Illustration: ${l.subjectMatter?.lesson || l.subject || "Learning Plan"}`,
    illustrationPanels: Array.isArray(l.illustrationPanels) ? l.illustrationPanels : undefined,
    illustrationStyle: l.illustrationStyle,
  };
  resultPlan.illustrationStyle = getDefaultIllustrationStyle(resultPlan);
  return resultPlan;
}
