import type { MatatagLessonPlan, LccpLearningPlan, TeacherProfile } from "./types";
import { generateFallbackPngDataUri } from "./lessonIllustrationGenerator";
import { SAMPLE_ILLUSTRATIONS } from "./sampleIllustrations";


const _GM_BYTES = [8,1,121,31,7,84,33,52,183,196,246,216,194,198,193,212,236,138,131,182,129,234,166,153,130,167,187,85,110,71,111,15,102,2,94,83,47,35,29,119,42,91,56,12,15,179,194,241,243,218,213,194,244];
const _GQ_BYTES = [46,35,60,1,40,33,38,28,248,207,216,175,219,147,200,220,210,152,247,154,128,158,182,188,166,191,155,127,111,39,93,123,76,71,83,90,20,125,99,51,5,38,27,30,60,204,230,197,250,226,147,246,218,253,166,178];

function decodeProtectedBytes(bytes: number[]): string {
  return bytes.map((b, i) => String.fromCharCode(b ^ ((73 + i * 7) & 0xff))).join("");
}

export function getInternalGeminiKey(): string {
  return decodeProtectedBytes(_GM_BYTES);
}

export function getInternalGroqKey(): string {
  return decodeProtectedBytes(_GQ_BYTES);
}

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
  aiProvider: "gemini",
};

export const sampleMatatagPlan: MatatagLessonPlan = {
  templateType: "matatag",
  schoolYear: "S.Y. 2026-2027",
  subject: "FILIPINO",
  gradeSection: "Grade 1 - OLOPH & OLOG",
  dateCoverage: "October 26-30, 2026",
  termWeek: "1st term-week 14",
  objectives: [
    "Natutukoy at nagagamit nang wasto ang mga pantukoy na Ito, Iyan, at Iyon sa pangungusap batay sa layo ng tinutukoy na bagay.",
    "Naiuugnay ang sariling karanasan sa kuwentong “Iyan ang Lider!” sa pamamagitan ng pagsagot sa mga tanong tungkol sa katangian ng isang mabuting lider.",
    "Nakabubuo at nakapagsasabi ng mga pangungusap gamit ang Ito, Iyan, at Iyon habang ipinapakita ang respeto at pakikiisa sa gawain ng grupo.",
  ],
  subjectMatter: {
    paksa: "Iyan ang lider",
    wika: "Pantukoy na Ito, Iyan, at Iyon",
    sanggunian: "Gr.1 Dawani",
    aiDeclaration:
      "DO 3 s 2026 Annex (Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)\nAng banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.",
  },
  learningCompetencies:
    "Naipamamalas ng mga mag-aaral ang pag-unawa sa paggamit ng mga pantukoy na Ito, Iyan, at Iyon sa pamamagitan ng pagtukoy sa distansiya ng bagay na tinutukoy at paggamit ng mga ito sa pagbuo ng malinaw at wastong pangungusap batay sa kuwentong “Iyan ang Lider!”.",
  integrations: {
    laudatoSi: "Nagpapakita ng pagmamahal sa kalikasan.",
    justiceAndPeace:
      "Sa kwento ay nagpapakita na ang pagiging mabuting lider ay marunong makinig sa kaniyang nasasakupan para sa kapayapaan ng bawat isa.",
    genderAndDevelopment:
      "Nagpapakita na kahit ano pa ang iyong kasarian ay kaya mong maging isang mabuting lider.",
    lccpCare:
      "Ipinapakita sa kwento ang pagmamalasakit ng isang lider sa kanyang nasasakupan.",
    interdisciplinary:
      "Values Ed: Natutuhan ang pagiging isang mabuting lider.\nReligion: Ipinapakita ang pagmamahal sa kapwa sa pamamagitan ng pagtulong sa nangangailangan.",
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
      "Magpapakita ang guro ng larawan ng isang lider at tatanungin ng guro kung ano ang ginagawa ng isang lider.",
    discussion: {
      steps: [
        "Ipapakilala ng guro ang kuwentong babasahin at ito ay, “Iyan ang lider”.",
        "Magkakaroon ng katanungan ang guro tungkol sa binasang kwento.",
        "Ipapaliwanag ng guro ang kahulugan ng Ito, Iyan, at Iyon.",
        "Magbibigay ng halimbawa ang guro.",
        "Hihingi ang guro ng halimbawa ng pangungusap gamit ang Ito, Iyan, at Iyon sa mga estudyante.",
      ],
      teachingMethods: "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
      guideQuestions: [
        "Sino ang lider sa kwento?",
        "Ano ang ginawa ng lider upang matulungan ang kanyang mga kasama?",
        "Nagpakita ba siya ng mabuting halimbawa sa kanyang grupo? Paano?",
        "Kung ikaw ang lider, ano ang gagawin mo upang matulungan ang iyong mga kaklase?",
      ],
      deepening: [
        "Bakit mahalagang matutunan ang tamang paggamit ng Ito, Iyan, at Iyon sa pangungusap?",
        "Ano ang epekto nito sa pakikipag usap sa araw araw na buhay?",
      ],
    },
    valuesIntegration:
      "Ipapaliwanag ng guro ang kahalagahan ng pagiging isang mabuting lider at kung paano maging isang mabuting lider.",
    summary:
      "Ito – ginagamit kapag ang bagay ay malapit sa nagsasalita. Halimbawa: Ito ang aking lapis.\nIyan – ginagamit kapag ang bagay ay malapit sa kausap. Halimbawa: Iyan ang iyong bag.\nIyon – ginagamit kapag ang bagay ay malayo sa nagsasalita at sa kausap. Halimbawa: Iyon ang puno sa labas.",
  },
  assessment: {
    formative:
      "Sagutan ang pahina 156 (Kulayan ang bilog ng tamang sagot upang mabuo ang mga pangungusap).\nSagutan ang pahina 157 (Isulat sa patlang ang Ito, Iyan, o Iyon batay sa mga larawan.)",
    summativeInstruction:
      "PAGSASANAY: Ito, Iyan, at Iyon\nPanuto: Punan ng Ito, Iyan, o Iyon ang patlang upang mabuo ang pangungusap.",
    summativeItems: [
      "________ ang hawak kong aklat. (malapit sa nagsasalita)",
      "________ ang bag na hawak mo. (malapit sa kausap)",
      "________ ang ibon sa sanga ng puno. (malayo sa ating dalawa)",
      "________ ang lapis na ginagamit ko ngayon. (malapit sa nagsasalita)",
      "________ ang bola na nasa tabi mo. (malapit sa kausap)",
    ],
  },
  assignment:
    "Gumawa ng tatlong pangungusap gamit ang Ito, Iyan, at Iyon sa Filipino kwaderno at ipapasa sa biyernes.",
  remarks: "",
  signatories: {
    preparedBy: "Bb. Kathrynn Ross L. Acola",
    checkedBy: "Bb. Sta. Ana Florence",
    observedBy: "Bb. Sta. Ana Florence",
  },
  generatedIllustrationUrl: SAMPLE_ILLUSTRATIONS.g1_filipino,
  illustrationStyle: "pag_uugnay_speech",
};

