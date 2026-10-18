import type { MatatagLessonPlan, LccpLearningPlan, TeacherProfile } from "./types";

export const defaultTeacherProfile: TeacherProfile = {
  schoolName: "LA CONSOLACION COLLEGE-PASIG",
  schoolAddress: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
  teacherName: "Ms. Kathrynn Ross L. Acola",
  teacherNameFilipino: "Bb. Kathrynn Ross L. Acola",
  schoolYear: "S.Y. 2026-2027",
  sectionKinder: "Kinder 2",
  sectionGrade1: "Grade 1 - OLOPH & OLOG",
  coordinatorKinder: "Mrs. Emma P. Dunque Lpt.",
  coordinatorGrade1: "Bb. Sta. Ana Florence",
  aiProvider: "free_cloud",
};

export const sampleMatatagPlan: MatatagLessonPlan = {
  templateType: "matatag",
  schoolYear: "S.Y. 2026-2027",
  subject: "FILIPINO",
  gradeSection: "Grade 1 - OLOPH & OLOG",
  dateCoverage: "August 31 – September 4, 2026",
  termWeek: "1st term-week 10",
  objectives: [
    "Natutukoy kung ang isang pahayag ay pangungusap o hindi pangungusap.",
    "Nakabubuo ng simpleng pangungusap batay sa larawan o sitwasyon.",
    "Nakikilala ang mga pangyayari at tauhan sa kuwentong napakinggan o nabasa.",
    "Nagagamit ang wastong pangungusap sa pagsasalaysay ng simpleng ideya.",
  ],
  subjectMatter: {
    paksa: "Si Matsing, Si Kuting, at si Muning",
    wika: "Pangungusap at Hindi Pangungusap",
    sanggunian: "Gr.1 Dawani, pp. 197-202",
    aiDeclaration: "DO 3 s 2026 Annex (Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.)",
  },
  learningCompetencies: "Naipamamalas ng mga mag-aaral ang pag-unawa sa pagkakaiba ng pangungusap at hindi pangungusap, at kung paano ito ginagamit sa pakikipag-usap at pag-unawa sa binasang kuwento.",
  integrations: {
    laudatoSi: "Pangangalaga sa kalikasan at sa mga nilikha ng Diyos.",
    justiceAndPeace: "Nagpapakita ito na dapat ang kasunduan ng bawat isa ay masunod para sa kapayapaan at pantay pantay na pagtrato.",
    genderAndDevelopment: "Magkaroon ng pantay na pagtrato sa bawat isa. Walang lamangan para sa ikakabuti ng lahat.",
    lccpCare: "Nagpapakita ito ng malasakit sa pamamagitan ng paghatian ng tama at pantay pantay sa bawat isa.",
    interdisciplinary: "Values Ed: Pagpapahalaga sa pagiging patas at sa pagbabahagi. Religion: Pagkilala na ang pagsunod at pagiging makatarungan ay kalooban ng Diyos.",
    techTeaching: "Canva presentasyon",
  },
  procedures: {
    routine: [
      "Panalangin",
      "Pagbati",
      "Pagpupulot ng basura at pag-aayos ng upuan",
      "Pagsusuri ng liban",
    ],
    motivation: "Basahin ang Pares ng salita. Bilugan ang tsek (/) kung ito ay parehas ng kahulugan at ekis (x) naman kung hindi (Page 197). Lagyan ng tsek (/) ang salitang-kilos na tumutukoy sa larawan (Page 198).",
    discussion: {
      steps: [
        "Ipapakilala ng guro ang kuwentong babasahin: 'Si Matsing, Si Kuting, at Si Muning'.",
        "Magkakaroon ng katanungan ang guro tungkol sa binasang kwento.",
        "Magbibigay ang guro ng dalawang pangungusap na konektado sa kwento (Page 201).",
        "Ipapaliwanag ng guro ang dalawang magkaibang pahayag at ipakikilala ang pangungusap at hindi pangungusap.",
      ],
      teachingMethods: "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
      guideQuestions: [
        "Ano ang problema ng dalawang pusa?",
        "Sino ang dumating upang tulungan ang dalawa? Nakatulong ba ito sa mga pusa?",
        "Ano-anong pag-uugali ang ipinakita nina kuting, muning, at matsing?",
      ],
      deepening: [
        "Anong aral ang natutuhan ng dalawang pusa?",
      ],
    },
    valuesIntegration: "Ipapaliwanag ng guro ang importansiya ng paggamit ng buong pangungusap sa maayos at tapat na pakikipagtalastasan.",
    summary: "Ang pangungusap ay lipon ng mga salita na may buong diwa. Ito ay nagsisimula sa malaking titik at nagtatapos sa bantas tulad ng tuldok (.). Ang hindi pangungusap ay parirala lamang.",
  },
  assessment: {
    formative: "Pakinggan ang bawat pahayag habang binabasa ng guro. Gumuhit ng puso sa loob ng kahon kung ito ay pangungusap. Gumuhit naman ng bituin kung ito ay hindi pangungusap (Page 202).",
    summativeInstruction: "Panuto: Isulat sa kwaderno ang (P) kung ito ay pangungusap, (HP) kung Hindi pangungusap.",
    summativeItems: [
      "Si Juan Miguel",
      "Ang Pamilyang Zalde ay pumunta sa mall.",
      "Sino ba ang tatay mo?",
      "Ang mga bata sa parke ay naglalaro.",
      "Saan ka ba nakatira?",
    ],
  },
  assignment: "Isulat sa kwaderno ang tatlong (3) halimbawa ng pangungusap at tatlong (3) hindi pangungusap. Ipapasa ang kwaderno sa Lunes.",
  remarks: "Naisagawa nang maayos ang talakayan at nakilahok ang mga mag-aaral.",
  signatories: {
    preparedBy: "Bb. Kathrynn Ross L. Acola",
    checkedBy: "Bb. Sta. Ana Florence",
    observedBy: "Bb. Sta. Ana Florence",
  },
};

