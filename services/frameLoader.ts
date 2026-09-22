import { TOTAL_FRAMES, getFrameUrl } from "@/config/cinematic";

export type ProgressCallback = (percent: number, loadedCount: number, total: number) => void;
export type FrameLoadedCallback = (frameNumber: number, image: HTMLImageElement) => void;

class FrameLoaderService {
  private cache = new Map<number, HTMLImageElement>();
  private failed = new Set<number>();
  private inflight = new Map<number, Promise<HTMLImageElement | null>>();
  private priorityQueue: number[] = [];
  private backgroundQueue: number[] = [];
  private activeConcurrency = 0;
  private maxConcurrency = 3; // Never flood the browser network
  private progressListeners = new Set<ProgressCallback>();
  private frameListeners = new Set<FrameLoadedCallback>();
  private isPreloading = false;
  private isDestroyed = false;

  public loadedCount = 0;
  public firstFrameLoaded = false;

  constructor() {
    // Fill background queue initially with all frames from 1 to TOTAL_FRAMES
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      this.backgroundQueue.push(i);
    }
  }

  public subscribeProgress(cb: ProgressCallback): () => void {
    this.progressListeners.add(cb);
    // Immediately emit current status
    cb(this.getPercent(), this.loadedCount, TOTAL_FRAMES);
    return () => {
      this.progressListeners.delete(cb);
    };
  }

  public onFrameLoaded(cb: FrameLoadedCallback): () => void {
    this.frameListeners.add(cb);
    return () => {
      this.frameListeners.delete(cb);
    };
  }

  public getPercent(): number {
    return Math.min(100, Math.round((this.loadedCount / TOTAL_FRAMES) * 100));
  }

  public getCachedFrame(frameNumber: number): HTMLImageElement | undefined {
    return this.cache.get(frameNumber);
  }

  public getNearestLoadedImage(targetFrame: number): HTMLImageElement | null {
    const target = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(targetFrame)));
    
    // Check exact match first
    if (this.cache.has(target)) {
      return this.cache.get(target)!;
    }

    // Radiate outward from target frame to find the closest cached image
    let radius = 1;
    const maxRadius = TOTAL_FRAMES;
    while (radius <= maxRadius) {
      const prev = target - radius;
      if (prev >= 1 && this.cache.has(prev)) {
        return this.cache.get(prev)!;
      }
      const next = target + radius;
      if (next <= TOTAL_FRAMES && this.cache.has(next)) {
        return this.cache.get(next)!;
      }
      radius++;
    }

    return null;
  }

  public async preloadInitial(onFirstFrame?: (img: HTMLImageElement) => void): Promise<void> {
    if (this.isPreloading) return;
    this.isPreloading = true;

    // 1. Load Frame 1 immediately as poster
    try {
      const frame1 = await this.loadSingleFrame(1, true);
      if (frame1) {
        this.firstFrameLoaded = true;
        if (onFirstFrame) onFirstFrame(frame1);
      }
    } catch {
      // safe fallback
    }

    // 2. Preload Frames 2-15 sequentially / small batch
    const initialBatch = Array.from({ length: 14 }, (_, i) => i + 2);
    for (const f of initialBatch) {
      this.priorityQueue.push(f);
    }
    this.drainQueue();

    // 3. Keep background loading active gradually
    this.startBackgroundPump();
  }

  public prioritizeWindow(currentFrame: number, windowRadius = 12): void {
    const target = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(currentFrame)));
    const needed: number[] = [];

    // Prioritize forward direction first, then backward
    for (let r = 0; r <= windowRadius; r++) {
      const forward = target + r;
      if (forward <= TOTAL_FRAMES && !this.cache.has(forward) && !this.failed.has(forward)) {
        needed.push(forward);
      }
      if (r > 0) {
        const backward = target - r;
        if (backward >= 1 && !this.cache.has(backward) && !this.failed.has(backward)) {
          needed.push(backward);
        }
      }
    }

    // Prepend to priority queue (filter duplicates)
    for (let i = needed.length - 1; i >= 0; i--) {
      const frame = needed[i];
      const existingIdx = this.priorityQueue.indexOf(frame);
      if (existingIdx !== -1) {
        this.priorityQueue.splice(existingIdx, 1);
      }
      this.priorityQueue.unshift(frame);
    }

    this.drainQueue();
  }

  private drainQueue(): void {
    if (this.isDestroyed) return;

    while (this.activeConcurrency < this.maxConcurrency) {
      let nextFrame: number | undefined;

      if (this.priorityQueue.length > 0) {
        nextFrame = this.priorityQueue.shift();
      } else if (this.backgroundQueue.length > 0) {
        nextFrame = this.backgroundQueue.shift();
      }

      if (nextFrame === undefined) {
        break;
      }

      if (this.cache.has(nextFrame) || this.failed.has(nextFrame) || this.inflight.has(nextFrame)) {
        continue;
      }

      this.activeConcurrency++;
      this.loadSingleFrame(nextFrame, false)
        .finally(() => {
          this.activeConcurrency--;
          this.drainQueue();
        });
    }
  }

  private startBackgroundPump(): void {
    const interval = setInterval(() => {
      if (this.isDestroyed || this.loadedCount >= TOTAL_FRAMES) {
        clearInterval(interval);
        return;
      }
      this.drainQueue();
    }, 150);
  }

  private loadSingleFrame(frameNumber: number, isHighPriority = false): Promise<HTMLImageElement | null> {
    if (this.cache.has(frameNumber)) {
      return Promise.resolve(this.cache.get(frameNumber)!);
    }
    if (this.failed.has(frameNumber)) {
      return Promise.resolve(null);
    }
    if (this.inflight.has(frameNumber)) {
      return this.inflight.get(frameNumber)!;
    }

    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      if (typeof window === "undefined") {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = isHighPriority ? "sync" : "async";

      let settled = false;
      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.inflight.delete(frameNumber);
          // Don't permanently fail on timeout, can be retried if requested later
          resolve(null);
        }
      }, 15000);

      img.onload = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        this.cache.set(frameNumber, img);
        this.inflight.delete(frameNumber);
        this.loadedCount = this.cache.size;

        // Notify progress listeners
        const percent = this.getPercent();
        for (const cb of this.progressListeners) {
          cb(percent, this.loadedCount, TOTAL_FRAMES);
        }
        for (const cb of this.frameListeners) {
          cb(frameNumber, img);
        }

        resolve(img);
      };

      img.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        this.failed.add(frameNumber);
        this.inflight.delete(frameNumber);
        resolve(null);
      };

      img.src = getFrameUrl(frameNumber);
    });

    this.inflight.set(frameNumber, promise);
    return promise;
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.priorityQueue = [];
    this.backgroundQueue = [];
    this.progressListeners.clear();
    this.frameListeners.clear();
    this.inflight.clear();
  }
}

// Global singleton instance so state persists smoothly across re-renders
let instance: FrameLoaderService | null = null;

export function getFrameLoader(): FrameLoaderService {
  if (!instance) {
    instance = new FrameLoaderService();
  }
  return instance;
}
