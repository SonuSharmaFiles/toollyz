// ─── Audio engine helpers ────────────────────────────────────────────────

export interface AudioAnalysis {
  peak: number;          // 0..1 amplitude
  rms: number;           // 0..1 amplitude
  peakDb: number;        // dBFS
  rmsDb: number;         // dBFS
  durationSec: number;
  channels: number;
  sampleRate: number;
}

export interface BoostOptions {
  gain: number;             // multiplier (1 = 100%)
  normalize: boolean;
  softClip: boolean;        // tanh-style limiter instead of hard clip
  bassEnhance: boolean;
  voiceClarity: boolean;
  stereoBoost: boolean;
}

// dBFS = 20 * log10(amplitude). Returns -Infinity for 0.
export function toDb(amp: number): number {
  if (amp <= 0) return -Infinity;
  return 20 * Math.log10(amp);
}

export function fromDb(db: number): number {
  return Math.pow(10, db / 20);
}

export function analyzeBuffer(buffer: AudioBuffer): AudioAnalysis {
  let peak = 0;
  let sumSq = 0;
  let count = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      const a = v >= 0 ? v : -v;
      if (a > peak) peak = a;
      sumSq += v * v;
      count++;
    }
  }
  const rms = Math.sqrt(sumSq / Math.max(count, 1));
  return {
    peak,
    rms,
    peakDb: toDb(peak),
    rmsDb: toDb(rms),
    durationSec: buffer.duration,
    channels: buffer.numberOfChannels,
    sampleRate: buffer.sampleRate,
  };
}

export interface ClippingInfo {
  willClip: boolean;
  postPeak: number;
  postPeakDb: number;
  risk: "safe" | "medium" | "high";
}

// Predicts what the peak will be after gain (and softClip if enabled)
export function predictClipping(
  analysis: AudioAnalysis,
  opts: { gain: number; softClip: boolean; normalize: boolean },
): ClippingInfo {
  let postPeak: number;
  if (opts.normalize) {
    // normalize → reset peak to 0.95 before gain (effectively constrained)
    postPeak = 0.95;
  } else {
    postPeak = analysis.peak * opts.gain;
  }
  // Soft-clip keeps it under 1 mathematically (tanh)
  if (opts.softClip && postPeak > 0.9) postPeak = Math.min(postPeak, 0.99);

  const willClip = postPeak >= 1 - 1e-3;
  let risk: ClippingInfo["risk"] = "safe";
  if (postPeak > 0.99) risk = "high";
  else if (postPeak > 0.85) risk = "medium";
  return { willClip, postPeak, postPeakDb: toDb(postPeak), risk };
}

// ─── Waveform peaks (downsampled min/max per pixel column) ───────────────

export function downsamplePeaks(
  buffer: AudioBuffer,
  pixels: number,
): { min: Float32Array; max: Float32Array } {
  const channel = buffer.getChannelData(0);
  const samplesPerPixel = Math.max(1, Math.floor(channel.length / pixels));
  const min = new Float32Array(pixels);
  const max = new Float32Array(pixels);
  for (let p = 0; p < pixels; p++) {
    const start = p * samplesPerPixel;
    const end = Math.min(start + samplesPerPixel, channel.length);
    let lo = 1;
    let hi = -1;
    for (let i = start; i < end; i++) {
      const s = channel[i];
      if (s < lo) lo = s;
      if (s > hi) hi = s;
    }
    if (start >= end) {
      lo = 0;
      hi = 0;
    }
    min[p] = lo;
    max[p] = hi;
  }
  return { min, max };
}

// ─── Offline render with all enabled effects ─────────────────────────────

export async function renderBoosted(
  buffer: AudioBuffer,
  opts: BoostOptions,
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate,
  );

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  // Build the processing chain
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: AudioNode = src;

  // 1. Normalize gain (apply pre-gain to bring peak to 0.95 first)
  if (opts.normalize) {
    const analysis = analyzeBuffer(buffer);
    if (analysis.peak > 0) {
      const normGain = ctx.createGain();
      normGain.gain.value = 0.95 / analysis.peak;
      node.connect(normGain);
      node = normGain;
    }
  }

  // 2. Bass enhancement
  if (opts.bassEnhance) {
    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 200;
    bass.gain.value = 6;
    node.connect(bass);
    node = bass;
  }

  // 3. Voice clarity (peaking around presence range)
  if (opts.voiceClarity) {
    const voice = ctx.createBiquadFilter();
    voice.type = "peaking";
    voice.frequency.value = 3000;
    voice.Q.value = 1;
    voice.gain.value = 4;
    node.connect(voice);
    node = voice;
  }

  // 4. Main boost gain
  const mainGain = ctx.createGain();
  mainGain.gain.value = opts.gain;
  node.connect(mainGain);
  node = mainGain;

  // 5. Soft-clip via WaveShaper (tanh-based limiter)
  if (opts.softClip) {
    const shaper = ctx.createWaveShaper();
    // Cast through unknown to bridge the strict TS DOM lib Float32Array<ArrayBuffer> requirement
    shaper.curve = makeSoftClipCurve(2048) as unknown as Float32Array<ArrayBuffer>;
    shaper.oversample = "2x";
    node.connect(shaper);
    node = shaper;
  }

  // 6. Stereo width (only meaningful for 2+ channel)
  if (opts.stereoBoost && buffer.numberOfChannels >= 2) {
    // Simple width: pan harder — use a StereoPannerNode chain? Skipped for now.
    // Light stereo enhancement via slight L/R delay would require ChannelSplitter.
    // For predictability, no-op when not implemented.
  }

  node.connect(ctx.destination);
  src.start();
  return await ctx.startRendering();
}

function makeSoftClipCurve(samples: number): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1; // -1..1
    // tanh-based soft saturation
    curve[i] = Math.tanh(x * 1.5);
  }
  return curve;
}

// ─── WAV encoder ─────────────────────────────────────────────────────────

export function bufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2; // 16-bit PCM
  const dataSize = length * numChannels * bytesPerSample;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Gather channels
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let s = channels[c][i];
      if (s > 1) s = 1;
      else if (s < -1) s = -1;
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

// ─── Format helpers ──────────────────────────────────────────────────────

export function formatDuration(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDb(db: number): string {
  if (!isFinite(db)) return "−∞ dB";
  return `${db > 0 ? "+" : ""}${db.toFixed(1)} dB`;
}
