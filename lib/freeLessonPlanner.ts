import type {
  GenerateRequestMeta,
  TeacherProfile,
  LessonPlan,
  MatatagLessonPlan,
  LccpLearningPlan,
  TemplateType,
} from "./types";
import { defaultTeacherProfile } from "./sampleData";
import { analyzeTextbookText, LearnedTextbookContent } from "./nlpAnalyzer";

/**
 * Generates a complete, institutional-grade LessonPlan from either
 * raw OCR text or a pre-analyzed LearnedTextbookContent object,
 * replicating Teacher Kathrynn Ross L. Acola's exact formats from "sample lesson plan".
 */
export function generatePlanFromExtractedText(
  input: string | LearnedTextbookContent,
  meta: GenerateRequestMeta,
  profile: TeacherProfile = defaultTeacherProfile
): LessonPlan {
  const learned: LearnedTextbookContent =
    typeof input === "string"
      ? analyzeTextbookText(input, meta.subject, meta.gradeLevel)
      : input;

  const templateType: TemplateType =
    meta.templateType ||
    (meta.gradeLevel === "grade1" || meta.subject === "filipino"
      ? "matatag"
      : "lccp");

  if (templateType === "matatag") {
    return buildFreeMatatagPlan(learned, meta, profile);
  }
  return buildFreeLccpPlan(learned, meta, profile);
}

