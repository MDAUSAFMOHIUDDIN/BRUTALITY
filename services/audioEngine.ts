// Procedural Web Audio API soundscape - no external audio files required
class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public init(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start(): void {
    if (!this.init() || !this.ctx) return;
    this.isPlaying = true;

    // Master volume setup with smooth fade-in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.45, this.ctx.currentTime + 2.0);
    this.masterGain.connect(this.ctx.destination);

    // 1. Procedural Cold Rain Generator
    this.setupRain(this.masterGain);

    // 2. Cinematic Low Temple Wind / Sub Drone
    this.setupDrone(this.masterGain);

    // 3. Play initial cold blade strike chime
    this.playBladeChime();
  }

  private setupRain(destination: GainNode): void {
    if (!this.ctx) return;

    // Generate 5-second pink noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = noiseBuffer;
    this.rainSource.loop = true;

    // Filter to sound like rain on mud and wet thatch
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    this.rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(destination);

    this.rainSource.start();
  }

  private setupDrone(destination: GainNode): void {
    if (!this.ctx) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Deep brooding sub-tone (55Hz = A1)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = "sine";
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Harmonics (110Hz = A2) slightly detuned for tension
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = "triangle";
    this.droneOsc2.frequency.setValueAtTime(110.5, this.ctx.currentTime);

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.droneOsc1.connect(droneFilter);
    this.droneOsc2.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(destination);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  public playBladeChime(): void {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(6.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {
      // safe fallback
    }
  }

  public stop(): void {
    if (!this.ctx || !this.masterGain) {
      this.isPlaying = false;
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      setTimeout(() => {
        try {
          this.rainSource?.stop();
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
        } catch {
          // ignore
        }
        this.isPlaying = false;
      }, 850);
    } catch {
      this.isPlaying = false;
    }
  }
}

export const audioEngine = new CinematicAudioEngine();
