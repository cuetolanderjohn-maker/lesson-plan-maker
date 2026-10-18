# Lesson Plan Maker (LCCP Edition)

An automated curriculum architecture studio designed specifically for **Ms. Kathrynn Ross L. Acola (Kat)** at **La Consolacion College - Pasig**.

It transforms textbook photos into officially formatted lesson plans for **Kindergarten 2** and **Grade 1** matching the school's exact Microsoft Word documents and DepEd MATATAG guidelines.

---

## Features

- **Zero-Key Multimodal Cloud Vision (100% Free):**
  - Powered by active vision models (`nvidia/nemotron-3.5-super-vl:free` with 1M context, `dots-studio/dots-3-note-preview:free`, and `openrouter/free`).
  - No API key, account, or credit card required.
- **Google Gemini Vision Integration:**
  - Direct integration with `gemini-3.8-flash` and `gemini-3.1-pro-preview` with dynamic API listing.
- **Client-Side Smart Compression:**
  - Automatically downsamples uploaded textbook photos to ~150KB (1200px max dimension at 0.78 quality), accelerating uploads by 10x and eliminating gateway timeouts.
- **Grounded Vision Extraction (No Machine Presets):**
  - Directly extracts lesson titles, stories, vocabulary, guide questions, and exercises from uploaded textbook pages without fallback to generic dummy templates.
- **School-Accurate Curriculum Architecture:**
  1. **DepEd MATATAG Banghay-Aralin Format (Grade 1 & Filipino):** Official 4-column layout with DepEd Order No. 3 s. 2026 Annex AI declaration, Augustinian Core Values (*Laudato Si'*, *Justice and Peace*, *Gender and Development*, *LCCP Care*), 5-part procedures, and quiz items.
  2. **LCCP Institutional Learning Plan (Kinder 2):** Official institutional format with Catholic Values Statement, Routine Activities, Motivation, Learning Strategies, Assessment, Closure, Assignment, and 3 Signatories.
- **Live In-Place Document Editor:** Click directly into any table cell in the browser to refine content before exporting.
- **Word Document (.docx) Generation:** Exports ready-to-submit Microsoft Word files embedding the authentic La Consolacion College Pasig banner and crest.
- **Print & PDF Stylesheet:** Formatted for standard paper printing with background cleanup.

---

## Quick Start on Windows

1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open **`http://localhost:3000`** in your browser.
3. Attach textbook photos or select a demonstration sample, then click **Generate DepEd / LCCP Lesson Plan**.

---

## Test Suite

Run the automated test suite:
```bash
npm test
```
All 18 unit tests verify schema compliance, vision parsing, and DOCX table generation.