function buildFreeMatatagPlan(
  learned: LearnedTextbookContent,
  meta: GenerateRequestMeta,
  profile: TeacherProfile
): MatatagLessonPlan {
  const isGrade1 = meta.gradeLevel === "grade1";
  const topic = learned.topic || "Pagbasa at Pag-unawa sa Kwento";
  const pageSuffix = learned.pageNumber ? `, ${learned.pageNumber}` : "";
  const defaultBook = isGrade1
    ? "Gr.1 Dawani"
    : "Masayang Mag-aaral ng Filipino";
  const bookRef = meta.bookReference?.trim()
    ? `${meta.bookReference.trim()}${
        !meta.bookReference.includes("p.") && learned.pageNumber
          ? pageSuffix
          : ""
      }`
    : `${defaultBook}${pageSuffix}`;

  const vocabText =
    learned.vocabulary.length > 0
      ? learned.vocabulary.slice(0, 5).join(", ")
      : "mahahalagang salita mula sa aralin";

  const guideQuestions =
    learned.guideQuestions.length >= 3
      ? learned.guideQuestions.slice(0, 5)
      : [
          ...learned.guideQuestions,
          `Tungkol saan ang binasang aralin na “${topic}”?`,
          "Sino-sino ang mga tauhan o pangunahing paksa sa talakayan?",
          "Anong mahalagang aral ang napulot mo mula sa kwento o aralin?",
        ].slice(0, 4);

  const summativeItems =
    learned.exerciseItems.length >= 3
      ? learned.exerciseItems.slice(0, 5)
      : [
          ...learned.exerciseItems,
          `Tukuyin ang pangunahing kaisipan sa araling “${topic}”.`,
          `Gamitin sa wastong pangungusap ang salitang: ${
            learned.vocabulary[0] || "paggalang"
          }.`,
          "Isulat ang T kung tama ang pahayag batay sa binasa at M kung mali.",
          "Magbigay ng isang halimbawa ng pagsasabuhay ng aral sa tahanan.",
          "Sagutin nang buong pangungusap ang tanong tungkol sa paksa.",
        ].slice(0, 5);

  const summativeInstruction =
    learned.instructions[0] ||
    `PAGSASANAY: ${topic}\nPanuto: Basahin at unawain ang bawat bilang. Isulat ang tamang sagot sa patlang o kwaderno.`;

  const preparedBy = isGrade1
    ? profile.teacherNameFilipino || "Bb. Kathrynn Ross L. Acola"
    : "Acola, Kathrynn Ross L.";
  const coordinator = isGrade1
    ? profile.coordinatorGrade1 || "Bb. Sta. Ana Florence"
    : "Emma P. Dunque, LPT.";

  return {
    templateType: "matatag",
    schoolYear: profile.schoolYear || "S.Y. 2026-2027",
    subject: "FILIPINO",
    gradeSection: isGrade1
      ? profile.sectionGrade1 || "Grade 1 - OLOPH & OLOG"
      : profile.sectionKinder || "Kinder 2",
    dateCoverage: meta.dateCoverage || "October 26-30, 2026",
    termWeek: `${meta.term || (isGrade1 ? "1st term" : "1st Term")}-${
      meta.weekNumber ? meta.weekNumber.toLowerCase() : "week 1"
    }`,
    objectives: [
      `Natutukoy ang mahahalagang detalye at kaisipan sa araling “${topic}”.`,
      `Nabibigyang-kahulugan at nagagamit sa pangungusap ang mga salitang: ${vocabText}.`,
      `Naisasabuhay ang aral ng “${topic}” sa pang-araw-araw na pakikipagkapwa.`,
    ],
    subjectMatter: {
      paksa: topic,
      wika:
        learned.vocabulary.length > 0
          ? `Paglinang ng Talasalitaan at Wika (${learned.vocabulary
              .slice(0, 3)
              .join(", ")})`
          : "Pagbasa, Wika, at Pag-unawa",
      sanggunian: bookRef,
      aiDeclaration:
        "DO 3 s 2026 Annex (Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)\nAng banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.",
    },
    learningCompetencies: `${
      isGrade1
        ? "Naipamamalas ng mga mag-aaral ang pag-unawa sa"
        : "Naipapakita ng mag-aaral ang pag-unawa sa"
    } binasang aralin na “${topic}” at nagagamit ang mga kasanayan sa wika at pakikipagtalastasan nang may paggalang at kahusayan.`,
    integrations: {
      laudatoSi:
        "Nagpapakita ng pagmamahal sa kalikasan at pag-iingat sa mga biyaya ng Panginoon.",
      justiceAndPeace:
        "Sa kwento ay nagpapakita ng pakikinig, pagkakaisa, at pantay na pakikitungo para sa kapayapaan ng bawat isa.",
      genderAndDevelopment:
        "Nagpapakita na kahit ano pa ang iyong kasarian ay may kakayahang gumawa ng mabuti at magpakita ng paggalang.",
      lccpCare: `Ipinapakita sa aralin ang pagmamalasakit sa kapwa at pamilya (${learned.theme}).`,
      interdisciplinary: isGrade1
        ? `Values Ed: Natutuhan ang ${learned.theme}.\nReligion: Ipinapakita ang pagmamahal sa kapwa sa pamamagitan ng pagtulong sa nangangailangan.`
        : `Values Ed: Natutuhan ang ${learned.theme}.`,
      techTeaching: "Canva presentasyon",
    },
    procedures: {
      routine: isGrade1
        ? [
            "Panalangin",
            "Pagbati",
            "Pagpupulot ng basura at pag aayos ng upuan",
            "Pagsusuri ng liban",
          ]
        : [
            "Pagpupulot ng basura at pag aayos ng upuan",
            "Minuto para gumamit ng comfort room",
          ],
      motivation: `Magpapakita ang guro ng larawan na may kaugnayan sa “${topic}”${
        learned.pageNumber ? ` (${learned.pageNumber})` : ""
      } at tatanungin ang mga mag-aaral tungkol sa kanilang karanasan.`,
      discussion: {
        steps: [
          `Ipapakilala ng guro ang kuwentong babasahin at ito ay, “${topic}”.`,
          "Magkakaroon ng katanungan ang guro tungkol sa binasang kwento.",
          `Ipapaliwanag ng guro ang kahulugan ng mga salita at kaisipan sa aralin (${vocabText}).`,
          "Magbibigay ng halimbawa ang guro.",
          "Hihingi ang guro ng halimbawa ng pangungusap mula sa mga estudyante.",
        ],
        teachingMethods:
          "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
        guideQuestions,
        deepening: [
          `Bakit mahalagang matutunan ang aral mula sa “${topic}”?`,
          "Ano ang epekto nito sa pakikipag usap sa araw araw na buhay?",
        ],
      },
      valuesIntegration: `Ipapaliwanag ng guro ang kahalagahan ng ${learned.theme.toLowerCase()} batay sa tinalakay na aralin.`,
      summary: `Ang araling “${topic}” ay nagtuturo ng wastong pag-unawa at paggamit ng mga salita sa pangungusap upang maipahayag nang malinaw ang ating kaisipan.`,
    },
    assessment: {
      formative: `Sagutan ang pagsasanay sa aklat (${bookRef}) tungkol sa “${topic}”.`,
      summativeInstruction,
      summativeItems,
    },
    assignment: `Gumawa ng tatlong pangungusap tungkol sa “${topic}” sa Filipino kwaderno at ipapasa sa biyernes.`,
    remarks: "",
    signatories: {
      preparedBy,
      checkedBy: coordinator,
      observedBy: coordinator,
    },
  };
}

