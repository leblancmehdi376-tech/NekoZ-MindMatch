let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  opts: { type?: OscillatorType; gain?: number; delay?: number } = {}
): void {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gainNode = audio.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.value = freq;
  const start = audio.currentTime + (opts.delay ?? 0);
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(opts.gain ?? 0.2, start + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gainNode);
  gainNode.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Short tick when a word is submitted. */
export function playSubmit(): void {
  tone(660, 0.08, { type: 'triangle', gain: 0.15 });
}

/** Confirmation blip when the host locks the reveal / points. */
export function playLock(): void {
  tone(440, 0.06, { gain: 0.15 });
  tone(660, 0.1, { delay: 0.06, gain: 0.15 });
}

/** Three-beat drumroll played right as a reveal appears, before the outcome sound. */
export function playDrumroll(): void {
  tone(200, 0.05, { type: 'square', gain: 0.08 });
  tone(200, 0.05, { type: 'square', gain: 0.08, delay: 0.18 });
  tone(200, 0.05, { type: 'square', gain: 0.08, delay: 0.36 });
}

/** Upbeat chime for a round where at least someone scored. */
export function playSuccess(): void {
  tone(523, 0.1, { type: 'triangle', gain: 0.18 });
  tone(659, 0.1, { delay: 0.08, type: 'triangle', gain: 0.18 });
  tone(784, 0.15, { delay: 0.16, type: 'triangle', gain: 0.18 });
}

/** Sad trombone for a round where nobody scored. */
export function playFail(): void {
  tone(220, 0.2, { type: 'sawtooth', gain: 0.12 });
  tone(180, 0.25, { delay: 0.12, type: 'sawtooth', gain: 0.12 });
}

/** Alarm-ish sting when a Chaos round begins. */
export function playChaosAlarm(): void {
  for (let i = 0; i < 4; i++) {
    tone(i % 2 === 0 ? 300 : 500, 0.12, { delay: i * 0.13, type: 'sawtooth', gain: 0.15 });
  }
}

/** End-of-game fanfare. */
export function playFanfare(): void {
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { delay: i * 0.12, type: 'triangle', gain: 0.2 }));
}
