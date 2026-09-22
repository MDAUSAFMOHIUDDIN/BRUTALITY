export const FRAME_BASE_URL =
  "https://lqsctfrqquwjldxjpfls.supabase.co/storage/v1/object/public/BRUTALITY";

export const TOTAL_FRAMES = 287; // easy to edit later

export const FRAME_DELAY = "0.042s";

export function getFrameUrl(frameNumber: number): string {
  const bounded = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(frameNumber)));
  const paddedNumber = String(bounded).padStart(3, "0");
  return `${FRAME_BASE_URL}/frame_${paddedNumber}_delay-${FRAME_DELAY}.webp`;
}

export interface ChapterInfo {
  id: string;
  number: string;
  kanji: string;
  title: string;
  supporting?: string;
  frameStart: number;
  frameEnd: number;
  progressStart: number;
  progressEnd: number;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: "opening",
    number: "序",
    kanji: "静寂",
    title: "BEFORE THE FIRE,\nTHERE WAS SILENCE.",
    supporting: "A lone ronin waits in the deluge. The calm before slaughter.",
    frameStart: 1,
    frameEnd: 48,
    progressStart: 0,
    progressEnd: 0.18,
  },
  {
    id: "ronin",
    number: "壱",
    kanji: "修羅",
    title: "THE BLOOD-SOAKED SAMURAI",
    supporting: "A masterless warrior bearing the weight of a thousand fallen swords.",
    frameStart: 49,
    frameEnd: 110,
    progressStart: 0.18,
    progressEnd: 0.38,
  },
  {
    id: "destruction",
    number: "弐",
    kanji: "名誉",
    title: "THEY CALLED IT HONOUR.",
    supporting: "Until the rain could no longer wash it away.",
    frameStart: 111,
    frameEnd: 175,
    progressStart: 0.38,
    progressEnd: 0.60,
  },
  {
    id: "aftermath",
    number: "参",
    kanji: "無常",
    title: "VIOLENCE BECOMES ORDINARY\nBEFORE IT BECOMES UNFORGIVABLE.",
    supporting: "The village smoulders under the iron sky. Nothing remains unbroken.",
    frameStart: 176,
    frameEnd: 228,
    progressStart: 0.60,
    progressEnd: 0.78,
  },
  {
    id: "blade",
    number: "肆",
    kanji: "銘刃",
    title: "A blade remembers\nwhat its owner tries to forget.",
    supporting: "Tamahagane steel quenched in blood, held by hands that know no rest.",
    frameStart: 229,
    frameEnd: 268,
    progressStart: 0.78,
    progressEnd: 0.90,
  },
  {
    id: "final",
    number: "終",
    kanji: "終焉",
    title: "VICTORY LEAVES\nNO ONE UNWOUNDED.",
    supporting: "The ashes settle in cold water. The ronin continues into the mist.",
    frameStart: 269,
    frameEnd: 287,
    progressStart: 0.90,
    progressEnd: 1.0,
  },
];

export const CINEMATIC_CONFIG = {
  initialPreloadCount: 15,
  windowRadius: 12,
  maxConcurrentLoads: 3,
  canvasMaxPixelRatio: 2.0,
  scrollDistanceMultiplier: 8, // 800vh
  primaryColor: "#8b1515", // deep crimson
  accentColor: "#d97736", // restrained ember orange
  charcoalBg: "#070709",
  ivoryText: "#e8e4dc",
};
