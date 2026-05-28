// Web Audio noise / ambient sound engine — all sounds synthesized from scratch.
import type { SoundId } from "./sounds";

interface Track {
  id: SoundId;
  gain: GainNode;
  cleanup: () => void;
}

const BUFFER_LENGTH_SECONDS = 4; // 4-second looped buffer for noise sources

// ─── Buffer fillers ───────────────────────────────────────────────────────

function fillWhiteNoise(buffer: AudioBuffer) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
}

// Paul Kellet's pink-noise algorithm
function fillPinkNoise(buffer: AudioBuffer) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
}

// Brown noise — random walk (integrated white)
function fillBrownNoise(buffer: AudioBuffer) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
}

// Blue noise — high-frequency emphasis (differentiator)
function fillBlueNoise(buffer: AudioBuffer) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    let prev = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      const v = w - prev;
      prev = w;
      data[i] = v * 0.5;
    }
  }
}

// Gray noise — approximate equal-loudness curve (psychoacoustic weighting).
// We approximate by combining pink + a bit of high shelf.
function fillGrayNoise(buffer: AudioBuffer) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029591;
      b1 = 0.985 * b1 + w * 0.032534;
      b2 = 0.95 * b2 + w * 0.048056;
      data[i] = (b0 + b1 + b2 + w * 0.18) * 0.5;
    }
  }
}

const FILL: Record<string, (buf: AudioBuffer) => void> = {
  white: fillWhiteNoise,
  pink: fillPinkNoise,
  brown: fillBrownNoise,
  blue: fillBlueNoise,
  gray: fillGrayNoise,
};

// ─── Engine ───────────────────────────────────────────────────────────────

