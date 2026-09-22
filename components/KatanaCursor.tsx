"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";

function subscribeFinePointer(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getPointerSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

function getServerPointerSnapshot() {
  return false;
}

export const KatanaCursor: React.FC = () => {
  const isPointerDevice = useSyncExternalStore(
    subscribeFinePointer,
    getPointerSnapshot,
    getServerPointerSnapshot
  );

  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [angle, setAngle] = useState(45);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isPointerDevice) return;

    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        // Calculate movement blade angle
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        setAngle(targetAngle);
      }
      lastX = e.clientX;
      lastY = e.clientY;
      setPos({ x: e.clientX, y: e.clientY });

      // Check if target is clickable
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest("button") ||
            target.closest("a") ||
            target.getAttribute("role") === "button" ||
            window.getComputedStyle(target).cursor === "pointer"
        );
        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPointerDevice]);

  if (!isPointerDevice || !isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        left: -12,
        top: -12,
      }}
    >
      {/* Precision center dot */}
      <div
        className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${
          isHoveringClickable ? "scale-125" : "scale-100"
        }`}
      >
        {/* Fine crosshair */}
        <div className="absolute w-full h-[1px] bg-red-700/60" />
        <div className="absolute h-full w-[1px] bg-red-700/60" />

        {/* Center steel point */}
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            isHoveringClickable
              ? "bg-[#e8e4dc] ring-2 ring-[#8b1515]"
              : "bg-[#8b1515]"
          }`}
        />

        {/* Subtle blade slash edge accent */}
        <div
          className="absolute w-5 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4cebe] to-transparent opacity-70 transition-transform duration-150"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </div>
    </div>
  );
};
