# Lesson Plan Maker (LCCP Edition)

> *"i made this website to lesson the heavy responsibilities of my love"*

An automated curriculum architecture studio designed specifically for **Ms. Kathrynn Ross L. Acola (Kat)** at **La Consolacion College - Pasig**.

It transforms textbook photos into officially formatted lesson plans for **Kindergarten 2** and **Grade 1** matching the school's exact Microsoft Word documents and DepEd MATATAG guidelines.

[![Live on GitHub Pages](https://img.shields.io/badge/Live%20Website-GitHub%20Pages-1b4332?style=for-the-badge&logo=github)](https://cuetolanderjohn-maker.github.io/lesson-plan-maker/)
[![DepEd MATATAG](https://img.shields.io/badge/DepEd-MATATAG%20K--12%20DO%203%20s.%202026-blue?style=for-the-badge)](https://cuetolanderjohn-maker.github.io/lesson-plan-maker/)
[![Tests Passing](https://img.shields.io/badge/Tests-19%2F19%20Passing-emerald?style=for-the-badge)](https://cuetolanderjohn-maker.github.io/lesson-plan-maker/)

> **Official Live Production URL (GitHub Pages):**  
> **[https://cuetolanderjohn-maker.github.io/lesson-plan-maker/](https://cuetolanderjohn-maker.github.io/lesson-plan-maker/)**

---

## Dedication

> *"i made this website to lesson the heavy responsibilities of my love"*

This project was built with love to support teacher Kat in preparing daily lesson plans, automating time-consuming document formatting, and ensuring seamless compliance with DepEd MATATAG and LCCP institutional standards.

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
