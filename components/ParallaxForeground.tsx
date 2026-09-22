"use client";

import React, { useEffect, useRef } from "react";

interface ParallaxForegroundProps {
  scrollProgress: number; // 0 to 1
  isDestructionOrAftermath: boolean; // triggers glowing embers instead of pure rain/ash
}

interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
  type: "rain" | "ash" | "ember";
  sway: number;
  swaySpeed: number;
}

export const ParallaxForeground: React.FC<ParallaxForegroundProps> = ({
  scrollProgress,
  isDestructionOrAftermath,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(scrollProgress);
  const destructionRef = useRef(isDestructionOrAftermath);

  useEffect(() => {
    progressRef.current = scrollProgress;
    destructionRef.current = isDestructionOrAftermath;
  }, [scrollProgress, isDestructionOrAftermath]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize particles
    const particleCount = 70;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isRain = Math.random() > 0.35;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: isRain ? 15 + Math.random() * 25 : 2 + Math.random() * 3,
        speed: isRain ? 18 + Math.random() * 14 : 0.8 + Math.random() * 1.5,
        opacity: 0.12 + Math.random() * 0.35,
        width: isRain ? 0.8 + Math.random() * 0.8 : 1 + Math.random() * 2.5,
        type: isRain ? "rain" : "ash",
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const hasFire = destructionRef.current || progressRef.current > 0.4;
      const scrollSpeedBoost = 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.type === "rain") {
          // Rain streaks falling slanted
          p.y += p.speed * scrollSpeedBoost;
          p.x += p.speed * 0.28; // wind slant

          if (p.y > height || p.x > width) {
            p.y = -p.length - Math.random() * 50;
            p.x = Math.random() * (width + 100) - 50;
          }

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length * 0.28, p.y + p.length);
          ctx.strokeStyle = `rgba(180, 195, 210, ${p.opacity * 0.55})`;
          ctx.lineWidth = p.width;
          ctx.stroke();
        } else {
          // Ash or Ember particles drifting slowly
          p.sway += p.swaySpeed;
          p.x += Math.sin(p.sway) * 0.6 + 0.3;
          p.y += (hasFire ? -p.speed * 0.7 : p.speed * 0.8); // embers rise, cold ash falls

          if (hasFire && p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          } else if (!hasFire && p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.width, 0, Math.PI * 2);

          if (hasFire) {
            // Restrained burning ember orange/crimson
            ctx.fillStyle = `rgba(225, 90, 30, ${p.opacity * 0.8})`;
            ctx.shadowColor = "rgba(225, 70, 20, 0.6)";
            ctx.shadowBlur = 6;
          } else {
            // Cold grey charcoal ash
            ctx.fillStyle = `rgba(160, 160, 170, ${p.opacity * 0.4})`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Dynamic Rain and Ember canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Blurred foreground wooden debris / banner silhouette in bottom corner */}
      <div
        className="absolute -bottom-16 -left-12 w-64 h-80 opacity-20 pointer-events-none blur-[4px] mix-blend-multiply bg-gradient-to-tr from-black via-black/80 to-transparent"
        style={{
          transform: `translateY(${scrollProgress * 40}px) rotate(${-3 + scrollProgress * 5}deg)`,
        }}
      />
      <div
        className="absolute -top-12 -right-12 w-72 h-72 opacity-25 pointer-events-none blur-[6px] mix-blend-multiply bg-gradient-to-bl from-black via-black/70 to-transparent"
        style={{
          transform: `translateY(${-scrollProgress * 30}px) rotate(${5 - scrollProgress * 3}deg)`,
        }}
      />
    </div>
  );
};
