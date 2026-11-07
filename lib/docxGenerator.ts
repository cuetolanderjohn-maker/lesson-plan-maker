import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  ShadingType,
  ImageRun,
  PageOrientation,
} from "docx";
import { saveAs } from "file-saver";
import type {
  MatatagLessonPlan,
  LccpLearningPlan,
  LessonPlan,
  TeacherProfile,
} from "./types";
import {
  dataUriToUint8Array,
  getLccpBannerBuffer,
  getLccpCrestBuffer,
  getLccpPaascuBuffer,
} from "./schoolLogos";
import { generateFallbackPngDataUri } from "./lessonIllustrationGenerator";

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: "FFFFFF",
};

const BORDERLESS_CELL = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
};

function buildEmbeddedIllustrationParagraphs(
  dataUri: string | undefined,
  width = 330,
  height = 208
): Paragraph[] {
  const effectiveUri = dataUri || generateFallbackPngDataUri(77);
  const bytes = dataUriToUint8Array(effectiveUri);
  if (!bytes || bytes.length < 16) return [];

  const isJpeg =
    effectiveUri.startsWith("data:image/jpeg") ||
    effectiveUri.startsWith("data:image/jpg") ||
    (bytes[0] === 0xff && bytes[1] === 0xd8);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [
        new ImageRun({
          data: bytes,
          transformation: {
            width,
            height,
          },
          type: isJpeg ? "jpg" : "png",
        }),
      ],
    }),
  ];
}


const BORDER_SINGLE = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "000000",
};

const STANDARD_BORDERS = {
  top: BORDER_SINGLE,
  bottom: BORDER_SINGLE,
  left: BORDER_SINGLE,
  right: BORDER_SINGLE,
};

const CELL_PADDING = {
  top: 70,
  bottom: 70,
  left: 110,
  right: 110,
};

const FONT_FAMILY = "Times New Roman";

function p(
  text: string,
  options?: {
    bold?: boolean;
    italics?: boolean;
    size?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
    spacingBefore?: number;
    bullet?: boolean;
    indentLeft?: number;
    color?: string;
  }
): Paragraph {
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spacingBefore ?? 0,
      after: options?.spacingAfter ?? 40,
    },
    indent: options?.indentLeft ? { left: options.indentLeft } : undefined,
    children: [
      new TextRun({
        text: options?.bullet ? `• ${text}` : text,
        bold: options?.bold || false,
        italics: options?.italics || false,
        size: options?.size || 20, // 10pt default for Banghay-Aralin
        font: FONT_FAMILY,
        color: options?.color,
      }),
    ],
  });
}

function pMixed(
  runs: {
    text: string;
    bold?: boolean;
    italics?: boolean;
    size?: number;
    color?: string;
  }[],
  options?: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
    spacingBefore?: number;
    indentLeft?: number;
  }
): Paragraph {
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spacingBefore ?? 0,
      after: options?.spacingAfter ?? 40,
    },
    indent: options?.indentLeft ? { left: options.indentLeft } : undefined,
    children: runs.map(
      (r) =>
        new TextRun({
          text: r.text,
          bold: r.bold || false,
          italics: r.italics || false,
          size: r.size || 20,
          font: FONT_FAMILY,
          color: r.color,
        })
    ),
  });
}

function parseInterdisciplinaryLines(text: string): Paragraph[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [p("")];

  return lines.map((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1 && colonIdx < 25) {
      const label = line.slice(0, colonIdx + 1);
      const rest = line.slice(colonIdx + 1);
      return pMixed([
        { text: label, bold: true, size: 20 },
        { text: rest, size: 20 },
      ]);
    }
    return p(line, { size: 20 });
  });
}

/**
 * Generates Kat's EXACT Banghay-Aralin sa FILIPINO .docx (Grade 1 & Kinder 2 Filipino)
 * Matches G1-Filipino-LP-Week 11.docx, GRADE1-FILIPINO-LP-WEEK14 true.pdf, and K2 - Week 4 Filipino.docx
 */
