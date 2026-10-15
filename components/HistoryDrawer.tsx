"use client";

import React from "react";
import { X, Trash2, ArrowRight, FileText, Calendar } from "lucide-react";
import type { LessonPlan } from "@/lib/types";

export interface HistoryItem {
  id: string;
  timestamp: number;
  plan: LessonPlan;
  subject: string;
  grade: string;
  topic: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectPlan: (plan: LessonPlan) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectPlan,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface h-full shadow-2xl border-l border-borderMuted flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderMuted">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-sage-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Saved Lesson Plans
            </h3>
            <span className="text-[10px] bg-sage-50 text-sage-700 font-semibold px-2 py-0.5 rounded-full border border-sage-200">
              {items.length}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                title="Clear all history"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-canvas transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <FileText className="w-10 h-10 mb-2 stroke-1 text-gray-300" />
              <p className="text-xs font-medium">No saved plans yet</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Generated lesson plans will automatically appear here
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group p-3.5 rounded-xl border border-borderMuted hover:border-sage-400 bg-surface hover:bg-canvas/60 transition-all flex items-start justify-between space-x-3 cursor-pointer shadow-2xs"
                onClick={() => {
                  onSelectPlan(item.plan);
                  onClose();
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sage-50 text-sage-700 border border-sage-200 uppercase">
                      {item.grade}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {item.subject}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 truncate">
                    {item.topic || "Untitled Lesson"}
                  </h4>
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-sage-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
