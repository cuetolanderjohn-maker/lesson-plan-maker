# Kat's Lesson Plan Generator (LCCP Edition) - Architectural Design Spec

- **Date:** 2026-10-15
- **Status:** Approved
- **Target Audience:** Ms. Kathrynn Ross L. Acola (Kat), Kindergarten 2 & Grade 1 Teacher at La Consolacion College - Pasig

---

## 1. Overview & Goal

Kat's Lesson Plan Generator is a modern, minimalist web application built to automate lesson planning for **Kinder 2** and **Grade 1** at **La Consolacion College - Pasig**. 

A teacher can take a photo of a textbook lesson page (or multiple pages) on their phone or upload it on a computer. The system leverages Google Gemini 2.5 Flash Vision to extract educational content (story/concept, grade, vocabulary, exercises, guide questions, and page numbers) and transforms it into the exact school-mandated lesson plan format:
1. **Grade 1 & K2 Filipino:** DepEd MATATAG / Banghay-Aralin format (including DepEd DO 3 s 2026 AI declaration, 6 LCCP core value integrations, 5-day procedure breakdown, formative/summative tests).
2. **Kinder 2 English / Science / Math:** LCCP Institutional Learning Plan format (including Learning Objectives, Subject Matter, Competencies, Catholic Values Statement, Routine/Motivation/Learning Strategies, Assessment, Closure, and Assignment).

Teachers can review and edit the generated lesson plan in an interactive on-screen document, and export it as an exact Microsoft Word `.docx` table, Print/PDF, or copy the text.

---

## 2. Design System & Minimalist Pastel UI/UX

Following anti-slop, clean editorial guidelines:
- **Palette:**
  - **Background Canvas:** Soft warm ivory (`#FAF8F5`)
  - **Cards & Surfaces:** Clean white (`#FFFFFF`) with thin, crisp borders (`#EAE6DF`)
  - **Primary Action Accent:** Soothing muted sage green (`#5F8D7A`)
  - **Badges & Subject Chips:**
    - Filipino: Muted peach (`#FBE6DB` / `#8C5042`)
    - Language / English: Muted lavender (`#EBE6F3` / `#5F527A`)
    - Science: Muted mint (`#E2F0EA` / `#386652`)
    - Mathematics: Muted buttercup (`#FEF3D6` / `#7B622E`)
- **Typography:** Modern clean sans-serif (`Inter` or `Plus Jakarta Sans`), balanced weights, high readability.
- **Layout & Interaction:**
  - **Header:** Clean title *"Kat's Lesson Planner - La Consolacion College - Pasig"*, with Settings (⚙️) and History buttons.
  - **Left Panel (Inputs & Setup):**
    - Drag-and-drop / phone camera upload dropzone with thumbnail carousel.
    - Grade selector pills: `[ Kinder 2 ]` and `[ Grade 1 ]`.
    - Subject selector pills: `[ Filipino ]`, `[ Language / English ]`, `[ Science ]`, `[ Mathematics ]`.
    - Active Template indicator showing which school standard is applied.
    - Optional metadata overrides: Week Number, Date Coverage, Term/Quarter, Book Title.
    - Prominent pastel action button: **"Generate Lesson Plan ✨"** with animated shimmer state.
  - **Right Panel (Live Interactive Preview & Actions):**
    - Action bar: **"📥 Download .docx"**, **"🖨️ Print / Save PDF"**, **"📋 Copy Text"**.
    - Rich in-place editable paper view mirroring the exact Word table layout.

---

## 3. System Architecture & Tech Stack

- **Framework:** Next.js 14+ (App Router) with React, TypeScript, and Tailwind CSS.
- **AI Multimodal SDK:** Official Google Gen AI SDK (`@google/genai`) configured for `gemini-2.5-flash` with structured JSON output schema (`responseMimeType: "application/json"`).
- **DOCX Generation:** Browser-based `docx` library (`Packer.toBlob()`) producing standard Microsoft Word `.docx` files formatted identically to the reference documents.
- **Storage:** Client-side `localStorage` / `IndexedDB` for saved plans, recent history, and custom API key / teacher profile settings.
- **1-Click Local Execution:** `start.bat` Windows launcher script for instant zero-config startup and auto-opening browser at `http://localhost:3000`.
- **Cloud Readiness:** Zero-dependency standalone build ready for 1-click Vercel deployment.