export const sampleLccpPlan: LccpLearningPlan = {
  templateType: "lccp",
  header: {
    institution: "LA CONSOLACION COLLEGE-PASIG",
    address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
    title: "LEARNING PLAN",
    schoolYear: "S.Y. 2026-2027",
  },
  subject: "Language",
  gradeLevel: "Kinder 2",
  dateCoverage: "Week 6 – August 3-7, 2026",
  term: "Term 1",
  objectives: [
    "Identify the names of things in the house.",
    "Tell the uses of common things in the house by using 'is' and 'are'.",
    "Recite rhyme about things in the house.",
    "Cut out and paste the pictures of the things found in the house.",
  ],
  subjectMatter: {
    lesson: "Learning about things in the house.",
    references: "Early Beginnings: Language Kinder worktext, pp. 38-41",
  },
  learningCompetencies: "The learner demonstrates understanding of common household objects by identifying their names, describing their uses with 'is' and 'are,' and creatively expressing knowledge through rhymes and art activities.",
  valuesStatement: "God gave us our home and the things inside it to help us live safely and happily. When we take care of the things in our house, use them properly, and share them with love, we show respect and gratitude to God and our family.",
  procedures: {
    routineActivities: [
      "Prayer",
      "Circle Time",
      "Attendance",
    ],
    motivation: "My House Rhyme & Picture Guessing Game",
    learningStrategies: [
      {
        title: "Picture Talk",
        instructions: "The teacher will show pictures of different rooms and things inside the house.",
        questions: [
          "What can you see in each room?",
          "Do you have the same things in your house?",
          "How are you going to take care of your house?",
        ],
      },
      {
        title: "Grammar Practice ('is' and 'are')",
        instructions: "Teacher models: 'This is a table. These are chairs.' Students repeat and identify single vs multiple items.",
      },
    ],
  },
  assessment: [
    "Color the correct picture being described.",
    "Box the correct name of the picture.",
  ],
  closure: "The teacher will recap the importance of things inside the house and lead a thank-you prayer for our home.",
  assignment: "Cut out and paste the pictures of the things you use in your house. Page 40",
  remarks: "The learners enthusiastically identified items found in their own rooms.",
  signatories: {
    preparedBy: "Ms. Kathrynn Ross L. Acola",
    checkedBy: "Mrs. Emma P. Dunque Lpt.",
    observedBy: "Mrs. Emma P. Dunque Lpt.",
  },
};
