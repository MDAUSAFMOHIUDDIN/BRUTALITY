"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { audioEngine } from "@/services/audioEngine";
import { CHAPTERS, TOTAL_FRAMES } from "@/config/cinematic";

interface CinematicControlsProps {
  scrollProgress: number; // 0 to 1
  currentFrame: number;
  currentChapterIndex: number;
  onScrollToTop: () => void;
  onSelectChapter: (progress: number) => void;
}

export const CinematicControls: React.FC<CinematicControlsProps> = ({
  scrollProgress,
  currentFrame,
  currentChapterIndex,
  onScrollToTop,
  onSelectChapter,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const activeChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

  const handleToggleAudio = () => {
    const active = audioEngine.toggle();
    setIsAudioActive(active);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-6 sm:px-10 py-5 pointer-events-none">
        {/* Left: Discreet Title & Kanji */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="font-kanji text-base sm:text-lg text-[#8b1515] font-bold select-none">
            侍
          </span>
          <div className="h-3.5 w-[1px] bg-[#333742]" />
          <span className="font-serif text-xs sm:text-sm tracking-[0.25em] text-[#e8e4dc] uppercase font-semibold text-steel-glow select-none">
            The Blood-Soaked Samurai
          </span>
        </div>

        {/* Right: Sound Control and Begin Again Shortcut */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {scrollProgress > 0.85 && (
            <button
              onClick={onScrollToTop}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#3a3a48] hover:border-[#8b1515] bg-[#0c0c12]/80 backdrop-blur-sm text-[10px] tracking-[0.2em] font-serif uppercase text-[#d4cebe] hover:text-white transition-all cursor-pointer"
              title="Return to the beginning"
              type="button"
            >
              <RotateCcw className="w-3 h-3 text-[#8b1515]" />
              <span>Begin Again</span>
            </button>
          )}

          {/* Sound Toggle (Never autoplays) */}
          <button
            onClick={handleToggleAudio}
            type="button"
            aria-label={isAudioActive ? "Mute atmospheric soundscape" : "Enable atmospheric soundscape"}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#2e2e38] hover:border-[#8b1515] bg-[#0c0c12]/85 backdrop-blur-sm text-[10px] tracking-[0.2em] font-mono uppercase text-[#e8e4dc] hover:text-white transition-all cursor-pointer"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#8b1515] animate-pulse" />
                <span className="text-[#8b1515] font-semibold">SOUND: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#9e988a]" />
                <span className="text-[#9e988a]">SOUND: OFF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Right-Side Vertical Chapter & Progress Track */}
      <nav
        aria-label="Cinematic chapters navigation"
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-4 pointer-events-auto select-none"
      >
        <div className="relative flex flex-col items-center gap-4 py-3">
          {/* Subtle vertical spine track */}
          <div className="absolute top-0 bottom-0 w-[1px] bg-[#1a1a24] -z-10" />

          {/* Active progress fill line */}
          <div
            className="absolute top-0 w-[1.5px] bg-[#8b1515] shadow-[0_0_8px_rgba(139,21,21,0.8)] -z-10 transition-all duration-150"
            style={{ height: `${scrollProgress * 100}%` }}
          />

          {CHAPTERS.map((ch, idx) => {
            const isActive = currentChapterIndex === idx;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChapter(ch.progressStart)}
                type="button"
                aria-label={`Jump to chapter ${ch.number}: ${ch.title.replace("\n", " ")}`}
                className="group relative flex items-center justify-center p-1.5 cursor-pointer"
              >
                {/* Chapter Dot */}
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#8b1515] ring-4 ring-[#8b1515]/30 scale-125"
                      : "bg-[#2b2b36] hover:bg-[#9e988a] group-hover:scale-110"
                  }`}
                />

                {/* Hover Tooltip with Chapter Kanji and Title */}
                <div className="absolute right-7 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-[#0b0b10] border border-[#262633] px-2.5 py-1 text-[10px] tracking-[0.2em] font-serif uppercase text-[#e8e4dc] flex items-center gap-2 shadow-xl">
                  <span className="font-kanji text-[#8b1515] font-bold">{ch.kanji}</span>
                  <span>{ch.title.split("\n")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Interface HUD */}
      <footer className="fixed bottom-0 inset-x-0 z-30 flex items-end justify-between px-6 sm:px-10 py-5 pointer-events-none text-xs text-[#9e988a] font-mono">
        {/* Bottom Left: Current Chapter readout */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#0a0a0f]/60 backdrop-blur-xs px-3 py-1.5 border border-[#1b1b24]">
          <span className="font-kanji text-sm text-[#8b1515] font-bold">
            {activeChapter.kanji}
          </span>
          <span className="text-[#3c404f]">/</span>
          <span className="tracking-[0.2em] uppercase text-[#e8e4dc] font-serif font-medium text-[11px]">
            CHAPTER {activeChapter.number}
          </span>
        </div>

        {/* Bottom Right: Frame scrubber telemetry */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#0a0a0f]/60 backdrop-blur-xs px-3 py-1.5 border border-[#1b1b24] text-[10px] tracking-[0.25em]">
          <span className="text-[#e8e4dc]">FRAME {String(currentFrame).padStart(3, "0")}</span>
          <span className="text-[#3c404f]">/</span>
          <span className="text-[#6d6a62]">{TOTAL_FRAMES}</span>
        </div>
      </footer>
    </>
  );
};
