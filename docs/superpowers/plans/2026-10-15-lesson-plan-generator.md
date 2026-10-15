# Kat's Lesson Plan Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack, minimalist pastel web application tailored for Ms. Kathrynn Ross L. Acola (Kat) at La Consolacion College - Pasig that generates official Kinder 2 and Grade 1 lesson plans from textbook photos, with in-browser editing and exact Microsoft Word `.docx` table exports.

**Architecture:** Next.js (App Router) fullstack application with Tailwind CSS, leveraging Google Gemini 2.5 Flash Vision for multimodal textbook extraction into strict JSON schemas, an interactive on-screen document editor, client-side `.docx` generation via `docx`, and a 1-click Windows launcher.

**Tech Stack:** Next.js 14, React 18/19, TypeScript, Tailwind CSS, Lucide React, `@google/genai`, `docx`, `file-saver`.

**Spec:** [`docs/superpowers/specs/2026-10-15-lesson-plan-generator-design.md`](file:///c:/Users/lande/Downloads/lesson%20plan%20website%20for%20kat/docs/superpowers/specs/2026-10-15-lesson-plan-generator-design.md)

## Global Constraints

- **Platform:** Windows (Node v24.10.0, use `npm.cmd` instead of `npm.ps1`).
- **Templates Supported:** 
  1. DepEd MATATAG / Banghay-Aralin format (Grade 1 & K2 Filipino).
  2. LCCP Institutional Learning Plan format (Kinder 2 English, Science, Math).
- **Default Teacher Details:**
  - School: La Consolacion College - Pasig (641 Mercedes Avenue, Brgy. San Miguel, Pasig City)
  - Teacher: Ms. Kathrynn Ross L. Acola (or Bb. Kathrynn Ross L. Acola for Filipino)
  - School Year: S.Y. 2026-2027
  - Coordinators: Mrs. Emma P. Dunque Lpt. & Bb. Sta. Ana Florence
- **Design System:** Minimalist pastel palette (warm ivory `#FAF8F5`, soft white cards `#FFFFFF`, subtle borders `#EAE6DF`, muted sage green `#5F8D7A`, pastel subject chips).

## Review Focus

1. **Multi-page image handling:** Teacher uploads 2-3 photos of varying sizes/orientations for one lesson; application must compress/normalize them for Gemini without crashing or exceeding payload limits.
2. **Missing / Blurry API input:** Teacher uploads a blurry image or non-book photo; Gemini prompt & parser must return a clean, friendly error message instead of hallucinating garbled schema fields.
3. **DOCX Table Integrity:** Downloaded Word document must render properly in Microsoft Word without table overflow or missing borders across all 16 rows of the Banghay-Aralin format and 11 rows of the LCCP format.
4. **Custom Key vs .env Precedence:** Teacher enters API key in Settings modal; app must prioritize the custom key over `.env.local` and remember it in `localStorage`.
5. **In-place Edit Persistence:** Edits made in the browser document editor must immediately reflect in both the downloaded `.docx` and the print stylesheet.

---

### Task 1: Project Scaffolding & Minimalist Pastel Theme Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `next.config.js`
- Create: `app/globals.css`
- Create: `app/layout.tsx`

**Interfaces:**
- Produces: Base Next.js project with Tailwind CSS configured with the pastel palette tokens (`cream`, `sage`, `pastel-peach`, `pastel-mint`, `pastel-lavender`, `pastel-butter`).

- [ ] **Step 1: Create package.json with dependencies**
  - Add `next`, `react`, `react-dom`, `@google/genai`, `docx`, `file-saver`, `lucide-react`, `clsx`, `tailwind-merge`, and devDependencies for typescript, tailwindcss, postcss, and `@types/*`.

- [ ] **Step 2: Install dependencies**
  - Run: `npm.cmd install`
  - Expected: Packages installed cleanly without errors.

- [ ] **Step 3: Create Tailwind, PostCSS, Next, and TS config files**
  - Configure `tailwind.config.js` with custom pastel colors and font family.
  - Configure `app/globals.css` with clean body reset, ivory canvas background, and print styles.
  - Create minimal `app/layout.tsx` with Inter/sans-serif font and metadata.

- [ ] **Step 4: Verify Next.js build / typecheck**
  - Run: `npx.cmd next build`
  - Expected: Build completes or passes type checking.

- [ ] **Step 5: Commit scaffolding**
  - Commit: `git add package.json tsconfig.json tailwind.config.js postcss.config.js next.config.js app/globals.css app/layout.tsx; git commit -m "chore: scaffold next.js with minimalist pastel theme"`

---

### Task 2: Type Definitions & Sample Templates

**Files:**
- Create: `lib/types.ts`
- Create: `lib/sampleData.ts`
- Test: `tests/types.test.ts`

**Interfaces:**
- Produces: 
  - `MatatagLessonPlan` interface for Grade 1 & K2 Filipino.
  - `LccpLearningPlan` interface for K2 English/Science/Math.
  - `TeacherProfile` and `GenerateRequest` types.
  - `sampleMatatagPlan` and `sampleLccpPlan` instances matching Kat's reference documents for instant testing.

- [ ] **Step 1: Write unit test validating sample data against schema contracts**
  - Create `tests/types.test.ts` ensuring both sample objects satisfy all required keys and match school formats.

- [ ] **Step 2: Run test to verify it fails**
  - Run: `npx.cmd tsx tests/types.test.ts`
  - Expected: FAIL with missing module `lib/types`.

- [ ] **Step 3: Implement `lib/types.ts` and `lib/sampleData.ts`**
  - Define interfaces with complete docstrings reflecting exact fields from the spec.
  - Populate sample data using the exact text from `K2-LANGUAGE-LP.docx` and `Grade 1 - FILIPINO - LP- WEEK 10.pdf`.

- [ ] **Step 4: Run test to verify it passes**
  - Run: `npx.cmd tsx tests/types.test.ts`
  - Expected: PASS with sample data validated.

- [ ] **Step 5: Commit**
  - Commit: `git add lib/types.ts lib/sampleData.ts tests/types.test.ts; git commit -m "feat: add lesson plan type definitions and official school sample data"`

---

### Task 3: Client-Side DOCX Generation Engine

**Files:**
- Create: `lib/docxGenerator.ts`
- Test: `tests/docx.test.ts`

**Interfaces:**
- Consumes: `MatatagLessonPlan`, `LccpLearningPlan`, `TeacherProfile` from `lib/types.ts`.
- Produces:
  - `generateMatatagDocx(plan: MatatagLessonPlan, profile: TeacherProfile): Promise<Blob>`
  - `generateLccpDocx(plan: LccpLearningPlan, profile: TeacherProfile): Promise<Blob>`
  - Generates exact Microsoft Word tables matching the borders, shading, font sizes, and layout of `K2 - LP - WEEK 1-3.docx` and `K2-LANGUAGE-LP.docx`.

- [ ] **Step 1: Write test for DOCX generation**
  - Create `tests/docx.test.ts` that generates buffers for both sample plans and verifies the output is a non-empty valid ZIP/DOCX structure.

- [ ] **Step 2: Run test to verify it fails**
  - Run: `npx.cmd tsx tests/docx.test.ts`
  - Expected: FAIL with missing module `lib/docxGenerator`.

- [ ] **Step 3: Implement `lib/docxGenerator.ts`**
  - Construct table schemas using `docx` (`Table`, `TableRow`, `TableCell`, `Paragraph`, `TextRun`, `WidthType`, `BorderStyle`).
  - Implement `generateMatatagDocx` with 16-row layout, shaded header, 6 LCCP integration values, procedures, and 3-column signature row.
  - Implement `generateLccpDocx` with LCCP institutional header, Roman numeral sections I through VII, and 3-column signature row.

- [ ] **Step 4: Run test to verify it passes**
  - Run: `npx.cmd tsx tests/docx.test.ts`
  - Expected: PASS and creates valid test `.docx` files.

- [ ] **Step 5: Commit**
  - Commit: `git add lib/docxGenerator.ts tests/docx.test.ts; git commit -m "feat: implement official docx table generation engine"`

---

### Task 4: Gemini 2.5 Flash Multimodal Prompt Pipeline

**Files:**
- Create: `lib/prompts.ts`
- Create: `lib/gemini.ts`
- Create: `app/api/generate/route.ts`
- Test: `tests/prompts.test.ts`

**Interfaces:**
- Consumes: `GenerateRequest` containing base64 images and metadata.
- Produces:
  - `buildMatatagPrompt(images, meta, profile)`
  - `buildLccpPrompt(images, meta, profile)`
  - `POST /api/generate` handler returning `{ success: true, plan: MatatagLessonPlan | LccpLearningPlan, type: 'matatag' | 'lccp' }`.

- [ ] **Step 1: Write prompt generation unit tests**
  - Create `tests/prompts.test.ts` verifying prompt strings include DO 3 s 2026 AI declaration, LCCP core values, and strict JSON instruction.

- [ ] **Step 2: Run test to verify it fails**
  - Run: `npx.cmd tsx tests/prompts.test.ts`
  - Expected: FAIL with missing module `lib/prompts`.

- [ ] **Step 3: Implement `lib/prompts.ts`, `lib/gemini.ts`, and `app/api/generate/route.ts`**
  - Build prompt templates with few-shot examples taken from Kat's actual files.
  - Initialize `@google/genai` with model `gemini-2.5-flash` and `responseMimeType: "application/json"`.
  - Handle image compression / base64 normalization.
  - Add robust error handling for quota limits or unreadable textbook images.

- [ ] **Step 4: Run test to verify it passes**
  - Run: `npx.cmd tsx tests/prompts.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - Commit: `git add lib/prompts.ts lib/gemini.ts app/api/generate/route.ts tests/prompts.test.ts; git commit -m "feat: implement gemini 2.5 flash multimodal prompt and api route"`

---

### Task 5: Frontend UI Controls (Uploader, Selectors, Settings, History)

**Files:**
- Create: `components/Header.tsx`
- Create: `components/ImageUploader.tsx`
- Create: `components/SelectorBar.tsx`
- Create: `components/SettingsModal.tsx`
- Create: `components/HistoryDrawer.tsx`

**Interfaces:**
- Produces:
  - `Header`: Clean pastel bar with Kat's school branding, Settings trigger, and History button.
  - `ImageUploader`: Drag-and-drop & mobile camera file picker supporting multiple images with thumbnails.
  - `SelectorBar`: Quick toggle pills for Grade Level (Kinder 2 / Grade 1), Subject (Filipino, Language, Science, Math), and active template indicator.
  - `SettingsModal`: Custom Gemini API key input and Kat's customizable school/teacher profile (saved to `localStorage`).
  - `HistoryDrawer`: Slide-over panel of previously generated plans for 1-click loading.

- [ ] **Step 1: Implement `components/Header.tsx` and `components/SelectorBar.tsx`**
  - Build responsive header with pastel styling.
  - Build selector bar that syncs selected Grade and Subject and shows the active template badge.

- [ ] **Step 2: Implement `components/ImageUploader.tsx`**
  - Support multi-image upload, drag-and-drop, phone camera input (`capture="environment"`), image preview thumbnails, and delete buttons.

- [ ] **Step 3: Implement `components/SettingsModal.tsx` and `components/HistoryDrawer.tsx`**
  - Provide input for Gemini API Key with link to Google AI Studio.
  - Provide editable fields for Kat's name, school year, and coordinators.
  - Store history of generated plans in `localStorage`.

- [ ] **Step 4: Verify TypeScript compilation**
  - Run: `npx.cmd tsc --noEmit`
  - Expected: PASS without type errors.

- [ ] **Step 5: Commit**
  - Commit: `git add components/; git commit -m "feat: add uploader, selector bar, settings modal, and history drawer"`

---

### Task 6: Interactive Live Document Editor & Actions

**Files:**
- Create: `components/LessonPlanPreview.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: Plans from Task 2/4 and components from Task 5.
- Produces:
  - Interactive on-screen editable paper document formatted like the official school Word table.
  - Live editing of objectives, competencies, procedures, guide questions, and values.
  - Action buttons: "Download .docx", "Print / Save PDF", "Copy Text".
  - Main page coordinating upload -> generate -> edit -> export lifecycle.

- [ ] **Step 1: Implement `components/LessonPlanPreview.tsx`**
  - Render DepEd MATATAG table layout or LCCP Learning Plan layout based on active template.
  - Allow inline content editing (`contentEditable` or clean controlled inputs/textareas).
  - Add print CSS rules (`@media print`) so the on-screen preview prints cleanly without sidebar controls.

- [ ] **Step 2: Implement `app/page.tsx`**
  - Assemble the two-panel layout: left panel for upload and controls, right panel for live document review and actions.
  - Wire up API generation with loading skeletons and notifications.
  - Wire up "Download .docx" via `lib/docxGenerator.ts` and `file-saver`.
  - Add "Load Sample" button so Kat or any reviewer can test and preview the formats with 1 click even without an image!

- [ ] **Step 3: Verify build**
  - Run: `npx.cmd next build`
  - Expected: Production build succeeds.

- [ ] **Step 4: Commit**
  - Commit: `git add components/LessonPlanPreview.tsx app/page.tsx; git commit -m "feat: build live editable lesson plan preview and export actions"`

---

### Task 7: Windows Launcher (`start.bat`) & End-to-End Verification

**Files:**
- Create: `start.bat`
- Create: `.env.example`
- Create: `README.md`

**Interfaces:**
- Produces:
  - `start.bat`: Double-click shortcut that checks Node, runs `npm.cmd install` if needed, starts `npm.cmd run dev`, and automatically opens `http://localhost:3000` in the browser.
  - Documentation and end-to-end verification.

- [ ] **Step 1: Create `start.bat` and `.env.example`**
  - Add Windows batch script with user-friendly console output and auto-browser launch.
  - Add `.env.example` with `GEMINI_API_KEY=`.

- [ ] **Step 2: Create comprehensive `README.md`**
  - Instructions for Kat on how to use it locally with `start.bat` or deploy to Vercel in 1 click.

- [ ] **Step 3: End-to-end verification**
  - Run test suite: `npx.cmd tsx tests/types.test.ts; npx.cmd tsx tests/docx.test.ts; npx.cmd tsx tests/prompts.test.ts`
  - Run `next build` to verify clean bundle.
  - Verify generated `.docx` files can be opened and inspected.

- [ ] **Step 4: Commit**
  - Commit: `git add start.bat .env.example README.md; git commit -m "feat: add 1-click windows launcher, readme, and complete end-to-end verification"`
