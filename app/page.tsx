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
  Camera,
  FileText,
  HelpCircle,
  Key,
  ExternalLink,
  Zap,
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

  // Engine Mode: "gemini" (Deep Vision AI) vs "builtIn" (Free On-Device ML)
  const [engineMode, setEngineMode] = useState<"gemini" | "builtIn">("gemini");
  const [quickApiKey, setQuickApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Input Mode: "photo" (camera/file upload) vs "directText" (paste/type directly)
  const [inputMode, setInputMode] = useState<"photo" | "directText">("photo");
  const [directText, setDirectText] = useState("");

  // Machine Learning & Analysis State
  const [learnedContent, setLearnedContent] = useState<LearnedTextbookContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanWarning, setScanWarning] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);

  // Reset learned content when user removes all images in photo mode
  useEffect(() => {
    if (inputMode === "photo" && images.length === 0) {
      setLearnedContent(null);
      setScanWarning(null);
    }
  }, [images, inputMode]);

  // Load profile and history from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("kat_teacher_profile");
      if (savedProfile) {
        const parsed: TeacherProfile = JSON.parse(savedProfile);
        setProfile(parsed);
        if (parsed.geminiApiKey?.trim()) {
          setEngineMode("gemini");
        } else {
          setEngineMode("builtIn");
        }
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

  const handleSaveQuickKey = () => {
    if (!quickApiKey.trim()) return;
    const updated = {
      ...profile,
      geminiApiKey: quickApiKey.trim(),
    };
    handleSaveProfile(updated);
    setQuickApiKey("");
    setShowKeyInput(false);
    setEngineMode("gemini");
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

  // Step 1: Analyze & Learn from Attached Photos (Local OCR & Vision NLP)
  const handleAnalyzeImages = async (): Promise<LearnedTextbookContent | null> => {
    if (images.length === 0) {
      setErrorMessage("Please attach at least one photo of the lesson from the book.");
      return null;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setScanWarning(null);

    try {
      let combinedText = "";

      for (let i = 0; i < images.length; i++) {
        setProgressStatus(`Optimizing page ${i + 1} for high-fidelity reading...`);
        const preprocessed = await preprocessTextbookImage(images[i].base64Data);

        setProgressStatus(`Scanning textbook page ${i + 1} with Machine Learning OCR...`);
        let ocrText = "";
        try {
          const result = await Tesseract.recognize(preprocessed.ocrDataUrl, "fil+eng", {
            logger: (m) => {
              if (m.status === "recognizing text" && typeof m.progress === "number") {
                setProgressStatus(
                  `Reading page ${i + 1} (${Math.round(m.progress * 100)}%)...`
                );
              }
            },
          });
          ocrText = result.data.text || "";
        } catch {
          const fallbackResult = await Tesseract.recognize(preprocessed.ocrDataUrl, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text" && typeof m.progress === "number") {
                setProgressStatus(
                  `Reading page ${i + 1} (${Math.round(m.progress * 100)}%)...`
                );
              }
            },
          });
          ocrText = fallbackResult.data.text || "";
        }

        combinedText += "\n" + ocrText;
      }

      const cleanLen = combinedText.trim().replace(/\s+/g, " ").length;
      if (cleanLen < 30) {
        setScanWarning(
          "The photo had glare or low contrast. You can type or paste the lesson title and story in the review card below or switch to Gemini AI mode for deep photo analysis."
        );
      }

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

  // Step 1 (Alternate): Analyze Direct Pasted Text
  const handleAnalyzeDirectText = () => {
    if (!directText.trim()) {
      setErrorMessage("Please type or paste some text from the lesson or textbook.");
      return;
    }
    setErrorMessage(null);
    setScanWarning(null);

    const learned = analyzeTextbookText(directText, subject, gradeLevel);
    setLearnedContent(learned);
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

  // Generate with Gemini Vision AI (Deep Multimodal Analysis of the JPEG)
  const handleGenerateWithGemini = async () => {
    if (images.length === 0) {
      setErrorMessage("Please attach at least one photo of the lesson from the book.");
      return;
    }

    const hasKey = Boolean(profile.geminiApiKey?.trim());
    if (!hasKey) {
      setShowKeyInput(true);
      setErrorMessage("Please provide your Google Gemini API key to use Gemini Vision AI mode.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setScanWarning(null);

    try {
      setProgressStatus("Sending textbook photo to Google Gemini 2.0 Flash Vision...");
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
        throw new Error(data.error || "Failed to generate lesson plan with Gemini AI.");
      }

      setCurrentPlan(data.plan);
      handleSavePlanToHistory(data.plan);
    } catch (err: unknown) {
      console.error("Gemini Generation Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to generate plan with Gemini AI.";
      setErrorMessage(
        `${msg} (Tip: You can switch to the Free Built-in Mode ⚡ below if your API key has quota limits).`
      );
    } finally {
      setIsGenerating(false);
      setProgressStatus("");
    }
  };

  // Primary Action Button Handler
  const handlePrimaryGenerate = async () => {
    if (inputMode === "directText") {
      if (!directText.trim()) {
        setErrorMessage("Please type or paste some lesson text first.");
        return;
      }
      const learned = analyzeTextbookText(directText, subject, gradeLevel);
      setLearnedContent(learned);
      handleGenerateFromLearned(learned);
    } else {
      // In Photo mode: Check which engine is active
      if (engineMode === "gemini") {
        await handleGenerateWithGemini();
      } else {
        const learned = await handleAnalyzeImages();
        if (learned) {
          handleGenerateFromLearned(learned);
        }
      }
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
    setScanWarning(null);
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

            {/* AI Engine Selector: Gemini Vision AI vs Free Built-in Mode */}
            <div className="p-3.5 rounded-2xl bg-surface border border-sage-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                  <span>AI Generation Engine:</span>
                </span>
                {profile.geminiApiKey?.trim() && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Gemini Key Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEngineMode("gemini");
                    if (!profile.geminiApiKey?.trim()) {
                      setShowKeyInput(true);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                    engineMode === "gemini"
                      ? "bg-sage-50 border-sage-500 text-sage-700 font-semibold shadow-2xs"
                      : "bg-surface border-borderMuted text-gray-500 hover:bg-canvas"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                  <span>Gemini Vision AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngineMode("builtIn")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                    engineMode === "builtIn"
                      ? "bg-pastel-mint-bg border-pastel-mint-border text-pastel-mint-text font-semibold shadow-2xs"
                      : "bg-surface border-borderMuted text-gray-500 hover:bg-canvas"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-sage-600" />
                  <span>Free Built-in (No Key)</span>
                </button>
              </div>

              {/* Gemini Key Inline Input if missing */}
              {engineMode === "gemini" && (!profile.geminiApiKey?.trim() || showKeyInput) && (
                <div className="pt-1.5 border-t border-borderMuted space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-700 flex items-center space-x-1">
                      <Key className="w-3 h-3 text-sage-600" />
                      <span>Enter Gemini API Key:</span>
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage-600 hover:text-sage-700 font-medium underline underline-offset-2 flex items-center space-x-0.5"
                    >
                      <span>Get free key</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={quickApiKey}
                      onChange={(e) => setQuickApiKey(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSaveQuickKey())}
                      className="flex-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-canvas border border-borderMuted focus:outline-none focus:border-sage-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveQuickKey}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage-500 text-white hover:bg-sage-600"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-400 leading-relaxed">
                {engineMode === "gemini"
                  ? "✨ Deep Multimodal Vision: Directly reads textbook JPEGs, analyzing stories, illustrations, and questions with high relevance."
                  : "⚡ 100% Free on-device machine learning: Reads textbook text inside your browser without needing any API keys."}
              </p>
            </div>

            {/* Input Method Tabs: Photo vs Direct Text */}
            <div className="bg-surface rounded-2xl border border-borderMuted p-1.5 flex gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setInputMode("photo")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  inputMode === "photo"
                    ? "bg-sage-50 text-sage-700 border border-sage-200 shadow-2xs"
                    : "text-gray-500 hover:text-gray-700 hover:bg-canvas"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Textbook Photo (JPEG)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode("directText")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  inputMode === "directText"
                    ? "bg-sage-50 text-sage-700 border border-sage-200 shadow-2xs"
                    : "text-gray-500 hover:text-gray-700 hover:bg-canvas"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste / Type Lesson Text</span>
              </button>
            </div>

            {/* Method A: Photo Uploader */}
            {inputMode === "photo" && (
              <ImageUploader
                images={images}
                onImagesChange={(newImgs) => {
                  setImages(newImgs);
                  setLearnedContent(null);
                  setScanWarning(null);
                }}
                disabled={isAnalyzing || isGenerating}
              />
            )}

            {/* Method B: Direct Text Paste Input */}
            {inputMode === "directText" && (
              <div className="bg-surface rounded-2xl border border-borderMuted p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lesson Content / Notes
                  </h2>
                  <span className="text-[11px] text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-200">
                    Instant Analysis
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  placeholder="Paste or type your lesson title, story, or exercises here (e.g. Aralin 5: Ang Munting Gamu-gamo... Pahina 42... Gabay na Tanong...)"
                  className="w-full text-xs p-3.5 rounded-xl bg-canvas border border-borderMuted focus:outline-none focus:border-sage-500 font-sans leading-relaxed text-gray-800"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeDirectText}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-sage-700 bg-sage-50 border border-sage-200 hover:bg-sage-100 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Analyze Pasted Text</span>
                </button>
              </div>
            )}

            {/* Scan Warning Notice */}
            {scanWarning && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-[11px]">Notice on Scan Quality</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{scanWarning}</p>
                </div>
              </div>
            )}

            {/* Built-in Mode Inspection Card (if learned locally) */}
            {learnedContent && (
              <LearnedInsightsCard
                learned={learnedContent}
                onUpdateLearned={setLearnedContent}
                onGeneratePlan={() => handleGenerateFromLearned(learnedContent)}
                isGenerating={isGenerating}
              />
            )}

            {/* Primary Action Button */}
            {!learnedContent && (
              <button
                type="button"
                onClick={handlePrimaryGenerate}
                disabled={
                  isAnalyzing ||
                  isGenerating ||
                  (inputMode === "photo" && images.length === 0) ||
                  (inputMode === "directText" && !directText.trim())
                }
                className="w-full py-3.5 px-6 rounded-2xl text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 active:scale-[0.99] transition-all shadow-md shadow-sage-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing || isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{progressStatus || "Analyzing Textbook JPEG..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-pastel-butter-border" />
                    <span>
                      {engineMode === "gemini" && inputMode === "photo"
                        ? "Analyze JPEG with Gemini AI & Generate Plan ✨"
                        : "Read Book & Generate Official Lesson Plan ⚡"}
                    </span>
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
                  {engineMode === "gemini" && (
                    <button
                      type="button"
                      onClick={() => {
                        setEngineMode("builtIn");
                        setErrorMessage(null);
                      }}
                      className="mt-2 text-xs font-semibold text-sage-700 underline"
                    >
                      Switch to Free Built-in Mode (No API Key)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Demo Previews */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-gray-400 block mb-2 font-medium">
                Want to test Kat&apos;s official school templates right now?
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
                    Your Official School Lesson Plan
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Attach a photo of the lesson page or paste your lesson notes. The system extracts the topic, questions, and exercises into Kat&apos;s exact DepEd MATATAG or LCCP document format.
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