export async function generateMatatagDocx(
  plan: MatatagLessonPlan,
  profile?: TeacherProfile
): Promise<Blob | Buffer> {
  const isKinder = plan.gradeSection.toLowerCase().includes("kinder");
  const preparedBy =
    plan.signatories?.preparedBy ||
    (isKinder
      ? "Acola, Kathrynn Ross L."
      : profile?.teacherNameFilipino || "Bb. Kathrynn Ross L. Acola");
  const checkedBy =
    plan.signatories?.checkedBy ||
    (isKinder
      ? "Emma P. Dunque, LPT."
      : profile?.coordinatorGrade1 || "Bb. Sta. Ana Florence");
  const observedBy =
    plan.signatories?.observedBy ||
    (isKinder
      ? "Emma P. Dunque, LPT."
      : profile?.coordinatorGrade1 || "Bb. Sta. Ana Florence");

  const bannerBuffer = getLccpBannerBuffer();
  const headerChildren: Paragraph[] = [];

  if (bannerBuffer) {
    headerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 40 },
        children: [
          new ImageRun({
            data: bannerBuffer,
            transformation: {
              width: 245,
              height: 83,
            },
            type: "jpg",
          }),
        ],
      })
    );
  }

  headerChildren.push(
    p("Banghay- Aralin sa FILIPINO", {
      bold: true,
      size: 32, // 16pt Times New Roman bold
      align: AlignmentType.CENTER,
      spacingAfter: 20,
    }),
    p(plan.schoolYear || profile?.schoolYear || "S.Y. 2026-2027", {
      bold: false,
      size: 20, // 10pt Times New Roman regular
      align: AlignmentType.CENTER,
      spacingAfter: 20,
    })
  );

  // Split AI declaration into main header + indented body paragraph matching Kat's files
  const aiLines = (plan.subjectMatter.aiDeclaration || "").split("\n");
  const aiHeaderNote =
    aiLines[0]?.replace(/^DO\s*3\s*s\.?\s*2026\s*Annex\s*/i, "").trim() ||
    "(Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)";
  const aiBodyText =
    aiLines[1]?.trim() ||
    "Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.";

  const rows: TableRow[] = [
    // Row 1: Pure White Header Banner Cell (columnSpan 6)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: headerChildren,
        }),
      ],
    }),

    // Row 2: Exact 3-Column Metadata Row (Subject | Grade & Section | Date Coverage + Term & Week)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Subject:", { bold: true, size: 20 }),
            p("", { size: 20 }),
            p(plan.subject || "FILIPINO", { bold: true, size: 20 }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Grade & Section:", { bold: true, size: 20 }),
            p("", { size: 20 }),
            p(plan.gradeSection || "Grade 1 - OLOPH & OLOG", {
              bold: true,
              size: 20,
            }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p(`Date Coverage: ${plan.dateCoverage}`, { bold: true, size: 20 }),
            p("", { size: 20 }),
            p(`Term & Week: ${plan.termWeek}`, { bold: true, size: 20 }),
          ],
        }),
      ],
    }),

    // Row 3: Two Columns (I. Mga Layunin sa Pagkatuto | II. Paksang Aralin)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("I. Mga Layunin sa Pagkatuto:", { bold: true, size: 20 }),
            p("Sa pagtatapos ng talakayan, ang mga mag-aaral ay inaasahang;", {
              italics: true,
              size: 20,
              spacingAfter: 60,
            }),
            ...plan.objectives.map((obj) =>
              p(obj, { bullet: true, size: 20, indentLeft: 180 })
            ),
          ],
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("II. Paksang Aralin:", { bold: true, size: 20 }),
            pMixed([
              { text: "Paksa: ", bold: true, size: 20 },
              { text: plan.subjectMatter.paksa, size: 20 },
            ]),
            ...(plan.subjectMatter.wika
              ? [
                  pMixed([
                    { text: "Wika: ", bold: true, size: 20 },
                    { text: plan.subjectMatter.wika, size: 20 },
                  ]),
                ]
              : []),
            p("", { size: 16 }),
            p("Sanggunian:", { bold: true, size: 20 }),
            p(plan.subjectMatter.sanggunian, { size: 20, spacingAfter: 60 }),
            pMixed([
              { text: "Deklarasyon sa Paggamit ng AI: ", bold: true, size: 17 },
              { text: "DO 3 s 2026 Annex ", italics: true, size: 17 },
              { text: aiHeaderNote, italics: true, size: 17 },
            ]),
            p(aiBodyText, { size: 17, indentLeft: 360 }),
          ],
        }),
      ],
    }),

    // Row 4: III. Mga Kasanayan sa Pagkatuto
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("III. Mga Kasanayan sa Pagkatuto:", { bold: true, size: 20 }),
            p(plan.learningCompetencies, {
              bullet: isKinder,
              size: 20,
            }),
          ],
        }),
      ],
    }),

    // Row 5: IV. Integrasyon Header (Pure White #FFFFFF)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [p("IV. Integrasyon:", { bold: true, size: 20 })],
        }),
      ],
    }),

    // Row 6: Laudato Si (Kat's Exact Sage Green #93C37D on BOTH cells)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "93C37D", type: ShadingType.CLEAR, color: "auto" },
          children: [p("Laudato Si", { bold: true, size: 20 })],
        }),
        new TableCell({
          columnSpan: 4,
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "93C37D", type: ShadingType.CLEAR, color: "auto" },
          children: [p(plan.integrations.laudatoSi, { italics: true, size: 20 })],
        }),
      ],
    }),

    // Row 7: Justice and Peace Education (Kat's Exact Rust Brown #A34500 on BOTH cells)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "A34500", type: ShadingType.CLEAR, color: "auto" },
          children: [p("Justice and Peace Education", { bold: true, size: 20 })],
        }),
        new TableCell({
          columnSpan: 4,
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "A34500", type: ShadingType.CLEAR, color: "auto" },
          children: [
            p(plan.integrations.justiceAndPeace, { italics: true, size: 20 }),
          ],
        }),
      ],
    }),

    // Row 8: Gender and Development (Kat's Exact Soft Lavender #B4A6D5 on BOTH cells)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "B4A6D5", type: ShadingType.CLEAR, color: "auto" },
          children: [p("Gender and Development", { bold: true, size: 20 })],
        }),
        new TableCell({
          columnSpan: 4,
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "B4A6D5", type: ShadingType.CLEAR, color: "auto" },
          children: [
            p(plan.integrations.genderAndDevelopment, {
              italics: true,
              size: 20,
            }),
          ],
        }),
      ],
    }),

    // Row 9: LCCP- Care (Kat's Exact Amber Orange #FF9900 on BOTH cells)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "FF9900", type: ShadingType.CLEAR, color: "auto" },
          children: [p("LCCP- Care", { bold: true, size: 20 })],
        }),
        new TableCell({
          columnSpan: 4,
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          shading: { fill: "FF9900", type: ShadingType.CLEAR, color: "auto" },
          children: [p(plan.integrations.lccpCare, { italics: true, size: 20 })],
        }),
      ],
    }),

    // Row 10: Integrasyong Interdisiplinaryo (White background)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Integrasyong Interdisiplinaryo", { bold: true, size: 20 }),
          ],
        }),
        new TableCell({
          columnSpan: 4,
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: parseInterdisciplinaryLines(
            plan.integrations.interdisciplinary
          ),
        }),
      ],
    }),

    // Row 11: Paggamit ng Teknolohiya sa Pagtuturo (White background)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Paggamit ng Teknolohiya sa Pagtuturo", { bold: true, size: 20 }),
          ],
        }),
        new TableCell({
          columnSpan: 4,
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p(plan.integrations.techTeaching, { italics: true, size: 20 }),
          ],
        }),
      ],
    }),

    // Row 12: • Pamamaraan
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("• Pamamaraan:", { bold: true, size: 20, spacingAfter: 60 }),
            p(
              isKinder
                ? "a. Mga Panimulang Gawain (5 mins)"
                : "a. Mga Panimulang Gawain (Day 1/10 mins)",
              { bold: true, size: 20, indentLeft: 180 }
            ),
            ...plan.procedures.routine.map((r) =>
              p(r, { bullet: true, size: 20, indentLeft: 360 })
            ),
            p("b. Pagganyak (day 1/15 mins)", {
              bold: true,
              size: 20,
              indentLeft: 180,
              spacingBefore: 60,
            }),
            ...plan.procedures.motivation
              .split("\n")
              .filter(Boolean)
              .map((line) =>
                p(line, { bullet: true, size: 20, indentLeft: 360 })
              ),
            ...buildEmbeddedIllustrationParagraphs(
              plan.generatedIllustrationUrl,
              340,
              214
            ),
            p("c. Pagtalakay ng Aralin: (Day 1-4/30 mins)", {
              bold: true,
              size: 20,
              indentLeft: 180,
              spacingBefore: 60,
            }),
            ...plan.procedures.discussion.steps.map((s) =>
              p(s, { bullet: true, size: 20, indentLeft: 360 })
            ),
            p("Gabay na tanong:", {
              bold: true,
              size: 20,
              indentLeft: 180,
              spacingBefore: 60,
            }),
            ...plan.procedures.discussion.guideQuestions.map((q, idx) =>
              p(`${idx + 1}. ${q}`, { size: 20, indentLeft: 360 })
            ),
            pMixed(
              [
                { text: "Pamamaraan sa Pagturo: ", bold: true, size: 20 },
                {
                  text:
                    plan.procedures.discussion.teachingMethods ||
                    "Demonstrasyon, Talakayan at Pagtatanong, Drill at Practice",
                  italics: true,
                  size: 20,
                },
              ],
              { spacingBefore: 60 }
            ),
            p("Pagpapalalim:", {
              bold: true,
              size: 20,
              spacingBefore: 60,
            }),
            ...plan.procedures.discussion.deepening.map((d) =>
              p(d, { bullet: true, size: 20, indentLeft: 360 })
            ),
            p("d. Integrasyon ng Pagpapahalaga: (Day 4/ 15 mins)", {
              bold: true,
              size: 20,
              indentLeft: 180,
              spacingBefore: 60,
            }),
            p(plan.procedures.valuesIntegration, {
              bullet: true,
              size: 20,
              indentLeft: 360,
            }),
            p("e. Pagbubuod: (Day 4/ 15 mins)", {
              bold: true,
              size: 20,
              indentLeft: 180,
              spacingBefore: 60,
            }),
            ...plan.procedures.summary
              .split("\n")
              .filter(Boolean)
              .map((line) =>
                p(line, { bullet: true, size: 20, indentLeft: 360 })
              ),
          ],
        }),
      ],
    }),

    // Row 13: VI- Pagtataya: (Day 5/ 20 mins)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("VI- Pagtataya: (Day 5/ 20 mins)", {
              bold: true,
              size: 20,
              spacingAfter: 60,
            }),
            ...(isKinder
              ? [
                  ...plan.assessment.formative
                    .split("\n")
                    .filter(Boolean)
                    .map((line) =>
                      p(line, { bullet: true, size: 20, indentLeft: 360 })
                    ),
                  ...(plan.assessment.summativeInstruction
                    ? [
                        p(plan.assessment.summativeInstruction, {
                          bullet: true,
                          size: 20,
                          indentLeft: 360,
                        }),
                      ]
                    : []),
                ]
              : [
                  p("Formative", { bold: true, size: 20 }),
                  ...plan.assessment.formative
                    .split("\n")
                    .filter(Boolean)
                    .map((line) =>
                      p(line, { bullet: true, size: 20, indentLeft: 360 })
                    ),
                  p("Summative", { bold: true, size: 20, spacingBefore: 60 }),
                  ...plan.assessment.summativeInstruction
                    .split("\n")
                    .filter(Boolean)
                    .map((line) => p(line, { bold: true, size: 20 })),
                  ...plan.assessment.summativeItems.map((item, idx) =>
                    p(`${idx + 1}. ${item}`, { size: 20 })
                  ),
                ]),
          ],
        }),
      ],
    }),

    // Row 14: VII- Takdang- Aralin:
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("VII- Takdang- Aralin:", { bold: true, size: 20 }),
            p(plan.assignment, { size: 20 }),
          ],
        }),
      ],
    }),

    // Row 15: Mga Tala at Pagninilay:
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Mga Tala at Pagninilay:", { bold: true, size: 20 }),
            p(plan.remarks || "", { size: 20, spacingAfter: 120 }),
          ],
        }),
      ],
    }),

    // Row 16: 3-Column Signatories (Inihanda / Sinuri / Inobserbahan)
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 33, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p(isKinder ? "Inihanda ni:" : "Inihanda:", {
              bold: true,
              size: 20,
              spacingAfter: 120,
            }),
            p(preparedBy, { bold: true, size: 20 }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 33, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p(isKinder ? "Sinuri ni:" : "Sinuri:", {
              bold: true,
              size: 20,
              spacingAfter: 120,
            }),
            p(checkedBy, { bold: true, size: 20 }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 34, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p(isKinder ? "Inobserbahan ni:" : "Inobserbahan:", {
              bold: true,
              size: 20,
              spacingAfter: 120,
            }),
            p(observedBy, { bold: true, size: 20 }),
          ],
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240, // 8.5 inches
              height: 20160, // 14 inches (Legal paper matching Kat's files)
            },
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
        ],
      },
    ],
  });

  if (typeof window === "undefined") {
    return await Packer.toBuffer(doc);
  }
  return await Packer.toBlob(doc);
}

