"use client";

import React, { useState, useEffect } from "react";
import { X, User, School, Check, UserCheck, ExternalLink, Zap } from "lucide-react";
import type { TeacherProfile } from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSaveProfile: (profile: TeacherProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<TeacherProfile>(profile);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderMuted">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Teacher Profile & Signatories
              </h3>
              <p className="text-xs text-gray-400">
                Customize your name, coordinators, and school year for official plans
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* AI Vision Provider Section (from awesome-free-llm-apis) */}
          <div className="space-y-3 p-4 rounded-xl bg-canvas border border-sage-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AI Vision Engine (Awesome Free LLM APIs)</span>
              </label>
              <a
                href="https://github.com/mnfst/awesome-free-llm-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sage-600 hover:text-sage-700 font-medium underline underline-offset-2 flex items-center space-x-1"
              >
                <span>Free LLMs Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Provider Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-surface rounded-lg border border-borderMuted text-xs font-medium">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aiProvider: "gemini" })}
                className={`py-1.5 px-2 rounded-md transition-all text-center ${
                  (formData.aiProvider || "gemini") === "gemini"
                    ? "bg-sage-600 text-white shadow-xs font-semibold"
                    : "text-gray-600 hover:bg-canvas"
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aiProvider: "free_cloud" })}
                className={`py-1.5 px-2 rounded-md transition-all text-center ${
                  formData.aiProvider === "free_cloud"
                    ? "bg-sage-600 text-white shadow-xs font-semibold"
                    : "text-gray-600 hover:bg-canvas"
                }`}
              >
                Zero-Key Cloud
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aiProvider: "openrouter" })}
                className={`py-1.5 px-2 rounded-md transition-all text-center ${
                  formData.aiProvider === "openrouter"
                    ? "bg-sage-600 text-white shadow-xs font-semibold"
                    : "text-gray-600 hover:bg-canvas"
                }`}
              >
                OpenRouter
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aiProvider: "mistral" })}
                className={`py-1.5 px-2 rounded-md transition-all text-center ${
                  formData.aiProvider === "mistral"
                    ? "bg-sage-600 text-white shadow-xs font-semibold"
                    : "text-gray-600 hover:bg-canvas"
                }`}
              >
                Mistral AI
              </button>
            </div>

            {/* Sub-view: Google Gemini */}
            {(formData.aiProvider || "gemini") === "gemini" && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-600">Gemini API Key:</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sage-600 hover:text-sage-700 underline flex items-center space-x-0.5"
                  >
                    <span>Get free key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy... (or paste multiple keys separated by commas)"
                  value={formData.geminiApiKey || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, geminiApiKey: e.target.value })
                  }
                  className="w-full text-xs font-mono px-3.5 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                />
                <div>
                  <label className="text-[11px] font-medium text-gray-600 block mb-1">
                    Gemini Model
                  </label>
                  <select
                    value={formData.geminiModel || "auto"}
                    onChange={(e) =>
                      setFormData({ ...formData, geminiModel: e.target.value })
                    }
                    className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 text-gray-800 cursor-pointer"
                  >
                    <option value="auto">Auto-detect Best Active Model (Gemini 3.8 Flash / Fast &amp; High Fidelity)</option>
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Official Vision Model)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Multimodal Vision)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  </select>
                </div>
              </div>
            )}

            {/* Sub-view: Zero-Key Free Cloud Vision */}
            {formData.aiProvider === "free_cloud" && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <p className="font-semibold flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zero-Key Free Cloud Vision Active</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    No API key or credit card needed! Uses public cloud multimodal gateways (from awesome-free-llm-apis) powered by <strong>Dots-3-Note Preview</strong> &amp; <strong>Nemotron 3.5 Super VL</strong> with 200 free requests/hour.
                  </p>
                </div>
              </div>
            )}

            {/* Sub-view: OpenRouter */}
            {formData.aiProvider === "openrouter" && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-600">OpenRouter API Key:</span>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sage-600 hover:text-sage-700 underline flex items-center space-x-0.5"
                  >
                    <span>Get free key (openrouter.ai)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={formData.openRouterApiKey || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, openRouterApiKey: e.target.value })
                  }
                  className="w-full text-xs font-mono px-3.5 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                />
                <div>
                  <label className="text-[11px] font-medium text-gray-600 block mb-1">
                    OpenRouter Free Vision Model
                  </label>
                  <select
                    value={formData.openRouterModel || "google/gemma-4-31b-it:free"}
                    onChange={(e) =>
                      setFormData({ ...formData, openRouterModel: e.target.value })
                    }
                    className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 text-gray-800 cursor-pointer"
                  >
                    <option value="google/gemma-4-31b-it:free">google/gemma-4-31b-it:free (262K context / Multimodal)</option>
                    <option value="dots-studio/dots-3-note-preview:free">dots-studio/dots-3-note-preview:free (Specialized for textbooks/notes)</option>
                    <option value="nvidia/nemotron-3.5-super-vl:free">nvidia/nemotron-3.5-super-vl:free (1M context)</option>
                    <option value="openrouter/free">openrouter/free (Auto Free Router)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Sub-view: Mistral AI */}
            {formData.aiProvider === "mistral" && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-600">Mistral API Key:</span>
                  <a
                    href="https://console.mistral.ai/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sage-600 hover:text-sage-700 underline flex items-center space-x-0.5"
                  >
                    <span>Get free key ($10/mo free credit)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="mistral-..."
                  value={formData.mistralApiKey || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mistralApiKey: e.target.value })
                  }
                  className="w-full text-xs font-mono px-3.5 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                />
                <div>
                  <label className="text-[11px] font-medium text-gray-600 block mb-1">
                    Mistral Vision Model
                  </label>
                  <select
                    value={formData.mistralModel || "pixtral-12b-2409"}
                    onChange={(e) =>
                      setFormData({ ...formData, mistralModel: e.target.value })
                    }
                    className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 text-gray-800 cursor-pointer"
                  >
                    <option value="pixtral-12b-2409">pixtral-12b-2409 (Dedicated High-Accuracy Vision OCR)</option>
                    <option value="mistral-small-latest">mistral-small-latest (Multimodal Vision)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="bg-sage-50/60 rounded-lg p-2.5 border border-sage-200/50 space-y-1 text-[11px] text-gray-600">
              <p className="font-semibold text-sage-800 flex items-center space-x-1">
                <span>Free &amp; Unlimited Intelligence Guide:</span>
              </p>
              <p>
                <strong>Google Gemini:</strong> 1,500 free generations daily. Supports multi-key pooling.
              </p>
              <p>
                <strong>Zero-Key Cloud:</strong> No API key required at all! Uses community-verified free cloud vision endpoints.
              </p>
              <p>
                <strong>OpenRouter / Mistral:</strong> Generous free tiers with SOTA open-weights vision models (Gemma, Pixtral, Nemotron).
              </p>
            </div>
          </div>

          {/* Teacher Profile Section */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Teacher Information (Kat)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Teacher Name (English)
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherName: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Teacher Name (Filipino)
                </label>
                <input
                  type="text"
                  value={formData.teacherNameFilipino}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teacherNameFilipino: e.target.value,
                    })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Kinder 2 Coordinator (Checked / Observed)
                </label>
                <input
                  type="text"
                  value={formData.coordinatorKinder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinatorKinder: e.target.value,
                    })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Grade 1 Coordinator (Checked / Observed)
                </label>
                <input
                  type="text"
                  value={formData.coordinatorGrade1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinatorGrade1: e.target.value,
                    })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* School Details */}
          <div className="space-y-3.5 pt-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
              <School className="w-3.5 h-3.5 text-gray-400" />
              <span>School Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  School Year
                </label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolYear: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Kinder Section
                </label>
                <input
                  type="text"
                  value={formData.sectionKinder}
                  onChange={(e) =>
                    setFormData({ ...formData, sectionKinder: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Grade 1 Section
                </label>
                <input
                  type="text"
                  value={formData.sectionGrade1}
                  onChange={(e) =>
                    setFormData({ ...formData, sectionGrade1: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-borderMuted">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-sage-500 text-white hover:bg-sage-600 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              {showSavedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
