"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SelectorBar } from "@/components/SelectorBar";
import { ImageUploader } from "@/components/ImageUploader";
import { LessonPlanPreview } from "@/components/LessonPlanPreview";
import { SettingsModal } from "@/components/SettingsModal";
import { HistoryDrawer, HistoryItem } from "@/components/HistoryDrawer";
import type { ImageInput } from "@/lib/gemini";
import type {
  GradeLevel,
  Subject,
  LessonPlan,
  TeacherProfile,
} from "@/lib/types";
import {
  defaultTeacherProfile,
  sampleMatatagPlan,
  sampleLccpPlan,
} from "@/lib/sampleData";
import { Sparkles, Loader2, FileCheck, AlertCircle, RefreshCw } from "lucide-react";

export default function HomePage() {
  // Navigation & modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Profile state with localStorage persistence
  const [profile, setProfile] = useState<TeacherProfile>(defaultTeacherProfile);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Generator inputs
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("grade1");
  const [subject, setSubject] = useState<Subject>("filipino");
  const [weekNumber, setWeekNumber] = useState("Week 1");
  const [term, setTerm] = useState("1st Term");
  const [dateCoverage, setDateCoverage] = useState("");
  const [bookReference, setBookReference] = useState("");
  const [images, setImages] = useState<ImageInput[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);

  // Load profile and history from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("kat_teacher_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      const savedHistory = localStorage.getItem("kat_plan_history");
      if (savedHistory) {
        setHistoryItems(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load local storage:", e);
    }
  }, []);

  const handleSaveProfile = (newProfile: TeacherProfile) => {
    const cleaned = {
      ...newProfile,
      geminiApiKey: newProfile.geminiApiKey?.trim() || undefined,
    };
    setProfile(cleaned);
    try {
      localStorage.setItem("kat_teacher_profile", JSON.stringify(cleaned));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleUpdateCurrentPlan = (updated: LessonPlan) => {
    setCurrentPlan(updated);
    if (historyItems.length > 0) {
      const topic =
        updated.templateType === "matatag"
          ? updated.subjectMatter.paksa
          : updated.subjectMatter.lesson;
      const updatedHistory = historyItems.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            plan: updated,
            topic: topic || item.topic,
          };
        }
        return item;
      });
      setHistoryItems(updatedHistory);
      try {
        localStorage.setItem("kat_plan_history", JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to update history in storage:", e);
      }
    }
  };

  const handleSavePlanToHistory = (plan: LessonPlan) => {
    const topic =
      plan.templateType === "matatag"
        ? plan.subjectMatter.paksa
        : plan.subjectMatter.lesson;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      plan,
      subject: plan.subject,
      grade: plan.templateType === "matatag" ? plan.gradeSection : plan.gradeLevel,
      topic: topic || "Lesson Plan",
    };

    const updated = [newItem, ...historyItems.slice(0, 24)]; // Keep last 25
    setHistoryItems(updated);
    try {
      localStorage.setItem("kat_plan_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = historyItems.filter((i) => i.id !== id);
    setHistoryItems(updated);
    localStorage.setItem("kat_plan_history", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your saved lesson plan history?")) {
      setHistoryItems([]);
      localStorage.removeItem("kat_plan_history");
    }
  };

  // Generate handler
  const handleGenerate = async () => {
    if (images.length === 0) {
      setErrorMessage("Please attach at least one photo of the lesson from the book.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          meta: {
            gradeLevel,
            subject,
            weekNumber,
            term,
            dateCoverage,
            bookReference,
          },
          profile,
          apiKey: profile.geminiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate lesson plan");
      }

      setCurrentPlan(data.plan);
      handleSavePlanToHistory(data.plan);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Load sample template for instant testing
  const handleLoadSample = (type: "matatag" | "lccp") => {
    if (type === "matatag") {
      setGradeLevel("grade1");
      setSubject("filipino");
      setCurrentPlan(sampleMatatagPlan);
    } else {
      setGradeLevel("kinder2");
      setSubject("language");
      setCurrentPlan(sampleLccpPlan);
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <Header
        profile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Inputs & Controls (5 cols) */}
          <div className="no-print lg:col-span-5 space-y-5">
            {/* Template & Preset Selectors */}
            <SelectorBar
              gradeLevel={gradeLevel}
              subject={subject}
              weekNumber={weekNumber}
              term={term}
              dateCoverage={dateCoverage}
              bookReference={bookReference}
              onChangeGrade={setGradeLevel}
              onChangeSubject={setSubject}
              onChangeWeekNumber={setWeekNumber}
              onChangeTerm={setTerm}
              onChangeDateCoverage={setDateCoverage}
              onChangeBookReference={setBookReference}
            />

            {/* Photo Uploader */}
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              disabled={isGenerating}
            />

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">Unable to generate lesson plan</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 active:scale-[0.99] transition-all shadow-md shadow-sage-500/20 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reading Textbook & Crafting Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-pastel-butter-border" />
                  <span>Generate Official Lesson Plan</span>
                </>
              )}
            </button>

            {/* Quick Demo Previews */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-gray-400 block mb-2 font-medium">
                Want to test without uploading right now?
              </span>
              <div className="flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample("matatag")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-sage-50 border border-borderMuted text-gray-600 font-medium transition-colors"
                >
                  Load Grade 1 Filipino Sample
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("lccp")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-sage-50 border border-borderMuted text-gray-600 font-medium transition-colors"
                >
                  Load K2 Language Sample
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Document Preview & Actions (7 cols) */}
          <div className="lg:col-span-7">
            {currentPlan ? (
              <LessonPlanPreview
                plan={currentPlan}
                profile={profile}
                onUpdatePlan={handleUpdateCurrentPlan}
              />
            ) : (
              <div className="bg-surface rounded-2xl border border-dashed border-borderMuted p-12 text-center flex flex-col items-center justify-center text-gray-400 space-y-3 min-h-[460px]">
                <div className="w-14 h-14 rounded-2xl bg-canvas border border-borderMuted flex items-center justify-center text-gray-400">
                  <FileCheck className="w-7 h-7 stroke-1" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Your Lesson Plan Will Appear Here
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Attach a photo of the lesson page in your book and click &quot;Generate Official Lesson Plan&quot;, or click one of the sample buttons to test.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelectPlan={(plan) => setCurrentPlan(plan)}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}
