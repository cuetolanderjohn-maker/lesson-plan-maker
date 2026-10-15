import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  convertInchesToTwip,
} from "docx";
import type { MatatagLessonPlan, LccpLearningPlan, TeacherProfile } from "./types";

const BORDER_STYLE = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: "000000",
};

const TABLE_BORDERS = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE,
  insideHorizontal: BORDER_STYLE,
  insideVertical: BORDER_STYLE,
};

function p(text: string, options?: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; size?: number; italic?: boolean }) {
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: { before: 40, after: 40, line: 240 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: options?.size || 20, // 10pt
        bold: options?.bold || false,
        italics: options?.italic || false,
      }),
    ],
  });
}

function cell(
  paragraphs: Paragraph | Paragraph[],
  options?: {
    colSpan?: number;
    widthPercent?: number;
    shadingColor?: string;
  }
) {
  const children = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  return new TableCell({
    columnSpan: options?.colSpan || 1,
    width: options?.widthPercent
      ? { size: options.widthPercent, type: WidthType.PERCENTAGE }
      : undefined,
    shading: options?.shadingColor
      ? { fill: options.shadingColor }
      : undefined,
    margins: {
      top: 100,
      bottom: 100,
      left: 140,
      right: 140,
    },
    verticalAlign: VerticalAlign.TOP,
    children,
  });
}

/**
 * Generates an exact Microsoft Word document for the DepEd MATATAG / Banghay-Aralin format
 * Matching Kat's files: Grade 1 - FILIPINO - LP- WEEK 10 and K2 - LP - WEEK 1-3.docx
 */
