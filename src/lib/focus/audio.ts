/**
 * Ambient sound and chimes, generated live with the Web Audio API.
 * No audio files are used, so there is nothing to license or download.
 *
 * - brown: integrated white noise (deep, steady rumble)
 * - rain: band-passed noise with slow intensity swells plus sparse "drops"
 * - cafe: speech-band noise with irregular swells (a murmur approximation)
 *   and the occasional soft cup clink
 */

import type { AmbientSound } from './storage';

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let current: { stop: () => void; kind: AmbientSound } | null = null;
let volume = 0.5;

function context(): Ctx | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume * 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call from a user gesture (e.g. the Start button) so audio is allowed later. */
export function unlockAudio(): void {
  context();
}

function noiseBuffer(c: Ctx, kind: 'white' | 'brown' | 'pink', seconds = 4): AudioBuffer {
  const length = Math.floor(c.sampleRate * seconds);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else if (kind === 'pink') {
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2;
    } else {
      data[i] = white * 0.5;
    }
  }
  return buffer;
}

function loop(c: Ctx, buffer: AudioBuffer): AudioBufferSourceNode {
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
}

/** Slow random swell on a gain parameter. */
function swell(c: Ctx, param: AudioParam, base: number, depth: number, minSec: number, maxSec: number): () => void {
  let timer = 0;
  const step = () => {
    const dur = minSec + Math.random() * (maxSec - minSec);
    param.linearRampToValueAtTime(Math.max(0, base + (Math.random() * 2 - 1) * depth), c.currentTime + dur);
    timer = window.setTimeout(step, dur * 1000);
  };
  step();
  return () => window.clearTimeout(timer);
}

function startBrown(c: Ctx, out: AudioNode): () => void {
  const src = loop(c, noiseBuffer(c, 'brown', 6));
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  src.connect(lp).connect(out);
  src.start();
  return () => src.stop();
}

function startRain(c: Ctx, out: AudioNode): () => void {
  const src = loop(c, noiseBuffer(c, 'pink', 5));
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 600;
  const bp = c.createBiquadFilter();
  bp.type = 'peaking';
  bp.frequency.value = 3200;
  bp.gain.value = 5;
  const g = c.createGain();
  g.gain.value = 0.7;
  src.connect(hp).connect(bp).connect(g).connect(out);
  src.start();
  const stopSwell = swell(c, g.gain, 0.7, 0.2, 2, 6);
  // Sparse droplets: very short filtered clicks.
  const dropBuffer = noiseBuffer(c, 'white', 0.03);
  let timer = 0;
  const drop = () => {
    const s = c.createBufferSource();
    s.buffer = dropBuffer;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800 + Math.random() * 3000;
    const dg = c.createGain();
    dg.gain.value = 0.15 + Math.random() * 0.2;
    s.connect(f).connect(dg).connect(out);
    s.start();
    timer = window.setTimeout(drop, 40 + Math.random() * 260);
  };
  drop();
  return () => {
    src.stop();
    stopSwell();
    window.clearTimeout(timer);
  };
}

function startCafe(c: Ctx, out: AudioNode): () => void {
  // Several overlapping "voices": speech-band noise with independent swells.
  const stops: (() => void)[] = [];
  const pink = noiseBuffer(c, 'pink', 5);
  for (let i = 0; i < 3; i++) {
    const src = loop(c, pink);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 350 + i * 260;
    bp.Q.value = 1.4;
    const g = c.createGain();
    g.gain.value = 0.35;
    src.connect(bp).connect(g).connect(out);
    src.start(c.currentTime + i * 0.37);
    stops.push(() => src.stop(), swell(c, g.gain, 0.35, 0.3, 0.25, 1.2));
  }
  // Room tone underneath.
  const room = loop(c, noiseBuffer(c, 'brown', 6));
  const rg = c.createGain();
  rg.gain.value = 0.3;
  room.connect(rg).connect(out);
  room.start();
  stops.push(() => room.stop());
  // Occasional soft clink of a cup.
  let timer = 0;
  const clink = () => {
    playTone(c, out, 2400 + Math.random() * 900, 0.05, 0.6);
    timer = window.setTimeout(clink, 6000 + Math.random() * 14000);
  };
  timer = window.setTimeout(clink, 3000);
  stops.push(() => window.clearTimeout(timer));
  return () => stops.forEach((s) => s());
}

function playTone(c: Ctx, out: AudioNode, freq: number, peak: number, seconds: number, when = 0): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t = c.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + seconds + 0.05);
}

/** Starts (or switches) the ambient sound; 'off' stops it. */
export function playAmbient(kind: AmbientSound): void {
  if (current?.kind === kind) return;
  stopAmbient();
  if (kind === 'off') return;
  const c = context();
  if (!c || !master) return;
  const stop = kind === 'brown' ? startBrown(c, master) : kind === 'rain' ? startRain(c, master) : startCafe(c, master);
  current = { kind, stop };
}

export function stopAmbient(): void {
  try {
    current?.stop();
  } catch {
    /* already stopped */
  }
  current = null;
}

export function setVolume(value: number): void {
  volume = Math.min(1, Math.max(0, value));
  if (master && ctx) master.gain.setTargetAtTime(volume * 0.6, ctx.currentTime, 0.05);
}

/** A soft three-note chime for the end of a block. */
export function playChime(): void {
  const c = context();
  if (!c) return;
  const out = c.destination;
  [659.25, 783.99, 1046.5].forEach((f, i) => playTone(c, out, f, 0.12, 1.4, i * 0.18));
}

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
}
