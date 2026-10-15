import type {
  GenerateRequestMeta,
  TeacherProfile,
  MatatagLessonPlan,
  LccpLearningPlan,
  LessonPlan,
} from "./types";
import { defaultTeacherProfile } from "./sampleData";
import { analyzeTextbookText, LearnedTextbookContent } from "./nlpAnalyzer";

export function generatePlanFromExtractedText(
  extractedOrLearned: string | LearnedTextbookContent,
  meta: GenerateRequestMeta,
  profile?: TeacherProfile
): LessonPlan {
  const prof = profile || defaultTeacherProfile;

  // 1. Obtain learned structured content from NLP analyzer
  const learned: LearnedTextbookContent =
    typeof extractedOrLearned === "string"
      ? analyzeTextbookText(extractedOrLearned, meta.subject, meta.gradeLevel)
      : extractedOrLearned;

  const topic = learned.topic || (meta.subject === "filipino" ? "Ang Ating Aralin" : "Lesson Topic");
  const ref =
    meta.bookReference ||
    (learned.pageNumber ? `Batayang Aklat, ${learned.pageNumber}` : "Batayang Aklat sa Aralin");

  const isMatatag =
    meta.templateType === "matatag" ||
    meta.gradeLevel === "grade1" ||
    meta.subject === "filipino";

  if (isMatatag) {
    // Grade 1 / Matatag Filipino
    const vocabStr =
      learned.vocabulary.length > 0
        ? ` (${learned.vocabulary.slice(0, 4).join(", ")})`
        : "";

    // Guide questions: use extracted textbook questions first, then add deeper questions
    const guideQuestions =
      learned.guideQuestions.length >= 2
        ? learned.guideQuestions.slice(0, 5)
        : [
            `Tungkol saan ang binasang aralin o kuwento na "${topic}"?`,
            `Ano-ano ang mahahalagang salita o kaisipan sa ating tinalakay${vocabStr}?`,
            "Paano mo magagamit o maisasabuhay ang aral na ito sa iyong pang-araw-araw na buhay?",
          ];

    // Summative items: use the real exercise items detected in the textbook
    const summativeItems =
      learned.exerciseItems.length >= 2
        ? learned.exerciseItems.slice(0, 5)
        : [
            `Tukuyin ang wastong kahulugan o gamit batay sa araling "${topic}".`,
            "Piliin ang wastong sagot batay sa binasang talakayan sa aklat.",
            `Gamitin sa sariling pangungusap ang isa sa mga natutuhang salita${vocabStr}.`,
            "Isulat sa kwaderno ang tamang sagot sa inihandang pagsasanay.",
            "Ibahagi ang sariling karanasan o saloobin na kaugnay ng ating aralin.",
          ];

    const plan: MatatagLessonPlan = {
      templateType: "matatag",
      schoolYear: prof.schoolYear || "S.Y. 2026-2027",
      subject: meta.subject.toUpperCase(),
      gradeSection: meta.gradeLevel === "grade1" ? prof.sectionGrade1 : prof.sectionKinder,
      dateCoverage: meta.dateCoverage || "Kasalukuyang Linggo",
      termWeek: `${meta.term || "1st Term"} - ${meta.weekNumber || "Week 1"}`,
      objectives: [
        `Natutukoy at nauunawaan ang mga pangunahing kaisipan at mensahe sa paksang "${topic}".`,
        `Nakikilala at nagagamit nang wasto ang mga mahahalagang salita${vocabStr} ayon sa konteksto ng aklat.`,
        "Nakapagbabahagi ng sariling ideya, reaksiyon, at saloobin tungkol sa binasang aralin.",
        "Naisasagawa nang buong sigla at kawilihan ang mga pagsasanay at pagsusulit sa aklat.",
      ],
      subjectMatter: {
        paksa: topic,
        wika: meta.subject === "filipino" ? "Wastong Gamit ng Wika, Pagbasa, at Pagsasalita" : undefined,
        sanggunian: ref,
        aiDeclaration:
          "DO 3 s 2026 Annex (Ang banghay-aralin na ito ay binuo sa tulong ng sistema upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.)",
      },
      learningCompetencies: `Naipamamalas ng mag-aaral ang pag-unawa at aktibong pakikilahok sa pagtalakay ng ${topic} upang malinang ang kaalaman at kasanayan ayon sa pamantayan ng DepEd MATATAG K-12.`,
      integrations: {
        laudatoSi: learned.theme.includes("Laudato")
          ? "Pangangalaga sa kalikasan, kapaligiran, at sa mga likha ng Diyos ayon sa diwa ng Laudato Si'."
          : "Pangangalaga sa kapaligiran at pagpapanatili ng kalinisan sa silid-aralan at tahanan.",
        justiceAndPeace: "Pagpapakita ng katarungan, paggalang sa kapwa, at pantay na pakikitungo sa bawat kamag-aral.",
        genderAndDevelopment: "Pagpapakita ng pantay na pagpapahalaga at patas na oportunidad sa lahat ng mag-aaral nang walang diskriminasyon.",
        lccpCare: `Pagsasabuhay ng LCCP Core Values: Malasakit (Care), kabutihan, at pagdamay sa kapwa kaugnay ng araling "${topic}".`,
        interdisciplinary: "Values Education: Pagpapahalaga sa pagiging magalang at responsable. Edukasyon sa Pagpapakatao: Pasasalamat sa Diyos sa mga biyaya at kakayahan.",
        techTeaching: "Smart TV / Canva presentasyon at mga visual media mula sa aklat.",
      },
      procedures: {
        routine: [
          "Panimulang Panalangin",
          "Masiglang Pagbati ng guro at mga mag-aaral",
          "Pagpupulot ng kalat at pag-aayos ng mga upuan",
          "Pagtatala ng liban at pumasok sa klase",
        ],
        motivation: `Pagganyak: ${
          learned.readingPassage.length > 30
            ? `Ibabahagi ng guro ang panimulang sitwasyon o kuwento mula sa aklat: "${learned.readingPassage.slice(0, 140)}..." at hihikayatin ang mga mag-aaral na magbahagi ng kanilang ideya.`
            : `Ipakikita ng guro ang mga larawan mula sa aklat kaugnay ng "${topic}" at magtatanong upang pukawin ang kuryosidad ng mga mag-aaral.`
        }`,
        discussion: {
          steps: [
            `Ipakikilala at ipaliliwanag ng guro ang paksang aralin: "${topic}".`,
            `Gagabayan ang mga bata sa pagbasa at pagsusuri ng mga salita at kaisipan sa aklat (${ref}).`,
            "Magkakaroon ng interaktibong talakayan at pagtatanong tungkol sa nilalaman ng binasang aralin.",
            "Ipaliliwanag ang wastong pagsasagawa ng mga pagsasanay at aktibidad na inihanda.",
          ],
          teachingMethods: "Demonstrasyon, Interaktibong Pagtatanong, Pangkatang Talakayan, Drill at Practice",
          guideQuestions,
          deepening: [
            "Paano mo magagamit ang iyong natutuhan sa araling ito upang maging mabuting anak at mag-aaral?",
          ],
        },
        valuesIntegration: `Ipaliliwanag ng guro kung paano maipakikita ang malasakit at kabutihan sa kapwa sa pamamagitan ng mga aral na natutuhan sa "${topic}".`,
        summary: `Pagbubuod: Ang aralin tungkol sa "${topic}" ay nagtuturo ng wastong kaalaman, kasanayan sa wika, at magagandang asal na dapat taglayin ng bawat batang Consolacion.`,
      },
      assessment: {
        formative: `Pasalitang pagsasanay, aktibong paglahok sa talakayan, at pagsagot sa mga tanong sa ${ref}.`,
        summativeInstruction:
          learned.instructions[0] ||
          "Panuto: Basahing mabuti ang bawat bilang at isulat ang tamang sagot sa inyong kwaderno.",
        summativeItems,
      },
      assignment: `Balikan ang binasang aralin sa ${ref} at magsanay sa pagbasa kasama ang mga magulang.`,
      remarks: "Aktibong nakilahok ang mga mag-aaral at matagumpay na nakamit ang mga layunin ng aralin.",
      signatories: {
        preparedBy: prof.teacherNameFilipino || "Bb. Kathrynn Ross L. Acola",
        checkedBy: prof.coordinatorGrade1 || "Bb. Sta. Ana Florence",
        observedBy: prof.coordinatorGrade1 || "Bb. Sta. Ana Florence",
      },
    };
    return plan;
  } else {
    // Template B: LCCP Institutional Learning Plan (Kinder 2)
    const subjectTitle = meta.subject.charAt(0).toUpperCase() + meta.subject.slice(1);
    const lessonTitle = topic;
    const kinderRef =
      meta.bookReference ||
      (learned.pageNumber
        ? `Early Beginnings: ${subjectTitle} Kinder worktext, ${learned.pageNumber}`
        : `Early Beginnings: ${subjectTitle} Kinder worktext`);

    const strategiesQuestions =
      learned.guideQuestions.length > 0
        ? learned.guideQuestions.slice(0, 4)
        : [
            `What can you see in the pictures about ${lessonTitle}?`,
            "How do we show care and kindness when learning this together?",
            "Can you name the examples we found in our worktext?",
          ];

    const assessmentItems =
      learned.exerciseItems.length > 0
        ? learned.exerciseItems.slice(0, 4)
        : [
            `Point to and name the pictures showing ${lessonTitle}.`,
            "Color the correct picture that matches the teacher's example.",
            "Draw or trace the shape / pattern in your worktext.",
            "Perform the action or recite the rhyme with teacher Kat.",
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
        `Identify and name the key concepts of "${lessonTitle}" using the textbook illustrations.`,
        `Demonstrate understanding of "${lessonTitle}" through guided hands-on classroom activities.`,
        `Express thoughts and participate enthusiastically in circle time, songs, and discussions.`,
        `Complete the corresponding workbook activities on ${kinderRef} with care and neatness.`,
      ],
      subjectMatter: {
        lesson: lessonTitle,
        references: kinderRef,
      },
      learningCompetencies: `The learner demonstrates awareness, appreciation, and foundational skills in ${lessonTitle} through play-based discovery and guided exploration.`,
      valuesStatement: `God lovingly gave us our minds and senses to learn about "${lessonTitle}" so we can help others, care for creation, and live as loving children of God.`,
      procedures: {
        routineActivities: [
          "Opening Prayer & Sign of the Cross",
          "Good Morning Song & Circle Time",
          "Attendance Check & Weather Song",
        ],
        motivation: `Interactive singing game or story preview about "${lessonTitle}" followed by a fun 'Guess what is inside the mystery bag' activity.`,
        learningStrategies: [
          {
            title: "Picture Talk & Interactive Story",
            instructions: `Teacher Kat shows the colorful pages from ${kinderRef} and guides the kindergarteners in exploring the pictures.`,
            questions: strategiesQuestions,
          },
          {
            title: "Guided Activity & Play-based Learning",
            instructions: `Teacher demonstrates the learning drill step-by-step; pupils practice together using manipulatives and book pages.`,
          },
        ],
      },
      assessment: assessmentItems,
      closure: `Recap the fun ideas learned about "${lessonTitle}" with a joyful action song and a prayer of thanksgiving.`,
      assignment: `Workbook activity on ${kinderRef}: Color and complete the page with the help of parents at home.`,
      remarks: "The kindergarteners actively participated with enthusiasm and curiosity.",
      signatories: {
        preparedBy: prof.teacherName || "Ms. Kathrynn Ross L. Acola",
        checkedBy: prof.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
        observedBy: prof.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
      },
    };
    return plan;
  }
}
