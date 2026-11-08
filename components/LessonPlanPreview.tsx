"use client";

import React, { useEffect, useRef, useState } from "react";
import type {
  IllustrationStyle,
  ImageInput,
  LessonPlan,
  MatatagLessonPlan,
  LccpLearningPlan,
  TeacherProfile,
} from "@/lib/types";
import { downloadLessonPlanDocx } from "@/lib/docxGenerator";
import {
  LCCP_BANNER_DATA_URI,
  LCCP_CREST_DATA_URI,
  LCCP_PAASCU_DATA_URI,
} from "@/lib/schoolLogos";
import {
  generateUniqueLessonIllustration,
  getDefaultIllustrationStyle,
} from "@/lib/lessonIllustrationGenerator";
import {
  FileDown,
  Printer,
  Edit3,
  Check,
  Loader2,
  Plus,
  Trash2,
  Columns,
  FileText,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

interface LessonPlanPreviewProps {
  plan: LessonPlan;
  profile: TeacherProfile;
  onUpdatePlan: (updated: LessonPlan) => void;
  attachedImages?: ImageInput[];
}

function isLegacyOrFallbackIllustration(url?: string): boolean {
  if (!url || url.length < 50) return true;
  if (
    url.includes("-12,38 0,-15 12,38") ||
    url.includes("-9,38 0,-15 9,38") ||
    url.includes("hill1_") ||
    url.includes("p1Sky_") ||
    url.includes("p2Shop_") ||
    url.includes("panel1Clip_") ||
    url.includes("pollinations.ai") ||
    url.startsWith("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAA")
  ) {
    return true;
  }
  return false;
}

export const LessonPlanPreview: React.FC<LessonPlanPreviewProps> = ({
  plan,
  profile,
  onUpdatePlan,
  attachedImages,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [variationSeed, setVariationSeed] = useState(0);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const lastRenderedIdentityRef = useRef<string>("");

  const planIdentityKey =
    plan.templateType === "matatag"
      ? `matatag|${plan.subjectMatter.paksa}|${plan.gradeSection}|${(plan.illustrationPanels || []).join("|")}`
      : `lccp|${plan.subject}|${plan.subjectMatter.lesson}|${plan.rveFormat || "portrait"}|${(plan.illustrationPanels || []).join("|")}`;

  useEffect(() => {
    let cancelled = false;
    const isAlreadyRendered =
      lastRenderedIdentityRef.current === planIdentityKey &&
      plan.generatedIllustrationUrl &&
      !isLegacyOrFallbackIllustration(plan.generatedIllustrationUrl);

    if (isAlreadyRendered) {
      return;
    }

    (async () => {
      setIsGeneratingArt(true);
      try {
        const style = getDefaultIllustrationStyle(plan);
        const dataUri = await generateUniqueLessonIllustration(plan, attachedImages, {
          style,
          variationSeed,
          forceNewGeneration: true,
        });
        if (!cancelled && dataUri) {
          lastRenderedIdentityRef.current = planIdentityKey;
          onUpdatePlan({
            ...plan,
            generatedIllustrationUrl: dataUri,
            illustrationStyle: style,
          });
        }
      } catch (err) {
        console.warn("Illustration render skipped:", err);
      } finally {
        if (!cancelled) {
          setIsGeneratingArt(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planIdentityKey]);

  const handleRegenerateIllustration = async (customStyle?: IllustrationStyle) => {
    setIsGeneratingArt(true);
    try {
      const nextSeed = variationSeed + 1;
      setVariationSeed(nextSeed);
      const nextStyle = customStyle || getDefaultIllustrationStyle(plan);
      const dataUri = await generateUniqueLessonIllustration(plan, attachedImages, {
        style: nextStyle,
        variationSeed: nextSeed,
        forceNewGeneration: true,
      });
      lastRenderedIdentityRef.current = planIdentityKey;
      onUpdatePlan({
        ...plan,
        generatedIllustrationUrl: dataUri,
        illustrationStyle: nextStyle,
      });
    } finally {
      setIsGeneratingArt(false);
    }
  };


  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      await downloadLessonPlanDocx(plan, profile);
    } catch (e) {
      console.error("Failed to generate DOCX:", e);
      alert("Error generating Word document. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const isMatatag = plan.templateType === "matatag";
  const isRve =
    !isMatatag && plan.subject.trim().toUpperCase() === "RVE";
  const rveFormat = !isMatatag ? plan.rveFormat || "portrait" : "portrait";

  return (
    <div className="space-y-4">
      {/* Action Toolbar (Hidden on Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-borderMuted shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
            {isMatatag
              ? "Banghay- Aralin sa FILIPINO (Exact Kat Format)"
              : isRve && rveFormat === "landscape_adidse"
              ? "Religion Learning Plan (5-Column Landscape ADIDSE)"
              : "LCCP Learning Plan (Exact Kat Format)"}
          </span>

          {isRve && !isMatatag && (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200 text-[11px]">
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    rveFormat: "portrait",
                  })
                }
                className={`px-2.5 py-1 rounded-md font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                  rveFormat === "portrait"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>LCCP Portrait (Wk 9–15)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    rveFormat: "landscape_adidse",
                  })
                }
                className={`px-2.5 py-1 rounded-md font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                  rveFormat === "landscape_adidse"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>5-Col ADIDSE (Wk 1–8)</span>
              </button>
            </div>
          )}

          <span className="text-xs text-gray-500 hidden sm:inline">
            {isEditing
              ? "Click any text box to customize before exporting"
              : "Exact school table format ready to download or print"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              isEditing
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-canvas hover:bg-surface border-borderMuted text-gray-700"
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-600" />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                <span>Edit Content</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleRegenerateIllustration()}
            disabled={isGeneratingArt}
            title="Generate a new unique lesson illustration based on the textbook page"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isGeneratingArt ? "animate-spin" : ""}`}
            />
            <span>New Unique Image</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-canvas hover:bg-gray-200/70 text-gray-700 border border-borderMuted transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isDownloading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sage-600 hover:bg-sage-700 text-white shadow-xs transition-all disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Download Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Paper Container */}
      <div className="print-container bg-white rounded-2xl border border-borderMuted shadow-sm p-4 sm:p-8 overflow-x-auto text-black">
        {isMatatag ? (
          <MatatagTableEditor
            plan={plan}
            profile={profile}
            isEditing={isEditing}
            onChange={(updated) => onUpdatePlan(updated)}
            onRegenerateIllustration={handleRegenerateIllustration}
            isGeneratingArt={isGeneratingArt}
          />
        ) : isRve && rveFormat === "landscape_adidse" && plan.adidse ? (
          <RveAdidseTableEditor
            plan={plan}
            profile={profile}
            isEditing={isEditing}
            onChange={(updated) => onUpdatePlan(updated)}
            onRegenerateIllustration={handleRegenerateIllustration}
            isGeneratingArt={isGeneratingArt}
          />
        ) : (
          <LccpTableEditor
            plan={plan}
            profile={profile}
            isEditing={isEditing}
            onChange={(updated) => onUpdatePlan(updated)}
            onRegenerateIllustration={handleRegenerateIllustration}
            isGeneratingArt={isGeneratingArt}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * FORMAT A: Banghay- Aralin sa FILIPINO (Grade 1 & Kinder 2 Filipino)
 * Exact replica of G1-Filipino-LP-Week 11.docx, GRADE1-FILIPINO-LP-WEEK14 true.pdf,
 * and K2 - Week 4 Filipino.docx
 * ========================================================================== */
const MatatagTableEditor: React.FC<{
  plan: MatatagLessonPlan;
  profile: TeacherProfile;
  isEditing: boolean;
  onChange: (plan: MatatagLessonPlan) => void;
  onRegenerateIllustration: (style?: IllustrationStyle) => void;
  isGeneratingArt: boolean;
}> = ({
  plan,
  profile,
  isEditing,
  onChange,
  onRegenerateIllustration,
  isGeneratingArt,
}) => {
  const isKinder = plan.gradeSection.toLowerCase().includes("kinder");

  const updateField = <K extends keyof MatatagLessonPlan>(
    key: K,
    value: MatatagLessonPlan[K]
  ) => {
    onChange({ ...plan, [key]: value });
  };

  const aiLines = (plan.subjectMatter.aiDeclaration || "").split("\n");
  const aiHeaderNote =
    aiLines[0]?.replace(/^DO\s*3\s*s\.?\s*2026\s*Annex\s*/i, "").trim() ||
    "(Banggitin kung paano ginamit ang AI sa pagbuo ng plano sa pagtuturo)";
  const aiBodyText =
    aiLines[1]?.trim() ||
    "Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.";

  return (
    <div
      className="max-w-[850px] mx-auto text-[13px] leading-snug text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <table className="lesson-table w-full border-collapse border border-black">
        <tbody>
          {/* Row 1: Pure White School Header Cell (colSpan 6) */}
          <tr>
            <td
              colSpan={6}
              className="bg-white text-center py-3 px-4 border border-black"
            >
              <div className="flex flex-col items-center justify-center">
                <img
                  src={LCCP_BANNER_DATA_URI}
                  alt="La Consolacion College Pasig PAASCU Banner"
                  className="h-16 sm:h-20 w-auto object-contain mx-auto mb-1"
                />
                <div className="font-bold text-lg sm:text-xl tracking-tight text-black">
                  Banghay- Aralin sa FILIPINO
                </div>
                <div className="text-xs font-normal text-black">
                  {plan.schoolYear || profile.schoolYear || "S.Y. 2026-2027"}
                </div>
              </div>
            </td>
          </tr>

          {/* Row 2: Exact 3-Column Metadata Row (Subject | Grade & Section | Date Coverage + Term & Week) */}
          <tr>
            <td
              colSpan={2}
              className="w-[30%] align-top p-2.5 border border-black bg-white"
            >
              <div className="font-bold">Subject:</div>
              <div className="h-3" />
              {isEditing ? (
                <input
                  type="text"
                  value={plan.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div className="font-bold">{plan.subject}</div>
              )}
            </td>
            <td
              colSpan={2}
              className="w-[35%] align-top p-2.5 border border-black bg-white"
            >
              <div className="font-bold">Grade &amp; Section:</div>
              <div className="h-3" />
              {isEditing ? (
                <input
                  type="text"
                  value={plan.gradeSection}
                  onChange={(e) => updateField("gradeSection", e.target.value)}
                  className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div className="font-bold">{plan.gradeSection}</div>
              )}
            </td>
            <td
              colSpan={2}
              className="w-[35%] align-top p-2.5 border border-black bg-white"
            >
              <div className="font-bold">
                Date Coverage:{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.dateCoverage}
                    onChange={(e) =>
                      updateField("dateCoverage", e.target.value)
                    }
                    className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.dateCoverage}</span>
                )}
              </div>
              <div className="h-3" />
              <div className="font-bold">
                Term &amp; Week:{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.termWeek}
                    onChange={(e) => updateField("termWeek", e.target.value)}
                    className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.termWeek}</span>
                )}
              </div>
            </td>
          </tr>

          {/* Row 3: Two Columns (I. Mga Layunin sa Pagkatuto | II. Paksang Aralin) */}
          <tr>
            <td
              colSpan={3}
              className="w-1/2 align-top p-3 border border-black bg-white"
            >
              <div className="font-bold">I. Mga Layunin sa Pagkatuto:</div>
              <div className="italic mb-2">
                Sa pagtatapos ng talakayan, ang mga mag-aaral ay inaasahang;
              </div>
              {isEditing ? (
                <EditableStringList
                  items={plan.objectives}
                  onChange={(objectives) =>
                    updateField("objectives", objectives)
                  }
                />
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {plan.objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              )}
            </td>

            <td
              colSpan={3}
              className="w-1/2 align-top p-3 border border-black bg-white space-y-2"
            >
              <div className="font-bold">II. Paksang Aralin:</div>
              <div>
                <span className="font-bold">Paksa: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.subjectMatter.paksa}
                    onChange={(e) =>
                      updateField("subjectMatter", {
                        ...plan.subjectMatter,
                        paksa: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.subjectMatter.paksa}</span>
                )}
              </div>

              {(plan.subjectMatter.wika || isEditing) && (
                <div>
                  <span className="font-bold">Wika: </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={plan.subjectMatter.wika || ""}
                      onChange={(e) =>
                        updateField("subjectMatter", {
                          ...plan.subjectMatter,
                          wika: e.target.value,
                        })
                      }
                      className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                    />
                  ) : (
                    <span>{plan.subjectMatter.wika}</span>
                  )}
                </div>
              )}

              <div className="pt-1">
                <div className="font-bold">Sanggunian:</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.subjectMatter.sanggunian}
                    onChange={(e) =>
                      updateField("subjectMatter", {
                        ...plan.subjectMatter,
                        sanggunian: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <div>{plan.subjectMatter.sanggunian}</div>
                )}
              </div>

              <div className="pt-1 text-[11px] leading-snug">
                <div>
                  <span className="font-bold">
                    Deklarasyon sa Paggamit ng AI:{" "}
                  </span>
                  <span className="italic">
                    DO 3 s 2026 Annex {aiHeaderNote}
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.subjectMatter.aiDeclaration}
                    onChange={(e) =>
                      updateField("subjectMatter", {
                        ...plan.subjectMatter,
                        aiDeclaration: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-1"
                  />
                ) : (
                  <div className="pl-5 mt-0.5">{aiBodyText}</div>
                )}
              </div>
            </td>
          </tr>

          {/* Row 4: III. Mga Kasanayan sa Pagkatuto */}
          <tr>
            <td colSpan={6} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">
                III. Mga Kasanayan sa Pagkatuto:
              </div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.learningCompetencies}
                  onChange={(e) =>
                    updateField("learningCompetencies", e.target.value)
                  }
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : isKinder ? (
                <ul className="list-disc pl-5">
                  <li>{plan.learningCompetencies}</li>
                </ul>
              ) : (
                <div>{plan.learningCompetencies}</div>
              )}
            </td>
          </tr>

          {/* Row 5: IV. Integrasyon Header (Pure White #FFFFFF) */}
          <tr>
            <td
              colSpan={6}
              className="bg-white font-bold p-2.5 border border-black"
            >
              IV. Integrasyon:
            </td>
          </tr>

          {/* Rows 6–11: Kat's Exact Color-Coded Integration Rows */}
          {(
            [
              {
                key: "laudatoSi",
                label: "Laudato Si",
                bgColor: "#93C37D",
                italicRight: true,
              },
              {
                key: "justiceAndPeace",
                label: "Justice and Peace Education",
                bgColor: "#A34500",
                italicRight: true,
              },
              {
                key: "genderAndDevelopment",
                label: "Gender and Development",
                bgColor: "#B4A6D5",
                italicRight: true,
              },
              {
                key: "lccpCare",
                label: "LCCP- Care",
                bgColor: "#FF9900",
                italicRight: true,
              },
              {
                key: "interdisciplinary",
                label: "Integrasyong Interdisiplinaryo",
                bgColor: "#FFFFFF",
                italicRight: false,
              },
              {
                key: "techTeaching",
                label: "Paggamit ng Teknolohiya sa Pagtuturo",
                bgColor: "#FFFFFF",
                italicRight: true,
              },
            ] as const
          ).map((item) => (
            <tr key={item.key}>
              <td
                colSpan={2}
                style={{ backgroundColor: item.bgColor }}
                className="w-[35%] font-bold p-2.5 align-top border border-black text-black"
              >
                {item.label}
              </td>
              <td
                colSpan={4}
                style={{ backgroundColor: item.bgColor }}
                className="w-[65%] p-2.5 align-top border border-black text-black"
              >
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.integrations[item.key]}
                    onChange={(e) =>
                      updateField("integrations", {
                        ...plan.integrations,
                        [item.key]: e.target.value,
                      })
                    }
                    className="w-full bg-white/90 border border-amber-400 rounded p-1 text-black"
                  />
                ) : item.key === "interdisciplinary" ? (
                  <div className="space-y-0.5">
                    {plan.integrations.interdisciplinary
                      .split("\n")
                      .filter(Boolean)
                      .map((line, lIdx) => {
                        const colonIdx = line.indexOf(":");
                        if (colonIdx !== -1 && colonIdx < 25) {
                          return (
                            <div key={lIdx}>
                              <span className="font-bold">
                                {line.slice(0, colonIdx + 1)}
                              </span>
                              <span>{line.slice(colonIdx + 1)}</span>
                            </div>
                          );
                        }
                        return <div key={lIdx}>{line}</div>;
                      })}
                  </div>
                ) : (
                  <div className={item.italicRight ? "italic" : ""}>
                    {plan.integrations[item.key]}
                  </div>
                )}
              </td>
            </tr>
          ))}

          {/* Row 12: • Pamamaraan */}
          <tr>
            <td
              colSpan={6}
              className="p-3 space-y-2.5 border border-black bg-white"
            >
              <div className="font-bold">• Pamamaraan:</div>

              {/* a. Mga Panimulang Gawain */}
              <div className="pl-3">
                <div className="font-bold mb-1">
                  {isKinder
                    ? "a. Mga Panimulang Gawain (5 mins)"
                    : "a. Mga Panimulang Gawain (Day 1/10 mins)"}
                </div>
                {isEditing ? (
                  <EditableStringList
                    items={plan.procedures.routine}
                    onChange={(routine) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        routine,
                      })
                    }
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-0.5">
                    {plan.procedures.routine.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* b. Pagganyak */}
              <div className="pl-3">
                <div className="font-bold mb-1">
                  b. Pagganyak (day 1/15 mins)
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.procedures.motivation}
                    onChange={(e) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        motivation: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-0.5">
                    {plan.procedures.motivation
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                )}
              </div>

              {/* Unique Generated Textbook Illustration (Matches Kat's "sample lesson plan" folder) */}
              <div className="pl-3 pt-1">
                <EmbeddedLessonIllustrationBlock plan={plan} />
              </div>

              {/* c. Pagtalakay ng Aralin */}
              <div className="pl-3 space-y-2">
                <div className="font-bold">
                  c. Pagtalakay ng Aralin: (Day 1-4/30 mins)
                </div>
                {isEditing ? (
                  <EditableStringList
                    items={plan.procedures.discussion.steps}
                    onChange={(steps) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        discussion: {
                          ...plan.procedures.discussion,
                          steps,
                        },
                      })
                    }
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-0.5">
                    {plan.procedures.discussion.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                <div>
                  <div className="font-bold mb-1">Gabay na tanong:</div>
                  {isEditing ? (
                    <EditableStringList
                      items={plan.procedures.discussion.guideQuestions}
                      onChange={(guideQuestions) =>
                        updateField("procedures", {
                          ...plan.procedures,
                          discussion: {
                            ...plan.procedures.discussion,
                            guideQuestions,
                          },
                        })
                      }
                    />
                  ) : (
                    <ol className="list-decimal pl-6 space-y-0.5">
                      {plan.procedures.discussion.guideQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ol>
                  )}
                </div>

                <div>
                  <span className="font-bold">Pamamaraan sa Pagturo: </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={plan.procedures.discussion.teachingMethods}
                      onChange={(e) =>
                        updateField("procedures", {
                          ...plan.procedures,
                          discussion: {
                            ...plan.procedures.discussion,
                            teachingMethods: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5 italic"
                    />
                  ) : (
                    <span className="italic">
                      {plan.procedures.discussion.teachingMethods}
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-bold mb-1">Pagpapalalim:</div>
                  {isEditing ? (
                    <EditableStringList
                      items={plan.procedures.discussion.deepening}
                      onChange={(deepening) =>
                        updateField("procedures", {
                          ...plan.procedures,
                          discussion: {
                            ...plan.procedures.discussion,
                            deepening,
                          },
                        })
                      }
                    />
                  ) : (
                    <ul className="list-disc pl-6 space-y-0.5">
                      {plan.procedures.discussion.deepening.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* d. Integrasyon ng Pagpapahalaga */}
              <div className="pl-3">
                <div className="font-bold mb-1">
                  d. Integrasyon ng Pagpapahalaga: (Day 4/ 15 mins)
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.procedures.valuesIntegration}
                    onChange={(e) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        valuesIntegration: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                  />
                ) : (
                  <ul className="list-disc pl-6">
                    <li>{plan.procedures.valuesIntegration}</li>
                  </ul>
                )}
              </div>

              {/* e. Pagbubuod */}
              <div className="pl-3">
                <div className="font-bold mb-1">
                  e. Pagbubuod: (Day 4/ 15 mins)
                </div>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={plan.procedures.summary}
                    onChange={(e) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        summary: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-0.5">
                    {plan.procedures.summary
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                )}
              </div>
            </td>
          </tr>

          {/* Row 13: VI- Pagtataya: (Day 5/ 20 mins) */}
          <tr>
            <td
              colSpan={6}
              className="p-3 space-y-2 border border-black bg-white"
            >
              <div className="font-bold">VI- Pagtataya: (Day 5/ 20 mins)</div>

              <div>
                {!isKinder && <div className="font-bold">Formative</div>}
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.assessment.formative}
                    onChange={(e) =>
                      updateField("assessment", {
                        ...plan.assessment,
                        formative: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5 mt-0.5"
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-0.5">
                    {plan.assessment.formative
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1 pt-1">
                {!isKinder && <div className="font-bold">Summative</div>}
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.assessment.summativeInstruction}
                    onChange={(e) =>
                      updateField("assessment", {
                        ...plan.assessment,
                        summativeInstruction: e.target.value,
                      })
                    }
                    className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                  />
                ) : (
                  <div className="font-bold whitespace-pre-line">
                    {plan.assessment.summativeInstruction}
                  </div>
                )}

                {isEditing ? (
                  <EditableStringList
                    items={plan.assessment.summativeItems}
                    onChange={(summativeItems) =>
                      updateField("assessment", {
                        ...plan.assessment,
                        summativeItems,
                      })
                    }
                  />
                ) : (
                  <ol className="list-decimal pl-6 space-y-0.5">
                    {plan.assessment.summativeItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                )}
              </div>
            </td>
          </tr>

          {/* Row 14: VII- Takdang- Aralin: */}
          <tr>
            <td colSpan={6} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">VII- Takdang- Aralin:</div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.assignment}
                  onChange={(e) => updateField("assignment", e.target.value)}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : (
                <div>{plan.assignment}</div>
              )}
            </td>
          </tr>

          {/* Row 15: Mga Tala at Pagninilay: */}
          <tr>
            <td colSpan={6} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">Mga Tala at Pagninilay:</div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.remarks}
                  onChange={(e) => updateField("remarks", e.target.value)}
                  placeholder="(Iniwanang bakante para sa sulat-kamay na tala at pagninilay)"
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : (
                <div className="min-h-[28px]">{plan.remarks}</div>
              )}
            </td>
          </tr>

          {/* Row 16: 3-Column Signatories */}
          <tr>
            <td
              colSpan={2}
              className="w-1/3 p-3 align-top border border-black bg-white"
            >
              <div className="font-bold mb-4">
                {isKinder ? "Inihanda ni:" : "Inihanda:"}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.signatories.preparedBy}
                  onChange={(e) =>
                    updateField("signatories", {
                      ...plan.signatories,
                      preparedBy: e.target.value,
                    })
                  }
                  className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div className="font-bold">
                  {plan.signatories.preparedBy ||
                    (isKinder
                      ? "Acola, Kathrynn Ross L."
                      : profile.teacherNameFilipino)}
                </div>
              )}
            </td>
            <td
              colSpan={2}
              className="w-1/3 p-3 align-top border border-black bg-white"
            >
              <div className="font-bold mb-4">
                {isKinder ? "Sinuri ni:" : "Sinuri:"}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.signatories.checkedBy}
                  onChange={(e) =>
                    updateField("signatories", {
                      ...plan.signatories,
                      checkedBy: e.target.value,
                    })
                  }
                  className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div className="font-bold">
                  {plan.signatories.checkedBy ||
                    (isKinder
                      ? "Emma P. Dunque, LPT."
                      : profile.coordinatorGrade1)}
                </div>
              )}
            </td>
            <td
              colSpan={2}
              className="w-1/3 p-3 align-top border border-black bg-white"
            >
              <div className="font-bold mb-4">
                {isKinder ? "Inobserbahan ni:" : "Inobserbahan:"}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.signatories.observedBy}
                  onChange={(e) =>
                    updateField("signatories", {
                      ...plan.signatories,
                      observedBy: e.target.value,
                    })
                  }
                  className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div className="font-bold">
                  {plan.signatories.observedBy ||
                    (isKinder
                      ? "Emma P. Dunque, LPT."
                      : profile.coordinatorGrade1)}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/* ============================================================================
 * FORMAT B: LA CONSOLACION COLLEGE-PASIG LEARNING PLAN (Portrait)
 * Exact replica of K2 -WEEK 6 - MATHEMATICS.docx, K2-SCIENCE-W6.docx,
 * and RVE LESSON 9.docx
 * ========================================================================== */
