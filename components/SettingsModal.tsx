"use client";

import React, { useState, useEffect } from "react";
import { X, User, School, Check, UserCheck } from "lucide-react";
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
          {/* Gemini AI Key Section */}
          <div className="space-y-1.5 p-4 rounded-xl bg-canvas border border-sage-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Google Gemini AI Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sage-600 hover:text-sage-700 font-medium underline underline-offset-2"
              >
                Get a free key (Google AI Studio)
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={formData.geminiApiKey || ""}
              onChange={(e) =>
                setFormData({ ...formData, geminiApiKey: e.target.value })
              }
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 transition-colors"
            />
            
            <div className="pt-2">
              <label className="text-[11px] font-medium text-gray-600 block mb-1">
                Gemini Model Version
              </label>
              <select
                value={formData.geminiModel || "auto"}
                onChange={(e) =>
                  setFormData({ ...formData, geminiModel: e.target.value })
                }
                className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-borderMuted focus:outline-none focus:border-sage-500 text-gray-800 cursor-pointer"
              >
                <option value="auto">Auto-detect Best Active Model (gemini-2.5-flash / Recommended)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fastest Vision & Document Analysis)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (High-Capacity Deep Reasoning)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-1.5-flash-latest">gemini-1.5-flash-latest</option>
              </select>
            </div>

            <p className="text-[11px] text-gray-400">
              The app automatically detects and queries active models for your API key, avoiding 404 deprecation errors.
            </p>
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
