"use client";

import React, { useState } from "react";
import { Download, Printer, Copy, Check, Edit3, Sparkles } from "lucide-react";
import type { LessonPlan, MatatagLessonPlan, LccpLearningPlan, TeacherProfile } from "@/lib/types";
import { generateMatatagDocx, generateLccpDocx } from "@/lib/docxGenerator";
import { saveAs } from "file-saver";

interface LessonPlanPreviewProps {
  plan: LessonPlan;
  profile: TeacherProfile;
  onUpdatePlan: (updated: LessonPlan) => void;
}

export const LessonPlanPreview: React.FC<LessonPlanPreviewProps> = ({
  plan,
  profile,
  onUpdatePlan,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      if (plan.templateType === "matatag") {
        const blob = await generateMatatagDocx(plan, profile);
        saveAs(blob as Blob, `${plan.gradeSection} - ${plan.subject} - LP.docx`);
      } else {
        const blob = await generateLccpDocx(plan, profile);
        saveAs(blob as Blob, `${plan.gradeLevel} - ${plan.subject} - LP.docx`);
      }
    } catch (err) {
      console.error("DOCX generation error:", err);
      alert("Failed to export Word document: " + err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let plainText = "";
    if (plan.templateType === "matatag") {
      plainText = `Banghay- Aralin sa ${plan.subject}\n${plan.schoolYear}\n\n` +
        `Subject: ${plan.subject} | Grade & Section: ${plan.gradeSection} | Date: ${plan.dateCoverage} (${plan.termWeek})\n\n` +
        `I. Mga Layunin sa Pagkatuto:\n${plan.objectives.map((o) => `• ${o}`).join("\n")}\n\n` +
        `II. Paksang Aralin:\nPaksa: ${plan.subjectMatter.paksa}\nWika: ${plan.subjectMatter.wika || "—"}\nSanggunian: ${plan.subjectMatter.sanggunian}\nAI Declaration: ${plan.subjectMatter.aiDeclaration}\n\n` +
        `III. Mga Kasanayan sa Pagkatuto:\n${plan.learningCompetencies}\n\n` +
        `IV. Integrasyon:\n` +
        `• Laudato Si: ${plan.integrations.laudatoSi}\n` +
        `• Justice and Peace: ${plan.integrations.justiceAndPeace}\n` +
        `• Gender & Development: ${plan.integrations.genderAndDevelopment}\n` +
        `• LCCP- Care: ${plan.integrations.lccpCare}\n` +
        `• Interdisciplinary: ${plan.integrations.interdisciplinary}\n` +
        `• Tech in Teaching: ${plan.integrations.techTeaching}\n\n` +
        `Pamamaraan:\n` +
        `a. Routine: ${plan.procedures.routine.join(", ")}\n` +
        `b. Pagganyak: ${plan.procedures.motivation}\n` +
        `c. Pagtalakay: ${plan.procedures.discussion.steps.join("\n")}\n` +
        `   Gabay na tanong:\n${plan.procedures.discussion.guideQuestions.map((q, i) => `   ${i + 1}. ${q}`).join("\n")}\n` +
        `d. Values Integration: ${plan.procedures.valuesIntegration}\n` +
        `e. Summary: ${plan.procedures.summary}\n\n` +
        `VI. Pagtataya:\nFormative: ${plan.assessment.formative}\nSummative: ${plan.assessment.summativeInstruction}\n${plan.assessment.summativeItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\n` +
        `VII. Takdang-Aralin:\n${plan.assignment}\n\n` +
        `Signatories:\nInihanda ni: ${plan.signatories.preparedBy} | Sinuri ni: ${plan.signatories.checkedBy} | Inobserbahan ni: ${plan.signatories.observedBy}`;
    } else {
      plainText = `${plan.header.institution}\n${plan.header.address}\n${plan.header.title} ${plan.header.schoolYear}\n\n` +
        `Subject: ${plan.subject} | Grade: ${plan.gradeLevel} | Date: ${plan.dateCoverage} (${plan.term})\n\n` +
        `I. Learning Objectives:\n${plan.objectives.map((o) => `• ${o}`).join("\n")}\n\n` +
        `II. Subject Matter:\nLesson: ${plan.subjectMatter.lesson}\nReference/s: ${plan.subjectMatter.references}\n\n` +
        `III. Learning Competencies:\n${plan.learningCompetencies}\n\n` +
        `III. Values Statement:\n${plan.valuesStatement}\n\n` +
        `IV. Procedures:\n` +
        `a. Routine: ${plan.procedures.routineActivities.join(", ")}\n` +
        `b. Motivation: ${plan.procedures.motivation}\n` +
        `c. Strategies:\n${plan.procedures.learningStrategies.map((s) => `• ${s.title}: ${s.instructions}`).join("\n")}\n\n` +
        `V. Assessment:\n${plan.assessment.map((a) => `• ${a}`).join("\n")}\n\n` +
        `VI. Closure:\n${plan.closure}\n\n` +
        `VII. Assignment:\n${plan.assignment}\n\n` +
        `Signatories:\nPrepared by: ${plan.signatories.preparedBy} | Checked by: ${plan.signatories.checkedBy} | Observed by: ${plan.signatories.observedBy}`;
    }

    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Helper for inline editing of string fields
  const updateField = (path: string, val: string) => {
    const updated = JSON.parse(JSON.stringify(plan));
    const parts = path.split(".");
    let current = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = val;
    onUpdatePlan(updated);
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="no-print bg-surface rounded-2xl border border-borderMuted p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
            <Edit3 className="w-4 h-4 text-sage-600" />
            <span>Interactive Live Document</span>
          </span>
          <span className="text-[11px] text-gray-400">
            (Click any text to edit directly)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-surface hover:bg-canvas border border-borderMuted transition-colors"
            title="Copy plain text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-sage-600" />
                <span className="text-sage-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-surface hover:bg-canvas border border-borderMuted transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 shadow-xs transition-colors disabled:opacity-50"
            title="Download official Microsoft Word document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Generating..." : "Download .docx"}</span>
          </button>
        </div>
      </div>

      {/* Rendered Official School Table */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-md p-6 sm:p-10 text-gray-800 font-sans print:shadow-none print:border-none print:p-0">
        {plan.templateType === "matatag" ? (
          <MatatagRenderer plan={plan} onUpdateField={updateField} />
        ) : (
          <LccpRenderer plan={plan} onUpdateField={updateField} />
        )}
      </div>
    </div>
  );
};

/* Sub-renderer for DepEd MATATAG / Banghay-Aralin format */
const MatatagRenderer: React.FC<{
  plan: MatatagLessonPlan;
  onUpdateField: (path: string, val: string) => void;
}> = ({ plan, onUpdateField }) => {
  return (
    <div className="border border-black overflow-x-auto text-[13px] leading-relaxed">
      {/* Title Header */}
      <div className="bg-gray-100 p-2 text-center border-b border-black font-bold text-sm tracking-wide">
        Banghay- Aralin sa {plan.subject.toUpperCase()}
        <div className="text-xs font-semibold">{plan.schoolYear}</div>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-3 border-b border-black divide-x divide-black text-xs font-medium">
        <div className="p-2">
          <span className="font-bold block">Subject:</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("subject", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.subject}
          </span>
        </div>
        <div className="p-2">
          <span className="font-bold block">Grade & Section:</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("gradeSection", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.gradeSection}
          </span>
        </div>
        <div className="p-2">
          <span className="font-bold">Date Coverage: </span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("dateCoverage", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.dateCoverage}
          </span>
          <br />
          <span className="font-bold">Term & Week: </span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("termWeek", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.termWeek}
          </span>
        </div>
      </div>

      {/* Objectives and Subject Matter */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black divide-y md:divide-y-0 md:divide-x divide-black">
        {/* Objectives */}
        <div className="p-3">
          <p className="font-bold mb-1">I. Mga Layunin sa Pagkatuto:</p>
          <p className="text-xs text-gray-600 mb-2">
            Sa pagtatapos ng talakayan, ang mga mag-aaral ay inaasahang:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {plan.objectives.map((obj, i) => (
              <li
                key={i}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const updated = [...plan.objectives];
                  updated[i] = e.currentTarget.textContent || "";
                  onUpdateField("objectives", updated as unknown as string);
                }}
                className="outline-none focus:bg-sage-50"
              >
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Subject Matter */}
        <div className="p-3 space-y-2">
          <p className="font-bold">II. Paksang Aralin:</p>
          <div>
            <span className="font-bold">Paksa: </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("subjectMatter.paksa", e.currentTarget.textContent || "")}
              className="outline-none focus:bg-sage-50"
            >
              {plan.subjectMatter.paksa}
            </span>
          </div>
          {plan.subjectMatter.wika && (
            <div>
              <span className="font-bold">Wika: </span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField("subjectMatter.wika", e.currentTarget.textContent || "")}
                className="outline-none focus:bg-sage-50"
              >
                {plan.subjectMatter.wika}
              </span>
            </div>
          )}
          <div>
            <span className="font-bold">Sanggunian: </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("subjectMatter.sanggunian", e.currentTarget.textContent || "")}
              className="outline-none focus:bg-sage-50"
            >
              {plan.subjectMatter.sanggunian}
            </span>
          </div>
          <div className="pt-2 text-xs border-t border-gray-200">
            <span className="font-bold block">Deklarasyon sa Paggamit ng AI: DO 3 s 2026 Annex</span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("subjectMatter.aiDeclaration", e.currentTarget.textContent || "")}
              className="italic text-gray-600 outline-none focus:bg-sage-50"
            >
              {plan.subjectMatter.aiDeclaration}
            </span>
          </div>
        </div>
      </div>

      {/* Learning Competencies */}
      <div className="p-3 border-b border-black">
        <p className="font-bold mb-1">III. Mga Kasanayan sa Pagkatuto:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("learningCompetencies", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50"
        >
          {plan.learningCompetencies}
        </p>
      </div>

      {/* Integrasyon Table */}
      <div className="border-b border-black">
        <div className="bg-gray-50 p-2 font-bold border-b border-black">
          IV. Integrasyon:
        </div>
        <div className="divide-y divide-black text-xs">
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 font-semibold">Laudato Si&apos;</div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("integrations.laudatoSi", e.currentTarget.textContent || "")}
              className="col-span-2 p-2 outline-none focus:bg-sage-50"
            >
              {plan.integrations.laudatoSi || "—"}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 font-semibold">Justice and Peace Education</div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("integrations.justiceAndPeace", e.currentTarget.textContent || "")}
              className="col-span-2 p-2 outline-none focus:bg-sage-50"
            >
              {plan.integrations.justiceAndPeace}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 font-semibold">Gender and Development</div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("integrations.genderAndDevelopment", e.currentTarget.textContent || "")}
              className="col-span-2 p-2 outline-none focus:bg-sage-50"
            >
              {plan.integrations.genderAndDevelopment}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 font-semibold">LCCP- Care</div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("integrations.lccpCare", e.currentTarget.textContent || "")}
              className="col-span-2 p-2 outline-none focus:bg-sage-50"
            >
              {plan.integrations.lccpCare}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 font-semibold">Integrasyong Interdisiplinaryo</div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("integrations.interdisciplinary", e.currentTarget.textContent || "")}
              className="col-span-2 p-2 outline-none focus:bg-sage-50"
            >
              {plan.integrations.interdisciplinary}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">
            <div className="p-2 font-semibold">Paggamit ng Teknolohiya sa Pagtuturo</div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("integrations.techTeaching", e.currentTarget.textContent || "")}
              className="col-span-2 p-2 outline-none focus:bg-sage-50"
            >
              {plan.integrations.techTeaching}
            </div>
          </div>
        </div>
      </div>

      {/* Procedures */}
      <div className="p-3 border-b border-black space-y-3">
        <p className="font-bold text-sm">Pamamaraan:</p>
        
        {/* Routine */}
        <div>
          <p className="font-semibold text-xs text-gray-700">a. Mga Panimulang Gawain (5-10 mins)</p>
          <ul className="list-disc pl-5 text-xs space-y-0.5 mt-1">
            {plan.procedures.routine.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Motivation */}
        <div>
          <p className="font-semibold text-xs text-gray-700">b. Pagganyak (15 mins)</p>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("procedures.motivation", e.currentTarget.textContent || "")}
            className="text-xs mt-1 outline-none focus:bg-sage-50"
          >
            {plan.procedures.motivation}
          </p>
        </div>

        {/* Discussion */}
        <div className="space-y-1.5">
          <p className="font-semibold text-xs text-gray-700">c. Pagtalakay ng Aralin: (Day 1-4/30 mins)</p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            {plan.procedures.discussion.steps.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
          <p className="text-xs italic text-gray-600">
            Pamamaraan sa Pagturo: {plan.procedures.discussion.teachingMethods}
          </p>

          <div className="mt-2 pl-3 border-l-2 border-gray-300 space-y-1">
            <p className="font-semibold text-xs">Gabay na tanong:</p>
            {plan.procedures.discussion.guideQuestions.map((q, i) => (
              <p key={i} className="text-xs">
                {i + 1}. {q}
              </p>
            ))}
            {plan.procedures.discussion.deepening.length > 0 && (
              <>
                <p className="font-semibold text-xs pt-1">Pagpapalalim:</p>
                {plan.procedures.discussion.deepening.map((d, i) => (
                  <p key={i} className="text-xs">
                    {i + 1}. {d}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Values Integration */}
        <div>
          <p className="font-semibold text-xs text-gray-700">d. Integrasyon ng Pagpapahalaga: (Day 4/ 15 mins)</p>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("procedures.valuesIntegration", e.currentTarget.textContent || "")}
            className="text-xs mt-1 outline-none focus:bg-sage-50"
          >
            {plan.procedures.valuesIntegration}
          </p>
        </div>

        {/* Summary */}
        <div>
          <p className="font-semibold text-xs text-gray-700">e. Pagbubuod: (Day 4/ 15 mins)</p>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("procedures.summary", e.currentTarget.textContent || "")}
            className="text-xs mt-1 outline-none focus:bg-sage-50"
          >
            {plan.procedures.summary}
          </p>
        </div>
      </div>

      {/* Assessment */}
      <div className="p-3 border-b border-black space-y-2 text-xs">
        <p className="font-bold text-sm">VI - Pagtataya: (Day 5/ 20 mins)</p>
        <div>
          <span className="font-semibold">• Formative: </span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("assessment.formative", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.assessment.formative}
          </span>
        </div>
        <div>
          <span className="font-semibold">• Summative: </span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("assessment.summativeInstruction", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.assessment.summativeInstruction}
          </span>
          <ol className="list-decimal pl-5 space-y-0.5 mt-1">
            {plan.assessment.summativeItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Assignment */}
      <div className="p-3 border-b border-black text-xs">
        <p className="font-bold text-sm mb-1">VII – Takdang Aralin:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("assignment", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50"
        >
          {plan.assignment}
        </p>
      </div>

      {/* Remarks */}
      <div className="p-3 border-b border-black text-xs">
        <p className="font-bold mb-1">Mga Tala at Pagninilay:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("remarks", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50 italic text-gray-600"
        >
          {plan.remarks}
        </p>
      </div>

      {/* Signatories */}
      <div className="grid grid-cols-3 divide-x divide-black p-3 text-xs">
        <div>
          <span className="font-bold block">Inihanda ni:</span>
          <span>{plan.signatories.preparedBy}</span>
        </div>
        <div className="pl-3">
          <span className="font-bold block">Sinuri ni:</span>
          <span>{plan.signatories.checkedBy}</span>
        </div>
        <div className="pl-3">
          <span className="font-bold block">Inobserbahan ni:</span>
          <span>{plan.signatories.observedBy}</span>
        </div>
      </div>
    </div>
  );
};

/* Sub-renderer for LCCP Institutional format */
const LccpRenderer: React.FC<{
  plan: LccpLearningPlan;
  onUpdateField: (path: string, val: string) => void;
}> = ({ plan, onUpdateField }) => {
  return (
    <div className="border border-black overflow-x-auto text-[13px] leading-relaxed">
      {/* School Header */}
      <div className="bg-gray-100 p-3 text-center border-b border-black">
        <h2 className="font-bold text-sm tracking-wide">{plan.header.institution}</h2>
        <p className="text-xs text-gray-600">{plan.header.address}</p>
        <p className="font-bold text-xs mt-1">{plan.header.title}</p>
        <p className="text-xs font-semibold">{plan.header.schoolYear}</p>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-3 border-b border-black divide-x divide-black text-xs font-medium">
        <div className="p-2">
          <span className="font-bold block">Subject:</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("subject", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.subject}
          </span>
        </div>
        <div className="p-2">
          <span className="font-bold block">Grade Level:</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("gradeLevel", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.gradeLevel}
          </span>
        </div>
        <div className="p-2">
          <span className="font-bold">Date Coverage: </span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("dateCoverage", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.dateCoverage}
          </span>
          <br />
          <span className="font-bold">Term: </span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("term", e.currentTarget.textContent || "")}
            className="outline-none focus:bg-sage-50"
          >
            {plan.term}
          </span>
        </div>
      </div>

      {/* Objectives and Subject Matter */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black divide-y md:divide-y-0 md:divide-x divide-black">
        <div className="p-3">
          <p className="font-bold mb-1">
            I Learning Objectives: At the end of the lesson the students will be able to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {plan.objectives.map((obj, i) => (
              <li
                key={i}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const updated = [...plan.objectives];
                  updated[i] = e.currentTarget.textContent || "";
                  onUpdateField("objectives", updated as unknown as string);
                }}
                className="outline-none focus:bg-sage-50"
              >
                {obj}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 space-y-2">
          <p className="font-bold">II Subject Matter</p>
          <div>
            <span className="font-bold">Lesson: </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("subjectMatter.lesson", e.currentTarget.textContent || "")}
              className="outline-none focus:bg-sage-50"
            >
              {plan.subjectMatter.lesson}
            </span>
          </div>
          <div>
            <span className="font-bold">Reference/s: </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField("subjectMatter.references", e.currentTarget.textContent || "")}
              className="outline-none focus:bg-sage-50"
            >
              {plan.subjectMatter.references}
            </span>
          </div>
        </div>
      </div>

      {/* Competencies */}
      <div className="p-3 border-b border-black">
        <p className="font-bold mb-1">III - Learning Competencies:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("learningCompetencies", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50"
        >
          {plan.learningCompetencies}
        </p>
      </div>

      {/* Values Statement */}
      <div className="p-3 border-b border-black">
        <p className="font-bold mb-1">III- Values Statement:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("valuesStatement", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50 italic text-gray-700"
        >
          {plan.valuesStatement}
        </p>
      </div>

      {/* Procedures */}
      <div className="p-3 border-b border-black space-y-3">
        <p className="font-bold text-sm">IV- Procedures:</p>
        <div>
          <p className="font-semibold text-xs text-gray-700">a. Routine Activities</p>
          <ul className="list-disc pl-5 text-xs space-y-0.5 mt-1">
            {plan.procedures.routineActivities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-xs text-gray-700">b. Motivation:</p>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateField("procedures.motivation", e.currentTarget.textContent || "")}
            className="text-xs mt-1 outline-none focus:bg-sage-50"
          >
            {plan.procedures.motivation}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-xs text-gray-700">c. Learning Strategies</p>
          {plan.procedures.learningStrategies.map((strat, idx) => (
            <div key={idx} className="pl-3 border-l-2 border-gray-200 text-xs">
              <span className="font-bold">{strat.title} – </span>
              <span>{strat.instructions}</span>
              {strat.questions && (
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-gray-600">
                  {strat.questions.map((q, qi) => (
                    <li key={qi}>{q}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assessment */}
      <div className="p-3 border-b border-black text-xs space-y-1">
        <p className="font-bold text-sm mb-1">V- Assessment:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          {plan.assessment.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      {/* Closure */}
      <div className="p-3 border-b border-black text-xs">
        <p className="font-bold mb-1">VI- Closure:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("closure", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50"
        >
          {plan.closure}
        </p>
      </div>

      {/* Assignment */}
      <div className="p-3 border-b border-black text-xs">
        <p className="font-bold mb-1">VII- Assignment:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("assignment", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50"
        >
          {plan.assignment}
        </p>
      </div>

      {/* Remarks */}
      <div className="p-3 border-b border-black text-xs">
        <p className="font-bold mb-1">Remarks:</p>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateField("remarks", e.currentTarget.textContent || "")}
          className="outline-none focus:bg-sage-50 italic text-gray-600"
        >
          {plan.remarks}
        </p>
      </div>

      {/* Signatories */}
      <div className="grid grid-cols-3 divide-x divide-black p-3 text-xs">
        <div>
          <span className="font-bold block">Prepared by:</span>
          <span>{plan.signatories.preparedBy}</span>
        </div>
        <div className="pl-3">
          <span className="font-bold block">Checked by:</span>
          <span>{plan.signatories.checkedBy}</span>
        </div>
        <div className="pl-3">
          <span className="font-bold block">Observed by:</span>
          <span>{plan.signatories.observedBy}</span>
        </div>
      </div>
    </div>
  );
};
