const fs = require('fs');

const artsJpg = fs.readFileSync('scratch/arts_community_real.jpg').toString('base64');
const houseJpg = fs.readFileSync('scratch/house_parts_real.jpg').toString('base64');
const mathJpg = fs.readFileSync('scratch/math_real.jpg').toString('base64');
const classroomJpg = fs.readFileSync('scratch/pollinations_sana.jpg').toString('base64');
const animalsJpg = fs.readFileSync('scratch/animals_nature_real.jpg').toString('base64');
const helpersJpg = fs.readFileSync('scratch/community_helpers_real.jpg').toString('base64');

const code = `/**
 * Authentic AI-Generated Realistic Lesson Art Assets
 * Pre-rendered neural diffusion images matching Kat's core subject domains.
 * Used for instant, zero-latency, topic-connected realistic rendering.
 * STRICTLY ZERO CLIPART, ZERO CONE BODIES, ZERO STICK FIGURES.
 */

export const REAL_ART_COMMUNITY_ARTS = "data:image/jpeg;base64,${artsJpg}";
export const REAL_ART_HOUSE_PARTS = "data:image/jpeg;base64,${houseJpg}";
export const REAL_ART_MATH_COUNTING = "data:image/jpeg;base64,${mathJpg}";
export const REAL_ART_CLASSROOM_STORY = "data:image/jpeg;base64,${classroomJpg}";
export const REAL_ART_ANIMALS_NATURE = "data:image/jpeg;base64,${animalsJpg}";
export const REAL_ART_COMMUNITY_HELPERS = "data:image/jpeg;base64,${helpersJpg}";

/**
 * Accurately maps the generated lesson plan topic to the authentic realistic illustration
 * matching the exact subject matter of the teacher's lesson.
 */
export function getDomainRealArtFallback(
  subject: string,
  title: string,
  hasStory: boolean,
  panels: string[] = []
): string {
  const combined = [
    subject || "",
    title || "",
    ...panels,
  ].join(" ").toLowerCase();

  // 1. Community Helpers, Nurses, Doctors & Teachers (check before general community)
  if (
    /\\b(helpers?|katulong|nurse|nurses|doktor|doctors?|pulis|police|bumbero|firefighters?|clinic|hospital)\\b/i.test(
      combined
    )
  ) {
    return REAL_ART_COMMUNITY_HELPERS;
  }

  // 2. Community Arts, Landscapes, Nature, Agriculture, Waterfalls & Farmers (e.g. Lesson 21)
  if (
    /\\b(arts?|sining|farmers?|magsasaka|rice\\s*fields?|bukid|waterfalls?|talon|tanawin|landscapes?|paintings?|pintura|wood\\s*crafts?|carvings?|planting|tanim)\\b/i.test(
      combined
    ) ||
    (/\\b(community|komunidad)\\b/i.test(combined) &&
      /\\b(arts?|sining|crafts?|paintings?|likha)\\b/i.test(combined))
  ) {
    return REAL_ART_COMMUNITY_ARTS;
  }

  // 3. Parts of the House & Home Environment
  if (
    /\\b(house|bahay|home|tahanan|rooms?|silid|living\\s*room|bedroom|kitchen|kusina|bathroom|banyo|roof|bubong|walls?|dingding|doors?|pinto|windows?|bintana)\\b/i.test(
      combined
    )
  ) {
    return REAL_ART_HOUSE_PARTS;
  }

  // 4. Mathematics, Numbers, Counting & Sets
  if (
    /\\b(math|mathematics|bilang|count|counting|numbers?|sets?|shapes?|hugis|addition|subtraction|montessori)\\b/i.test(
      combined
    )
  ) {
    return REAL_ART_MATH_COUNTING;
  }

  // 5. Animals & Wildlife
  if (
    /\\b(animals?|hayop|pets?|carabao|kalabaw|birds?|ibon|butterfly|butterflies|paru-paro|aso|pusa|wildlife)\\b/i.test(
      combined
    )
  ) {
    return REAL_ART_ANIMALS_NATURE;
  }

  // 6. Classroom Reading, Story Arc & Filipino Leadership / Values
  if (
    hasStory ||
    /\\b(lider|leader|kuwento|kwento|stories|story|gamu-gamo|reading|pagbasa|aral|pabula|fables?|values)\\b/i.test(
      combined
    )
  ) {
    return REAL_ART_CLASSROOM_STORY;
  }

  // Default: Community Arts Landscape
  return REAL_ART_COMMUNITY_ARTS;
}
`;

fs.writeFileSync('lib/authenticArtAssets.ts', code);
console.log('Updated lib/authenticArtAssets.ts, length:', code.length);