/**
 * Generates Kat's 5-Column Landscape RELIGION LEARNING PLAN (ADIDSE / Lectio-Divina Format)
 * Matches WEEK 1-3 RVE LP.docx and RVE LESSON 4-8
 */
async function generateRveAdidseLandscapeDocx(
  plan: LccpLearningPlan,
  profile?: TeacherProfile
): Promise<Blob | Buffer> {
  const adidse = plan.adidse!;
  const bannerBuffer = getLccpBannerBuffer();
  const topChildren: (Paragraph | Table)[] = [];

  if (bannerBuffer) {
    topChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new ImageRun({
            data: bannerBuffer,
            transformation: {
              width: 260,
              height: 88,
            },
            type: "jpg",
          }),
        ],
      })
    );
  }

  // Top Metadata Block
  topChildren.push(
    pMixed(
      [
        {
          text: "SUBJECT/ LEVEL: RELIGION – KINDER 2\t\t\t\tGRADE & SECTION: ",
          bold: true,
          size: 20,
        },
        {
          text: adidse.sectionName || "KINDER 2 – OUR LADY OF CONSOLATION",
          bold: true,
          size: 20,
        },
      ],
      { spacingAfter: 20 }
    ),
    pMixed(
      [
        {
          text: `SCHOOL YEAR : ${
            plan.header.schoolYear || profile?.schoolYear || "2026 - 2027"
          }\t\t\t\t\tWEEK # / DATE: `,
          bold: true,
          size: 20,
        },
        {
          text: adidse.weekDate || plan.dateCoverage,
          bold: true,
          size: 20,
        },
      ],
      { spacingAfter: 100 }
    )
  );

  // Nested 4-Row Core Values Table inside Column 1 of Row 3
  const nestedCoreValuesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "92D050", type: ShadingType.CLEAR, color: "auto" },
            children: [p("Laudato Si", { bold: true, size: 18 })],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [p(adidse.coreValues.laudatoSi, { size: 18 })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "EE0000", type: ShadingType.CLEAR, color: "auto" },
            children: [
              p("Justice & Peace Education", {
                bold: true,
                size: 18,
                color: "FFFFFF",
              }),
            ],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [p(adidse.coreValues.justiceAndPeace, { size: 18 })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "BC8FDD", type: ShadingType.CLEAR, color: "auto" },
            children: [p("Gender & Development", { bold: true, size: 18 })],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [p(adidse.coreValues.genderAndDevelopment, { size: 18 })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "F57E1B", type: ShadingType.CLEAR, color: "auto" },
            children: [p("LCCP Care", { bold: true, size: 18 })],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [p(adidse.coreValues.lccpCare, { size: 18 })],
          }),
        ],
      }),
    ],
  });

  // 5-Column Main ADIDSE Table
  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Row 1: Sky Blue #8DB3E2 Header Row
      new TableRow({
        children: [
          new TableCell({
            width: { size: 24, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "8DB3E2", type: ShadingType.CLEAR, color: "auto" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              p("CONTENT/ OBJECTIVES", {
                bold: true,
                size: 20,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "8DB3E2", type: ShadingType.CLEAR, color: "auto" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              p("ALL ABOUT MY EXPERIENCE", {
                bold: true,
                size: 20,
                align: AlignmentType.CENTER,
              }),
              p("(Activity – Discussion)", {
                italics: true,
                size: 18,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 26, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "8DB3E2", type: ShadingType.CLEAR, color: "auto" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              p("ALL ABOUT FAITH", {
                bold: true,
                size: 20,
                align: AlignmentType.CENTER,
              }),
              p("(Input – Further Discussion)", {
                italics: true,
                size: 18,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "8DB3E2", type: ShadingType.CLEAR, color: "auto" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              p("ALL ABOUT MY LEARNING", {
                bold: true,
                size: 20,
                align: AlignmentType.CENTER,
              }),
              p("(Integrated Synthesis – Evaluation)", {
                italics: true,
                size: 18,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            shading: { fill: "8DB3E2", type: ShadingType.CLEAR, color: "auto" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              p("Remarks", {
                bold: true,
                size: 20,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),

      // Row 2: Unit & Lesson Banner Row
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: adidse.unitTitle
              .split("\n")
              .map((line) =>
                p(line, {
                  bold: true,
                  size: 20,
                  align: AlignmentType.CENTER,
                })
              ),
          }),
          new TableCell({
            columnSpan: 2,
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              p(adidse.lessonTitle || plan.subjectMatter.lesson, {
                bold: true,
                size: 20,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [p("", { size: 20 })],
          }),
        ],
      }),

      // Row 3: 5-Column Main Content Row
      new TableRow({
        children: [
          // Col 1: LECTIO-DIVINA + Objectives + A/B/C/D + Nested Core Values Table
          new TableCell({
            width: { size: 24, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [
              p("LECTIO- DIVINA", { bold: true, size: 20, spacingAfter: 40 }),
              p("Objectives: At the end of lesson the learners can:", {
                bold: true,
                size: 19,
              }),
              ...plan.objectives.map((obj) =>
                p(obj, { bullet: true, size: 19, indentLeft: 140 })
              ),
              p("A. VALUE FOCUS:", { bold: true, size: 19, spacingBefore: 60 }),
              p(adidse.valueFocus, { size: 19 }),
              pMixed(
                [
                  { text: "B. REFERENCE: ", bold: true, size: 19 },
                  { text: adidse.references, size: 19 },
                ],
                { spacingBefore: 40 }
              ),
              pMixed(
                [
                  { text: "C. MATERIALS NEEDED: ", bold: true, size: 19 },
                  { text: adidse.materialsNeeded, size: 19 },
                ],
                { spacingBefore: 40 }
              ),
              pMixed(
                [
                  { text: "D. INTEGRITAS: ", bold: true, size: 19 },
                  { text: adidse.integritas, size: 19 },
                ],
                { spacingBefore: 40, spacingAfter: 60 }
              ),
              nestedCoreValuesTable,
            ],
          }),

          // Col 2: I. ROUTINE ACTIVITIES
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [
              p("I. ROUTINE ACTIVITIES", {
                bold: true,
                size: 20,
                spacingAfter: 60,
              }),
              ...adidse.routineActivities.map((act) =>
                p(act, { bullet: true, size: 19, indentLeft: 140 })
              ),
            ],
          }),

          // Col 3: II. Augustinian Lectio- Divina Proper (ADIDSE)
          new TableCell({
            width: { size: 26, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [
              p("II. Augustinian Lectio- Divina Proper (ADIDSE)", {
                bold: true,
                size: 20,
                spacingAfter: 60,
              }),
              p("Lectio:", { bold: true, size: 19 }),
              p(adidse.lectio, { size: 19, spacingAfter: 40 }),
              ...buildEmbeddedIllustrationParagraphs(
                plan.generatedIllustrationUrl,
                195,
                123
              ),
              p("Meditatio: The teacher will ask the students:", {
                bold: true,
                size: 19,
              }),
              ...adidse.meditatio.map((m) =>
                p(m, { bullet: true, size: 19, indentLeft: 140 })
              ),
              p("Oratio:", { bold: true, size: 19, spacingBefore: 40 }),
              p(adidse.oratio, { bullet: true, size: 19, indentLeft: 140 }),
              p("Contemplatio:", { bold: true, size: 19, spacingBefore: 40 }),
              p(adidse.contemplatio, {
                bullet: true,
                size: 19,
                indentLeft: 140,
              }),
              p("Communicatio:", { bold: true, size: 19, spacingBefore: 40 }),
              p(adidse.communicatio, {
                bullet: true,
                size: 19,
                indentLeft: 140,
              }),
              p("INPUT/ DEEPENING:", {
                bold: true,
                size: 19,
                spacingBefore: 60,
              }),
              p(adidse.inputDeepening, {
                bullet: true,
                size: 19,
                indentLeft: 140,
              }),
              p("FURTHER DISCUSSION:", {
                bold: true,
                size: 19,
                spacingBefore: 60,
              }),
              p(adidse.furtherDiscussion, {
                bullet: true,
                size: 19,
                indentLeft: 140,
              }),
            ],
          }),

          // Col 4: Closing Song/Prayer, SYNTHESIS, EVALUATION
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [
              p(`➢ ${adidse.closingSong || "Closing Song"}`, {
                bold: true,
                size: 19,
              }),
              p(`➢ ${adidse.closingPrayer || "Closing Prayer"}`, {
                bold: true,
                size: 19,
                spacingAfter: 60,
              }),
              p("SYNTHESIS:", { bold: true, size: 19 }),
              ...adidse.synthesis.map((s) =>
                p(s, { bullet: true, size: 19, indentLeft: 140 })
              ),
              p("EVALUATION:", { bold: true, size: 19, spacingBefore: 60 }),
              ...adidse.evaluation.map((ev) =>
                p(ev, { bullet: true, size: 19, indentLeft: 140 })
              ),
            ],
          }),

          // Col 5: Remarks
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: STANDARD_BORDERS,
            margins: CELL_PADDING,
            children: [p(plan.remarks || "", { size: 19 })],
          }),
        ],
      }),
    ],
  });

  topChildren.push(
    mainTable,
    pMixed(
      [
        {
          text: "PREPARED BY : Acola, Kathrynn Ross L. (Subject Teacher)\t\tCHECKED BY : _____________________ (SAC, RELIGION/VE/ GMRC)\t\tOBSERVED BY : _______________________",
          bold: true,
          size: 18,
        },
      ],
      { spacingBefore: 120, spacingAfter: 60 }
    ),
    p("R E L I G I O N   L E A R N I N G   P L A N", {
      bold: true,
      size: 20,
      align: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 12240,
              height: 18720,
            },
            margin: {
              top: 560,
              bottom: 560,
              left: 560,
              right: 560,
            },
          },
        },
        children: topChildren,
      },
    ],
  });

  if (typeof window === "undefined") {
    return await Packer.toBuffer(doc);
  }
  return await Packer.toBlob(doc);
}

/**
 * Generates Kat's EXACT LA CONSOLACION COLLEGE-PASIG LEARNING PLAN .docx
 * Matches K2 -WEEK 6 - MATHEMATICS.docx, K2-SCIENCE-W6.docx, and RVE LESSON 9.docx
 * (Or 5-Column Landscape ADIDSE Religion Learning Plan when rveFormat === "landscape_adidse")
 */
export async function generateLccpDocx(
  plan: LccpLearningPlan,
  profile?: TeacherProfile
): Promise<Blob | Buffer> {
  if (
    plan.subject.toUpperCase() === "RVE" &&
    plan.rveFormat === "landscape_adidse" &&
    plan.adidse
  ) {
    return generateRveAdidseLandscapeDocx(plan, profile);
  }

  const isRve = plan.subject.toUpperCase() === "RVE";
  const preparedBy =
    plan.signatories?.preparedBy ||
    profile?.teacherName ||
    "Ms. Kathrynn Ross L. Acola";
  const checkedBy =
    plan.signatories?.checkedBy ||
    profile?.coordinatorKinder ||
    "Mrs. Emma P. Dunque Lpt.";
  const observedBy =
    plan.signatories?.observedBy ||
    profile?.coordinatorKinder ||
    "Mrs. Emma P. Dunque Lpt.";

  const crestBuffer = getLccpCrestBuffer();
  const paascuBuffer = getLccpPaascuBuffer();

  const headerTextParagraphs: Paragraph[] = [
    p(
      plan.header?.institution ||
        profile?.schoolName ||
        "LA CONSOLACION COLLEGE-PASIG",
      {
        bold: true,
        size: 28, // 14pt Times New Roman bold
        align: AlignmentType.CENTER,
        spacingAfter: 20,
      }
    ),
    p(
      plan.header?.address ||
        profile?.schoolAddress ||
        "641 Mercedes Avenue, Brgy. San Miguel, Pasig City",
      {
        bold: true,
        size: 26,
        align: AlignmentType.CENTER,
        spacingAfter: 20,
      }
    ),
    p(plan.header?.title || "LEARNING PLAN", {
      bold: true,
      size: 28,
      align: AlignmentType.CENTER,
      spacingAfter: 20,
    }),
    p(
      plan.header?.schoolYear ||
        profile?.schoolYear ||
        "S.Y. 2026-2027",
      {
        bold: true,
        size: 26,
        align: AlignmentType.CENTER,
        spacingAfter: 20,
      }
    ),
  ];

  // Borderless 3-Column Header Table inside Row 1 so BOTH the LCCP Seal (Left) and PAASCU Level II Logo (Right) are always present
  const dualLogoHeaderTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: BORDERLESS_CELL,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: crestBuffer
                  ? [
                      new ImageRun({
                        data: crestBuffer,
                        transformation: {
                          width: 68,
                          height: 68,
                        },
                        type: "png",
                      }),
                    ]
                  : [],
              }),
            ],
          }),
          new TableCell({
            width: { size: 64, type: WidthType.PERCENTAGE },
            borders: BORDERLESS_CELL,
            verticalAlign: VerticalAlign.CENTER,
            children: headerTextParagraphs,
          }),
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: BORDERLESS_CELL,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: paascuBuffer
                  ? [
                      new ImageRun({
                        data: paascuBuffer,
                        transformation: {
                          width: 82,
                          height: 68,
                        },
                        type: "png",
                      }),
                    ]
                  : [],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const rows: TableRow[] = [
    // Row 1: Pure White Header Cell (columnSpan 3) containing Dual Logos + Centered Title Lines
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [dualLogoHeaderTable],
        }),
      ],
    }),

    // Row 2: 3-Column Metadata Row (Subject | Grade Level | Date Coverage + Term)
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            pMixed([
              { text: "Subject: ", bold: true, size: 24 },
              { text: plan.subject, size: 24 },
            ]),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            pMixed([
              { text: "Grade Level: ", bold: true, size: 24 },
              { text: plan.gradeLevel || "Kinder 2", size: 24 },
            ]),
          ],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            pMixed([
              { text: "Date Coverage: ", bold: true, size: 24 },
              { text: plan.dateCoverage, size: 24 },
            ]),
            p(plan.term || "Term 1", { bold: true, size: 24 }),
          ],
        }),
      ],
    }),

    // Row 3: 2-Column Split (I Learning Objectives | II Subject Matter)
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            pMixed([
              { text: "I Learning Objectives: ", bold: true, size: 24 },
              {
                text: "At the end of the lesson the students will be able to:",
                size: 24,
              },
            ]),
            ...plan.objectives.map((obj, idx) =>
              isRve
                ? p(`${String.fromCharCode(97 + idx)}. ${obj}`, {
                    size: 24,
                    indentLeft: 240,
                  })
                : p(obj, { bullet: true, size: 24, indentLeft: 240 })
            ),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("II Subject Matter", { bold: true, size: 24 }),
            pMixed([
              { text: "Lesson: ", bold: true, size: 24 },
              { text: plan.subjectMatter.lesson, size: 24 },
            ]),
            p("", { size: 16 }),
            pMixed([
              { text: "Reference/s: ", bold: true, size: 24 },
              { text: plan.subjectMatter.references, size: 24 },
            ]),
          ],
        }),
      ],
    }),

    // Optional Row 4: III - Learning Competencies (when present, e.g. Science Weeks 6-7)
    ...(plan.learningCompetencies && plan.learningCompetencies.trim().length > 0
      ? [
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 3,
                borders: STANDARD_BORDERS,
                margins: CELL_PADDING,
                children: [
                  p("III - Learning Competencies:", { bold: true, size: 24 }),
                  p(plan.learningCompetencies, {
                    bullet: true,
                    size: 24,
                    indentLeft: 240,
                  }),
                ],
              }),
            ],
          }),
        ]
      : []),

    // Row 5: III- Values Statement
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("III- Values Statement:", { bold: true, size: 24 }),
            p(plan.valuesStatement, {
              bullet: !isRve,
              size: 24,
              indentLeft: isRve ? 0 : 240,
            }),
          ],
        }),
      ],
    }),

    // Row 6: IV- Procedures
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("IV- Procedures:", { bold: true, size: 24 }),
            p("a. Routine Activities", {
              bold: true,
              size: 24,
              indentLeft: 240,
            }),
            ...plan.procedures.routineActivities.map((act) =>
              p(act, { bullet: true, size: 24, indentLeft: 480 })
            ),
            p("b. Motivation:", {
              bold: true,
              size: 24,
              indentLeft: 240,
              spacingBefore: 60,
            }),
            ...plan.procedures.motivation
              .split("\n")
              .filter(Boolean)
              .map((line) =>
                p(line, {
                  bold: /^guide question/i.test(line.trim()),
                  size: 24,
                  indentLeft: 480,
                })
              ),
            ...buildEmbeddedIllustrationParagraphs(
              plan.generatedIllustrationUrl,
              340,
              214
            ),
            p("c. Learning Strategies", {
              bold: true,
              size: 24,
              indentLeft: 240,
              spacingBefore: 60,
            }),
            ...plan.procedures.learningStrategies.flatMap((strat) => [
              pMixed(
                [
                  { text: `${strat.title} – `, bold: true, size: 24 },
                  { text: strat.instructions, size: 24 },
                ],
                { indentLeft: 360, spacingBefore: 40 }
              ),
              ...(strat.questions && strat.questions.length > 0
                ? [
                    p("Guide Questions:", {
                      bold: true,
                      size: 24,
                      indentLeft: 480,
                    }),
                    ...strat.questions.map((q, qIdx) =>
                      p(`${qIdx + 1}. ${q}`, { size: 24, indentLeft: 600 })
                    ),
                  ]
                : []),
            ]),
          ],
        }),
      ],
    }),

    // Row 7: V- Assessment
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("V- Assessment:", { bold: true, size: 24 }),
            ...plan.assessment.map((item) =>
              p(item, {
                bullet: !/^[A-Z]\./.test(item.trim()),
                size: 24,
                indentLeft: 240,
              })
            ),
          ],
        }),
      ],
    }),

    // Row 8: VI- Closure
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("VI- Closure:", { bold: true, size: 24 }),
            p(plan.closure, { size: 24 }),
          ],
        }),
      ],
    }),

    // Row 9: VII- Assignment
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("VII- Assignment:", { bold: true, size: 24 }),
            p(plan.assignment, { size: 24 }),
          ],
        }),
      ],
    }),

    // Row 10: Remarks
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Remarks:", { bold: true, size: 24 }),
            p(plan.remarks || "", { size: 24, spacingAfter: 120 }),
          ],
        }),
      ],
    }),

    // Row 11: 3-Column Signatories (Prepared by / Checked by / Observed by)
    new TableRow({
      children: [
        new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Prepared by:", { bold: true, size: 24, spacingAfter: 120 }),
            p(preparedBy, { size: 24 }),
          ],
        }),
        new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Checked by:", { bold: true, size: 24, spacingAfter: 120 }),
            p(checkedBy, { size: 24 }),
          ],
        }),
        new TableCell({
          width: { size: 34, type: WidthType.PERCENTAGE },
          borders: STANDARD_BORDERS,
          margins: CELL_PADDING,
          children: [
            p("Observed by:", { bold: true, size: 24, spacingAfter: 120 }),
            p(observedBy, { size: 24 }),
          ],
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240, // 8.5 inches
              height: 20160, // 14 inches (Legal paper matching Kat's files)
            },
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
        ],
      },
    ],
  });

  if (typeof window === "undefined") {
    return await Packer.toBuffer(doc);
  }
  return await Packer.toBlob(doc);
}

export async function downloadLessonPlanDocx(
  plan: LessonPlan,
  profile?: TeacherProfile
): Promise<void> {
  const blob =
    plan.templateType === "matatag"
      ? await generateMatatagDocx(plan, profile)
      : await generateLccpDocx(plan, profile);

  const rawTopic =
    plan.templateType === "matatag"
      ? plan.subjectMatter.paksa
      : plan.subjectMatter.lesson;
  const cleanTopic = (rawTopic || "Lesson_Plan")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);

  const fileName =
    plan.templateType === "matatag"
      ? `${
          plan.gradeSection.toLowerCase().includes("kinder")
            ? "K2-FILIPINO"
            : "GRADE1-FILIPINO-LP"
        }-${cleanTopic}.docx`
      : `K2-${plan.subject.toUpperCase()}-${cleanTopic}.docx`;

  saveAs(blob as Blob, fileName);
}
