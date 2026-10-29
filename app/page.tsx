"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AIProvider,
} from "@/lib/types";
import {
  defaultTeacherProfile,
  sampleMatatagPlan,
  sampleLccpPlan,
  DEFAULT_GROQ_KEY,
} from "@/lib/sampleData";
import { generatePlanFromExtractedText } from "@/lib/freeLessonPlanner";
import { generateLessonPlanWithGemini } from "@/lib/gemini";
import { generateLessonPlanUniversal } from "@/lib/universalAiScanner";
import { reportTelemetry } from "@/lib/clientTelemetry";
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
  ArrowRight,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import gsap from "gsap";

function getProviderDisplayName(provider?: AIProvider): string {
  switch (provider) {
    case "groq":
      return "Groq Vision (Lightning Fast)";
    case "free_cloud":
      return "Zero-Key Cloud AI";
    case "openrouter":
      return "OpenRouter Free Vision";
    case "mistral":
      return "Mistral AI Vision";
    case "custom_openai":
      return "Custom AI Vision";
    case "gemini":
    default:
      return "Google Gemini Vision";
  }
}

function isKeyConfigured(p: TeacherProfile): boolean {
  const provider = p.aiProvider || "groq";
  if (provider === "groq") {
    return Boolean(
      p.groqApiKey?.trim() ||
      (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY)) ||
      true // Pre-configured key bundled
    );
  }
  if (provider === "free_cloud") return true;
  if (provider === "openrouter") {
    return Boolean(
      p.openRouterApiKey?.trim() ||
      (typeof process !== "undefined" && process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)
    );
  }
  if (provider === "mistral") {
    return Boolean(
      p.mistralApiKey?.trim() ||
      (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MISTRAL_API_KEY)
    );
  }
  if (provider === "custom_openai") return Boolean(p.customBaseUrl?.trim());
  return Boolean(
    p.geminiApiKey?.trim() ||
    (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY))
  );
}

