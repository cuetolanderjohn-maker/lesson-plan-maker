"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SelectorBar } from "@/components/SelectorBar";
import { ImageUploader } from "@/components/ImageUploader";
import { LessonPlanPreview } from "@/components/LessonPlanPreview";
import { SettingsModal } from "@/components/SettingsModal";
import { HistoryDrawer, HistoryItem } from "@/components/HistoryDrawer";
import { LearnedInsightsCard } from "@/components/LearnedInsightsCard";
import type {
  GradeLevel,
  Subject,
  LessonPlan,
  TeacherProfile,
  ImageInput,
} from "@/lib/types";
import {
  defaultTeacherProfile,
  sampleMatatagPlan,
  sampleLccpPlan,
} from "@/lib/sampleData";
import { generatePlanFromExtractedText } from "@/lib/freeLessonPlanner";
import { analyzeTextbookText, LearnedTextbookContent } from "@/lib/nlpAnalyzer";
import { preprocessTextbookImage } from "@/lib/imagePreprocessor";
import Tesseract from "tesseract.js";
import {
  Sparkles,
  Loader2,
  FileCheck,
  AlertCircle,
  Brain,
  CheckCircle,
} from "lucide-react";

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

  // Machine Learning & Analysis State
  const [learnedContent, setLearnedContent] = useState<LearnedTextbookContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);

  // Reset learned content when user removes all images
  useEffect(() => {
    if (images.length === 0) {
      setLearnedContent(null);
    }
  }, [images]);

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
    setProfile(newProfile);
    try {
      localStorage.setItem("kat_teacher_profile", JSON.stringify(newProfile));
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

  // Step 1: Analyze & Learn from Attached JPG
  const handleAnalyzeImages = async (): Promise<LearnedTextbookContent | null> => {
    if (images.length === 0) {
      setErrorMessage("Please attach at least one photo of the lesson from the book.");
      return null;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let combinedText = "";

      for (let i = 0; i < images.length; i++) {
        // A. Image Preprocessing (Shadow removal, contrast boost, font sharpening)
        setProgressStatus(`Enhancing image contrast & sharpening page ${i + 1}...`);
        const preprocessed = await preprocessTextbookImage(images[i].base64Data);

        // B. Machine Learning OCR (Tesseract)
        setProgressStatus(`Reading textbook page ${i + 1} with Machine Learning OCR...`);
        const result = await Tesseract.recognize(preprocessed.ocrDataUrl, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text" && typeof m.progress === "number") {
              setProgressStatus(
                `Reading page ${i + 1} of ${images.length} (${Math.round(m.progress * 100)}%)...`
              );
            }
          },
        });

        combinedText += "\n" + (result.data.text || "");
      }

      // C. Semantic NLP Analyzer (Title, questions, vocabulary, exercises)
      setProgressStatus("Extracting lesson concepts, vocabulary, and questions...");
      const learned = analyzeTextbookText(combinedText, subject, gradeLevel);

      setLearnedContent(learned);
      return learned;
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to analyze textbook photo.";
      setErrorMessage(msg);
      return null;
    } finally {
      setIsAnalyzing(false);
      setProgressStatus("");
    }
  };

  // Step 2: Generate Official Lesson Plan from Learned Content
  const handleGenerateFromLearned = (learnedToUse?: LearnedTextbookContent) => {
    const sourceLearned = learnedToUse || learnedContent;
    if (!sourceLearned) return;

    setIsGenerating(true);
    try {
      const plan = generatePlanFromExtractedText(
        sourceLearned,
        {
          gradeLevel,
          subject,
          weekNumber,
          term,
          dateCoverage,
          bookReference,
        },
        profile
      );

      setCurrentPlan(plan);
      handleSavePlanToHistory(plan);
    } catch (err: unknown) {
      console.error("Plan generation error:", err);
      setErrorMessage("Failed to assemble official lesson plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Combined action: Analyze & Generate in one click if teacher prefers
  const handleAnalyzeAndGenerate = async () => {
    const learned = await handleAnalyzeImages();
    if (learned) {
      handleGenerateFromLearned(learned);
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
              onImagesChange={(newImgs) => {
                setImages(newImgs);
                setLearnedContent(null); // Fresh analysis needed for new images
              }}
              disabled={isAnalyzing || isGenerating}
            />

            {/* Step 1 Action: Analyze Textbook Photo (if not yet analyzed) */}
            {images.length > 0 && !learnedContent && (
              <div className="p-4 rounded-2xl bg-surface border border-sage-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
                  <Brain className="w-4 h-4 text-sage-600" />
                  <span>Machine Learning Textbook Reader</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  The system will read, understand, and extract the lesson title, reading story, vocabulary words, and practice exercises directly from your photo.
                </p>

                <button
                  type="button"
                  onClick={handleAnalyzeImages}
                  disabled={isAnalyzing}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 active:scale-[0.99] transition-all shadow-md shadow-sage-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{progressStatus || "Analyzing Textbook Photo..."}</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-pastel-mint-border" />
                      <span>Analyze & Learn from Textbook (ML)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Interactive Learned Content Inspector Card */}
            {learnedContent && (
              <LearnedInsightsCard
                learned={learnedContent}
                onUpdateLearned={setLearnedContent}
                onGeneratePlan={() => handleGenerateFromLearned(learnedContent)}
                isGenerating={isGenerating}
              />
            )}

            {/* Direct 1-Click Generate Button (if no card yet) */}
            {!learnedContent && (
              <button
                type="button"
                onClick={handleAnalyzeAndGenerate}
                disabled={isAnalyzing || isGenerating || images.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 active:scale-[0.99] transition-all shadow-md shadow-sage-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing || isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{progressStatus || "Reading & Generating Official Plan..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-pastel-butter-border" />
                    <span>Read Book & Generate Official Lesson Plan</span>
                  </>
                )}
              </button>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">Notice</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

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
                    Your Official Lesson Plan Will Appear Here
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Attach a photo of the lesson page in your book and the machine learning engine will extract the topic, questions, and exercises to build your official DepEd / LCCP document.
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
