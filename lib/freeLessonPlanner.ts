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

  const topic =
    learned.topic ||
    (meta.subject === "filipino" ? "Ang Ating Aralin" : "Lesson Topic");

  const ref =
    meta.bookReference ||
    (learned.pageNumber ? `Gr.1 Dawani, ${learned.pageNumber}` : "Gr.1 Dawani");

  const isMatatag =
    meta.templateType === "matatag" ||
    meta.gradeLevel === "grade1" ||
    meta.subject === "filipino";

  if (isMatatag) {
    // Determine Wika / Gramatika topic if mentioned
    let detectedWika = "Pangungusap at Hindi Pangungusap";
    const lowerRaw = learned.rawText.toLowerCase();
    if (lowerRaw.includes("paturol") || lowerRaw.includes("pasalaysay")) {
      detectedWika = "Pangungusap na Paturol o Pasalaysay";
    } else if (lowerRaw.includes("pangngalan")) {
      detectedWika = "Pangngalan (Ngalan ng Tao, Bagay, Hayop, Lugar, o Pangyayari)";
    } else if (lowerRaw.includes("pandiwa") || lowerRaw.includes("salitang-kilos")) {
      detectedWika = "Salitang-kilos o Pandiwa";
    } else if (lowerRaw.includes("pang-uri")) {
      detectedWika = "Salitang Naglalarawan o Pang-uri";
    } else if (lowerRaw.includes("patanong")) {
      detectedWika = "Pangungusap na Patanong";
    }

    // Guide questions: use extracted questions from textbook first
    const guideQuestions =
      learned.guideQuestions.length >= 3
        ? learned.guideQuestions.slice(0, 5)
        : [
            `Tungkol saan ang binasang kwento o aralin na "${topic}"?`,
            "Sino-sino ang mga tauhan o ano ang pangunahing ideya sa talakayan?",
            "Ano-anong pag-uugali o magagandang aral ang ipinakita sa ating aralin?",
          ];

    // Summative items: use real exercise items from textbook
    const summativeItems =
      learned.exerciseItems.length >= 3
        ? learned.exerciseItems.slice(0, 5)
        : [
            `Tukuyin kung ito ay may kaugnayan sa araling "${topic}".`,
            "Piliin ang wastong sagot batay sa binasang kwento sa aklat.",
            "Gamitin sa simpleng pangungusap ang natutuhang aralin.",
            "Isulat sa kwaderno ang tamang sagot sa inihandang pagsasanay.",
            "Ibahagi ang sariling karanasan na may kaugnayan sa ating talakayan.",
          ];

    const plan: MatatagLessonPlan = {
      templateType: "matatag",
      schoolYear: prof.schoolYear || "S.Y. 2026-2027",
      subject: meta.subject.toUpperCase(),
      gradeSection: meta.gradeLevel === "grade1" ? prof.sectionGrade1 : prof.sectionKinder,
      dateCoverage: meta.dateCoverage || "Kasalukuyang Linggo",
      termWeek: `${meta.term || "1st term"} - ${meta.weekNumber || "week 10"}`,
      objectives: [
        `Natutukoy at nauunawaan ang mga pangunahing pangyayari at kaisipan sa araling "${topic}".`,
        `Nakikilala at nagagamit ang wastong ${detectedWika.toLowerCase()} batay sa mga halimbawa sa aklat.`,
        "Nakabubuo ng sariling ideya at reaksiyon batay sa kuwentong napakinggan o nabasa.",
        "Nagagamit ang natutuhang aralin sa pagsasalaysay ng simpleng kaisipan nang may kawilihan.",
      ],
      subjectMatter: {
        paksa: topic,
        wika: meta.subject === "filipino" ? detectedWika : undefined,
        sanggunian: ref,
        aiDeclaration:
          "Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.",
      },
      learningCompetencies: `Naipamamalas ng mga mag-aaral ang pag-unawa sa paksang "${topic}" at sa paggamit ng ${detectedWika.toLowerCase()} upang maipahayag ang ideya nang malinaw ayon sa pamantayan ng DepEd MATATAG K-12.`,
      integrations: {
        laudatoSi: "Pangangalaga sa kalikasan at sa mga nilikha ng Diyos.",
        justiceAndPeace:
          "Nagpapakita ito na dapat ang kasunduan ng bawat isa ay masunod para sa kapayapaan at pantay pantay na pagtrato.",
        genderAndDevelopment:
          "Magkaroon ng pantay na pagtrato sa bawat isa. Walang lamangan para sa ikakabuti ng lahat.",
        lccpCare:
          "Nagpapakita ito ng malasakit sa pamamagitan ng paghatian ng tama at pantay pantay sa bawat isa.",
        interdisciplinary:
          "Values Ed: Pagpapahalaga sa pagiging patas at sa pagbabahagi. Religion: Pagkilala na ang pagsunod at pagiging makatarungan ay kalooban ng Diyos.",
        techTeaching: "Canva presentasyon",
      },
      procedures: {
        routine: [
          "Panalangin",
          "Pagbati",
          "Pagpupulot ng basura at pag aayos ng upuan",
          "Pagsusuri ng liban",
        ],
        motivation:
          learned.readingPassage.length > 30
            ? `Basahin ang paunang pagsasanay kaugnay ng "${topic}" sa ${ref}. Ipakikita ng guro ang mga larawan at magtatanong upang pukawin ang kuryosidad ng mga mag-aaral.`
            : `Basahin ang pares ng salita o sitwasyon kaugnay ng "${topic}" sa ${ref}. Lagyan ng tsek (/) ang larawang tumutukoy sa tamang kilos o ideya.`,
        discussion: {
          steps: [
            `Ipapakilala ng guro ang kuwentong babasahin at ito ay, "${topic}".`,
            "Magkakaroon ng katanungan ang guro tungkol sa binasang kwento.",
            `Magbibigay ang guro ng dalawang halimbawa o pangungusap na konektado sa kwento (${ref}).`,
            `Ipapaliwanag ng guro ang mga halimbawa at ipakikilala ang ${detectedWika}.`,
          ],
          teachingMethods: "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
          guideQuestions,
          deepening: [
            `Anong mahalagang aral ang iyong natutuhan mula sa ating talakayan sa "${topic}"?`,
          ],
        },
        valuesIntegration: `Ipapaliwanag ng guro ang importansiya ng ${detectedWika.toLowerCase()} at ang kahalagahan ng pagpapakita ng malasakit at paggalang sa kapwa.`,
        summary: `Pagbubuod: Ang aralin tungkol sa "${topic}" at ${detectedWika.toLowerCase()} ay nagtuturo ng wastong pagpapahayag ng ideya at pagiging responsable at may malasakit sa kapwa.`,
      },
      assessment: {
        formative: `Pakinggang mabuti ang bawat pahayag habang binabasa ng guro. Sagutin ang inihandang gawain batay sa aklat (${ref}).`,
        summativeInstruction:
          learned.instructions[0] ||
          "Isulat sa kwaderno ang tamang sagot para sa bawat bilang.",
        summativeItems,
      },
      assignment: `Isulat sa kwaderno ang karagdagang pagsasanay batay sa ${ref}. Ipapasa ang kwaderno sa susunod na pagkikita.`,
      remarks: "Naisagawa nang maayos ang talakayan at aktibong nakilahok ang mga mag-aaral.",
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
            "Do you have the same things in your house or classroom?",
            "How are you going to take care of them and share with friends?",
          ];

    const assessmentItems =
      learned.exerciseItems.length > 0
        ? learned.exerciseItems.slice(0, 4)
        : [
            `Color the correct picture being described about ${lessonTitle}.`,
            "Box the correct name of the picture.",
            "Draw or trace the picture in your worktext.",
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
      dateCoverage: meta.dateCoverage || "Week 6 – August 3-7, 2026",
      term: meta.term || "Term 1",
      objectives: [
        `Identify the key concepts and names related to ${lessonTitle}.`,
        `Describe common examples of ${lessonTitle} through interactive play and conversation.`,
        `Recite rhymes or songs related to ${lessonTitle} enthusiastically.`,
        `Complete the corresponding workbook activities on ${kinderRef} with care.`,
      ],
      subjectMatter: {
        lesson: `Learning about ${lessonTitle}.`,
        references: kinderRef,
      },
      learningCompetencies: `The learner demonstrates understanding of ${lessonTitle} by identifying concepts, actively describing examples, and creatively expressing knowledge through guided classroom activities.`,
      valuesStatement: `God gave us our world and our home to help us live safely and happily. When we take care of things, use them properly, and share them with love, we show respect and gratitude to God and our family.`,
      procedures: {
        routineActivities: ["Prayer", "Circle Time", "Attendance"],
        motivation: `Singing and dancing to an interactive song related to ${lessonTitle}, followed by a picture guessing game.`,
        learningStrategies: [
          {
            title: "Picture Talk",
            instructions: `The teacher will show pictures from ${kinderRef} and invite students to share their observations.`,
            questions: strategiesQuestions,
          },
          {
            title: "Guided Activity & Practice",
            instructions: `Teacher models the activity step-by-step; kindergarteners practice together using worktext examples.`,
          },
        ],
      },
      assessment: assessmentItems,
      closure: `The teacher will recap the importance of ${lessonTitle} and lead a cheerful review song and thank-you prayer.`,
      assignment: `Cut out and paste or color the pictures in your worktext (${kinderRef}) with the guidance of parents.`,
      remarks: "The kindergarteners enthusiastically participated in circle time and activities.",
      signatories: {
        preparedBy: prof.teacherName || "Ms. Kathrynn Ross L. Acola",
        checkedBy: prof.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
        observedBy: prof.coordinatorKinder || "Mrs. Emma P. Dunque Lpt.",
      },
    };
    return plan;
  }
}
