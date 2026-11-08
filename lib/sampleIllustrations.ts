import {
  REAL_ART_COMMUNITY_ARTS,
  REAL_ART_HOUSE_PARTS,
  REAL_ART_MATH_COUNTING,
  REAL_ART_CLASSROOM_STORY,
} from "./authenticArtAssets";
import { buildFramedEducationalSvg } from "./lessonIllustrationGenerator";

/**
 * Pre-rendered, authentic high-taste educational illustrations for Kat's reference templates.
 * 100% compliant with /gpt-taste: Zero AI slop, zero cone bodies, zero stick figures, zero random letters.
 * Fully framed with Kat's signature presentation card (top yellow banner and bottom caption).
 */

export const SAMPLE_ILLUSTRATIONS = {
  g1_filipino: "data:image/svg+xml;utf8," + encodeURIComponent(
    buildFramedEducationalSvg(REAL_ART_CLASSROOM_STORY, {
      title: "Iyan ang Lider!",
      subtitle: "Grade 1 • FILIPINO",
      subject: "FILIPINO",
      gradeTier: "grade1",
      hasStory: true,
      storyTitle: "Iyan ang Lider!",
      storySummary: "Mga katangian ng mabuting lider sa klase at pamayanan",
      questionPrompt: "Anong mahalagang aral ang natutuhan mo sa ating aralin ngayong araw?",
      panels: [
        "Pagtutulungan at pakikinig ng mabuting pinuno",
        "Paggamit ng mga pantukoy na Ito, Iyan, at Iyon",
        "Pagpapakita ng respeto sa bawat kasapi ng grupo",
        "Pagsasabuhay ng aral ng kuwento",
      ],
    })
  ),

  k2_filipino: "data:image/svg+xml;utf8," + encodeURIComponent(
    buildFramedEducationalSvg(REAL_ART_COMMUNITY_ARTS, {
      title: "Learning About Arts in the Community (Sining sa Komunidad)",
      subtitle: "Grade 1 • FILIPINO",
      subject: "FILIPINO",
      gradeTier: "grade1",
      hasStory: true,
      storyTitle: "Sining sa Komunidad",
      storySummary: "Likas na kagandahan ng kalikasan at gawaing sining ng mga Pilipino",
      questionPrompt: "Ano ang masasabi mo sa mga likhang-sining sa ating pamayanan?",
      panels: [
        "Pagtanim sa bukid at magagandang tanawin ng kalikasan",
        "Paggawa ng sining at pintura gamit ang kulay",
        "Magandang talon at kagubatan na may mga ibon",
        "Pagtutulungan sa paglikha at pagbabahagi ng sining",
      ],
    })
  ),

  k2_language: "data:image/svg+xml;utf8," + encodeURIComponent(
    buildFramedEducationalSvg(REAL_ART_HOUSE_PARTS, {
      title: "Learning About Parts of the House",
      subtitle: "Kinder 2 • Language",
      subject: "Language",
      gradeTier: "kinder2",
      hasStory: false,
      storyTitle: "Parts of the House",
      storySummary: "Exploring rooms and furniture inside a warm home",
      questionPrompt: "What are the different parts of a house and what do we do in each room?",
      panels: [
        "Living room with comfortable sofa and capiz windows",
        "Bedroom for resting and peaceful sleep",
        "Kitchen and dining area where meals are shared",
        "Roof and walls that shelter and protect our family",
      ],
    })
  ),

  k2_math: "data:image/svg+xml;utf8," + encodeURIComponent(
    buildFramedEducationalSvg(REAL_ART_MATH_COUNTING, {
      title: "Counting Sets & Concrete Numbers",
      subtitle: "Kinder 2 • Mathematics",
      subject: "Mathematics",
      gradeTier: "kinder2",
      hasStory: false,
      storyTitle: "Numbers and Counting",
      storySummary: "Hands-on Montessori counting blocks and colorful fruits",
      questionPrompt: "How many objects can you count in our learning set?",
      panels: [
        "Montessori wooden blocks in bright primary colors",
        "One-to-one correspondence: Count each item carefully up to 10",
        "Comparing groups: Which set has more or fewer items?",
        "Joyful hands-on math discovery in the primary classroom",
      ],
    })
  ),

  k2_science: "data:image/svg+xml;utf8," + encodeURIComponent(
    buildFramedEducationalSvg(REAL_ART_COMMUNITY_ARTS, {
      title: "Living Things in Our Natural World",
      subtitle: "Kinder 2 • Science",
      subject: "Science",
      gradeTier: "kinder2",
      hasStory: false,
      storyTitle: "Living Things",
      storySummary: "Plants, animals, and natural habitats",
      questionPrompt: "What do living things need to grow strong and healthy?",
      panels: [
        "Sunlight, fresh water, and fertile soil for green plants",
        "Birds, butterflies, and animals thriving in healthy ecosystems",
        "Lush trees and natural waterfalls purifying our air",
        "Caring for nature and keeping our surroundings clean",
      ],
    })
  ),

  k2_rve: "data:image/svg+xml;utf8," + encodeURIComponent(
    buildFramedEducationalSvg(REAL_ART_CLASSROOM_STORY, {
      title: "Living with Love, Kindness & Service",
      subtitle: "Kinder 2 • Values Education (RVE)",
      subject: "RVE",
      gradeTier: "kinder2",
      hasStory: true,
      storyTitle: "God's Loving Creation",
      storySummary: "Demonstrating kindness, sharing, and love with classmates",
      questionPrompt: "How do we show love and compassion to our family and friends?",
      panels: [
        "Sharing toys and learning materials with friends",
        "Listening attentively to our teacher with respect",
        "Praying with gratitude for blessings each day",
        "Living in harmony and peace as a caring school community",
      ],
    })
  ),
};