---

## 4. Lesson Plan Template Specifications

### Template A: DepEd MATATAG / Banghay-Aralin (Grade 1 & K2 Filipino)
Matches reference files: `Grade 1 - FILIPINO - LP- WEEK 10.pdf`, `Grade 1 - FILIPINO LP - WEEK 9 .pdf`, and `K2 - LP - WEEK 1-3.docx`.

| Section | Content & Structure |
|---|---|
| **Header** | Centered: `Banghay- Aralin sa FILIPINO` <br> `S.Y. 2026-2027` |
| **Metadata Row** | Col 1: `Subject: FILIPINO` <br> Col 2: `Grade & Section: Grade 1 - OLOPH & OLOG` (or Kinder 2) <br> Col 3: `Date Coverage: [Date]` & `Term & Week: [Term-Week]` |
| **I. Layunin sa Pagkatuto** | Behavioral objectives: *Sa pagtatapos ng talakayan, ang mga mag-aaral ay inaasahang: ...* (bulleted list) |
| **II. Paksang Aralin** | - **Paksa:** Story or topic title <br> - **Wika:** Grammar / language focus <br> - **Sanggunian:** Textbook reference and page numbers <br> - **Deklarasyon sa Paggamit ng AI:** *DO 3 s 2026 Annex (Ang banghay- aralin na ay binuo sa tulong ng AI upang masiguro ang pagka-ayon nito sa mga Pamantayan ng Kurikulum ng DepEd MATATAG K-12.)* |
| **III. Mga Kasanayan** | MATATAG K-12 competency statement: *Naipamamalas ng mga mag-aaral ang pag-unawa sa...* |
| **IV. Integrasyon** | Structured table with 6 official LCCP core values: <br> 1. *Laudato Si'* <br> 2. *Justice and Peace Education* <br> 3. *Gender and Development* <br> 4. *LCCP- Care* <br> 5. *Integrasyong Interdisiplinaryo* (Values Ed & Religion) <br> 6. *Paggamit ng Teknolohiya sa Pagtuturo* (Canva presentasyon) |
| **Pamamaraan** | **a. Mga Panimulang Gawain (Day 1 / 10 mins):** Panalangin, Pagbati, Pagpupulot ng basura, Pagsusuri ng liban. <br> **b. Pagganyak (Day 1 / 15 mins):** Introductory activity based on textbook exercise. <br> **c. Pagtalakay ng Aralin (Day 1-4 / 30 mins):** Step-by-step discussion, Gabay na Tanong (Questions 1-5), Pagpapalalim, Teaching methods (Demonstrasyon, Talakayan, Drill at Practice). <br> **d. Integrasyon ng Pagpapahalaga (Day 4 / 15 mins):** Values reflection. <br> **e. Pagbubuod (Day 4 / 15 mins):** Summary concept or grammatical rule. |
| **VI. Pagtataya** | - **Formative:** Guided exercise referencing textbook pages. <br> - **Summative:** 5 numbered questions testing the topic. |
| **VII. Takdang-Aralin** | Practice task or workbook activity. |
| **Mga Tala at Pagninilay** | Reflection / remarks placeholder. |
| **Signatories** | 3-column row: <br> - *Inihanda ni: Bb. Kathrynn Ross L. Acola* <br> - *Sinuri ni: Bb. Sta. Ana Florence* <br> - *Inobserbahan ni: Bb. Sta. Ana Florence* |

---

### Template B: LCCP Institutional Learning Plan (Kinder 2 English / Science / Math)
Matches reference files: `K2-LANGUAGE-LP.docx` and `K2-SCIENCE LP.docx`.

