"use client";

import React from "react";

interface ParallaxBackgroundProps {
  scrollProgress: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ scrollProgress }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#070709]">
      {/* Distant Cold Mountain Haze Silhouette */}
      <div
        className="absolute inset-x-0 bottom-0 h-[65vh] opacity-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${scrollProgress * 25}px) scale(${1 + scrollProgress * 0.05})`,
        }}
      >
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          {/* Far Mountains */}
          <path
            d="M0 450L180 320L360 410L560 270L780 390L1020 250L1240 370L1440 290V600H0V450Z"
            fill="url(#mountainGradFar)"
            opacity="0.45"
          />
          {/* Mid Ridge */}
          <path
            d="M0 490L220 390L480 470L720 360L960 440L1200 350L1440 430V600H0V490Z"
            fill="url(#mountainGradMid)"
            opacity="0.75"
          />
          <defs>
            <linearGradient id="mountainGradFar" x1="720" y1="250" x2="720" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1a1c24" />
              <stop offset="1" stopColor="#070709" />
            </linearGradient>
            <linearGradient id="mountainGradMid" x1="720" y1="350" x2="720" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#13141a" />
              <stop offset="1" stopColor="#070709" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Layered Drifting Fog Mist */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 65%, rgba(65, 75, 90, 0.35) 0%, rgba(7, 7, 9, 0) 75%)",
          transform: `translateY(${scrollProgress * -20}px)`,
        }}
      />

      {/* Burning firelight glow overlay in deeper scroll regions */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: Math.max(0, (scrollProgress - 0.35) * 1.4),
          background:
            "radial-gradient(ellipse 80% 60% at 50% 85%, rgba(139, 21, 21, 0.28) 0%, rgba(194, 94, 34, 0.15) 40%, rgba(7, 7, 9, 0) 80%)",
        }}
      />
    </div>
  );
};
