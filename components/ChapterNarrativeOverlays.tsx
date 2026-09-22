"use client";

import React from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { KatanaBladeSection } from "./KatanaBladeSection";

interface ChapterNarrativeOverlaysProps {
  scrollProgress: number; // 0 to 1
  onScrollToTop: () => void;
}

// Calculate clean opacity and translateY curves for any progress interval [start, end]
function calculateTransition(progress: number, start: number, end: number, fadeFraction = 0.22) {
  if (progress < start || progress > end) return { opacity: 0, translateY: 16, pointerEvents: "none" as const };

  const duration = end - start;
  const local = (progress - start) / duration; // 0 to 1
  const fade = fadeFraction;

  let opacity = 1;
  let translateY = 0;

  if (local < fade) {
    const t = local / fade;
    opacity = t;
    translateY = (1 - t) * 14;
  } else if (local > 1 - fade) {
    const t = (1 - local) / fade;
    opacity = t;
    translateY = (1 - t) * -14;
  }

  return {
    opacity: Math.max(0, Math.min(1, opacity)),
    translateY,
    pointerEvents: (opacity > 0.35 ? "auto" : "none") as "auto" | "none",
  };
}

export const ChapterNarrativeOverlays: React.FC<ChapterNarrativeOverlaysProps> = ({
  scrollProgress,
  onScrollToTop,
}) => {
  // Scene 1: Opening (0.0 to 0.17)
  const scene1 = calculateTransition(scrollProgress, 0.0, 0.17);

  // Scene 2: Ronin Chapter (0.17 to 0.37)
  const scene2 = calculateTransition(scrollProgress, 0.17, 0.37);

  // Scene 3: Destruction Chapter (0.37 to 0.58)
  const scene3 = calculateTransition(scrollProgress, 0.37, 0.58);

  // Scene 4: Aftermath Section (0.58 to 0.77)
  const scene4 = calculateTransition(scrollProgress, 0.58, 0.77);

  // Scene 5: The Blade Section (0.77 to 0.90)
  const scene5 = calculateTransition(scrollProgress, 0.77, 0.90);

  // Scene 6: Final Section (0.90 to 1.00)
  const scene6 = calculateTransition(scrollProgress, 0.90, 1.00);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center select-none overflow-hidden">
      {/* ----------------- SCENE 1: OPENING ----------------- */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-300 ease-out"
        style={{
          opacity: scene1.opacity,
          transform: `translate3d(0, ${scene1.translateY}px, 0)`,
          pointerEvents: scene1.pointerEvents,
        }}
      >
        <div className="relative max-w-3xl space-y-6">
          {/* Extremely subtle ambient vignette backdrop, max 0.20 opacity, seamless edge fade */}
          <div className="absolute inset-0 -inset-x-12 -inset-y-8 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.20)_0%,transparent_75%)] -z-10" />

          <p className="font-kanji text-sm text-[#8b1515] tracking-[0.4em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            序 · 静寂
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.16em] uppercase text-[#e8e4dc] leading-tight text-steel-glow drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]">
            BEFORE THE FIRE,
            <br />
            <span className="text-[#a81c1c] drop-shadow-[0_2px_10px_rgba(139,21,21,0.6)]">
              THERE WAS SILENCE.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#9e988a]/80 font-sans tracking-[0.25em] uppercase max-w-lg mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Cold rain falls over the Edo mountains. A masterless sword stands watch.
          </p>
          <div className="pt-6 flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-[0.35em] text-[#9e988a]/70 font-mono uppercase">
              Scroll To Enter
            </span>
            <ChevronDown className="w-4 h-4 text-[#8b1515] animate-bounce" />
          </div>
        </div>
      </div>

      {/* ----------------- SCENE 2: RONIN CHAPTER ----------------- */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-300 ease-out"
        style={{
          opacity: scene2.opacity,
          transform: `translate3d(0, ${scene2.translateY}px, 0)`,
          pointerEvents: scene2.pointerEvents,
        }}
      >
        <div className="relative max-w-4xl space-y-4">
          <div className="absolute inset-0 -inset-x-16 -inset-y-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.22)_0%,transparent_75%)] -z-10" />

          <p className="font-kanji text-sm text-[#8b1515] tracking-[0.4em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            壱 · 修羅の道
          </p>
          <h2 className="font-serif text-3xl sm:text-6xl lg:text-7xl font-bold tracking-[0.18em] uppercase text-[#e8e4dc] leading-none text-steel-glow drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            THE BLOOD-SOAKED
            <br />
            <span className="text-[#8b1515] text-crimson-glow drop-shadow-[0_0_20px_rgba(139,21,21,0.7)]">
              SAMURAI
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#d4cebe]/75 font-sans tracking-[0.3em] uppercase max-w-md mx-auto pt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            No banners remain. Only iron and rain.
          </p>
        </div>
      </div>

      {/* ----------------- SCENE 3: DESTRUCTION CHAPTER ----------------- */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-300 ease-out"
        style={{
          opacity: scene3.opacity,
          transform: `translate3d(0, ${scene3.translateY}px, 0)`,
          pointerEvents: scene3.pointerEvents,
        }}
      >
        <div className="relative max-w-3xl space-y-5">
          <div className="absolute inset-0 -inset-x-12 -inset-y-8 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.22)_0%,transparent_75%)] -z-10" />

          <p className="font-kanji text-sm text-[#8b1515] tracking-[0.4em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            弐 · 灰燼の名誉
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.15em] uppercase text-[#e8e4dc] leading-tight text-steel-glow drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]">
            THEY CALLED IT HONOUR.
          </h2>
          <div className="h-[1px] w-24 bg-[#8b1515] mx-auto shadow-[0_0_10px_rgba(139,21,21,0.8)]" />
          <p className="font-serif text-base sm:text-xl text-[#d4cebe]/85 tracking-widest leading-relaxed max-w-xl mx-auto italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            “Until the rain could no longer wash it away.”
          </p>
        </div>
      </div>

      {/* ----------------- SCENE 4: AFTERMATH SECTION (NO RECTANGULAR BOX) ----------------- */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-300 ease-out"
        style={{
          opacity: scene4.opacity,
          transform: `translate3d(0, ${scene4.translateY}px, 0)`,
          pointerEvents: scene4.pointerEvents,
        }}
      >
        <div className="relative max-w-3xl space-y-5">
          {/* Subtle soft gradient fading seamlessly into battlefield, no card border or opaque rectangle */}
          <div className="absolute inset-0 -inset-x-12 -inset-y-8 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.22)_0%,transparent_75%)] -z-10" />

          <p className="font-kanji text-sm text-[#8b1515] tracking-[0.4em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            参 · 戦跡の無常
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-[0.14em] uppercase text-[#e8e4dc] leading-tight text-steel-glow drop-shadow-[0_3px_14px_rgba(0,0,0,0.95)]">
            VIOLENCE BECOMES ORDINARY
            <br />
            <span className="text-[#a81c1c] drop-shadow-[0_2px_10px_rgba(139,21,21,0.6)]">
              BEFORE IT BECOMES UNFORGIVABLE.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#9e988a]/80 font-sans tracking-widest max-w-lg mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            The burned timbers hiss in the mud. Smoke rises where fathers and sons once slept.
          </p>
        </div>
      </div>

      {/* ----------------- SCENE 5: THE BLADE SECTION (FLOAT OVER BATTLEFIELD) ----------------- */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center transition-all duration-300 ease-out"
        style={{
          opacity: scene5.opacity,
          transform: `translate3d(0, ${scene5.translateY}px, 0)`,
          pointerEvents: scene5.pointerEvents,
        }}
      >
        <KatanaBladeSection />
      </div>

      {/* ----------------- SCENE 6: FINAL CINEMATIC SECTION (NO OPAQUE CARD) ----------------- */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-300 ease-out"
        style={{
          opacity: scene6.opacity,
          transform: `translate3d(0, ${scene6.translateY}px, 0)`,
          pointerEvents: scene6.pointerEvents,
        }}
      >
        <div className="relative max-w-2xl space-y-6">
          {/* Subtle soft gradient fading seamlessly into burning village, no box border or dark card */}
          <div className="absolute inset-0 -inset-x-16 -inset-y-12 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.24)_0%,transparent_75%)] -z-10" />

          <p className="font-kanji text-sm text-[#8b1515] tracking-[0.4em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            終 · 終焉
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.16em] uppercase text-[#e8e4dc] leading-tight text-steel-glow drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">
            VICTORY LEAVES
            <br />
            <span className="text-[#8b1515] text-crimson-glow drop-shadow-[0_0_20px_rgba(139,21,21,0.7)]">
              NO ONE UNWOUNDED.
            </span>
          </h2>

          <div className="h-[1px] w-16 bg-[#8b1515] mx-auto shadow-[0_0_12px_rgba(139,21,21,0.8)]" />

          <p className="text-xs sm:text-sm text-[#9e988a]/80 font-sans tracking-widest leading-relaxed max-w-md mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            The ronin sheathes his blade in cold mud. The smoke drifts across centuries.
          </p>

          <div className="pt-4 pointer-events-auto">
            <button
              onClick={onScrollToTop}
              type="button"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-3.5 overflow-hidden border border-[#8b1515]/70 hover:border-[#a81c1c] transition-all duration-300 bg-[#070709]/30 hover:bg-[#8b1515]/20 cursor-pointer shadow-[0_0_18px_rgba(139,21,21,0.25)] hover:shadow-[0_0_28px_rgba(139,21,21,0.5)]"
            >
              <RotateCcw className="w-4 h-4 text-[#8b1515] group-hover:rotate-[-180deg] transition-transform duration-500" />
              <span className="relative z-10 text-xs tracking-[0.3em] uppercase font-serif text-[#e8e4dc] group-hover:text-white transition-colors duration-300 font-bold">
                Begin Again
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-[#8b1515]/30 to-transparent transition-transform duration-500 ease-out" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