export class NoiseEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private tracks = new Map<SoundId, Track>();
  private noiseBuffers = new Map<string, AudioBuffer>();
  private masterFadeNode: GainNode | null = null;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctx();
      this.masterFadeNode = this.ctx.createGain();
      this.masterFadeNode.gain.value = 1;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterFadeNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  private getOrCreateNoiseBuffer(
    color: "white" | "pink" | "brown" | "blue" | "gray",
  ): AudioBuffer {
    if (this.noiseBuffers.has(color)) return this.noiseBuffers.get(color)!;
    const ctx = this.ensureCtx();
    const buffer = ctx.createBuffer(
      2,
      Math.floor(ctx.sampleRate * BUFFER_LENGTH_SECONDS),
      ctx.sampleRate,
    );
    FILL[color](buffer);
    this.noiseBuffers.set(color, buffer);
    return buffer;
  }

  // Build the audio graph for a given sound id
  private createTrack(id: SoundId): Track {
    const ctx = this.ensureCtx();
    const trackGain = ctx.createGain();
    trackGain.gain.value = 0;
    trackGain.connect(this.masterFadeNode!);

    let cleanup = () => {
      try {
        trackGain.disconnect();
      } catch {
        /* noop */
      }
    };

    switch (id) {
      case "white":
      case "pink":
      case "brown":
      case "blue":
      case "gray": {
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer(id);
        src.loop = true;
        src.connect(trackGain);
        src.start();
        cleanup = () => {
          try {
            src.stop();
          } catch {
            /* noop */
          }
          src.disconnect();
          trackGain.disconnect();
        };
        break;
      }

      case "rain": {
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("pink");
        src.loop = true;
        const highPass = ctx.createBiquadFilter();
        highPass.type = "highpass";
        highPass.frequency.value = 400;
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = "lowpass";
        lowPass.frequency.value = 7000;

        // Subtle LFO on lowpass cutoff for breathing variation
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.13;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 1200;
        lfo.connect(lfoGain);
        lfoGain.connect(lowPass.frequency);
        lfo.start();

        src.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(trackGain);
        src.start();

        cleanup = () => {
          try { src.stop(); } catch { /* noop */ }
          try { lfo.stop(); } catch { /* noop */ }
          src.disconnect();
          highPass.disconnect();
          lowPass.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
          trackGain.disconnect();
        };
        break;
      }

      case "wind": {
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("brown");
        src.loop = true;
        const bandPass = ctx.createBiquadFilter();
        bandPass.type = "bandpass";
        bandPass.frequency.value = 600;
        bandPass.Q.value = 0.7;

        // Slow LFO on bandpass frequency for gusts
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 400;
        lfo.connect(lfoGain);
        lfoGain.connect(bandPass.frequency);
        lfo.start();

        // Amplitude LFO for breath-like ebb and flow
        const ampLfo = ctx.createOscillator();
        ampLfo.frequency.value = 0.06;
        const ampLfoGain = ctx.createGain();
        ampLfoGain.gain.value = 0.4;
        ampLfo.connect(ampLfoGain);

        const intermediate = ctx.createGain();
        intermediate.gain.value = 0.6;
        ampLfoGain.connect(intermediate.gain);
        ampLfo.start();

        src.connect(bandPass);
        bandPass.connect(intermediate);
        intermediate.connect(trackGain);
        src.start();

        cleanup = () => {
          try { src.stop(); } catch { /* noop */ }
          try { lfo.stop(); ampLfo.stop(); } catch { /* noop */ }
          [src, bandPass, intermediate, lfo, lfoGain, ampLfo, ampLfoGain, trackGain].forEach((n) => n.disconnect());
        };
        break;
      }

      case "ocean": {
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("brown");
        src.loop = true;
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = "lowpass";
        lowPass.frequency.value = 1200;

        // Very slow LFO (~10s period) for wave swell
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.55;
        lfo.connect(lfoGain);
        const swell = ctx.createGain();
        swell.gain.value = 0.55;
        lfoGain.connect(swell.gain);
        lfo.start();

        src.connect(lowPass);
        lowPass.connect(swell);
        swell.connect(trackGain);
        src.start();

        cleanup = () => {
          try { src.stop(); lfo.stop(); } catch { /* noop */ }
          [src, lowPass, swell, lfo, lfoGain, trackGain].forEach((n) => n.disconnect());
        };
        break;
      }

      case "fan": {
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("brown");
        src.loop = true;
        const highPass = ctx.createBiquadFilter();
        highPass.type = "highpass";
        highPass.frequency.value = 100;
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = "lowpass";
        lowPass.frequency.value = 2800;
        src.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(trackGain);
        src.start();
        cleanup = () => {
          try { src.stop(); } catch { /* noop */ }
          [src, highPass, lowPass, trackGain].forEach((n) => n.disconnect());
        };
        break;
      }

      case "fireplace": {
        // Brown noise base + random crackle pops
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("brown");
        src.loop = true;
        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = "lowpass";
        bodyFilter.frequency.value = 1200;
        src.connect(bodyFilter);
        bodyFilter.connect(trackGain);
        src.start();

        // Periodic crackle scheduler
        const crackleBuf = this.getOrCreateNoiseBuffer("white");
        const cancelled = { v: false };
        const scheduleCrackle = () => {
          if (cancelled.v) return;
          const now = ctx.currentTime;
          const crackleSrc = ctx.createBufferSource();
          crackleSrc.buffer = crackleBuf;
          // play a tiny snippet
          const startOffset = Math.random() * (crackleBuf.duration - 0.1);
          const crackleFilter = ctx.createBiquadFilter();
          crackleFilter.type = "highpass";
          crackleFilter.frequency.value = 2000 + Math.random() * 2000;
          const env = ctx.createGain();
          env.gain.setValueAtTime(0, now);
          env.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.2, now + 0.005);
          env.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + Math.random() * 0.1);
          crackleSrc.connect(crackleFilter);
          crackleFilter.connect(env);
          env.connect(trackGain);
          crackleSrc.start(now, startOffset, 0.2);
          // schedule next
          window.setTimeout(scheduleCrackle, 80 + Math.random() * 600);
        };
        scheduleCrackle();

        cleanup = () => {
          cancelled.v = true;
          try { src.stop(); } catch { /* noop */ }
          [src, bodyFilter, trackGain].forEach((n) => n.disconnect());
        };
        break;
      }

      case "coffee": {
        // Pink noise + sporadic short noise blips for chatter / clinks
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("pink");
        src.loop = true;
        const bandFilter = ctx.createBiquadFilter();
        bandFilter.type = "bandpass";
        bandFilter.frequency.value = 800;
        bandFilter.Q.value = 0.4;
        src.connect(bandFilter);
        bandFilter.connect(trackGain);
        src.start();

        const cancelled = { v: false };
        const blipBuf = this.getOrCreateNoiseBuffer("white");
        const scheduleBlip = () => {
          if (cancelled.v) return;
          const now = ctx.currentTime;
          const blip = ctx.createBufferSource();
          blip.buffer = blipBuf;
          const f = ctx.createBiquadFilter();
          f.type = "bandpass";
          f.frequency.value = 1500 + Math.random() * 3000;
          f.Q.value = 1.5;
          const env = ctx.createGain();
          env.gain.setValueAtTime(0, now);
          env.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.06, now + 0.02);
          env.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          blip.connect(f);
          f.connect(env);
          env.connect(trackGain);
          blip.start(now, Math.random() * (blipBuf.duration - 0.4), 0.4);
          window.setTimeout(scheduleBlip, 300 + Math.random() * 1800);
        };
        scheduleBlip();

        cleanup = () => {
          cancelled.v = true;
          try { src.stop(); } catch { /* noop */ }
          [src, bandFilter, trackGain].forEach((n) => n.disconnect());
        };
        break;
      }

      case "heartbeat": {
        // Two low-frequency oscillator bumps per beat at ~60 BPM
        const cancelled = { v: false };
        const scheduleBeat = () => {
          if (cancelled.v) return;
          const now = ctx.currentTime;
          const playBump = (offset: number, freq: number, amp: number) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;
            const env = ctx.createGain();
            env.gain.setValueAtTime(0, now + offset);
            env.gain.linearRampToValueAtTime(amp, now + offset + 0.02);
            env.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
            osc.connect(env);
            env.connect(trackGain);
            osc.start(now + offset);
            osc.stop(now + offset + 0.2);
          };
          playBump(0, 65, 0.5);
          playBump(0.18, 55, 0.35);
          window.setTimeout(scheduleBeat, 1000); // 60 BPM
        };
        scheduleBeat();
        cleanup = () => {
          cancelled.v = true;
          trackGain.disconnect();
        };
        break;
      }

      case "crickets": {
        // High-frequency periodic chirps
        const cancelled = { v: false };
        const scheduleChirp = () => {
          if (cancelled.v) return;
          const now = ctx.currentTime;
          const chirpCount = 3 + Math.floor(Math.random() * 4);
          for (let i = 0; i < chirpCount; i++) {
            const t = now + i * 0.04;
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = 4200 + Math.random() * 800;
            const env = ctx.createGain();
            env.gain.setValueAtTime(0, t);
            env.gain.linearRampToValueAtTime(0.04, t + 0.005);
            env.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
            const f = ctx.createBiquadFilter();
            f.type = "bandpass";
            f.frequency.value = 5000;
            f.Q.value = 5;
            osc.connect(f);
            f.connect(env);
            env.connect(trackGain);
            osc.start(t);
            osc.stop(t + 0.03);
          }
          window.setTimeout(scheduleChirp, 500 + Math.random() * 1500);
        };
        scheduleChirp();
        cleanup = () => {
          cancelled.v = true;
          trackGain.disconnect();
        };
        break;
      }

      case "hum": {
        // Pink noise through a narrow bandpass at 60 Hz
        const src = ctx.createBufferSource();
        src.buffer = this.getOrCreateNoiseBuffer("pink");
        src.loop = true;
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 60;
        band.Q.value = 8;
        // Add a soft sine reinforcement
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 60;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.06;
        osc.connect(oscGain);
        oscGain.connect(trackGain);
        osc.start();
        src.connect(band);
        band.connect(trackGain);
        src.start();
        cleanup = () => {
          try { src.stop(); osc.stop(); } catch { /* noop */ }
          [src, band, osc, oscGain, trackGain].forEach((n) => n.disconnect());
        };
        break;
      }
    }

    return { id, gain: trackGain, cleanup };
  }

  isPlaying(id: SoundId): boolean {
    return this.tracks.has(id);
  }

  setVolume(id: SoundId, vol: number) {
    const track = this.tracks.get(id);
    if (!track || !this.ctx) return;
    const v = Math.max(0, Math.min(1, vol));
    track.gain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.05);
  }

  play(id: SoundId, vol = 0.5) {
    if (this.tracks.has(id)) {
      this.setVolume(id, vol);
      return;
    }
    const track = this.createTrack(id);
    this.tracks.set(id, track);
    // fade in
    const ctx = this.ensureCtx();
    track.gain.gain.cancelScheduledValues(ctx.currentTime);
    track.gain.gain.setValueAtTime(0, ctx.currentTime);
    track.gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.4);
  }

  stop(id: SoundId, fadeSec = 0.3) {
    const track = this.tracks.get(id);
    if (!track || !this.ctx) return;
    const ctx = this.ctx;
    track.gain.gain.cancelScheduledValues(ctx.currentTime);
    track.gain.gain.setValueAtTime(track.gain.gain.value, ctx.currentTime);
    track.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeSec);
    const id2 = id;
    window.setTimeout(() => {
      const t = this.tracks.get(id2);
      if (t) {
        t.cleanup();
        this.tracks.delete(id2);
      }
    }, fadeSec * 1000 + 50);
  }

  stopAll(fadeSec = 0.4) {
    for (const id of this.tracks.keys()) this.stop(id, fadeSec);
  }

  setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    const v = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.05);
  }

  // Master fade — used by sleep timer
  fadeOut(seconds: number) {
    if (!this.masterFadeNode || !this.ctx) return;
    const ctx = this.ctx;
    this.masterFadeNode.gain.cancelScheduledValues(ctx.currentTime);
    this.masterFadeNode.gain.setValueAtTime(
      this.masterFadeNode.gain.value,
      ctx.currentTime,
    );
    this.masterFadeNode.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
  }

  resetFade() {
    if (!this.masterFadeNode || !this.ctx) return;
    const ctx = this.ctx;
    this.masterFadeNode.gain.cancelScheduledValues(ctx.currentTime);
    this.masterFadeNode.gain.setValueAtTime(1, ctx.currentTime);
  }

  destroy() {
    this.stopAll(0);
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.masterGain = null;
    this.masterFadeNode = null;
    this.noiseBuffers.clear();
    this.tracks.clear();
  }
}