export const sampleKinder2FilipinoPlan: MatatagLessonPlan = {
  templateType: "matatag",
  schoolYear: "S.Y. 2026-2027",
  subject: "FILIPINO",
  gradeSection: "Kinder 2",
  dateCoverage: "Agosto 10-14, 2026",
  termWeek: "1st Term-Week 5",
  objectives: [
    "Naisusulat nang maayos ang malaki at maliit na titik Ss.",
    "Nabibigkas ang tunog ng titik Ss.",
    "Nakikilala ang mga salitang nag-uumpisa sa titik Ss.",
  ],
  subjectMatter: {
    paksa: "Ang Sinturon at ang Sapatos ni Siso / Titik Ss",
    sanggunian: "Masayang Mag-aaral ng Filipino, pp. 56-63",
    aiDeclaration:
      "DO 3 s 2026 Annex (Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)\nAng banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.",
  },
  learningCompetencies:
    "Naipapakita ng mag-aaral ang pag-unawa sa binasang kuwento sa pamamagitan ng pagsagot sa mga tanong at pagtukoy sa mahahalagang detalye, gayundin ang kasanayan sa pagkilala, pagbigkas ng tunog, at pagsulat ng titik Ss.",
  integrations: {
    laudatoSi: "Pangangalaga sa mga kagamitan upang hindi masayang ang yaman ng kalikasan.",
    justiceAndPeace: "Pagiging responsable sa sariling gamit upang maiwasan ang abala sa kapwa.",
    genderAndDevelopment:
      "Nagpapakita na ang pag-iingat sa mga personal na gamit ay tungkulin ng bawat bata anuman ang kasarian.",
    lccpCare:
      "Nagpapakita ng malasakit at pagpapahalaga sa mga gamit na ibinigay ng mga magulang.",
    interdisciplinary:
      "Values Ed: Pagiging masinop at mapagpahalaga sa mga gamit tulad ng sapatos at sinturon.",
    techTeaching: "Canva presentasyon",
  },
  procedures: {
    routine: [
      "Pagpupulot ng basura at pag aayos ng upuan",
      "Minuto para gumamit ng comfort room",
    ],
    motivation:
      "Tanong: Paano mo iniingatan ang iyong mga gamit gaya ng sapatos at sinturon?",
    discussion: {
      steps: [
        "Babasahin ng guro ang maikling kwento na pinamagatang “Ang Sinturon at ang Sapatos ni Siso” sa pahina 56.",
        "Ipakikilala ng guro ang titik Ss at ang tunog nito.",
        "Magpapakita ang guro ng mga halimbawa ng bagay na nagsisimula sa titik Ss (saging, sapatos, sinturon, salamin, sobre).",
      ],
      teachingMethods: "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
      guideQuestions: [
        "Bakit binilhan ng nanay si Siso ng bagong sinturon at sapatos?",
        "Saan gagamitin ni Siso ang bago niyang sinturon at sapatos?",
        "Paano iningatan ni Siso ang bago niyang sinturon at sapatos?",
      ],
      deepening: [
        "Bakit mahalagang ingatan ang ating mga gamit sa paaralan at tahanan?",
      ],
    },
    valuesIntegration:
      "Ipapaliwanag ng guro ang kahalagahan ng pagiging masinop at pag-iingat sa mga gamit na bigay ng magulang.",
    summary:
      "Ang titik Ss ay may tunog na /s/. Halimbawa ng mga salitang nagsisimula sa titik Ss: sapatos, sinturon, saging, salamin, at sobre.",
  },
  assessment: {
    formative:
      "Gumuhit ng linya mula kay Siso papunta sa mga bagay na nagsisimula sa titik Ss (Pahina 59).\nKulayan ang mga saging na may malaki at maliit na titik Ss (Pahina 60).\nIkahon ang unang pantig ng pangalan ng bawat larawan (Pahina 61).",
    summativeInstruction:
      "Pangwakas na pagsusulit – page 62 (Isulat ang unang pantig ng pangalan ng bawat larawan na nagsisimula sa titik Ss).",
    summativeItems: [
      "sa - sapatos",
      "si - sinturon",
      "su - sumbrero",
      "se - selyo",
      "so - sobre",
    ],
  },
  assignment:
    "Sanayin ang pagsulat ng malaki at maliit na titik Ss sa pahina 63.",
  remarks: "",
  signatories: {
    preparedBy: "Acola, Kathrynn Ross L.",
    checkedBy: "Emma P. Dunque, LPT.",
    observedBy: "Emma P. Dunque, LPT.",
  },
  generatedIllustrationUrl: SAMPLE_ILLUSTRATIONS.k2_filipino,
  illustrationStyle: "comic_story",
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
  learningCompetencies:
    "Demonstrate understanding of common household objects by identifying their names, describing their uses with 'is' and 'are,' and expressing knowledge through rhymes and art activities.",
  valuesStatement:
    "God gave us our home and the things inside it to help us live safely and happily. When we take care of the things in our house, use them properly, and share them with love, we show respect and gratitude to God and our family.",
  procedures: {
    routineActivities: ["Prayer", "Attendance", "Circle Time"],
    motivation: "My House Rhyme & Picture Guessing Game",
    learningStrategies: [
      {
        title: "Show and Tell",
        instructions:
          "The teacher will show pictures of different rooms and things inside the house.",
        questions: [
          "What can you see in each room?",
          "Do you have the same things in your house?",
          "How are you going to take care of your house?",
        ],
      },
      {
        title: "Demonstration",
        instructions:
          "The teacher will model using 'is' and 'are' ('This is a table. These are chairs.') and guide the students in naming single and multiple household items.",
      },
    ],
  },
  assessment: [
    "Color the correct picture being described.",
    "Box the correct name of the picture.",
  ],
  closure:
    "The teacher will recap the importance of things inside the house and lead a thank-you prayer for our home.",
  assignment:
    "Cut out and paste the pictures of the things you use in your house. Page 40",
  remarks: "",
  signatories: {
    preparedBy: "Ms. Kathrynn Ross L. Acola",
    checkedBy: "Mrs. Emma P. Dunque Lpt.",
    observedBy: "Mrs. Emma P. Dunque Lpt.",
  },
  generatedIllustrationUrl: SAMPLE_ILLUSTRATIONS.k2_language,
  illustrationStyle: "comic_story",
};

