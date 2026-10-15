import assert from "node:assert";
import { test } from "node:test";
import { analyzeTextbookText } from "../lib/nlpAnalyzer";

test("analyzeTextbookText correctly extracts topic, page, questions, and exercises from Filipino textbook", () => {
  const ocrOutput = `
    Yunit 1: Ang Aming Pamilya
    Aralin 3: Si Tatay at Nanay sa Aming Tahanan
    Pahina 24-25

    Maikling Kuwento:
    Masipag si Tatay sa paghahanapbuhay habang si Nanay naman ay nag-aalaga sa amin.
    Mahalaga ang pagtutulungan at pagmamalasakit sa bawat kasapi ng pamilya.

    Mga Tanong sa Pag-unawa:
    1. Sino ang masipag na naghahanapbuhay para sa pamilya?
    2. Paano ipinapakita nina Tatay at Nanay ang kanilang pagmamahal?
    3. Bakit mahalaga ang pagtutulungan sa tahanan?

    Pagsasanay A:
    Panuto: Piliin ang wastong salita upang mabuo ang pangungusap.
    1. Si Nanay ay nagluluto ng masarap na pagkain.
    2. Si Tatay ay maagang gumigising para magtrabaho.
    3. Ang mga anak ay magalang na sumusunod sa magulang.
  `;

  const learned = analyzeTextbookText(ocrOutput, "filipino", "grade1");

  assert.ok(learned.topic.includes("Tatay") || learned.topic.includes("Pamilya"));
  assert.strictEqual(learned.pageNumber, "p. 24-25");
  assert.ok(learned.guideQuestions.length >= 3);
  assert.ok(learned.guideQuestions.some((q) => q.includes("Sino")));
  assert.ok(learned.guideQuestions.some((q) => q.includes("Bakit")));
  assert.ok(learned.exerciseItems.length >= 3);
  assert.ok(learned.vocabulary.some((v) => ["Tatay", "Nanay", "Tahanan", "Pamilya"].includes(v)));
  assert.ok(learned.confidenceScore >= 80);
});

test("analyzeTextbookText handles English Kinder 2 textbook page", () => {
  const ocrOutput = `
    Lesson 4: Our Five Senses
    Page 32

    We use our Eyes to see the beautiful colors.
    We use our Ears to listen to gentle music.
    We use our Hands to touch soft teddy bears.

    Can you point to your eyes?
    What sounds do you hear in our classroom?

    Activity:
    1. Circle the things you can smell with your nose.
    2. Color the pictures that make loud sounds.
  `;

  const learned = analyzeTextbookText(ocrOutput, "science", "kinder2");

  assert.ok(learned.topic.includes("Senses"));
  assert.strictEqual(learned.pageNumber, "p. 32");
  assert.ok(learned.guideQuestions.length >= 2);
  assert.ok(learned.exerciseItems.length >= 2);
  assert.ok(learned.vocabulary.some((v) => ["Eyes", "Ears", "Hands"].includes(v)));
});