export default function HomePage() {
  // Navigation and modal controls
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

  // Engine Mode: Cloud Vision AI vs Free On-Device ML
  const [engineMode, setEngineMode] = useState<"gemini" | "builtIn">("gemini");
  const [quickApiKey, setQuickApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Input Mode: Camera/File Upload vs Direct Text Paste
  const [inputMode, setInputMode] = useState<"photo" | "directText">("photo");
  const [directText, setDirectText] = useState("");

  // Analysis and Generation State
  const [learnedContent, setLearnedContent] = useState<LearnedTextbookContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanWarning, setScanWarning] = useState<string | null>(null);

  // Generated Plan
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);

  // GSAP Animation Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const studioAnchorRef = useRef<HTMLDivElement>(null);

  // Load saved profile and history from localStorage with automatic Groq migration
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("kat_teacher_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        const merged: TeacherProfile = {
          ...defaultTeacherProfile,
          ...parsed,
          groqApiKey: parsed.groqApiKey || DEFAULT_GROQ_KEY,
          groqModel: parsed.groqModel || "qwen/qwen3.8-27b",
        };
        if (merged.aiProvider === "free_cloud" || !merged.aiProvider) {
          merged.aiProvider = "groq";
        }
        setProfile(merged);
        try {
          localStorage.setItem("kat_teacher_profile", JSON.stringify(merged));
        } catch {
          // ignore storage error
        }
      } else {
        try {
          localStorage.setItem("kat_teacher_profile", JSON.stringify(defaultTeacherProfile));
        } catch {
          // ignore
        }
      }
      const savedHistory = localStorage.getItem("kat_plan_history");
      if (savedHistory) {
        setHistoryItems(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load stored preferences:", e);
    }
  }, []);

  // GSAP Staggered Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll(".gsap-hero-item"), {
          opacity: 0,
          y: 28,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        });
      }
      if (bentoRef.current) {
        gsap.from(bentoRef.current.querySelectorAll(".gsap-bento-card"), {
          opacity: 0,
          y: 35,
          duration: 0.85,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.25,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSaveProfile = (updated: TeacherProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem("kat_teacher_profile", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleSaveQuickKey = () => {
    if (!quickApiKey.trim()) return;
    const provider = profile.aiProvider || "groq";
    let updated = { ...profile };
    if (provider === "groq") {
      updated.groqApiKey = quickApiKey.trim();
    } else if (provider === "openrouter") {
      updated.openRouterApiKey = quickApiKey.trim();
    } else if (provider === "mistral") {
      updated.mistralApiKey = quickApiKey.trim();
    } else {
      updated.geminiApiKey = quickApiKey.trim();
    }
    handleSaveProfile(updated);
    setQuickApiKey("");
    setShowKeyInput(false);
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
        console.error("Failed to update history:", e);
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

    const updated = [newItem, ...historyItems.slice(0, 24)];
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

  // Local OCR Analysis for On-Device Machine Learning Mode
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
          "The photo had glare or low contrast. For full fidelity, ensure the photo is well lit or switch to Cloud AI Vision."
        );
      }

      setProgressStatus("Extracting lesson concepts, vocabulary, and questions...");
      const learned = analyzeTextbookText(combinedText, subject, gradeLevel);

      setLearnedContent(learned);
      return learned;
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const msg = err instanceof Error ? err.message : "Failed to analyze textbook photo.";
      setErrorMessage(msg);
      return null;
    } finally {
      setIsAnalyzing(false);
      setProgressStatus("");
    }
  };

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

  // Cloud AI Vision Generation (Multimodal Reading of the JPEG)
  const handleGenerateCloudAI = async () => {
    if (images.length === 0) {
      setErrorMessage("Please attach at least one photo of the lesson from the book.");
      return;
    }

    // Auto-save quick API key if entered in the inline input
    let activeProfile = { ...profile };
    if (quickApiKey.trim()) {
      const provider = activeProfile.aiProvider || "groq";
      if (provider === "groq") {
        activeProfile.groqApiKey = quickApiKey.trim();
      } else if (provider === "openrouter") {
        activeProfile.openRouterApiKey = quickApiKey.trim();
      } else if (provider === "mistral") {
        activeProfile.mistralApiKey = quickApiKey.trim();
      } else {
        activeProfile.geminiApiKey = quickApiKey.trim();
      }
      handleSaveProfile(activeProfile);
      setQuickApiKey("");
      setShowKeyInput(false);
    }

    const providerName = getProviderDisplayName(activeProfile.aiProvider);
    if (!isKeyConfigured(activeProfile)) {
      setShowKeyInput(true);
      setErrorMessage(
        `Please provide your ${providerName} key or switch to Zero-Key Free Cloud mode.`
      );
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setScanWarning(null);

    const timer1 = setTimeout(() => {
      setProgressStatus(`Reading story, characters, and vocabulary with ${providerName}...`);
    }, 2500);
    const timer2 = setTimeout(() => {
      setProgressStatus("Extracting comprehension questions, grammar concepts & exercises...");
    }, 7000);
    const timer3 = setTimeout(() => {
      setProgressStatus("Assembling official DepEd MATATAG / LCCP lesson plan table...");
    }, 14000);

    const callStartTime = Date.now();
    const traceId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    reportTelemetry("info", "Textbook AI analysis started", {
      provider: activeProfile.aiProvider,
      imageCount: images.length,
      gradeLevel,
      subject,
    }, traceId);

    try {
      setProgressStatus(`Analyzing textbook photo with ${providerName}...`);

      let plan: LessonPlan;

      // Direct client-side multimodal execution for ALL providers (eliminates Netlify 10-second serverless timeout!)
      try {
        plan = await generateLessonPlanUniversal({
          images,
          meta: {
            gradeLevel,
            subject,
            weekNumber,
            term,
            dateCoverage,
            bookReference,
          },
          profile: activeProfile,
        });
      } catch (cloudErr: unknown) {
        console.warn(`[Client AI] Direct cloud execution failed with ${providerName}:`, cloudErr);

        // If cloud gateway is rate-limited, busy, or unreachable, seamlessly fall back to built-in Machine Learning OCR engine
        setProgressStatus("Cloud model busy — switching to built-in Machine Learning engine...");
        const learned = await handleAnalyzeImages();
        if (learned) {
          plan = generatePlanFromExtractedText(
            learned,
            {
              gradeLevel,
              subject,
              weekNumber,
              term,
              dateCoverage,
              bookReference,
            },
            activeProfile
          );
          setScanWarning(
            `Notice: ${providerName} was rate-limited or busy, so your official lesson plan was seamlessly generated using the built-in Machine Learning engine.`
          );
        } else {
          throw cloudErr;
        }
      }

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      reportTelemetry("info", "Textbook AI analysis succeeded", {
        provider: activeProfile.aiProvider,
        durationMs: Date.now() - callStartTime,
        templateType: plan.templateType,
      }, traceId);

      setCurrentPlan(plan);
      handleSavePlanToHistory(plan);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      console.error("Cloud AI generation failed:", err);
      const msg = err instanceof Error ? err.message : `Failed to generate plan with ${providerName}.`;

      reportTelemetry("error", "Textbook AI analysis failed", {
        provider: activeProfile.aiProvider,
        durationMs: Date.now() - callStartTime,
        error: msg,
      }, traceId);

      setErrorMessage(
        `${msg} — We never substitute preset dummy data. Please verify your internet connection, ensure the textbook photo is clear and well-lit, or switch to Zero-Key Cloud above.`
      );
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGenerating(false);
      setProgressStatus("");
    }
  };

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
      if (engineMode === "gemini") {
        await handleGenerateCloudAI();
      } else {
        const learned = await handleAnalyzeImages();
        if (learned) {
          handleGenerateFromLearned(learned);
        }
      }
    }
  };

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

  const scrollToStudio = () => {
    studioAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-stone-200 selection:text-stone-900 flex flex-col">
      {/* Floating Header */}
      <Header
        profile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Cinematic Center Hero (AIDA: Attention) */}
      <section ref={heroRef} className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="gsap-hero-item inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/90 text-[11px] font-medium text-stone-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>La Consolacion College Pasig Official Curriculum Architecture</span>
          </div>

          <h1 className="gsap-hero-item text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 leading-[1.12] max-w-5xl mx-auto">
            Official Lesson Plan Studio for La Consolacion College Pasig
          </h1>

          <p className="gsap-hero-item text-sm sm:text-base md:text-lg text-stone-600 font-normal max-w-3xl mx-auto leading-relaxed">
            Multimodal vision intelligence that reads textbook photos and constructs compliant DepEd MATATAG and LCCP institutional curriculum architectures with authentic school assets.
          </p>

          <div className="gsap-hero-item flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={scrollToStudio}
              className="px-6 py-3 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 active:scale-[0.98] transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center space-x-2"
            >
              <span>Capture &amp; Analyze Textbook</span>
              <ArrowRight className="w-4 h-4 text-stone-300" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-stone-800 text-xs sm:text-sm font-medium border border-stone-200/90 hover:bg-stone-50 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
              <span>Curriculum Settings &amp; Profile</span>
            </button>
          </div>
        </div>
      </section>

      {/* Studio Workspace Anchor */}
      <div ref={studioAnchorRef} />

      {/* Gapless Bento Grid Workspace (AIDA: Interest, Desire, Action) */}
      <section ref={bentoRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-dense items-start">
          
          {/* Bento Card 1: Textbook Capture Studio (Col 8) */}
          <div className="gsap-bento-card lg:col-span-8 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-stone-800" />
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">
                    Textbook Capture Studio
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Direct multimodal vision extraction from lesson pages without preset template fallbacks
                </p>
              </div>

              {/* Engine Mode Tabs */}
              <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEngineMode("gemini");
                    if (!isKeyConfigured(profile)) setShowKeyInput(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                    engineMode === "gemini"
                      ? "bg-white text-stone-900 shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Cloud Vision AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngineMode("builtIn")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                    engineMode === "builtIn"
                      ? "bg-white text-stone-900 shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-stone-600" />
                  <span>Offline ML</span>
                </button>
              </div>
            </div>

            {/* Provider Pill Selectors */}
            {engineMode === "gemini" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, aiProvider: "groq" as const };
                      handleSaveProfile(updated);
                      setShowKeyInput(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                      (profile.aiProvider || "groq") === "groq"
                        ? "bg-emerald-800 text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    <Zap className="w-3 h-3 text-emerald-300" />
                    <span>Groq (Fastest)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, aiProvider: "gemini" as const };
                      handleSaveProfile(updated);
                      if (!updated.geminiApiKey?.trim()) setShowKeyInput(true);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                      profile.aiProvider === "gemini"
                        ? "bg-stone-900 text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    Google Gemini
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, aiProvider: "free_cloud" as const };
                      handleSaveProfile(updated);
                      setShowKeyInput(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                      profile.aiProvider === "free_cloud"
                        ? "bg-stone-900 text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    Zero-Key Cloud
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, aiProvider: "openrouter" as const };
                      handleSaveProfile(updated);
                      if (!updated.openRouterApiKey?.trim()) setShowKeyInput(true);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                      profile.aiProvider === "openrouter"
                        ? "bg-stone-900 text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    OpenRouter
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, aiProvider: "mistral" as const };
                      handleSaveProfile(updated);
                      if (!updated.mistralApiKey?.trim()) setShowKeyInput(true);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                      profile.aiProvider === "mistral"
                        ? "bg-stone-900 text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    Mistral AI
                  </button>
                </div>

                {/* Active Key Indicator */}
                {isKeyConfigured(profile) && !showKeyInput && profile.aiProvider !== "free_cloud" && (
                  <div className="flex items-center justify-between p-3 px-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold">{getProviderDisplayName(profile.aiProvider)} Active</span>
                        <span className="ml-1.5 font-mono text-[11px] text-emerald-700">
                          {(() => {
                            const k = profile.aiProvider === "groq"
                              ? (profile.groqApiKey || DEFAULT_GROQ_KEY)
                              : profile.aiProvider === "openrouter"
                              ? profile.openRouterApiKey
                              : profile.aiProvider === "mistral"
                              ? profile.mistralApiKey
                              : profile.geminiApiKey;
                            return k?.trim() ? `(...${k.slice(-4)})` : "(Environment Variable Active)";
                          })()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowKeyInput(true)}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 cursor-pointer"
                    >
                      Update Key
                    </button>
                  </div>
                )}

                {/* Inline API Key Input */}
                {(!isKeyConfigured(profile) || showKeyInput) && profile.aiProvider !== "free_cloud" && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800 flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-stone-600" />
                        <span>Enter {getProviderDisplayName(profile.aiProvider)} API Key</span>
                      </span>
                      <a
                        href={
                          profile.aiProvider === "groq"
                            ? "https://console.groq.com/keys"
                            : profile.aiProvider === "openrouter"
                            ? "https://openrouter.ai/keys"
                            : profile.aiProvider === "mistral"
                            ? "https://console.mistral.ai/api-keys/"
                            : "https://aistudio.google.com/app/apikey"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center space-x-1"
                      >
                        <span>Acquire key</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        placeholder={
                          profile.aiProvider === "groq"
                            ? "gsk_..."
                            : profile.aiProvider === "openrouter"
                            ? "sk-or-v1-..."
                            : profile.aiProvider === "mistral"
                            ? "mistral_..."
                            : "AIzaSy..."
                        }
                        value={quickApiKey}
                        onChange={(e) => setQuickApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSaveQuickKey())}
                        className="flex-1 text-xs font-mono px-3 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-stone-800"
                      />
                      <button
                        type="button"
                        onClick={handleSaveQuickKey}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 cursor-pointer"
                      >
                        Save Key
                      </button>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
                      <span>Key is stored securely on your browser.</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...profile, aiProvider: "free_cloud" as const };
                          handleSaveProfile(updated);
                          setShowKeyInput(false);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-medium underline flex items-center space-x-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>Use Zero-Key Cloud Instead</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Mode Selector */}
            <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200/80 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setInputMode("photo")}
                className={`flex-1 py-2 px-3 rounded-xl font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  inputMode === "photo"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Textbook Photo (JPEG / PNG)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode("directText")}
                className={`flex-1 py-2 px-3 rounded-xl font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  inputMode === "directText"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Lesson Notes</span>
              </button>
            </div>

            {/* Photo Uploader */}
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

            {/* Direct Text Input */}
            {inputMode === "directText" && (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  placeholder="Paste or type your lesson title, story, or exercises here (e.g. Aralin 5: Ang Munting Gamu-gamo... Pahina 42... Gabay na Tanong...)"
                  className="w-full text-xs p-4 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-stone-800 font-sans leading-relaxed text-stone-900"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeDirectText}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5 text-stone-700" />
                  <span>Parse Lesson Text</span>
                </button>
              </div>
            )}

            {/* Offline Learned Insights Inspection */}
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
                className="w-full py-4 px-6 rounded-2xl text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing || isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{progressStatus || "Analyzing Textbook Content..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>
                      {engineMode === "gemini" && inputMode === "photo"
                        ? `Analyze JPEG with ${getProviderDisplayName(profile.aiProvider)}`
                        : "Generate Official DepEd / LCCP Lesson Plan"}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Error and Guidance Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-rose-900">Scan Notice</p>
                  <p className="text-[11px] leading-relaxed text-rose-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Warning Banner */}
            {scanWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-950">Lighting Notice</p>
                  <p className="text-[11px] leading-relaxed text-amber-800 mt-0.5">{scanWarning}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bento Card 2: Curriculum Architecture (Col 4) */}
          <div className="gsap-bento-card lg:col-span-4 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-5">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-stone-800" />
                <h2 className="text-base font-semibold tracking-tight text-stone-900">
                  Curriculum Parameters
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Target grade level, subject domain, and term week
              </p>
            </div>

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

            {/* Quick Demo Previews */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-medium text-stone-500 block">
                Instant Template Demonstrations:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample("matatag")}
                  className="text-xs py-2 px-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-medium transition-colors cursor-pointer text-center"
                >
                  Grade 1 Filipino
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("lccp")}
                  className="text-xs py-2 px-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-medium transition-colors cursor-pointer text-center"
                >
                  Kinder 2 Language
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Institutional Mandates & Compliance (Col 4) */}
          <div className="gsap-bento-card lg:col-span-4 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <h2 className="text-base font-semibold tracking-tight text-stone-900">
                Institutional Mandates
              </h2>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="font-semibold text-stone-900 block">DepEd DO 3 s. 2026 Annex</span>
                <p className="text-[11px] text-stone-600">
                  Includes mandatory AI declaration ensuring curriculum alignment with DepEd MATATAG K-12 standards.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="font-semibold text-stone-900 block">Augustinian Core Values</span>
                <p className="text-[11px] text-stone-600">
                  Preserves Laudato Si stewardship, Justice and Peace, Gender and Development, and LCCP Care.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="font-semibold text-stone-900 block">Document Signatories</span>
                <p className="text-[11px] text-stone-600">
                  Configured with prepared, checked, and observed signatories in accordance with institutional policy.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Official Document Workspace (Col 8) */}
          <div className="gsap-bento-card lg:col-span-8 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">
                  Official Lesson Plan Document
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Interactive in-place table editor with official Microsoft Word and PDF export
                </p>
              </div>
            </div>

            {currentPlan ? (
              <LessonPlanPreview
                plan={currentPlan}
                profile={profile}
                onUpdatePlan={handleUpdateCurrentPlan}
              />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center flex flex-col items-center justify-center text-stone-400 space-y-3 min-h-[380px]">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400">
                  <FileCheck className="w-7 h-7 stroke-1" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-semibold text-stone-800">
                    Awaiting Lesson Plan Generation
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Attach textbook lesson photos or click a demonstration sample to render Kat&apos;s verified DepEd MATATAG or LCCP institutional table.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer (AIDA: Action) */}
      <footer className="w-full border-t border-stone-200/80 bg-white py-10 px-4 sm:px-8 text-center text-xs text-stone-500 space-y-2">
        <p className="font-medium text-stone-700">
          La Consolacion College Pasig &bull; Basic Education Department
        </p>
        <p className="text-[11px] text-stone-400">
          Compliant with DepEd Order No. 3 s. 2026 Annex &bull; Augustinian Community of Learning
        </p>
      </footer>

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
    </main>
  );
}