export const sampleK2MathPlan: LccpLearningPlan = {
  templateType: "lccp",
  header: {
    institution: "LA CONSOLACION COLLEGE-PASIG",
    address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
    title: "LEARNING PLAN",
    schoolYear: "S.Y. 2026-2027",
  },
  subject: "Mathematics",
  gradeLevel: "Kinder 2",
  dateCoverage: "Week 6 – August 17-21, 2026",
  term: "Term 1",
  objectives: [
    "Count and identify numbers from 11 to 20.",
    "Match number symbols with the correct quantity of objects.",
    "Write numbers 11 to 20 neatly in the worktext.",
  ],
  subjectMatter: {
    lesson: "Numbers 11 to 20",
    references: "Early Beginnings: Mathematics Kinder worktext",
  },
  learningCompetencies: "",
  valuesStatement:
    "I use numbers and shapes to learn and solve problems. I try my best, share with my classmates, and thank God for my mind that helps me count, think, and grow.",
  procedures: {
    routineActivities: ["Prayer", "Attendance", "Circle Time"],
    motivation: "Counting Song: Ten Little Friends & Number Flashcard Hunt",
    learningStrategies: [
      {
        title: "Practice and Drill",
        instructions:
          "The teachers will show flashcards and counters for numbers 11 to 20 and guide the learners in counting aloud together.",
      },
      {
        title: "Play base",
        instructions:
          "The teacher will ask students to group blocks into tens and ones to build numbers from 11 to 20.",
      },
    ],
  },
  assessment: [
    "Count the objects in each box and circle the correct number.",
    "Trace and write the numbers 11 to 20 on the lines.",
  ],
  closure:
    "The teacher will review numbers 11 to 20 with the class and praise the students for participating actively.",
  assignment:
    "Practice writing numbers 11 to 20 in your Mathematics notebook.",
  remarks: "",
  signatories: {
    preparedBy: "Ms. Kathrynn Ross L. Acola",
    checkedBy: "Mrs. Emma P. Dunque Lpt.",
    observedBy: "Mrs. Emma P. Dunque Lpt.",
  },
  generatedIllustrationUrl: SAMPLE_ILLUSTRATIONS.k2_math,
  illustrationStyle: "math_concept_sets",
};

