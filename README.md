# Kat's Lesson Plan Generator (LCCP Edition) 🌸

An automated, minimalist pastel web application designed specifically for **Ms. Kathrynn Ross L. Acola (Kat)** at **La Consolacion College - Pasig**.

It transforms textbook photos into officially formatted lesson plans for **Kindergarten 2** and **Grade 1** matching the school's exact Microsoft Word documents and DepEd MATATAG guidelines — **100% free, runs directly in the browser, with no API keys or setup required**.

---

## ✨ Features

- 🧠 **Built-in Machine Learning Engine (Zero API Keys / $0 Cost):**
  - **Computer Vision Preprocessor:** Automatically enhances contrast, sharpens textbook fonts, and removes paper shadows from smartphone camera photos.
  - **Machine Learning OCR:** Reads Philippine curriculum textbook pages with high character accuracy.
  - **Deep Semantic NLP Analyzer:** Extracts and understands the **Lesson Title / Paksa**, **Key Vocabulary**, **Reading Story Passages**, **Comprehension Questions**, and **Practice Exercises**.
- 🔍 **Interactive "What the AI Learned" Inspector:**
  - Shows you what was extracted from your textbook photo *before* generating the final plan.
  - Review or fine-tune the detected lesson title, add or remove vocabulary tags, and inspect the raw scanned text.
- 🏫 **School-Accurate Templates:**
  1. **Grade 1 & K2 Filipino:** DepEd MATATAG Banghay-Aralin format with DepEd DO 3 s 2026 AI declaration, 6 official LCCP core values (*Laudato Si'*, *Justice & Peace*, *Gender & Dev*, *LCCP Care*, *Values Ed / Religion*, and *Canva Tech*), 5-day procedure breakdown, and formative/summative quizzes using the exercises identified from the book.
  2. **Kinder 2 English / Science / Math:** LCCP Institutional Learning Plan format with Catholic Values Statement, Routine Activities, Motivation, Learning Strategies, Assessment, Closure, and Assignment.
- ✏️ **Interactive Live Editor:** Click directly into any text on screen to tweak questions, objectives, or instructions before downloading.
- 📥 **Exact Word Export (`.docx`):** Generates clean, ready-to-submit Microsoft Word tables with exact borders, column widths, and 3-column signature rows.
- 🖨️ **Print & PDF:** Formatted for standard paper printing without sidebar buttons.
- ⚙️ **Kat's Teacher Profile:** Pre-fills Kat's name, school year, and coordinators by default, with a Settings modal to update coordinator names anytime.

---

## 🚀 How to Run on Windows (1-Click)

1. Double-click the **`start.bat`** file in this folder.
2. The script will automatically install any missing dependencies and open **`http://localhost:3000`** in your browser.
3. No API key or account is needed! Simply attach your textbook photo and click **"Analyze & Learn from Textbook (ML)"**.

---

## 🧪 Testing & Verification

Run the automated test suite anytime:
```bash
npm.cmd test
```
All 16 unit tests verify schema compliance, NLP analysis, and Word `.docx` table generation.