| Section | Content & Structure |
|---|---|
| **Header** | Centered: `LA CONSOLACION COLLEGE-PASIG` <br> `641 Mercedes Avenue, Brgy. San Miguel, Pasig City` <br> `LEARNING PLAN` <br> `S.Y. 2026-2027` |
| **Metadata Row** | Col 1: `Subject: [Subject]` <br> Col 2: `Grade Level: Kinder 2` <br> Col 3: `Date Coverage: [Dates] Term [Term]` |
| **I. Learning Objectives** | *At the end of the lesson the students will be able to:* (bulleted list of developmentally appropriate actions) |
| **II. Subject Matter** | - **Lesson:** Topic title <br> - **Reference/s:** Textbook title (e.g., *Early Beginnings: Science/Language/Mathematics Kinder worktext*) |
| **III. Learning Competencies** | Thematic competency: *The learner demonstrates understanding of...* |
| **III. Values Statement** | Explicit Catholic values statement: *God gave us...* |
| **IV. Procedures** | - **a. Routine Activities:** Prayer, Attendance, Circle Time <br> - **b. Motivation:** Song, dance, or interactive guessing game <br> - **c. Learning Strategies:** Picture talk, Demonstration, Practice & Drill with teacher instructions and art of questioning |
| **V. Assessment** | Developmentally appropriate exercises (coloring, matching, checking, oral recitation) |
| **VI. Closure** | Teacher recap and student reflection song or activity |
| **VII. Assignment** | Home creative task or workbook page activity |
| **Remarks** | Remarks block |
| **Signatories** | 3-column row: <br> - *Prepared by: Ms. Kathrynn Ross L. Acola* <br> - *Checked by: Mrs. Emma P. Dunque Lpt.* <br> - *Observed by: Mrs. Emma P. Dunque Lpt.* |

---

## 5. API & Data Flow

```
+--------------------------------------------------------------------+
| Teacher (Kat)                                                      |
| 1. Takes photo of book page(s) on phone/laptop                     |
| 2. Chooses Grade (K2/G1) & Subject (Filipino, Lang, Sci, Math)     |
| 3. Clicks "Generate Lesson Plan"                                   |
+---------------------------------+----------------------------------+
                                  |
                                  v
+---------------------------------+----------------------------------+
| Next.js Client                                                     |
| - Prepares base64 image data                                       |
| - Bundles metadata & user API key (if set in settings)             |
| - POST to /api/generate                                            |
+---------------------------------+----------------------------------+
                                  |
                                  v
+---------------------------------+----------------------------------+
| Next.js API Route (/api/generate)                                  |
| - Reads GEMINI_API_KEY from request header or process.env          |
| - Calls Google Gemini 2.5 Flash Vision                             |
| - Enforces strict JSON Schema for chosen template                  |
| - Injects few-shot examples from Kat's actual files                |
+---------------------------------+----------------------------------+
                                  |
                                  v
+---------------------------------+----------------------------------+
| Structured JSON Response                                           |
| - Rendered in on-screen editable document view                     |
| - Stored in local history (localStorage)                           |
+---------------------------------+----------------------------------+
                                  |
      +---------------------------+---------------------------+
      |                           |                           |
      v                           v                           v
+---------------+          +---------------+          +---------------+
| 📥 .docx Export|          | 🖨️ Print/PDF  |          | 📋 Copy Text  |
| (docx library |          | (Clean print  |          | (Formatted    |
| client-side)  |          | stylesheet)   |          | markdown)     |
+---------------+          +---------------+          +---------------+
```

---

## 6. Implementation Components

1. **`app/page.tsx`**: Main two-panel responsive workspace.
2. **`components/ImageUploader.tsx`**: Drag-and-drop & mobile camera image picker with preview thumbnails.
3. **`components/SelectorBar.tsx`**: Grade & Subject pill selectors with active template badge.
4. **`components/LessonPlanPreview.tsx`**: Rich in-place editable paper sheet mirroring the exact Word table layout.
5. **`components/SettingsModal.tsx`**: Gemini API key input and Kat's customizable school profile.
6. **`lib/gemini.ts`**: Multimodal Gemini 2.5 Flash client with few-shot prompts and JSON schemas.
7. **`lib/docxGenerator.ts`**: Pure client-side Word document generator matching Kat's exact borders, cell widths, font sizes, and 3-column signature tables.
8. **`start.bat`**: Windows 1-click launcher script.

---

## 7. Testing & Verification

1. **Vision Parsing Verification:** Test with actual book photos for both English and Filipino lessons to ensure accurate extraction of titles, competencies, and exercises.
2. **Template Fidelity Check:** Verify generated `.docx` against `K2 - LP - WEEK 1-3.docx` and `K2-LANGUAGE-LP.docx` to guarantee identical column widths, borders, and margins in Microsoft Word.
3. **Editable State Verification:** Verify that modifying text on screen immediately updates the downloaded `.docx` and print view.
4. **Offline / Fallback Resilience:** Verify helpful guidance when no API key is provided or when an invalid image is uploaded.