export async function generateMatatagDocx(plan: MatatagLessonPlan, profile?: TeacherProfile) {
  const prepName = profile?.teacherNameFilipino || plan.signatories.preparedBy;
  const checkName = profile?.coordinatorGrade1 || plan.signatories.checkedBy;
  const obsName = profile?.coordinatorGrade1 || plan.signatories.observedBy;

  const rows: TableRow[] = [];

  // Row 0: Title Header
  rows.push(
    new TableRow({
      children: [
        cell(
          [
            p(`Banghay- Aralin sa ${plan.subject.toUpperCase()}`, { bold: true, align: AlignmentType.CENTER, size: 24 }),
            p(plan.schoolYear || "S.Y. 2026-2027", { bold: true, align: AlignmentType.CENTER, size: 20 }),
          ],
          { colSpan: 3, shadingColor: "F2F2F2" }
        ),
      ],
    })
  );

  // Row 1: Metadata Row (3 columns)
  rows.push(
    new TableRow({
      children: [
        cell([
          p("Subject:", { bold: true }),
          p(plan.subject),
        ], { widthPercent: 33 }),
        cell([
          p("Grade & Section:", { bold: true }),
          p(plan.gradeSection),
        ], { widthPercent: 33 }),
        cell([
          p(`Date Coverage: ${plan.dateCoverage}`, { bold: true }),
          p(`Term & Week: ${plan.termWeek}`, { bold: true }),
        ], { widthPercent: 34 }),
      ],
    })
  );

  // Row 2: Objectives & Subject Matter (2 columns split)
  const objParagraphs: Paragraph[] = [
    p("I. Mga Layunin sa Pagkatuto:", { bold: true }),
    p("Sa pagtatapos ng talakayan, ang mga mag-aaral ay inaasahang;"),
    ...plan.objectives.map((obj) => p(`• ${obj}`)),
  ];

  const subjParagraphs: Paragraph[] = [
    p("II. Paksang Aralin:", { bold: true }),
    p(`Paksa: ${plan.subjectMatter.paksa}`),
    ...(plan.subjectMatter.wika ? [p(`Wika: ${plan.subjectMatter.wika}`)] : []),
    p(`Sanggunian: ${plan.subjectMatter.sanggunian}`),
    p("Deklarasyon sa Paggamit ng AI: DO 3 s 2026 Annex", { bold: true, size: 18 }),
    p(plan.subjectMatter.aiDeclaration, { italic: true, size: 18 }),
  ];

  rows.push(
    new TableRow({
      children: [
        cell(objParagraphs, { widthPercent: 50, colSpan: 1 }),
        cell(subjParagraphs, { widthPercent: 50, colSpan: 2 }),
      ],
    })
  );

  // Row 3: Learning Competencies
  rows.push(
    new TableRow({
      children: [
        cell(
          [
            p("III. Mga Kasanayan sa Pagkatuto:", { bold: true }),
            p(plan.learningCompetencies),
          ],
          { colSpan: 3 }
        ),
      ],
    })
  );

  // Row 4: Integrasyon Title
  rows.push(
    new TableRow({
      children: [
        cell([p("IV. Integrasyon:", { bold: true })], { colSpan: 3, shadingColor: "F8F8F8" }),
      ],
    })
  );

  // Rows 5-10: 6 Integration Items
  const integrationsList = [
    { name: "Laudato Si'", val: plan.integrations.laudatoSi },
    { name: "Justice and Peace Education", val: plan.integrations.justiceAndPeace },
    { name: "Gender and Development", val: plan.integrations.genderAndDevelopment },
    { name: "LCCP- Care", val: plan.integrations.lccpCare },
    { name: "Integrasyong Interdisiplinaryo", val: plan.integrations.interdisciplinary },
    { name: "Paggamit ng Teknolohiya sa Pagtuturo", val: plan.integrations.techTeaching },
  ];

  for (const item of integrationsList) {
    rows.push(
      new TableRow({
        children: [
          cell([p(item.name, { bold: true })], { widthPercent: 35 }),
          cell([p(item.val || "—")], { colSpan: 2, widthPercent: 65 }),
        ],
      })
    );
  }

  // Row 11: Procedures (Pamamaraan)
  const procParagraphs: Paragraph[] = [
    p("Pamamaraan:", { bold: true, size: 22 }),
    p("a. Mga Panimulang Gawain (5-10 mins)", { bold: true }),
    ...plan.procedures.routine.map((r) => p(`  • ${r}`)),
    p("b. Pagganyak (15 mins)", { bold: true }),
    p(`  ${plan.procedures.motivation}`),
    p("c. Pagtalakay ng Aralin: (Day 1-4/30 mins)", { bold: true }),
    ...plan.procedures.discussion.steps.map((st) => p(`  • ${st}`)),
    p(`  Pamamaraan sa Pagturo: ${plan.procedures.discussion.teachingMethods}`, { italic: true }),
    p("  Gabay na tanong:", { bold: true }),
    ...plan.procedures.discussion.guideQuestions.map((q, i) => p(`    ${i + 1}. ${q}`)),
    ...(plan.procedures.discussion.deepening.length > 0
      ? [
          p("  Pagpapalalim:", { bold: true }),
          ...plan.procedures.discussion.deepening.map((d, i) => p(`    ${i + 1}. ${d}`)),
        ]
      : []),
    p("d. Integrasyon ng Pagpapahalaga: (Day 4/ 15 mins)", { bold: true }),
    p(`  ${plan.procedures.valuesIntegration}`),
    p("e. Pagbubuod: (Day 4/ 15 mins)", { bold: true }),
    p(`  ${plan.procedures.summary}`),
  ];

  rows.push(
    new TableRow({
      children: [cell(procParagraphs, { colSpan: 3 })],
    })
  );

  // Row 12: Assessment
  const assessParagraphs: Paragraph[] = [
    p("VI - Pagtataya: (Day 5/ 20 mins)", { bold: true }),
    p(`• Formative – ${plan.assessment.formative}`),
    p(`• Summative – ${plan.assessment.summativeInstruction}`),
    ...plan.assessment.summativeItems.map((item, idx) => p(`    ${idx + 1}. ${item}`)),
  ];
  rows.push(new TableRow({ children: [cell(assessParagraphs, { colSpan: 3 })] }));

  // Row 13: Assignment
  rows.push(
    new TableRow({
      children: [
        cell([p("VII – Takdang Aralin:", { bold: true }), p(plan.assignment)], { colSpan: 3 }),
      ],
    })
  );

  // Row 14: Remarks / Reflections
  rows.push(
    new TableRow({
      children: [
        cell([p("Mga Tala at Pagninilay:", { bold: true }), p(plan.remarks || "N/A")], { colSpan: 3 }),
      ],
    })
  );

  // Row 15: Signatories (3 columns)
  rows.push(
    new TableRow({
      children: [
        cell([p("Inihanda ni:", { bold: true }), p(prepName)], { widthPercent: 33 }),
        cell([p("Sinuri ni:", { bold: true }), p(checkName)], { widthPercent: 33 }),
        cell([p("Inobserbahan ni:", { bold: true }), p(obsName)], { widthPercent: 34 }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children: [
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: TABLE_BORDERS,
          }),
        ],
      },
    ],
  });

  if (typeof window !== "undefined") {
    return await Packer.toBlob(doc);
  }
  return await Packer.toBuffer(doc);
}

/**
 * Generates an exact Microsoft Word document for the LCCP Institutional Learning Plan format
 * Matching Kat's files: K2-LANGUAGE-LP.docx and K2-SCIENCE LP.docx
 */
