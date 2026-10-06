// Procedural Web Audio API Sound Engine (zero external audio files needed)
import { safeStorage } from './safeStorage';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    try {
      const saved = safeStorage.getItem('research_sound_enabled');
      this.enabled = saved !== null ? saved === 'true' : true;
    } catch {
      this.enabled = true;
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      safeStorage.setItem('research_sound_enabled', String(this.enabled));
    } catch {}
    if (this.enabled) {
      this.playChirp();
    }
    return this.enabled;
  }

  // Futuristic micro-click
  public playClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  // Gentle high-tech chirp on selection
  public playChirp() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Holographic sweep when agent step advances
  public playAgentSweep(stepIndex: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const freqs = [520, 650, 780, 960, 1200];
      const baseFreq = freqs[Math.min(stepIndex - 1, freqs.length - 1)] || 600;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  // Success resonant chord upon report completion
  public playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major triumph
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + 0.6);
      });
    } catch {}
  }
}

export const sounds = new SoundEngine();