const LccpTableEditor: React.FC<{
  plan: LccpLearningPlan;
  profile: TeacherProfile;
  isEditing: boolean;
  onChange: (plan: LccpLearningPlan) => void;
  onRegenerateIllustration: (style?: IllustrationStyle) => void;
  isGeneratingArt: boolean;
}> = ({
  plan,
  profile,
  isEditing,
  onChange,
  onRegenerateIllustration,
  isGeneratingArt,
}) => {
  const isRve = plan.subject.trim().toUpperCase() === "RVE";

  const updateField = <K extends keyof LccpLearningPlan>(
    key: K,
    value: LccpLearningPlan[K]
  ) => {
    onChange({ ...plan, [key]: value });
  };

  return (
    <div
      className="max-w-[850px] mx-auto text-[14px] leading-snug text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <table className="lesson-table w-full border-collapse border border-black">
        <tbody>
          {/* Row 1: Pure White Institutional Header with BOTH Left LCCP Crest & Right PAASCU Level II Logo */}
          <tr>
            <td
              colSpan={3}
              className="bg-white text-center py-4 px-6 border border-black"
            >
              <div className="flex items-center justify-between gap-4">
                <img
                  src={LCCP_CREST_DATA_URI}
                  alt="La Consolacion College Pasig Seal"
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain shrink-0"
                />
                <div className="flex-1 text-center">
                  <div className="font-bold text-base sm:text-lg tracking-wide text-black">
                    {plan.header.institution || profile.schoolName}
                  </div>
                  <div className="font-bold text-sm sm:text-base text-black">
                    {plan.header.address || profile.schoolAddress}
                  </div>
                  <div className="font-bold text-base sm:text-lg text-black">
                    {plan.header.title || "LEARNING PLAN"}
                  </div>
                  <div className="font-bold text-sm sm:text-base text-black">
                    {plan.header.schoolYear || profile.schoolYear}
                  </div>
                </div>
                <img
                  src={LCCP_PAASCU_DATA_URI}
                  alt="PAASCU Level II Accredited Logo"
                  className="h-16 sm:h-20 w-auto object-contain shrink-0"
                />
              </div>
            </td>
          </tr>

          {/* Row 2: 3-Column Metadata Row */}
          <tr>
            <td className="w-[30%] p-2.5 align-top border border-black bg-white">
              <span className="font-bold">Subject: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                />
              ) : (
                <span>{plan.subject}</span>
              )}
            </td>
            <td className="w-[30%] p-2.5 align-top border border-black bg-white">
              <span className="font-bold">Grade Level: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.gradeLevel}
                  onChange={(e) => updateField("gradeLevel", e.target.value)}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                />
              ) : (
                <span>{plan.gradeLevel}</span>
              )}
            </td>
            <td className="w-[40%] p-2.5 align-top border border-black bg-white">
              <div>
                <span className="font-bold">Date Coverage: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.dateCoverage}
                    onChange={(e) =>
                      updateField("dateCoverage", e.target.value)
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.dateCoverage}</span>
                )}
              </div>
              <div className="font-bold mt-0.5">
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.term}
                    onChange={(e) => updateField("term", e.target.value)}
                    className="w-full font-bold bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.term}</span>
                )}
              </div>
            </td>
          </tr>

          {/* Row 3: Two Columns (I Learning Objectives | II Subject Matter) */}
          <tr>
            <td className="w-1/2 p-3 align-top border border-black bg-white">
              <div className="mb-1.5">
                <span className="font-bold">I Learning Objectives: </span>
                <span>
                  At the end of the lesson the students will be able to:
                </span>
              </div>
              {isEditing ? (
                <EditableStringList
                  items={plan.objectives}
                  onChange={(objectives) =>
                    updateField("objectives", objectives)
                  }
                />
              ) : isRve ? (
                <ol className="list-[lower-alpha] pl-6 space-y-1">
                  {plan.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ol>
              ) : (
                <ul className="list-disc pl-6 space-y-1">
                  {plan.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              )}
            </td>
            <td
              colSpan={2}
              className="w-1/2 p-3 align-top space-y-3 border border-black bg-white"
            >
              <div className="font-bold">II Subject Matter</div>
              <div>
                <span className="font-bold">Lesson: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.subjectMatter.lesson}
                    onChange={(e) =>
                      updateField("subjectMatter", {
                        ...plan.subjectMatter,
                        lesson: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.subjectMatter.lesson}</span>
                )}
              </div>
              <div>
                <span className="font-bold">Reference/s: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.subjectMatter.references}
                    onChange={(e) =>
                      updateField("subjectMatter", {
                        ...plan.subjectMatter,
                        references: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5 mt-0.5"
                  />
                ) : (
                  <span>{plan.subjectMatter.references}</span>
                )}
              </div>
            </td>
          </tr>

          {/* Optional Row 4: III - Learning Competencies */}
          {(plan.learningCompetencies?.trim() || isEditing) && (
            <tr>
              <td colSpan={3} className="p-3 border border-black bg-white">
                <div className="font-bold mb-1">
                  III - Learning Competencies:
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.learningCompetencies}
                    onChange={(e) =>
                      updateField("learningCompetencies", e.target.value)
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                  />
                ) : (
                  <ul className="list-disc pl-6">
                    <li>{plan.learningCompetencies}</li>
                  </ul>
                )}
              </td>
            </tr>
          )}

          {/* Row 5: III- Values Statement */}
          <tr>
            <td colSpan={3} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">III- Values Statement:</div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.valuesStatement}
                  onChange={(e) =>
                    updateField("valuesStatement", e.target.value)
                  }
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : isRve ? (
                <div>{plan.valuesStatement}</div>
              ) : (
                <ul className="list-disc pl-6">
                  <li>{plan.valuesStatement}</li>
                </ul>
              )}
            </td>
          </tr>

          {/* Row 6: IV- Procedures */}
          <tr>
            <td
              colSpan={3}
              className="p-3 space-y-2.5 border border-black bg-white"
            >
              <div className="font-bold">IV- Procedures:</div>

              <div className="pl-4">
                <div className="font-bold mb-1">a. Routine Activities</div>
                {isEditing ? (
                  <EditableStringList
                    items={plan.procedures.routineActivities}
                    onChange={(routineActivities) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        routineActivities,
                      })
                    }
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-0.5">
                    {plan.procedures.routineActivities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pl-4">
                <div className="font-bold mb-1">b. Motivation:</div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={plan.procedures.motivation}
                    onChange={(e) =>
                      updateField("procedures", {
                        ...plan.procedures,
                        motivation: e.target.value,
                      })
                    }
                    className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-1"
                  />
                ) : (
                  <div className="pl-4 whitespace-pre-line">
                    {plan.procedures.motivation}
                  </div>
                )}
              </div>

              {/* Unique Generated Textbook Illustration (Matches Kat's "sample lesson plan" folder) */}
              <div className="pl-4 pt-1">
                <EmbeddedLessonIllustrationBlock plan={plan} />
              </div>

              <div className="pl-4 space-y-2">
                <div className="font-bold">c. Learning Strategies</div>
                {plan.procedures.learningStrategies.map((strat, sIdx) => (
                  <div key={sIdx} className="pl-3 space-y-1">
                    {isEditing ? (
                      <div className="space-y-1 bg-amber-50/40 p-2 rounded border border-amber-200">
                        <input
                          type="text"
                          value={strat.title}
                          onChange={(e) => {
                            const updated = [
                              ...plan.procedures.learningStrategies,
                            ];
                            updated[sIdx] = {
                              ...strat,
                              title: e.target.value,
                            };
                            updateField("procedures", {
                              ...plan.procedures,
                              learningStrategies: updated,
                            });
                          }}
                          className="w-full font-bold bg-white border border-amber-300 rounded px-1.5 py-0.5"
                        />
                        <textarea
                          rows={2}
                          value={strat.instructions}
                          onChange={(e) => {
                            const updated = [
                              ...plan.procedures.learningStrategies,
                            ];
                            updated[sIdx] = {
                              ...strat,
                              instructions: e.target.value,
                            };
                            updateField("procedures", {
                              ...plan.procedures,
                              learningStrategies: updated,
                            });
                          }}
                          className="w-full bg-white border border-amber-300 rounded p-1"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold">{strat.title} – </span>
                        <span>{strat.instructions}</span>
                      </div>
                    )}

                    {strat.questions && strat.questions.length > 0 && (
                      <div className="pl-4">
                        <div className="font-bold">Guide Questions:</div>
                        <ol className="list-decimal pl-5 space-y-0.5">
                          {strat.questions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </td>
          </tr>

          {/* Row 7: V- Assessment */}
          <tr>
            <td colSpan={3} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">V- Assessment:</div>
              {isEditing ? (
                <EditableStringList
                  items={plan.assessment}
                  onChange={(assessment) =>
                    updateField("assessment", assessment)
                  }
                />
              ) : (
                <ul className="list-disc pl-6 space-y-0.5">
                  {plan.assessment.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </td>
          </tr>

          {/* Row 8: VI- Closure */}
          <tr>
            <td colSpan={3} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">VI- Closure:</div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.closure}
                  onChange={(e) => updateField("closure", e.target.value)}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : (
                <div>{plan.closure}</div>
              )}
            </td>
          </tr>

          {/* Row 9: VII- Assignment */}
          <tr>
            <td colSpan={3} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">VII- Assignment:</div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.assignment}
                  onChange={(e) => updateField("assignment", e.target.value)}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : (
                <div>{plan.assignment}</div>
              )}
            </td>
          </tr>

          {/* Row 10: Remarks */}
          <tr>
            <td colSpan={3} className="p-3 border border-black bg-white">
              <div className="font-bold mb-1">Remarks:</div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.remarks}
                  onChange={(e) => updateField("remarks", e.target.value)}
                  placeholder="(Left blank for handwritten remarks)"
                  className="w-full bg-amber-50/70 border border-amber-300 rounded p-1.5"
                />
              ) : (
                <div className="min-h-[28px]">{plan.remarks}</div>
              )}
            </td>
          </tr>

          {/* Row 11: 3-Column Signatories */}
          <tr>
            <td className="w-1/3 p-3 align-top border border-black bg-white">
              <div className="font-bold mb-4">Prepared by:</div>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.signatories.preparedBy}
                  onChange={(e) =>
                    updateField("signatories", {
                      ...plan.signatories,
                      preparedBy: e.target.value,
                    })
                  }
                  className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div>{plan.signatories.preparedBy || profile.teacherName}</div>
              )}
            </td>
            <td className="w-1/3 p-3 align-top border border-black bg-white">
              <div className="font-bold mb-4">Checked by:</div>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.signatories.checkedBy}
                  onChange={(e) =>
                    updateField("signatories", {
                      ...plan.signatories,
                      checkedBy: e.target.value,
                    })
                  }
                  className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div>
                  {plan.signatories.checkedBy || profile.coordinatorKinder}
                </div>
              )}
            </td>
            <td className="w-1/3 p-3 align-top border border-black bg-white">
              <div className="font-bold mb-4">Observed by:</div>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.signatories.observedBy}
                  onChange={(e) =>
                    updateField("signatories", {
                      ...plan.signatories,
                      observedBy: e.target.value,
                    })
                  }
                  className="w-full bg-amber-50/70 border border-amber-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <div>
                  {plan.signatories.observedBy || profile.coordinatorKinder}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/* ============================================================================
 * FORMAT C: 5-Column Landscape RELIGION LEARNING PLAN (ADIDSE / Lectio-Divina)
 * Exact replica of WEEK 1-3 RVE LP.docx and RVE LESSON 4-8
 * ========================================================================== */
