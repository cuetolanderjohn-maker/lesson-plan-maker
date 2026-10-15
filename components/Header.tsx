"use client";

import React from "react";
import { BookOpen, Settings, History, Sparkles } from "lucide-react";
import type { TeacherProfile } from "@/lib/types";

interface HeaderProps {
  profile: TeacherProfile;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenSettings,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-borderMuted px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & School */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-600 shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-gray-800">
                Kat&apos;s Lesson Planner
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-pastel-mint-bg text-pastel-mint-text border border-pastel-mint-border">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </span>
            </div>
            <p className="text-xs text-gray-500 font-normal">
              {profile.schoolName} • {profile.schoolYear}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-surface hover:bg-sage-50 border border-borderMuted transition-colors"
            title="View saved lesson plans"
          >
            <History className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 text-[10px] bg-sage-100 text-sage-700 font-semibold px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-surface hover:bg-sage-50 border border-borderMuted transition-colors"
            title="Settings & Teacher Profile"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