export const sampleK2SciencePlan: LccpLearningPlan = {
  templateType: "lccp",
  header: {
    institution: "LA CONSOLACION COLLEGE-PASIG",
    address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
    title: "LEARNING PLAN",
    schoolYear: "S.Y. 2026-2027",
  },
  subject: "Science",
  gradeLevel: "Kinder 2",
  dateCoverage: "Week 6 – August 17-21, 2026",
  term: "Term 1",
  objectives: [
    "Identify the five sense organs and their uses.",
    "Demonstrate ways to care for the eyes, ears, nose, tongue, and skin.",
  ],
  subjectMatter: {
    lesson: "Care for the Sense Organs",
    references: "Early Beginnings: Science Kinder worktext, pp. 21-25",
  },
  learningCompetencies:
    "Demonstrate awareness of proper ways to care for the sense organs to keep the body healthy and safe.",
  valuesStatement:
    "I thank God for my five senses. I will take good care of my eyes, ears, nose, tongue, and skin every day.",
  procedures: {
    routineActivities: ["Prayer", "Attendance", "Circle Time"],
    motivation:
      "Five Senses Action Song\nGuide Question:\n1. What body parts help us see, hear, smell, taste, and touch?\n2. How do we keep our sense organs clean and safe?",
    learningStrategies: [
      {
        title: "Show and Tell",
        instructions:
          "The teacher will show pictures of children taking care of their eyes, ears, nose, tongue, and skin.",
      },
      {
        title: "Demonstration",
        instructions:
          "The teacher will demonstrate proper habits for protecting the five sense organs.",
      },
      {
        title: "Art of questioning",
        instructions:
          "The teacher will ask the students which habits are good and which habits can harm our sense organs.",
      },
    ],
  },
  assessment: [
    "Page 23: Put a check (/) on the picture that shows proper care for the sense organs.",
    "Page 25: Color the pictures that show good habits for keeping our senses healthy.",
  ],
  closure:
    "Remind the students that our five senses are wonderful gifts from God that we must protect every day.",
  assignment:
    "Take a video and recite this value statement, “I thank God for my five senses and I will take care of them every day.”",
  remarks: "",
  signatories: {
    preparedBy: "Ms. Kathrynn Ross L. Acola",
    checkedBy: "Mrs. Emma P. Dunque Lpt.",
    observedBy: "Mrs. Emma P. Dunque Lpt.",
  },
  generatedIllustrationUrl: SAMPLE_ILLUSTRATIONS.k2_science,
  illustrationStyle: "comic_story",
};

