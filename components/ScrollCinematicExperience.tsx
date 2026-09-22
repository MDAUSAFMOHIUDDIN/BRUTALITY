"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TOTAL_FRAMES, CHAPTERS } from "@/config/cinematic";
import { getFrameLoader } from "@/services/frameLoader";
import { CinematicCanvas } from "./CinematicCanvas";
import { ParallaxBackground } from "./ParallaxBackground";
import { ParallaxForeground } from "./ParallaxForeground";
import { CinematicControls } from "./CinematicControls";
import { ChapterNarrativeOverlays } from "./ChapterNarrativeOverlays";
import { Preloader } from "./Preloader";
import { KatanaCursor } from "./KatanaCursor";

export const ScrollCinematicExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedStageRef = useRef<HTMLDivElement | null>(null);

  // High-frequency values kept in refs to avoid redundant React renders
  const scrollProgressRef = useRef(0);
  const currentFrameRef = useRef(1);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Throttled UI state for text / HUD
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);
  const [isInitialReady, setIsInitialReady] = useState(false);

  // Frame window prioritization & rAF throttling
  const lastPrioritizedFrameRef = useRef(1);
  const uiUpdateRafIdRef = useRef<number | null>(null);

  const updateUIState = useCallback((progress: number, frame: number) => {
    if (uiUpdateRafIdRef.current !== null) return;

    uiUpdateRafIdRef.current = requestAnimationFrame(() => {
      uiUpdateRafIdRef.current = null;
      setScrollProgress(progress);
      setCurrentFrame(frame);

      // Determine active chapter based on progress ranges
      const chapterIdx = CHAPTERS.findIndex(
        (ch) => progress >= ch.progressStart && progress <= ch.progressEnd
      );
      if (chapterIdx !== -1) {
        setCurrentChapterIndex(chapterIdx);
      }
    });
  }, []);

  // Initialize GSAP ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const loader = getFrameLoader();
    const container = containerRef.current;
    const stage = pinnedStageRef.current;

    if (!container || !stage) return;

    // Create pinned scroll timeline
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=700%", // 800vh total scroll distance
      pin: stage,
      pinSpacing: true,
      scrub: 0.12, // Smooth Apple-like damping
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = Math.max(0, Math.min(1, self.progress));
        scrollProgressRef.current = progress;

        // Map scroll progress to frame number:
        const frameNumber = Math.min(
          TOTAL_FRAMES,
          Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1)
        );

        currentFrameRef.current = frameNumber;

        // Prioritize nearby frame window (±12 frames) if user moved significantly
        if (Math.abs(frameNumber - lastPrioritizedFrameRef.current) >= 3) {
          lastPrioritizedFrameRef.current = frameNumber;
          loader.prioritizeWindow(frameNumber, 12);
        }

        updateUIState(progress, frameNumber);
      },
    });

    scrollTriggerRef.current = st;

    return () => {
      st.kill();
      if (uiUpdateRafIdRef.current !== null) {
        cancelAnimationFrame(uiUpdateRafIdRef.current);
      }
    };
  }, [updateUIState]);

  // Jump to specific scroll position (e.g. from chapter dots)
  const handleSelectChapter = (targetProgress: number) => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + targetProgress * totalScrollable;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const handleScrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreloaderEnter = () => {
    setIsPreloaderActive(false);
  };

  const handleFirstFrameReady = () => {
    setIsInitialReady(true);
  };

  const isDestructionOrAftermath = currentChapterIndex >= 2;

  return (
    <div className="relative w-[100vw] w-screen bg-[#070709] selection:bg-[#8b1515] selection:text-white m-0 p-0 max-w-none overflow-x-hidden">
      {/* Desktop Katana Cursor */}
      <KatanaCursor />

      {/* Preloader */}
      {isPreloaderActive && (
        <Preloader
          onEnter={handlePreloaderEnter}
          isInitialReady={isInitialReady}
        />
      )}

      {/* Persistent Cinematic Controls / HUD */}
      <CinematicControls
        scrollProgress={scrollProgress}
        currentFrame={currentFrame}
        currentChapterIndex={currentChapterIndex}
        onScrollToTop={handleScrollToTop}
        onSelectChapter={handleSelectChapter}
      />

      {/* Pinned 800vh Scroll Experience Container */}
      <div
        ref={containerRef}
        className="relative w-[100vw] w-screen h-[800vh] bg-[#070709] m-0 p-0 max-w-none overflow-x-hidden"
      >
        {/* Pinned Viewport Stage */}
        <div
          ref={pinnedStageRef}
          className="hero-cinematic frame-sequence-section canvas-wrapper relative w-[100vw] w-screen h-[100dvh] min-h-screen overflow-hidden bg-[#070709] m-0 p-0 max-w-none"
        >
          {/* Layer 1: Background Parallax (Distant Mountains & Haze) */}
          <ParallaxBackground scrollProgress={scrollProgress} />

          {/* Layer 2: Fullscreen HTML Canvas Frame-Sequence Renderer */}
          <CinematicCanvas
            currentFrame={currentFrame}
            onFirstFrameReady={handleFirstFrameReady}
            className="z-5"
          />

          {/* Layer 3: Narrative Chapters Overlays */}
          <ChapterNarrativeOverlays
            scrollProgress={scrollProgress}
            onScrollToTop={handleScrollToTop}
          />

          {/* Layer 4: Foreground Parallax (Rain Streaks, Drifting Ash, Glowing Embers) */}
          <ParallaxForeground
            scrollProgress={scrollProgress}
            isDestructionOrAftermath={isDestructionOrAftermath}
          />
        </div>
      </div>
    </div>
  );
};
