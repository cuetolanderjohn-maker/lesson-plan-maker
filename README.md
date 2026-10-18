# Lesson Plan Maker (LCCP Edition)

An automated curriculum architecture studio designed specifically for **Ms. Kathrynn Ross L. Acola (Kat)** at **La Consolacion College - Pasig**.

It transforms textbook photos into officially formatted lesson plans for **Kindergarten 2** and **Grade 1** matching the school's exact Microsoft Word documents and DepEd MATATAG guidelines.

[![Live Website](https://img.shields.io/badge/Live%20Website-katlessonplan.netlify.app-1b4332?style=for-the-badge&logo=netlify)](https://katlessonplan.netlify.app)
[![DepEd MATATAG](https://img.shields.io/badge/DepEd-MATATAG%20K--12%20DO%203%20s.%202026-blue?style=for-the-badge)](https://katlessonplan.netlify.app)
[![Tests Passing](https://img.shields.io/badge/Tests-18%2F18%20Passing-emerald?style=for-the-badge)](https://katlessonplan.netlify.app)

> **Official Live Production URL:** **[https://katlessonplan.netlify.app/](https://katlessonplan.netlify.app/)**

---

## Live Website

The production application is deployed and accessible worldwide 24/7 at:
**[https://katlessonplan.netlify.app/](https://katlessonplan.netlify.app/)**

All continuous deployments are automatically triggered via GitHub commits to this repository.


## Features

- **Zero-Key Multimodal Cloud Vision (100% Free):**
  - Powered by active vision models (`nvidia/nemotron-3.5-super-vl:free` with 1M context, `dots-studio/dots-3-note-preview:free`, and `openrouter/free`).
  - No API key, account, or credit card required. Works out of the box!
- **Google Gemini Direct Browser Vision:**
  - Direct client-to-API communication bypassing serverless function execution limits.
  - Automatically tests and auto-rotates active Google Gemini models (`gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-3.8-flash`, etc.).
  - Enter your free key at **[aistudio.google.com](https://aistudio.google.com/app/apikey)** directly in the web app, or configure `NEXT_PUBLIC_GEMINI_API_KEY` on Netlify for site-wide access.
- **Fail-Safe Offline ML Engine:**
  - If any cloud AI provider is busy or unreachable, the browser seamlessly falls back to the built-in Machine Learning OCR engine (Tesseract.js + local curriculum NLP parser) without crashing or failing.
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

## Configuring AI Keys for the Live Domain (Optional)

You can provide your Google Gemini API key in two easy ways:

### Option 1: Directly on the Website (Per Teacher)
1. Open **[https://katlessonplan.netlify.app/](https://katlessonplan.netlify.app/)**.
2. Click **Google Gemini** on the studio card.
3. Paste your key (`AIzaSy...`) into the inline box or click **Curriculum Settings & Profile**.
4. The key is securely saved in your browser's private storage and works immediately.

### Option 2: Netlify Environment Variable (For All Users)
1. Go to your **[Netlify Dashboard](https://app.netlify.com/)** &rarr; Select your site (`katlessonplan`).
2. Navigate to **Site configuration** &rarr; **Environment variables**.
3. Add a new variable:
   - **Key:** `NEXT_PUBLIC_GEMINI_API_KEY`
   - **Value:** `your-gemini-api-key-here`
4. Trigger a re-deploy. All visitors to your live site will now have Gemini Vision enabled automatically!

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
