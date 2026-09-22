"use client";

import React, { useEffect, useState } from "react";
import { getFrameLoader } from "@/services/frameLoader";
import { TOTAL_FRAMES } from "@/config/cinematic";

interface PreloaderProps {
  onEnter: () => void;
  isInitialReady: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ onEnter, isInitialReady }) => {
  const [percent, setPercent] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [canEnter, setCanEnter] = useState(false);

  useEffect(() => {
    const loader = getFrameLoader();
    const unsubscribe = loader.subscribeProgress((pct, loaded) => {
      setPercent(pct);
      setLoadedFrames(loaded);
      // As soon as initial 15 frames are ready or percent >= 6%, user can enter immediately
      if (loaded >= 10 || isInitialReady) {
        setCanEnter(true);
      }
    });

    // Fallback timer so preloader never traps the user even on weak network
    const timeout = setTimeout(() => {
      setCanEnter(true);
    }, 2800);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [isInitialReady]);

  const handleStart = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onEnter();
    }, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070709] text-[#e8e4dc] transition-opacity duration-700 select-none ${
        isDismissing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle Japanese vertical background kanji */}
      <div className="absolute right-8 top-12 font-kanji text-2xl tracking-[0.5em] text-[#e8e4dc]/10 writing-vertical select-none pointer-events-none">
        血塗られた侍
      </div>
      <div className="absolute left-8 bottom-12 font-kanji text-xs tracking-[0.4em] text-[#e8e4dc]/15 writing-vertical select-none pointer-events-none">
        雨と灰と刃の記憶
      </div>

      <div className="w-full max-w-md px-6 text-center space-y-8 z-10">
        {/* Title & Subtitle */}
        <div className="space-y-3">
          <p className="text-[11px] tracking-[0.35em] text-[#8b1515] uppercase font-semibold">
            Photorealistic Historical War Chronicle
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.18em] text-[#e8e4dc] uppercase font-bold text-steel-glow">
            The Blood-Soaked Samurai
          </h1>
          <p className="text-xs text-[#9e988a] tracking-widest uppercase">
            A Live-Action Cinematic Experience
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-3 pt-4">
          <div className="relative w-full h-[2px] bg-[#1a1a22] overflow-hidden">
            <div
              className="absolute top-0 left-0 bottom-0 bg-[#8b1515] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(139,21,21,0.8)]"
              style={{ width: `${Math.max(percent, canEnter ? 35 : 5)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] tracking-[0.25em] text-[#9e988a] font-mono">
            <span>FRAMES BUFFERED: {loadedFrames} / {TOTAL_FRAMES}</span>
            <span>{percent}%</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {canEnter ? (
            <button
              onClick={handleStart}
              type="button"
              className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden border border-[#8b1515]/60 hover:border-[#8b1515] transition-all duration-300 bg-[#0e0e14] hover:bg-[#8b1515]/20 cursor-pointer"
            >
              <span className="relative z-10 text-xs tracking-[0.3em] uppercase font-serif text-[#e8e4dc] group-hover:text-white transition-colors duration-300">
                Enter The Aftermath
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-[#8b1515]/30 to-transparent transition-transform duration-500 ease-out" />
            </button>
          ) : (
            <div className="text-xs tracking-[0.3em] uppercase text-[#9e988a]/70 animate-pulse font-serif">
              Gathering The Ashes...
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#6b665c] tracking-wider italic">
          Best experienced with sound enabled · Scroll slowly through the deluge
        </p>
      </div>
    </div>
  );
};