function buildFreeLccpPlan(
  learned: LearnedTextbookContent,
  meta: GenerateRequestMeta,
  profile: TeacherProfile
): LccpLearningPlan {
  const topic = learned.topic || "Exploring Our Lesson";
  const pageSuffix = learned.pageNumber ? `, ${learned.pageNumber}` : "";

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

  const bookRef = meta.bookReference?.trim()
    ? `${meta.bookReference.trim()}${
        !meta.bookReference.includes("p.") && learned.pageNumber
          ? pageSuffix
          : ""
      }`
    : `${defaultReferenceMap[meta.subject] || "Early Beginnings Kinder worktext"}${pageSuffix}`;

  const questions =
    learned.guideQuestions.length >= 2
      ? learned.guideQuestions.slice(0, 4)
      : [
          `What do you observe in our lesson about "${topic}"?`,
          "How can we apply what we learned at home and in school?",
          "Why is it important to thank God for what we learn today?",
        ];

  const assessmentItems =
    learned.exerciseItems.length >= 2
      ? learned.exerciseItems.slice(0, 3)
      : [
          learned.instructions[0] ||
            `Answer the worktext activity on "${topic}" (${bookRef}).`,
          `Identify and color the correct pictures related to "${topic}".`,
        ];

  const weekDate = meta.dateCoverage
    ? `${meta.weekNumber || "Week 6"} – ${meta.dateCoverage}`
    : `${meta.weekNumber || "Week 6"} – August 17-21, 2026`;
  const termLabel =
    meta.term
      ?.replace(/1st\s+Term/i, "Term 1")
      .replace(/2nd\s+Term/i, "Term 2") || "Term 1";

  const isRve = meta.subject === "rve";
  const isMath = meta.subject === "math";

  const valuesStatement = isRve
    ? `Bible verse: “Let all that you do be done in love.” – 1 Corinthians 16:14 (${topic})`
    : isMath
    ? "I use numbers and shapes to learn and solve problems. I try my best, share with my classmates, and thank God for my mind that helps me count, think, and grow."
    : `God gave us wonderful gifts to learn about "${topic}". When we care for God's creation and share what we learn with love, we show gratitude to God and our family.`;

  const strategies = isRve
    ? [
        {
          title: "Play based (sharing what you have)",
          instructions: `The teacher will guide the learners in an interactive sharing activity about "${topic}".`,
          questions,
        },
        {
          title: "Demonstration (Sharing the message)",
          instructions: `The teacher will read the message from the bible and explain how we can live out "${topic}" at home and in school.`,
        },
      ]
    : isMath
    ? [
        {
          title: "Practice and Drill",
          instructions: `The teachers will guide the learners in counting and practicing "${topic}" using flashcards and counters.`,
          questions,
        },
        {
          title: "Play base",
          instructions: `The teacher will ask the students to participate in a hands-on group activity for "${topic}" (${bookRef}).`,
        },
      ]
    : [
        {
          title: "Show and Tell",
          instructions: `The teacher will show pictures and real objects related to "${topic}".`,
          questions,
        },
        {
          title: "Demonstration",
          instructions: `The teacher will model the key concepts and guide the students in completing the worktext activity in ${bookRef}.`,
        },
      ];

  return {
    templateType: "lccp",
    rveFormat: meta.rveFormat || "portrait",
    header: {
      institution: profile.schoolName || "LA CONSOLACION COLLEGE-PASIG",
      address:
        profile.schoolAddress ||
        "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
      title: "LEARNING PLAN",
      schoolYear: profile.schoolYear || "S.Y. 2026-2027",
    },
    subject: displaySubject,
    gradeLevel: profile.sectionKinder || "Kinder 2",
    dateCoverage: weekDate,
    term: termLabel,
    objectives: [
      `Identify the key concepts and examples in "${topic}".`,
      `Demonstrate understanding of "${topic}" through guided oral and hands-on activities.`,
      `Complete the worktext exercises on "${topic}" neatly and accurately.`,
    ],
    subjectMatter: {
      lesson: topic,
      references: bookRef,
    },
    learningCompetencies:
      meta.subject === "science" || meta.subject === "language"
        ? `Demonstrate understanding of "${topic}" by identifying key concepts and participating actively in class activities.`
        : "",
    valuesStatement,
    procedures: {
      routineActivities: ["Prayer", "Attendance", "Circle Time"],
      motivation: `Action Song & Picture Exploration: "${topic}"\nGuide Question:\n1. ${questions[0]}\n2. ${questions[1] || "How does this help us every day?"}`,
      learningStrategies: strategies,
    },
    assessment: assessmentItems,
    closure: `The teacher will recap the key takeaways on "${topic}" and praise the learners for their active participation.`,
    assignment: `Review "${topic}" at home with your parents in ${bookRef}.`,
    remarks: "",
    signatories: {
      preparedBy: profile.teacherName || "Ms. Kathrynn Ross L. Acola",
      checkedBy: profile.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
      observedBy: profile.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
    },
    adidse: {
      unitTitle: "FIRST TERM\nUNIT I: God is good to us",
      lessonTitle: topic.toUpperCase(),
      sectionName: "KINDER 2 – OUR LADY OF CONSOLATION",
      weekDate,
      valueFocus: learned.theme || "Love, Faith, and Gratitude to God",
      references: "Seed of faith, God’s Gift of Character, Bible",
      materialsNeeded: "Textbook, Crayons, Laptop, Tv",
      integritas: "Arts – Drawing and Coloring",
      coreValues: {
        laudatoSi: `Caring for God's creation through "${topic}".`,
        justiceAndPeace: "Sharing peace, fairness, and kindness with classmates.",
        genderAndDevelopment: "Showing equal respect and love for all boys and girls.",
        lccpCare: "Showing compassion and helpfulness at home and in school.",
      },
      routineActivities: [
        "Opening Prayer",
        "Flag ceremony",
        "What’s the weather today?",
        "Checking of Attendance",
        "Sharing of Feelings",
      ],
      lectio: `Story/Picture of "${topic}" (${bookRef})`,
      meditatio: questions.slice(0, 2),
      oratio: `Read a message from the bible; “Let all that you do be done in love.” (1 Corinthians 16:14)`,
      contemplatio: `Reflect: “Thank You, God, for teaching us about ${topic}.”`,
      communicatio: "Sharing the message of faith.",
      inputDeepening: `Value Statement: ${valuesStatement}`,
      furtherDiscussion: `The teacher will discuss how the children can practice the lesson "${topic}" every day.`,
      closingSong: "Closing Song",
      closingPrayer: "Closing Prayer",
      synthesis: [
        `God teaches us about "${topic}" because He loves us.`,
        "We show our love for God when we pray and do good to others.",
      ],
      evaluation: assessmentItems,
    },
  };
}
