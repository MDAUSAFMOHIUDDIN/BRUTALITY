"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { audioEngine } from "@/services/audioEngine";

export const KatanaBladeSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [glintPos, setGlintPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc] = useState("/images/katana-sword-hd.jpg");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlintPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setGlintPos({ x, y: 50 });
    setIsHovered(true);
  };

  const handleBladeClick = () => {
    audioEngine.playBladeChime();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 text-center select-none">
      {/* Chapter Label - Transparent Overlay */}
      <div className="flex items-center justify-center gap-3 mb-3 text-[#8b1515] text-xs font-mono tracking-[0.3em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        <span className="font-kanji">肆</span>
        <span>·</span>
        <span>The Steel</span>
        <span>·</span>
        <span className="font-kanji">銘刃</span>
      </div>

      {/* Main Copy - Transparent with subtle shadow */}
      <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#e8e4dc] tracking-[0.14em] uppercase font-bold leading-tight mb-3 text-steel-glow drop-shadow-[0_3px_14px_rgba(0,0,0,0.95)]">
        A blade remembers
        <br />
        <span className="text-[#a81c1c] drop-shadow-[0_2px_10px_rgba(139,21,21,0.6)]">
          what its owner tries to forget.
        </span>
      </h2>

      <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#9e988a]/80 font-sans tracking-widest leading-relaxed mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        Folded sixteen times in the fires of an extinguished clan. Quenched in icy winter water,
        it cuts not with anger, but with relentless indifference.
      </p>

      {/* Real Provided Sword Image - Directly Over Battlefield (No Solid Box / No Card Border) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsHovered(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleBladeClick}
        role="button"
        tabIndex={0}
        aria-label="Inspect the forged blade. Touch or click to sound the steel."
        className="relative group cursor-crosshair w-full max-w-4xl mx-auto h-48 sm:h-64 md:h-72 flex items-center justify-center overflow-hidden transition-all duration-300"
      >
        {/* Soft, low-opacity radial dark gradient directly behind the sword for contrast without visible borders */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.26)_0%,transparent_75%)] -z-10" />

        {/* Real Provided Sword Image */}
        <Image
          src={imgSrc}
          alt="Forged Katana Blade"
          width={900}
          height={504}
          priority
          className="w-full h-full max-h-72 object-contain mix-blend-screen drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)] select-none pointer-events-none"
          style={{
            maskImage: "radial-gradient(ellipse 92% 80% at center, black 65%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 92% 80% at center, black 65%, transparent 100%)",
          }}
        />

        {/* Pointer/Touch specular steel reflection sheen */}
        <div
          className="absolute inset-y-0 w-28 pointer-events-none transition-opacity duration-200 blur-md mix-blend-screen"
          style={{
            left: `${glintPos.x}%`,
            transform: "translateX(-50%)",
            opacity: isHovered ? 0.5 : 0.15,
            background:
              "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(139, 21, 21, 0.45) 45%, transparent 70%)",
          }}
        />

        {/* Small, unobtrusive sound instruction */}
        <div className="absolute bottom-1 right-2 sm:right-6 text-[10px] tracking-[0.25em] text-[#9e988a]/60 font-mono flex items-center gap-1.5 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b1515] animate-ping" />
          <span>TOUCH OR CLICK TO SOUND THE STEEL</span>
        </div>
      </div>

      {/* Subtle blade specifications */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#6b665c]/80 font-mono tracking-widest max-w-xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        <span>LENGTH: 2 SHAKU 4 SUN</span>
        <span>TEMPER: CLAY NOTARE HAMON</span>
        <span>WEIGHT: 1,020G</span>
      </div>
    </div>
  );
};
