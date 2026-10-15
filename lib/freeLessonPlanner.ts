import type {
  GenerateRequestMeta,
  TeacherProfile,
  MatatagLessonPlan,
  LccpLearningPlan,
  LessonPlan,
} from "./types";
import { defaultTeacherProfile } from "./sampleData";

export function generatePlanFromExtractedText(
  extractedText: string,
  meta: GenerateRequestMeta,
  profile?: TeacherProfile
): LessonPlan {
  const prof = profile || defaultTeacherProfile;
  const lines = extractedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Extract page number if present
  const pageMatch = extractedText.match(/(?:page|pahina|p\.|pp\.)\s*(\d+(?:\s*-\s*\d+)?)/i);
  const detectedPage = pageMatch ? `p. ${pageMatch[1]}` : "";

  // Extract candidate topic from top non-empty lines
  let detectedTitle = "";
  for (const line of lines.slice(0, 10)) {
    const cleanedLine = line
      .replace(/^(?:aralin|lesson|unit|chapter)\s*\d*\s*[:\-]\s*/i, "")
      .trim();

    if (
      cleanedLine.length > 3 &&
      !/^(?:page|pahina|p\.|pp\.|grade|subject)/i.test(cleanedLine) &&
      !cleanedLine.includes("...")
    ) {
      detectedTitle = cleanedLine;
      break;
    }
  }

  // Extract any question marks for guide questions
  const detectedQuestions = lines
    .filter((l) => l.endsWith("?") || l.includes("?"))
    .slice(0, 5);

  // Extract candidate exercise items (lines starting with numbers or letters)
  const detectedItems = lines
    .filter((l) => /^\d+[\.\)]\s+|^[a-e][\.\)]\s+/i.test(l))
    .slice(0, 5);

  const isMatatag =
    meta.templateType === "matatag" ||
    meta.gradeLevel === "grade1" ||
    meta.subject === "filipino";

  if (isMatatag) {
    const topic = detectedTitle || (meta.subject === "filipino" ? "Ang Ating Aralin" : "Lesson Topic");
    const ref = meta.bookReference || (detectedPage ? `Batayang Aklat, ${detectedPage}` : "Batayang Aklat sa Aralin");

    const guideQuestions =
      detectedQuestions.length >= 3
        ? detectedQuestions
        : [
            `Tungkol saan ang binasang aralin o kuwento na "${topic}"?`,
            "Sino-sino ang mga tauhan o ano ang pangunahing ideya sa talakayan?",
            "Ano ang mahahalagang aral o kasanayan na dapat tandaan ng mga mag-aaral?",
          ];

    const summativeItems =
      detectedItems.length >= 3
        ? detectedItems.map((item) => item.replace(/^\d+[\.\)]\s*/, ""))
        : [
            `Tukuyin ang wastong gamit batay sa araling "${topic}".`,
            "Piliin ang tamang sagot sa bawat sitwasyon.",
            "Sumulat ng maikling halimbawa sa kwaderno.",
            "Ilarawan ang wastong paraan ng pagsasagawa ng gawain.",
            "Ibahagi ang sariling karanasan na may kaugnayan sa aralin.",
          ];

    const plan: MatatagLessonPlan = {
      templateType: "matatag",
      schoolYear: prof.schoolYear || "S.Y. 2026-2027",
      subject: meta.subject.toUpperCase(),
      gradeSection: meta.gradeLevel === "grade1" ? prof.sectionGrade1 : prof.sectionKinder,
      dateCoverage: meta.dateCoverage || "Kasalukuyang Linggo",
      termWeek: `${meta.term || "1st Term"} - ${meta.weekNumber || "Week 1"}`,
      objectives: [
        `Natutukoy at nauunawaan ang mga pangunahing kaisipan sa araling "${topic}".`,
        "Nakikilala at nagagamit ang wastong kasanayan batay sa mga halimbawa sa aklat.",
        "Nakapagbabahagi ng sariling ideya at saloobin tungkol sa paksang tinalakay.",
        "Naisasagawa nang may kawilihan ang mga inihandang pagsasanay at gawain.",
      ],
      subjectMatter: {
        paksa: topic,
        wika: meta.subject === "filipino" ? "Wastong Gamit ng Wika at Pagsasalita" : undefined,
        sanggunian: ref,
        aiDeclaration:
          "DO 3 s 2026 Annex (Ang banghay- aralin na ay binuo sa tulong ng sistema upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.)",
      },
      learningCompetencies: `Naipamamalas ng mag-aaral ang pag-unawa at aktibong pakikilahok sa pagtalakay ng ${topic} upang malinang ang kaalaman at kasanayan ayon sa pamantayan ng DepEd MATATAG K-12.`,
      integrations: {
        laudatoSi: "Pangangalaga sa kalikasan, kapiligiran, at sa mga likha ng Diyos.",
        justiceAndPeace: "Pagpapakita ng katarungan, paggalang, at pantay-pantay na pakikitungo sa bawat kaklase.",
        genderAndDevelopment: "Pagpapakita ng pantay na pagpapahalaga at oportunidad sa lahat ng mag-aaral.",
        lccpCare: "Pagpapakita ng malasakit (Care), pagtulong, at kabutihan sa kapwa.",
        interdisciplinary: "Values Ed: Pagpapahalaga sa pagiging magalang at responsable. Religion: Pasasalamat sa biyaya at karunungan mula sa Diyos.",
        techTeaching: "Canva presentasyon at visual instructional media",
      },
      procedures: {
        routine: [
          "Panalangin",
          "Pagbati ng guro at mag-aaral",
          "Pagpupulot ng kalat at pag-aayos ng upuan",
          "Pagsusuri ng liban sa klase",
        ],
        motivation: `Ipakikita ng guro ang mga larawan o kaugnay na sitwasyon sa paksang "${topic}" at magtatanong sa mga mag-aaral upang pukawin ang kanilang interes.`,
        discussion: {
          steps: [
            `Ipakikilala ng guro ang paksang tatalakayin: "${topic}".`,
            "Gagabayan ang mga mag-aaral sa pagbasa at pagsusuri ng mga halimbawa sa aklat.",
            "Magkakaroon ng interaktibong talakayan at pagpapalitan ng ideya.",
            "Ipapaliwanag ang kahalagahan at wastong paggamit ng natutuhang aralin.",
          ],
          teachingMethods: "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
          guideQuestions,
          deepening: [
            "Paano mo maisasabuhay ang aral na iyong natutuhan sa iyong tahanan at paaralan?",
          ],
        },
        valuesIntegration: `Ipapaliwanag ng guro kung paano maipakikita ang malasakit at paggalang sa kapwa sa pamamagitan ng natutuhan sa ${topic}.`,
        summary: `Pagbubuod: Ang aralin tungkol sa ${topic} ay nagbibigay-diin sa tamang pagkaunawa at paglalapat ng kasanayan sa pang-araw-araw na buhay.`,
      },
      assessment: {
        formative: `Pasalitang pagsasanay at pagsasagot sa mga inihandang gawain sa pahina ng aklat (${ref}).`,
        summativeInstruction: "Panuto: Isulat ang tamang sagot sa inyong kwaderno para sa bawat bilang.",
        summativeItems,
      },
      assignment: `Magbasa ng karagdagang pagsasanay sa susunod na pahina ng aklat at maghanda para sa talakayan bukas.`,
      remarks: "Matagumpay na naisagawa ang talakayan at aktibong nakilahok ang mga mag-aaral.",
      signatories: {
        preparedBy: prof.teacherNameFilipino || "Bb. Kathrynn Ross L. Acola",
        checkedBy: prof.coordinatorGrade1 || "Bb. Sta. Ana Florence",
        observedBy: prof.coordinatorGrade1 || "Bb. Sta. Ana Florence",
      },
    };
    return plan;
  } else {
    // Template B: LCCP Institutional Learning Plan
    const subjectTitle = meta.subject.charAt(0).toUpperCase() + meta.subject.slice(1);
    const lessonTitle = detectedTitle || `Learning About ${subjectTitle}`;
    const ref = meta.bookReference || (detectedPage ? `Early Beginnings: ${subjectTitle} Kinder worktext, ${detectedPage}` : `Early Beginnings: ${subjectTitle} Kinder worktext`);

    const strategiesQuestions =
      detectedQuestions.length > 0
        ? detectedQuestions
        : [
            `What can you see in the pictures about ${lessonTitle}?`,
            "How do we use or care for these in our everyday life?",
            "Why is this important for our family and friends?",
          ];

    const assessmentItems =
      detectedItems.length > 0
        ? detectedItems.map((it) => it.replace(/^\d+[\.\)]\s*/, ""))
        : [
            `Point and name the key concepts related to ${lessonTitle}.`,
            "Color the pictures that show the correct action or example.",
            "Draw your favorite part of the lesson in your worktext.",
          ];

    const plan: LccpLearningPlan = {
      templateType: "lccp",
      header: {
        institution: "LA CONSOLACION COLLEGE-PASIG",
        address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
        title: "LEARNING PLAN",
        schoolYear: prof.schoolYear || "S.Y. 2026-2027",
      },
      subject: subjectTitle,
      gradeLevel: "Kinder 2",
      dateCoverage: meta.dateCoverage || "Week 1",
      term: meta.term || "Term 1",
      objectives: [
        `Identify and name the key concepts of ${lessonTitle}.`,
        `Demonstrate understanding of ${lessonTitle} through interactive classroom activities.`,
        `Participate enthusiastically in songs, rhymes, and discussion.`,
        `Complete the corresponding workbook activities with care and creativity.`,
      ],
      subjectMatter: {
        lesson: lessonTitle,
        references: ref,
      },
      learningCompetencies: `The learner demonstrates awareness, appreciation, and foundational understanding of ${lessonTitle} through guided exploration and play-based activities.`,
      valuesStatement: `God gave us our abilities, world, and lessons so we can learn with joy, help our friends, and take care of everything around us with love and gratitude.`,
      procedures: {
        routineActivities: ["Prayer", "Circle Time", "Attendance"],
        motivation: `Singing and dancing to an interactive song related to ${lessonTitle}, followed by a mystery guessing game.`,
        learningStrategies: [
          {
            title: "Picture Talk & Discussion",
            instructions: `The teacher displays pictures from the textbook (${ref}) and invites students to share their observations.`,
            questions: strategiesQuestions,
          },
          {
            title: "Hands-on Practice & Guided Drill",
            instructions: `Teacher models the activity step-by-step and guides the learners in practicing together.`,
          },
        ],
      },
      assessment: assessmentItems,
      closure: `The teacher recaps the key points of ${lessonTitle} and closes with a cheerful review song and a thank-you prayer.`,
      assignment: `Workbook activity on ${detectedPage || "the next page"}: Cut and paste or color the pictures with the guidance of parents.`,
      remarks: "The kindergarten learners showed great interest and actively participated.",
      signatories: {
        preparedBy: prof.teacherName || "Ms. Kathrynn Ross L. Acola",
        checkedBy: prof.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
        observedBy: prof.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
      },
    };
    return plan;
  }
}
