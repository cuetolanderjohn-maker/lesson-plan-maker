"use client";

import React, { useState } from "react";
import {
  Brain,
  CheckCircle2,
  HelpCircle,
  ListOrdered,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Edit3,
} from "lucide-react";
import type { LearnedTextbookContent } from "@/lib/nlpAnalyzer";

interface LearnedInsightsCardProps {
  learned: LearnedTextbookContent;
  onUpdateLearned: (updated: LearnedTextbookContent) => void;
  onGeneratePlan: () => void;
  isGenerating?: boolean;
}

export const LearnedInsightsCard: React.FC<LearnedInsightsCardProps> = ({
  learned,
  onUpdateLearned,
  onGeneratePlan,
  isGenerating = false,
}) => {
  const [showRawText, setShowRawText] = useState(false);
  const [newVocab, setNewVocab] = useState("");

  const handleTopicChange = (newTopic: string) => {
    onUpdateLearned({
      ...learned,
      topic: newTopic,
    });
  };

  const handleAddVocab = () => {
    if (!newVocab.trim()) return;
    const word = newVocab.trim();
    if (!learned.vocabulary.includes(word)) {
      onUpdateLearned({
        ...learned,
        vocabulary: [...learned.vocabulary, word],
      });
    }
    setNewVocab("");
  };

  const handleRemoveVocab = (idx: number) => {
    const next = [...learned.vocabulary];
    next.splice(idx, 1);
    onUpdateLearned({
      ...learned,
      vocabulary: next,
    });
  };

  return (
    <div className="bg-surface rounded-2xl border-2 border-sage-300 p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderMuted pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center border border-sage-300 shadow-2xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                What the AI Learned from Your Textbook
              </h3>
              <span className="text-[10px] font-semibold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-200">
                {learned.confidenceScore}% Analyzed
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Review and verify the learned content below before creating your official plan.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-sage-600 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden sm:inline">Photo Analyzed</span>
        </div>
      </div>

      {/* 1. Detected Topic / Aralin */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
          <Edit3 className="w-3.5 h-3.5 text-sage-600" />
          <span>Learned Lesson Title / Paksa:</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={learned.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-canvas border border-sage-200 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-300 text-gray-800 transition-all"
            placeholder="e.g. Aralin 5: Ang Ating Pamilya"
          />
          {learned.pageNumber && (
            <span className="absolute right-3 top-2.5 text-[10px] bg-sage-100 text-sage-700 px-2 py-0.5 rounded-md font-medium">
              {learned.pageNumber}
            </span>
          )}
        </div>
      </div>

      {/* 2. Detected Key Vocabulary */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
          <Tag className="w-3.5 h-3.5 text-sage-600" />
          <span>Learned Vocabulary & Key Words:</span>
        </label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {learned.vocabulary.map((vocab, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-sage-50 text-sage-700 border border-sage-200 font-medium"
            >
              <span>{vocab}</span>
              <button
                type="button"
                onClick={() => handleRemoveVocab(idx)}
                className="text-sage-400 hover:text-rose-500 ml-1 leading-none text-xs"
                title="Remove word"
              >
                ×
              </button>
            </span>
          ))}

          {/* Quick add word */}
          <div className="inline-flex items-center space-x-1">
            <input
              type="text"
              value={newVocab}
              onChange={(e) => setNewVocab(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVocab())}
              placeholder="+ add word"
              className="text-[11px] px-2 py-1 rounded-lg bg-surface border border-dashed border-borderMuted focus:outline-none focus:border-sage-400 w-24"
            />
            {newVocab && (
              <button
                type="button"
                onClick={handleAddVocab}
                className="text-xs text-sage-600 font-semibold px-1"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Detected Questions from Textbook */}
      {learned.guideQuestions.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-sage-600" />
            <span>Questions Identified in Textbook ({learned.guideQuestions.length}):</span>
          </label>
          <ul className="text-xs text-gray-600 space-y-1 bg-canvas p-2.5 rounded-xl border border-borderMuted list-disc list-inside">
            {learned.guideQuestions.slice(0, 4).map((q, idx) => (
              <li key={idx} className="line-clamp-1 italic text-[11px]">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Detected Exercises from Textbook */}
      {learned.exerciseItems.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-sage-600" />
            <span>Exercises / Drills Identified ({learned.exerciseItems.length}):</span>
          </label>
          <ul className="text-xs text-gray-600 space-y-1 bg-canvas p-2.5 rounded-xl border border-borderMuted list-decimal list-inside">
            {learned.exerciseItems.slice(0, 4).map((item, idx) => (
              <li key={idx} className="line-clamp-1 text-[11px]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Collapsible Full Scanned Text Inspector */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowRawText(!showRawText)}
          className="text-[11px] font-medium text-sage-600 hover:text-sage-700 flex items-center space-x-1 focus:outline-none"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {showRawText ? "Hide Full Scanned Textbook Text" : "Inspect Raw Scanned Textbook Text"}
          </span>
          {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showRawText && (
          <div className="mt-2 space-y-1 animate-in fade-in duration-150">
            <textarea
              rows={5}
              value={learned.rawText}
              onChange={(e) =>
                onUpdateLearned({
                  ...learned,
                  rawText: e.target.value,
                })
              }
              className="w-full text-[11px] font-mono p-2.5 rounded-xl bg-canvas border border-borderMuted focus:outline-none focus:border-sage-400 text-gray-700"
              placeholder="Raw extracted text from textbook..."
            />
            <p className="text-[10px] text-gray-400">
              You can edit or paste additional textbook lines above if any words were partially shadowed.
            </p>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 active:scale-[0.99] transition-all shadow-md shadow-sage-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 text-pastel-butter-border" />
          <span>Generate Official Lesson Plan from this Learning</span>
        </button>
      </div>
    </div>
  );
};