const RveAdidseTableEditor: React.FC<{
  plan: LccpLearningPlan;
  profile: TeacherProfile;
  isEditing: boolean;
  onChange: (plan: LccpLearningPlan) => void;
  onRegenerateIllustration: (style?: IllustrationStyle) => void;
  isGeneratingArt: boolean;
}> = ({ plan, profile, onChange, onRegenerateIllustration, isGeneratingArt }) => {
  const adidse = plan.adidse!;

  return (
    <div
      className="min-w-[920px] mx-auto text-[12px] leading-snug text-black space-y-3"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* Top School Banner */}
      <div className="flex flex-col items-center justify-center">
        <img
          src={LCCP_BANNER_DATA_URI}
          alt="La Consolacion College Pasig PAASCU Banner"
          className="h-16 w-auto object-contain mx-auto"
        />
      </div>

      {/* Two-Column Metadata Block */}
      <div className="grid grid-cols-2 gap-4 font-bold text-xs px-1">
        <div className="space-y-0.5">
          <div>SUBJECT/ LEVEL: RELIGION – KINDER 2</div>
          <div>
            SCHOOL YEAR : {plan.header.schoolYear || profile.schoolYear}
          </div>
        </div>
        <div className="space-y-0.5">
          <div>
            GRADE &amp; SECTION:{" "}
            {adidse.sectionName || "KINDER 2 – OUR LADY OF CONSOLATION"}
          </div>
          <div>WEEK # / DATE: {adidse.weekDate || plan.dateCoverage}</div>
        </div>
      </div>

      {/* 5-Column Main ADIDSE Table */}
      <table className="lesson-table w-full border-collapse border border-black">
        <tbody>
          {/* Row 1: Sky Blue #8DB3E2 Header Row */}
          <tr style={{ backgroundColor: "#8DB3E2" }} className="text-center">
            <td className="w-[25%] p-2 border border-black font-bold">
              CONTENT/ OBJECTIVES
            </td>
            <td className="w-[17%] p-2 border border-black">
              <div className="font-bold">ALL ABOUT MY EXPERIENCE</div>
              <div className="italic text-[11px]">(Activity – Discussion)</div>
            </td>
            <td className="w-[26%] p-2 border border-black">
              <div className="font-bold">ALL ABOUT FAITH</div>
              <div className="italic text-[11px]">
                (Input – Further Discussion)
              </div>
            </td>
            <td className="w-[22%] p-2 border border-black">
              <div className="font-bold">ALL ABOUT MY LEARNING</div>
              <div className="italic text-[11px]">
                (Integrated Synthesis – Evaluation)
              </div>
            </td>
            <td className="w-[10%] p-2 border border-black font-bold">
              Remarks
            </td>
          </tr>

          {/* Row 2: Unit & Lesson Banner Row */}
          <tr className="bg-white font-bold text-center">
            <td
              colSpan={2}
              className="p-2 border border-black whitespace-pre-line"
            >
              {adidse.unitTitle}
            </td>
            <td colSpan={2} className="p-2 border border-black">
              {adidse.lessonTitle || plan.subjectMatter.lesson}
            </td>
            <td className="p-2 border border-black" />
          </tr>

          {/* Row 3: 5-Column Main Content */}
          <tr className="bg-white align-top">
            {/* Col 1: LECTIO-DIVINA + Objectives + A/B/C/D + Nested 4-Color Core Values Table */}
            <td className="p-2.5 border border-black space-y-2">
              <div className="font-bold">LECTIO- DIVINA</div>
              <div>
                <div className="font-bold">
                  Objectives: At the end of lesson the learners can:
                </div>
                <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                  {plan.objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-bold">A. VALUE FOCUS: </span>
                <span>{adidse.valueFocus}</span>
              </div>
              <div>
                <span className="font-bold">B. REFERENCE: </span>
                <span>{adidse.references}</span>
              </div>
              <div>
                <span className="font-bold">C. MATERIALS NEEDED: </span>
                <span>{adidse.materialsNeeded}</span>
              </div>
              <div>
                <span className="font-bold">D. INTEGRITAS: </span>
                <span>{adidse.integritas}</span>
              </div>

              {/* Nested 4-Color Core Values Table */}
              <table className="w-full border-collapse border border-black text-[11px] mt-2">
                <tbody>
                  <tr>
                    <td
                      style={{ backgroundColor: "#92D050" }}
                      className="w-[42%] p-1.5 border border-black font-bold"
                    >
                      Laudato Si
                    </td>
                    <td className="w-[58%] p-1.5 border border-black bg-white">
                      {adidse.coreValues.laudatoSi}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "#EE0000" }}
                      className="p-1.5 border border-black font-bold text-white"
                    >
                      Justice &amp; Peace Education
                    </td>
                    <td className="p-1.5 border border-black bg-white">
                      {adidse.coreValues.justiceAndPeace}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "#BC8FDD" }}
                      className="p-1.5 border border-black font-bold"
                    >
                      Gender &amp; Development
                    </td>
                    <td className="p-1.5 border border-black bg-white">
                      {adidse.coreValues.genderAndDevelopment}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "#F57E1B" }}
                      className="p-1.5 border border-black font-bold"
                    >
                      LCCP Care
                    </td>
                    <td className="p-1.5 border border-black bg-white">
                      {adidse.coreValues.lccpCare}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* Col 2: I. ROUTINE ACTIVITIES */}
            <td className="p-2.5 border border-black space-y-1.5">
              <div className="font-bold">I. ROUTINE ACTIVITIES</div>
              <ul className="list-disc pl-5 space-y-1">
                {adidse.routineActivities.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </td>

            {/* Col 3: II. Augustinian Lectio- Divina Proper (ADIDSE) */}
            <td className="p-2.5 border border-black space-y-2">
              <div className="font-bold">
                II. Augustinian Lectio- Divina Proper (ADIDSE)
              </div>
              <div>
                <div className="font-bold">Lectio:</div>
                <div>{adidse.lectio}</div>
              </div>
              <div className="py-1">
                <EmbeddedLessonIllustrationBlock plan={plan} compact />
              </div>
              <div>
                <div className="font-bold">
                  Meditatio: The teacher will ask the students:
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {adidse.meditatio.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-bold">Oratio:</div>
                <ul className="list-disc pl-5">
                  <li>{adidse.oratio}</li>
                </ul>
              </div>
              <div>
                <div className="font-bold">Contemplatio:</div>
                <ul className="list-disc pl-5">
                  <li>{adidse.contemplatio}</li>
                </ul>
              </div>
              <div>
                <div className="font-bold">Communicatio:</div>
                <ul className="list-disc pl-5">
                  <li>{adidse.communicatio}</li>
                </ul>
              </div>
              <div>
                <div className="font-bold">INPUT/ DEEPENING:</div>
                <ul className="list-disc pl-5">
                  <li>{adidse.inputDeepening}</li>
                </ul>
              </div>
              <div>
                <div className="font-bold">FURTHER DISCUSSION:</div>
                <ul className="list-disc pl-5">
                  <li>{adidse.furtherDiscussion}</li>
                </ul>
              </div>
            </td>

            {/* Col 4: Closing Song/Prayer, SYNTHESIS, EVALUATION */}
            <td className="p-2.5 border border-black space-y-2">
              <div className="font-bold">➢ {adidse.closingSong}</div>
              <div className="font-bold">➢ {adidse.closingPrayer}</div>
              <div>
                <div className="font-bold">SYNTHESIS:</div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {adidse.synthesis.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-bold">EVALUATION:</div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {adidse.evaluation.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            </td>

            {/* Col 5: Remarks */}
            <td className="p-2.5 border border-black">{plan.remarks}</td>
          </tr>
        </tbody>
      </table>

      {/* Bottom Signatories & Footer */}
      <div className="grid grid-cols-3 gap-4 pt-2 font-bold text-[11px] px-1">
        <div>PREPARED BY : Acola, Kathrynn Ross L. (Subject Teacher)</div>
        <div>CHECKED BY : _____________________ (SAC, RELIGION/VE/ GMRC)</div>
        <div>OBSERVED BY : _______________________</div>
      </div>
      <div className="text-center font-bold tracking-[0.25em] text-xs pt-1">
        R E L I G I O N &nbsp; L E A R N I N G &nbsp; P L A N
      </div>
    </div>
  );
};

/* ============================================================================
 * Helper Component for Editing Lists of Strings
 * ========================================================================== */
const EditableStringList: React.FC<{
  items: string[];
  onChange: (items: string[]) => void;
}> = ({ items, onChange }) => {
  const handleUpdateItem = (index: number, val: string) => {
    const updated = [...items];
    updated[index] = val;
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([...items, "New item..."]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-1.5 mt-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start space-x-1.5">
          <input
            type="text"
            value={item}
            onChange={(e) => handleUpdateItem(idx, e.target.value)}
            className="flex-1 bg-amber-50/70 border border-amber-300 rounded px-2 py-0.5 text-xs"
          />
          <button
            type="button"
            onClick={() => handleRemoveItem(idx)}
            className="p-1 text-gray-400 hover:text-rose-600"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddItem}
        className="inline-flex items-center space-x-1 text-[11px] font-medium text-sage-700 hover:text-sage-800 px-2 py-0.5 rounded bg-sage-50 border border-sage-200"
      >
        <Plus className="w-3 h-3" />
        <span>Add Line</span>
      </button>
    </div>
  );
};

/* ============================================================================
 * Embedded Unique Textbook Lesson Illustration Block
 * Clean, seamless embedding of the generated lesson illustration in the lesson table.
 * ========================================================================== */
const EmbeddedLessonIllustrationBlock: React.FC<{
  plan: LessonPlan;
  compact?: boolean;
}> = ({ plan, compact = false }) => {
  if (!plan.generatedIllustrationUrl) return null;

  return (
    <div className="my-2 flex flex-col items-center">
      {/* High-Taste Educational Illustration (Rendered cleanly for Web, Print & Word .docx Export) */}
      <img
        src={plan.generatedIllustrationUrl}
        alt={plan.illustrationCaption || "Generated Lesson Illustration"}
        className={`${
          compact ? "max-w-[260px]" : "max-w-[480px] w-full"
        } h-auto object-contain rounded-xl border border-stone-200 shadow-xs mx-auto`}
      />
    </div>
  );
};

