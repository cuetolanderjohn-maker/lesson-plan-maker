# Lesson Plan Maker (LCCP Edition)

An automated curriculum architecture studio designed specifically for **Ms. Kathrynn Ross L. Acola (Kat)** at **La Consolacion College - Pasig**.

It transforms textbook photos into officially formatted lesson plans for **Kindergarten 2** and **Grade 1** matching the school's exact Microsoft Word documents and DepEd MATATAG guidelines.

[![DepEd MATATAG](https://img.shields.io/badge/DepEd-MATATAG%20K--12%20DO%203%20s.%202026-blue?style=for-the-badge)](https://github.com/cuetolanderjohn-maker/lesson-plan-maker)
[![Tests Passing](https://img.shields.io/badge/Tests-19%2F19%20Passing-emerald?style=for-the-badge)](https://github.com/cuetolanderjohn-maker/lesson-plan-maker)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/cuetolanderjohn-maker/lesson-plan-maker)

---

## Deploy to a Free Domain (Render)

This repository includes a pre-configured `render.yaml` blueprint for 1-click free deployment to Render.

### 1-Click Setup:
1. Click the **[Deploy to Render](https://render.com/deploy?repo=https://github.com/cuetolanderjohn-maker/lesson-plan-maker)** button above (or open [dashboard.render.com](https://dashboard.render.com/)).
2. Sign in with your GitHub account (`cuetolanderjohn-maker`).
3. Select this repository: `cuetolanderjohn-maker/lesson-plan-maker`.
4. Click **Create Web Service**.
5. Render immediately provisions your app on a free live domain:
   - **`https://kat-lesson-plan.onrender.com`** (or your chosen name)
   - Real Node.js container (zero serverless timeout limits, automatic continuous deployment on every git push).

---

## How to Disable the Netlify Domain

To permanently disable the old `katlessonplan.netlify.app` deployment:
1. Go to your **[Netlify Dashboard](https://app.netlify.com/)**.
2. Click your site **`katlessonplan`**.
3. Go to **Site configuration** &rarr; scroll to the bottom &rarr; **Manage site** &rarr; click **Delete site**.
4. Type `katlessonplan` to confirm. The Netlify domain is immediately deleted and stops serving traffic.

---

## Features

- **Groq AI Vision (`qwen/qwen3.8-27b`) — Ultra Fast (2.5s):**
  - Pre-configured with Groq Vision for instantaneous textbook analysis without serverless lag.
- **Grafana Loki NoSQL Tracing (`/loki/api/v1/push`):**
  - Comprehensive logging with nanosecond timestamps, log stream labels, and beacon telemetry.
- **Direct Browser Multimodal Execution:**
  - Direct client-to-API communication bypassing serverless function execution limits.
- **Fail-Safe Offline ML Engine:**
  - If any cloud AI provider is busy or unreachable, the browser seamlessly falls back to the built-in Machine Learning OCR engine (Tesseract.js + local curriculum NLP parser).
- **Client-Side Smart Compression:**
  - Automatically downsamples uploaded textbook photos to ~150KB (1200px max dimension at 0.78 quality), accelerating uploads by 10x.
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
   *(Or double-click `start.bat`)*
2. Open **`http://localhost:3000`** in your browser.
3. Attach textbook photos or select a demonstration sample, then click **Generate DepEd / LCCP Lesson Plan**.

---

## Test Suite

Run the automated test suite:
```bash
npm test
```
All 19 unit tests verify schema compliance, vision parsing, and DOCX table generation.
