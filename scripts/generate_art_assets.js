const fs = require('fs');

const artsJpg = fs.readFileSync('scratch/arts_community_real.jpg').toString('base64');
const houseJpg = fs.readFileSync('scratch/house_parts_real.jpg').toString('base64');
const mathJpg = fs.readFileSync('scratch/math_real.jpg').toString('base64');
const classroomJpg = fs.readFileSync('scratch/pollinations_sana.jpg').toString('base64');

const code = `/**
 * Authentic AI-Generated Realistic Lesson Art Assets
 * Pre-rendered neural diffusion images matching Kat's core subject domains.
 * Used for instant, zero-latency, offline-safe realistic rendering.
 * STRICTLY ZERO CLIPART, ZERO CONE BODIES, ZERO STICK FIGURES.
 */

export const REAL_ART_COMMUNITY_ARTS = "data:image/jpeg;base64,${artsJpg}";
export const REAL_ART_HOUSE_PARTS = "data:image/jpeg;base64,${houseJpg}";
export const REAL_ART_MATH_COUNTING = "data:image/jpeg;base64,${mathJpg}";
export const REAL_ART_CLASSROOM_STORY = "data:image/jpeg;base64,${classroomJpg}";

export function getDomainRealArtFallback(subject: string, title: string, hasStory: boolean): string {
  const s = (subject || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (s.includes("math") || t.includes("math") || t.includes("bilang") || t.includes("number")) {
    return REAL_ART_MATH_COUNTING;
  }
  if (t.includes("house") || t.includes("bahay") || t.includes("room") || t.includes("tahanan")) {
    return REAL_ART_HOUSE_PARTS;
  }
  if (hasStory || t.includes("lider") || t.includes("kuwento") || t.includes("story") || t.includes("gamu-gamo")) {
    return REAL_ART_CLASSROOM_STORY;
  }
  return REAL_ART_COMMUNITY_ARTS;
}
`;

fs.writeFileSync('lib/authenticArtAssets.ts', code);
console.log('Created lib/authenticArtAssets.ts, size:', code.length);
