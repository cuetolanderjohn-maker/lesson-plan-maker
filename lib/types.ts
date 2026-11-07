export type GradeLevel = "kinder2" | "grade1";
export type Subject = "filipino" | "language" | "science" | "math" | "rve";
export type TemplateType = "matatag" | "lccp";
export type RveFormatType = "portrait" | "landscape_adidse";
export type IllustrationStyle = "comic_story" | "pag_uugnay_speech" | "math_concept_sets";


export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

export type AIProvider = "groq" | "gemini" | "openrouter" | "mistral" | "free_cloud" | "custom_openai";

export interface TeacherProfile {
  schoolName: string;
  schoolAddress: string;
  teacherName: string;
  teacherNameFilipino: string;
  schoolYear: string;
  sectionKinder: string;
  sectionGrade1: string;
  coordinatorKinder: string;
  coordinatorGrade1: string;
  groqApiKey?: string;
  groqModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  aiProvider?: AIProvider;
  openRouterApiKey?: string;
  openRouterModel?: string;
  mistralApiKey?: string;
  mistralModel?: string;
  customBaseUrl?: string;
  customApiKey?: string;
  customModel?: string;
}

/**
 * Template A: DepEd MATATAG / Banghay-Aralin format
 * Used for Grade 1 & Kinder 2 Filipino
 */
export interface MatatagLessonPlan {
  templateType: "matatag";
  schoolYear: string;
  subject: string;
  gradeSection: string;
  dateCoverage: string;
  termWeek: string;
  objectives: string[];
  subjectMatter: {
    paksa: string;
    wika?: string;
    sanggunian: string;
    aiDeclaration: string;
  };
  learningCompetencies: string;
  integrations: {
    laudatoSi: string;
    justiceAndPeace: string;
    genderAndDevelopment: string;
    lccpCare: string;
    interdisciplinary: string;
    techTeaching: string;
  };
  procedures: {
    routine: string[];
    motivation: string;
    discussion: {
      steps: string[];
      teachingMethods: string;
      guideQuestions: string[];
      deepening: string[];
    };
    valuesIntegration: string;
    summary: string;
  };
  assessment: {
    formative: string;
    summativeInstruction: string;
    summativeItems: string[];
  };
  assignment: string;
  remarks: string;
  signatories: {
    preparedBy: string;
    checkedBy: string;
    observedBy: string;
  };
  generatedIllustrationUrl?: string;
  illustrationCaption?: string;
  illustrationPanels?: string[];
  illustrationStyle?: IllustrationStyle;
}

export interface RveAdidseContent {
  unitTitle: string;
  lessonTitle: string;
  sectionName: string;
  weekDate: string;
  valueFocus: string;
  references: string;
  materialsNeeded: string;
  integritas: string;
  coreValues: {
    laudatoSi: string;
    justiceAndPeace: string;
    genderAndDevelopment: string;
    lccpCare: string;
  };
  routineActivities: string[];
  lectio: string;
  meditatio: string[];
  oratio: string;
  contemplatio: string;
  communicatio: string;
  inputDeepening: string;
  furtherDiscussion: string;
  closingSong: string;
  closingPrayer: string;
  synthesis: string[];
  evaluation: string[];
}

/**
 * Template B: LCCP Institutional Learning Plan format
 * Used for Kinder 2 Language, Science, Mathematics, and RVE (Portrait & 5-Column Landscape ADIDSE)
 */
export interface LccpLearningPlan {
  templateType: "lccp";
  rveFormat?: RveFormatType;
  adidse?: RveAdidseContent;
  header: {
    institution: string;
    address: string;
    title: string;
    schoolYear: string;
  };
  subject: string;
  gradeLevel: string;
  dateCoverage: string;
  term: string;
  objectives: string[];
  subjectMatter: {
    lesson: string;
    references: string;
  };
  learningCompetencies: string;
  valuesStatement: string;
  procedures: {
    routineActivities: string[];
    motivation: string;
    learningStrategies: {
      title: string;
      instructions: string;
      questions?: string[];
    }[];
  };
  assessment: string[];
  closure: string;
  assignment: string;
  remarks: string;
  signatories: {
    preparedBy: string;
    checkedBy: string;
    observedBy: string;
  };
  generatedIllustrationUrl?: string;
  illustrationCaption?: string;
  illustrationPanels?: string[];
  illustrationStyle?: IllustrationStyle;
}

export type LessonPlan = MatatagLessonPlan | LccpLearningPlan;

export interface GenerateRequestMeta {
  gradeLevel: GradeLevel;
  subject: Subject;
  templateType?: TemplateType;
  rveFormat?: RveFormatType;
  weekNumber?: string;
  dateCoverage?: string;
  term?: string;
  bookReference?: string;
}
