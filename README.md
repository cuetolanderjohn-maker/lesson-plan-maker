# Kat's Lesson Plan Generator (LCCP Edition) 🌸

An automated, minimalist pastel web application designed specifically for **Ms. Kathrynn Ross L. Acola (Kat)** at **La Consolacion College - Pasig**.

It transforms textbook photos into officially formatted lesson plans for **Kindergarten 2** and **Grade 1** matching the school's exact Microsoft Word documents and DepEd MATATAG guidelines.

---

## ✨ Features

- 📸 **Textbook Photo Input:** Drag and drop book pages, upload multiple images (story page + exercises page), or snap photos directly using a phone camera.
- 🏫 **School-Accurate Templates:**
  1. **Grade 1 & K2 Filipino:** DepEd MATATAG Banghay-Aralin format with DepEd DO 3 s 2026 AI declaration, 6 official LCCP core values (*Laudato Si'*, *Justice & Peace*, *Gender & Dev*, *LCCP Care*, *Values Ed / Religion*, and *Canva Tech*), 5-day procedure breakdown, and formative/summative quizzes.
  2. **Kinder 2 English / Science / Math:** LCCP Institutional Learning Plan format with Catholic Values Statement, Routine Activities, Motivation, Learning Strategies, Assessment, Closure, and Assignment.
- ✏️ **Interactive Live Editor:** Click directly into any text on screen to tweak questions, objectives, or instructions before downloading.
- 📥 **Exact Word Export (`.docx`):** Generates clean, ready-to-submit Microsoft Word tables with exact borders, column widths, and 3-column signature rows.
- 🖨️ **Print & PDF:** Formatted for standard paper printing without sidebar buttons.
- ⚙️ **Dual API Key & Profile:** Pre-fills Kat's name, school year, and coordinators by default, with a Settings modal to update keys or coordinator names anytime.

---

## 🚀 How to Run on Windows (1-Click)

1. Double-click the **`start.bat`** file in this folder.
2. The script will automatically install any missing dependencies and open **`http://localhost:3000`** in your browser.
3. In the top-right corner, click **Settings (⚙️)** and paste your free **Google Gemini API Key** (or add it to `.env.local` as `GEMINI_API_KEY=your_key`).
   - You can get a free key in 30 seconds at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 📱 Deploying to the Web (Use on Phone Camera Anywhere)

To access the website from your phone to snap book pictures directly:
1. Push this folder to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository, add `GEMINI_API_KEY` under Environment Variables, and click **Deploy**.
4. You now have a live URL you can bookmark on your phone!

---

## 🧪 Testing & Verification

Run the automated test suite anytime:
```bash
npm test
```
This tests schema compliance, prompt assembly, and Word `.docx` table generation.