export async function generateLccpDocx(plan: LccpLearningPlan, profile?: TeacherProfile) {
  const prepName = profile?.teacherName || plan.signatories.preparedBy;
  const checkName = profile?.coordinatorKinder || plan.signatories.checkedBy;
  const obsName = profile?.coordinatorKinder || plan.signatories.observedBy;

  const rows: TableRow[] = [];

  // Row 0: School Header
  rows.push(
    new TableRow({
      children: [
        cell(
          [
            p(plan.header.institution, { bold: true, align: AlignmentType.CENTER, size: 22 }),
            p(plan.header.address, { align: AlignmentType.CENTER, size: 18 }),
            p(plan.header.title, { bold: true, align: AlignmentType.CENTER, size: 22 }),
            p(plan.header.schoolYear, { bold: true, align: AlignmentType.CENTER, size: 20 }),
          ],
          { colSpan: 3, shadingColor: "F2F2F2" }
        ),
      ],
    })
  );

  // Row 1: Metadata Row (3 cols)
  rows.push(
    new TableRow({
      children: [
        cell([p(`Subject: ${plan.subject}`, { bold: true })], { widthPercent: 33 }),
        cell([p(`Grade Level: ${plan.gradeLevel}`, { bold: true })], { widthPercent: 33 }),
        cell([p(`Date Coverage: ${plan.dateCoverage} | ${plan.term}`, { bold: true })], { widthPercent: 34 }),
      ],
    })
  );

  // Row 2: Objectives & Subject Matter
  const objParagraphs: Paragraph[] = [
    p("I Learning Objectives: At the end of the lesson the students will be able to:", { bold: true }),
    ...plan.objectives.map((obj) => p(`• ${obj}`)),
  ];

  const subjParagraphs: Paragraph[] = [
    p("II Subject Matter", { bold: true }),
    p(`Lesson: ${plan.subjectMatter.lesson}`),
    p(`Reference/s: ${plan.subjectMatter.references}`),
  ];

  rows.push(
    new TableRow({
      children: [
        cell(objParagraphs, { widthPercent: 50 }),
        cell(subjParagraphs, { widthPercent: 50, colSpan: 2 }),
      ],
    })
  );

  // Row 3: Learning Competencies
  rows.push(
    new TableRow({
      children: [
        cell([p("III - Learning Competencies:", { bold: true }), p(plan.learningCompetencies)], { colSpan: 3 }),
      ],
    })
  );

  // Row 4: Values Statement
  rows.push(
    new TableRow({
      children: [
        cell([p("III- Values Statement:", { bold: true }), p(plan.valuesStatement)], { colSpan: 3 }),
      ],
    })
  );

  // Row 5: Procedures
  const procParagraphs: Paragraph[] = [
    p("IV- Procedures:", { bold: true }),
    p("a. Routine Activities", { bold: true }),
    ...plan.procedures.routineActivities.map((r) => p(`  • ${r}`)),
    p(`b. Motivation: ${plan.procedures.motivation}`, { bold: true }),
    p("c. Learning Strategies", { bold: true }),
    ...plan.procedures.learningStrategies.flatMap((strat) => [
      p(`  • ${strat.title}: ${strat.instructions}`, { bold: false }),
      ...(strat.questions ? strat.questions.map((q) => p(`     - ${q}`)) : []),
    ]),
  ];

  rows.push(
    new TableRow({
      children: [cell(procParagraphs, { colSpan: 3 })],
    })
  );

  // Row 6: Assessment
  rows.push(
    new TableRow({
      children: [
        cell(
          [
            p("V- Assessment:", { bold: true }),
            ...plan.assessment.map((a) => p(`• ${a}`)),
          ],
          { colSpan: 3 }
        ),
      ],
    })
  );

  // Row 7: Closure
  rows.push(
    new TableRow({
      children: [
        cell([p("VI- Closure:", { bold: true }), p(plan.closure)], { colSpan: 3 }),
      ],
    })
  );

  // Row 8: Assignment
  rows.push(
    new TableRow({
      children: [
        cell([p("VII- Assignment:", { bold: true }), p(plan.assignment)], { colSpan: 3 }),
      ],
    })
  );

  // Row 9: Remarks
  rows.push(
    new TableRow({
      children: [
        cell([p("Remarks:", { bold: true }), p(plan.remarks || "Accomplished successfully.")], { colSpan: 3 }),
      ],
    })
  );

  // Row 10: Signatories
  rows.push(
    new TableRow({
      children: [
        cell([p("Prepared by:", { bold: true }), p(prepName)], { widthPercent: 33 }),
        cell([p("Checked by:", { bold: true }), p(checkName)], { widthPercent: 33 }),
        cell([p("Observed by:", { bold: true }), p(obsName)], { widthPercent: 34 }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children: [
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: TABLE_BORDERS,
          }),
        ],
      },
    ],
  });

  if (typeof window !== "undefined") {
    return await Packer.toBlob(doc);
  }
  return await Packer.toBuffer(doc);
}