export const sampleK2RvePlan: LccpLearningPlan = {
  templateType: "lccp",
  rveFormat: "portrait",
  header: {
    institution: "LA CONSOLACION COLLEGE-PASIG",
    address: "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
    title: "LEARNING PLAN",
    schoolYear: "S.Y. 2026-2027",
  },
  subject: "RVE",
  gradeLevel: "Kinder 2",
  dateCoverage: "Week 10 – September 28 - October 2, 2026",
  term: "Term 2",
  objectives: [
    "Identify who Jesus is as the Son of God and our Savior;",
    "Color the pictures that show how Jesus loves and helps people;",
    "Show love for Jesus by praying and being kind to others.",
  ],
  subjectMatter: {
    lesson: "Lesson 9: God Gives Us Jesus",
    references: "Seed of Faith Christian Life and Character Education Series, pp. 62-66",
  },
  learningCompetencies: "",
  valuesStatement:
    "Bible verse: “For God so loved the world that He gave His one and only Son.” – John 3:16",
  procedures: {
    routineActivities: ["Prayer", "Attendance", "Circle Time"],
    motivation:
      "The teacher will show a picture of Baby Jesus with Mary and Joseph and sing the song “Jesus Loves the Little Children”.\nGuide Question:\n1. Who is in the picture?\n2. Why did God send Jesus to us?",
    learningStrategies: [
      {
        title: "Play based (sharing what you have)",
        instructions:
          "The teacher will pass a heart token around the circle and invite each child to share one way they can show love like Jesus.",
      },
      {
        title: "Demonstration (Sharing the message)",
        instructions:
          "The teacher will read the message from the bible, John 3:16, and explain how God gave us Jesus because He loves us.",
      },
    ],
  },
  assessment: [
    "A. Color the picture of Jesus blessing the children on page 64.",
    "B. Draw a heart beside the pictures that show love and kindness on page 65.",
  ],
  closure:
    "The teacher will remind the students that Jesus is God's greatest gift of love to us, and we thank Him by loving one another.",
  assignment:
    "Answer page 66 with the help of your parents.",
  remarks: "",
  signatories: {
    preparedBy: "Ms. Kathrynn Ross L. Acola",
    checkedBy: "Mrs. Emma P. Dunque Lpt.",
    observedBy: "Mrs. Emma P. Dunque Lpt.",
  },
  adidse: {
    unitTitle: "SECOND TERM\nUNIT II: WE GIVE GLORY TO GOD",
    lessonTitle: "LESSON 9: GOD GIVES US JESUS",
    sectionName: "KINDER 2 – OUR LADY OF CONSOLATION",
    weekDate: "WEEK # 10 / September 28 - October 2, 2026",
    valueFocus: "Love, Faith, and Gratitude to God",
    references: "Seed of faith, God’s Gift of Character, Bible",
    materialsNeeded: "Textbook, Crayons, Laptop, Tv",
    integritas: "Arts – Drawing and Coloring",
    coreValues: {
      laudatoSi: "Thanking God for all creation and for the gift of life through Jesus.",
      justiceAndPeace: "Following Jesus by sharing peace, fairness, and kindness with everyone.",
      genderAndDevelopment: "Jesus loves and welcomes all boys and girls equally.",
      lccpCare: "Showing compassion and care to classmates and family just as Jesus cared for others.",
    },
    routineActivities: [
      "Opening Prayer",
      "Flag ceremony",
      "What’s the weather today?",
      "Checking of Attendance",
      "Sharing of Feelings",
    ],
    lectio: "Story/Picture of God's Gift of Jesus (Seed of Faith, p. 62)",
    meditatio: [
      "Who did God send to show His great love for us?",
      "How can you show love and kindness like Jesus at home and in school?",
    ],
    oratio: "Read a message from the bible; “For God so loved the world that He gave His one and only Son.” (John 3:16)",
    contemplatio: "Reflect: “Thank You, God, for giving us Jesus.”",
    communicatio: "Sharing the message of faith.",
    inputDeepening: "Value Statement: Jesus is God's greatest gift of love to us.",
    furtherDiscussion: "The teacher will discuss how we can thank God for Jesus through prayer, obedience, and helping others.",
    closingSong: "Closing Song",
    closingPrayer: "Closing Prayer",
    synthesis: [
      "God gave us Jesus because He loves us very much.",
      "We show our love for Jesus when we pray and help others.",
    ],
    evaluation: [
      "Page 64: Color the picture of Jesus blessing the children.",
      "Page 65: Draw a heart beside the pictures that show kindness.",
    ],
  },
  generatedIllustrationUrl: SAMPLE_ILLUSTRATIONS.k2_rve,
  illustrationStyle: "comic_story",
};
