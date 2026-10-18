"use client";

import React from "react";
import { BookOpen, Settings, History, Brain, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 bg-white/80 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & School Identification */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5 text-stone-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">
                Kat&apos;s Curriculum Studio
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                {profile.aiProvider === "gemini" && profile.geminiApiKey?.trim() ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>Gemini Vision</span>
                  </>
                ) : profile.aiProvider === "free_cloud" ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>Zero-Key Cloud Vision</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-3 h-3 text-stone-600" />
                    <span>Offline Vision ML</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              {profile.schoolName} &bull; {profile.schoolYear}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="View saved lesson plans"
          >
            <History className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Saved Plans</span>
            {historyCount > 0 && (
              <span className="ml-1 text-[10px] bg-stone-100 text-stone-800 font-semibold px-2 py-0.5 rounded-full border border-stone-200">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Settings and Teacher Profile"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
