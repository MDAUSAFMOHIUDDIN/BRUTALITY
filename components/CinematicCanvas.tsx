"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import { getFrameLoader } from "@/services/frameLoader";
import { getFrameUrl, CINEMATIC_CONFIG } from "@/config/cinematic";

interface CinematicCanvasProps {
  currentFrame: number;
  onFirstFrameReady?: () => void;
  className?: string;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

export const CinematicCanvas: React.FC<CinematicCanvasProps> = ({
  currentFrame,
  onFirstFrameReady,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const targetFrameRef = useRef<number>(currentFrame);
  const onFirstFrameReadyRef = useRef(onFirstFrameReady);
  const hasRenderedFirstRef = useRef(false);
  const [hasRenderedFirst, setHasRenderedFirst] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );

  const performDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const loader = getFrameLoader();
    const target = prefersReducedMotion ? 1 : targetFrameRef.current;

    // Get exact or nearest loaded frame
    let imageToDraw: HTMLImageElement | null | undefined = loader.getCachedFrame(target);
    if (!imageToDraw) {
      imageToDraw = loader.getNearestLoadedImage(target) || lastDrawnImageRef.current;
    }

    if (!imageToDraw || !imageToDraw.complete || (imageToDraw.naturalWidth === 0 && imageToDraw.width === 0)) {
      return;
    }

    lastDrawnImageRef.current = imageToDraw;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = imageToDraw.naturalWidth || imageToDraw.width;
    const imgHeight = imageToDraw.naturalHeight || imageToDraw.height;

    // 3. Draw every image using cover scaling:
    //    scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight)
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // 4. Calculate centered crop coordinates correctly:
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = (canvasHeight - scaledHeight) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imageToDraw, offsetX, offsetY, scaledWidth, scaledHeight);

    // Subtle edge vignette overlay for cinematic atmosphere
    const maxDim = Math.max(canvasWidth, canvasHeight);
    const gradient = ctx.createRadialGradient(
      canvasWidth * 0.5,
      canvasHeight * 0.5,
      maxDim * 0.22,
      canvasWidth * 0.5,
      canvasHeight * 0.5,
      maxDim * 0.72
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.65, "rgba(7, 7, 9, 0.4)");
    gradient.addColorStop(1, "rgba(7, 7, 9, 0.88)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (!hasRenderedFirstRef.current) {
      hasRenderedFirstRef.current = true;
      setHasRenderedFirst(true);
      if (onFirstFrameReadyRef.current) {
        onFirstFrameReadyRef.current();
      }
    }
  }, [prefersReducedMotion]);

  const requestRender = useCallback(() => {
    if (animFrameIdRef.current !== null) return;
    animFrameIdRef.current = requestAnimationFrame(() => {
      animFrameIdRef.current = null;
      performDraw();
    });
  }, [performDraw]);

  // Handle canvas sizing and DPI scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Canvas CSS size must be exactly viewport width and viewport height
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

    // 2. Canvas internal resolution must account for devicePixelRatio, capped at 2
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);

    canvas.style.width = "100vw";
    canvas.style.height = "100dvh";
    canvas.style.minHeight = "100vh";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";

    requestRender();
  }, [requestRender]);

  useEffect(() => {
    onFirstFrameReadyRef.current = onFirstFrameReady;
  }, [onFirstFrameReady]);

  // Keep target frame ref updated
  useEffect(() => {
    targetFrameRef.current = currentFrame;
    requestRender();
  }, [currentFrame, requestRender]);

  // Initialize loader & listeners
  useEffect(() => {
    const loader = getFrameLoader();

    const unsubscribeFrame = loader.onFrameLoaded((loadedFrameNum) => {
      if (
        loadedFrameNum === targetFrameRef.current ||
        !lastDrawnImageRef.current ||
        Math.abs(loadedFrameNum - targetFrameRef.current) < 3
      ) {
        requestRender();
      }
    });

    loader.preloadInitial(() => {
      requestRender();
    });

    resizeCanvas();

    // 5. Re-run resize and redraw on browser resize and device orientation change
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      unsubscribeFrame();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [requestRender, resizeCanvas]);

  return (
    <div
      ref={containerRef}
      className={`hero-cinematic frame-sequence-section canvas-wrapper absolute inset-0 w-[100vw] w-screen h-[100dvh] min-h-screen overflow-hidden m-0 p-0 max-w-none bg-[#070709] ${className}`}
    >
      {/* Fallback poster image using Next.js Image component */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 pointer-events-none ${
          hasRenderedFirst ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={getFrameUrl(1)}
          alt="The Blood-Soaked Samurai"
          fill
          priority
          sizes="100vw"
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Main HTML5 Cinematic Sequence Canvas */}
      <canvas
        ref={canvasRef}
        className="frame-sequence-canvas absolute inset-0 w-full h-full block object-cover pointer-events-none"
        style={{ touchAction: "none" }}
      />

      {/* Cinematic Film Grain & Vignette layer */}
      <div className="absolute inset-0 pointer-events-none cinematic-grain opacity-40 mix-blend-overlay w-full h-full" />
      <div className="absolute inset-0 pointer-events-none cinematic-vignette opacity-80 w-full h-full" />
    </div>
  );
};
