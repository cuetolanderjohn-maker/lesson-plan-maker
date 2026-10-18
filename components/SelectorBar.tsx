"use client";

import React from "react";
import { Sparkles, Calendar, BookOpen, Layers, Languages, FlaskConical, Calculator } from "lucide-react";
import type { GradeLevel, Subject, TemplateType } from "@/lib/types";

interface SelectorBarProps {
  gradeLevel: GradeLevel;
  subject: Subject;
  weekNumber: string;
  term: string;
  dateCoverage: string;
  bookReference: string;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeSubject: (subject: Subject) => void;
  onChangeWeekNumber: (val: string) => void;
  onChangeTerm: (val: string) => void;
  onChangeDateCoverage: (val: string) => void;
  onChangeBookReference: (val: string) => void;
}

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
  const activeTemplate: TemplateType =
    gradeLevel === "grade1" || subject === "filipino" ? "matatag" : "lccp";

  return (
    <div className="bg-surface rounded-2xl border border-borderMuted p-5 shadow-xs space-y-4">
      {/* Grade Level Selection */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Select Grade Level
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChangeGrade("kinder2")}
            className={`py-2.5 px-4 rounded-xl text-xs font-medium border transition-all text-center flex items-center justify-center space-x-2 ${
              gradeLevel === "kinder2"
                ? "bg-sage-50 border-sage-500 text-sage-700 shadow-xs font-semibold"
                : "bg-surface border-borderMuted text-gray-600 hover:bg-canvas"
            }`}
          >
            <span>Kindergarten 2 (K2)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeGrade("grade1")}
            className={`py-2.5 px-4 rounded-xl text-xs font-medium border transition-all text-center flex items-center justify-center space-x-2 ${
              gradeLevel === "grade1"
                ? "bg-sage-50 border-sage-500 text-sage-700 shadow-xs font-semibold"
                : "bg-surface border-borderMuted text-gray-600 hover:bg-canvas"
            }`}
          >
            <span>Grade 1</span>
          </button>
        </div>
      </div>

      {/* Subject Selection */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Select Subject
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onChangeSubject("filipino")}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              subject === "filipino"
                ? "bg-stone-900 border-stone-900 text-white font-semibold shadow-xs"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Filipino</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeSubject("language")}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              subject === "language"
                ? "bg-stone-900 border-stone-900 text-white font-semibold shadow-xs"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Language</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeSubject("science")}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              subject === "science"
                ? "bg-stone-900 border-stone-900 text-white font-semibold shadow-xs"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Science</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeSubject("math")}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              subject === "math"
                ? "bg-stone-900 border-stone-900 text-white font-semibold shadow-xs"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Math</span>
          </button>
        </div>
      </div>

      {/* Active Format Badge */}
      <div className="pt-1">
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-canvas border border-borderMuted/80 text-xs text-gray-600">
          <Layers className="w-4 h-4 text-sage-600 shrink-0" />
          <span className="font-medium">Applied Format:</span>
          {activeTemplate === "matatag" ? (
            <span className="text-sage-700 font-semibold">
              DepEd MATATAG / Banghay-Aralin (with LCCP Core Values & AI DO 3)
            </span>
          ) : (
            <span className="text-sage-700 font-semibold">
              LCCP Institutional Learning Plan (with Catholic Values Statement)
            </span>
          )}
        </div>
      </div>

      {/* Optional Metadata Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">
            Week / Term
          </label>
          <input
            type="text"
            placeholder="e.g. Week 1, Term 1"
            value={weekNumber}
            onChange={(e) => onChangeWeekNumber(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">
            Date Coverage
          </label>
          <input
            type="text"
            placeholder="e.g. Aug 3-7, 2026"
            value={dateCoverage}
            onChange={(e) => onChangeDateCoverage(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">
            Textbook / Reference
          </label>
          <input
            type="text"
            placeholder="Auto-detected if blank"
            value={bookReference}
            onChange={(e) => onChangeBookReference(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
