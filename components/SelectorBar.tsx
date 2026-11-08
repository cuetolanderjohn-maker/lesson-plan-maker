"use client";

import React from "react";
import type { GradeLevel, Subject } from "@/lib/types";
import { GraduationCap, BookOpen, Calendar, Layers, Library } from "lucide-react";

interface SelectorBarProps {
  gradeLevel: GradeLevel;
  subject: Subject;
  weekNumber: string;
  term: string;
  dateCoverage: string;
  bookReference: string;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeSubject: (subject: Subject) => void;
  onChangeWeekNumber: (week: string) => void;
  onChangeTerm: (term: string) => void;
  onChangeDateCoverage: (date: string) => void;
  onChangeBookReference: (book: string) => void;
}

const DEFAULT_BOOK_HINTS: Record<string, string> = {
  "grade1-filipino": "Gr.1 Dawani",
  "kinder2-filipino": "Masayang Mag-aaral ng Filipino",
  "kinder2-language": "Early Beginnings: Language Kinder worktext",
  "kinder2-science": "Early Beginnings: Science Kinder worktext",
  "kinder2-math": "Early Beginnings: Mathematics Kinder worktext",
  "kinder2-rve": "Seed of Faith Christian Life and Character Education Series",
};

export const SelectorBar: React.FC<SelectorBarProps> = ({
  gradeLevel,
  subject,
  weekNumber,
  term,
  dateCoverage,
  bookReference,
  onChangeGrade,
  onChangeSubject,
  onChangeWeekNumber,
  onChangeTerm,
  onChangeDateCoverage,
  onChangeBookReference,
}) => {
  const defaultBookHint =
    DEFAULT_BOOK_HINTS[`${gradeLevel}-${subject}`] ||
    "e.g. Gr.1 Dawani / Early Beginnings Kinder worktext";

  return (
    <div className="bg-surface rounded-2xl border border-borderMuted p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Grade Level (Full Width 2-Column Pill) */}
      <div>
        <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-sage-600 shrink-0" />
          <span>Grade Level</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-canvas rounded-xl border border-borderMuted">
          <button
            type="button"
            onClick={() => onChangeGrade("kinder2")}
            className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${
              gradeLevel === "kinder2"
                ? "bg-sage-600 text-white shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-surface/60"
            }`}
          >
            Kinder 2
          </button>
          <button
            type="button"
            onClick={() => onChangeGrade("grade1")}
            className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center leading-tight ${
              gradeLevel === "grade1"
                ? "bg-sage-600 text-white shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-surface/60"
            }`}
          >
            Grade 1 (OLOPH &amp; OLOG)
          </button>
        </div>
      </div>

      {/* Subject (Full Width 3-Column Grid so labels never overlap or clip) */}
      <div>
        <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-sage-600 shrink-0" />
          <span>Subject</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-canvas rounded-xl border border-borderMuted">
          {(
            [
              { id: "filipino", label: "Filipino" },
              { id: "language", label: "Language" },
              { id: "science", label: "Science" },
              { id: "math", label: "Math" },
              { id: "rve", label: "RVE" },
            ] as { id: Subject; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSubject(item.id)}
              className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer text-center whitespace-nowrap overflow-hidden text-ellipsis ${
                subject === item.id
                  ? "bg-sage-600 text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-surface/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata Overrides: Term + Week Number on Row 1, Date Coverage + Textbook full-width below */}
      <div className="space-y-3 pt-3 border-t border-borderMuted/60">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center space-x-1 text-[11px] font-medium text-gray-600 mb-1">
              <Layers className="w-3 h-3 text-sage-600 shrink-0" />
              <span>Term</span>
            </label>
            <select
              value={term}
              onChange={(e) => onChangeTerm(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-borderMuted bg-canvas/50 focus:bg-surface focus:outline-none focus:border-sage-500 text-gray-800"
            >
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-1 text-[11px] font-medium text-gray-600 mb-1">
              <Calendar className="w-3 h-3 text-sage-600 shrink-0" />
              <span>Week Number</span>
            </label>
            <input
              type="text"
              value={weekNumber}
              onChange={(e) => onChangeWeekNumber(e.target.value)}
              placeholder="e.g. Week 14"
              className="w-full text-xs px-3 py-2 rounded-lg border border-borderMuted bg-canvas/50 focus:bg-surface focus:outline-none focus:border-sage-500 text-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-1 text-[11px] font-medium text-gray-600 mb-1">
            <Calendar className="w-3 h-3 text-sage-600 shrink-0" />
            <span>Date Coverage</span>
          </label>
          <input
            type="text"
            value={dateCoverage}
            onChange={(e) => onChangeDateCoverage(e.target.value)}
            placeholder="e.g. October 26-30, 2026"
            className="w-full text-xs px-3 py-2 rounded-lg border border-borderMuted bg-canvas/50 focus:bg-surface focus:outline-none focus:border-sage-500 text-gray-800"
          />
        </div>

        <div>
          <label className="flex items-center space-x-1 text-[11px] font-medium text-gray-600 mb-1">
            <Library className="w-3 h-3 text-sage-600 shrink-0" />
            <span>Textbook / Reference</span>
          </label>
          <input
            type="text"
            value={bookReference}
            onChange={(e) => onChangeBookReference(e.target.value)}
            placeholder={defaultBookHint}
            className="w-full text-xs px-3 py-2 rounded-lg border border-borderMuted bg-canvas/50 focus:bg-surface focus:outline-none focus:border-sage-500 text-gray-800"
          />
        </div>
      </div>

      {/* Format Indicator Pill */}
      <div className="space-y-1 pt-2 border-t border-borderMuted/60 text-[11px] text-gray-500 leading-relaxed">
        <div>
          Selected Format:{" "}
          <strong className="text-sage-700 font-semibold">
            {gradeLevel === "grade1" || subject === "filipino"
              ? "Banghay- Aralin sa FILIPINO (DepEd MATATAG / LCCP Table)"
              : subject === "rve"
              ? "LCCP Learning Plan / 5-Column ADIDSE Religion Table"
              : "LA CONSOLACION COLLEGE-PASIG LEARNING PLAN"}
          </strong>
        </div>
        <div className="text-gray-400">
          Default Book: <em className="text-gray-600">{defaultBookHint}</em>
        </div>
      </div>
    </div>
  );
};
