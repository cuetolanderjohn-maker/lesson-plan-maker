export type GradeLevel = "kinder2" | "grade1";
export type Subject = "filipino" | "language" | "science" | "math";
export type TemplateType = "matatag" | "lccp";

export interface ImageInput {
  base64Data: string;
  mimeType: string;
}

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
}

/**
 * Template B: LCCP Institutional Learning Plan format
 * Used for Kinder 2 English, Science, Mathematics
 */
export interface LccpLearningPlan {
  templateType: "lccp";
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
}

export type LessonPlan = MatatagLessonPlan | LccpLearningPlan;

export interface GenerateRequestMeta {
  gradeLevel: GradeLevel;
  subject: Subject;
  templateType?: TemplateType;
  weekNumber?: string;
  dateCoverage?: string;
  term?: string;
  bookReference?: string;
}
