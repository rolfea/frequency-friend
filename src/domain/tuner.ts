import { pitchClassToName, type PitchClass } from './note.js';
import { TRANSPOSITIONS, type Transposition } from './transposition.js';

export function midiToFrequency(midi: number, transposition?: Transposition): number {
  const semitones = transposition?.semitones ?? 0;
  return 440 * Math.pow(2, (midi + semitones - 69) / 12);
}

export function centsDifference(detected: number, target: number): number {
  return 1200 * Math.log2(detected / target);
}

export function frequencyToMidi(frequency: number, a4 = 440): number {
  return 69 + 12 * Math.log2(frequency / a4);
}

export function noteNameFromFrequency(frequency: number, transposition?: Transposition, a4 = 440): string {
  const midi = Math.round(frequencyToMidi(frequency, a4));
  const semitones = transposition ? -transposition.semitones : 0;
  const transposedMidi = midi + semitones;
  const pitchClass = (transposedMidi % 12) as PitchClass;
  const octave = Math.floor(transposedMidi / 12) - 1;
  return `${pitchClassToName(pitchClass, true)}${octave}`;
}

export class FrequencyBuffer {
  private readonly capacity: number;
  private readonly values: number[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  add(value: number | null): number | null {
    if (value == null) return this.median();
    this.values.push(value);
    if (this.values.length > this.capacity) {
      this.values.shift();
    }
    return this.median();
  }

  median(): number | null {
    if (this.values.length === 0) return null;
    const sorted = [...this.values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1
      ? sorted[mid]!
      : (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
}

export interface TunerReading {
  frequency: number | null;
  noteName: string | null;
  cents: number | null;
  inTune: boolean;
}

export function readTuner(
  detected: number | null,
  target: number,
  toleranceCents: number,
  buffer: FrequencyBuffer,
  transposition?: Transposition,
): TunerReading {
  const frequency = buffer.add(detected);
  if (frequency == null) {
    return { frequency: null, noteName: null, cents: null, inTune: false };
  }
  const cents = centsDifference(frequency, target);
  return {
    frequency,
    noteName: noteNameFromFrequency(frequency, transposition),
    cents,
    inTune: Math.abs(cents) <= toleranceCents,
  };
}

export function autocorrelationPitch(samples: Float32Array, sampleRate: number): number | null {
  const n = samples.length;
  const rms = Math.sqrt(Array.from(samples).reduce((sum, v) => sum + v * v, 0) / n);
  if (rms < 0.001) return null;

  const minLag = Math.floor(sampleRate / 2000); // max detectable ~2 kHz
  const maxLag = Math.floor(sampleRate / 50); // min detectable ~50 Hz

  const correlations: number[] = [];

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < n - lag; i++) {
      correlation += samples[i] * samples[i + lag];
    }
    correlations[lag] = correlation;
  }

  let bestLag = minLag;
  let bestCorrelation = correlations[minLag] ?? -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (correlations[lag] > bestCorrelation) {
      bestCorrelation = correlations[lag];
      bestLag = lag;
    }
  }

  if (bestLag <= minLag || bestLag >= maxLag) return null;

  // Parabolic interpolation of the autocorrelation peak for sub-lag precision.
  const alpha = correlations[bestLag - 1];
  const beta = correlations[bestLag];
  const gamma = correlations[bestLag + 1];
  const denominator = alpha - 2 * beta + gamma;
  const peakOffset = denominator !== 0 ? 0.5 * (alpha - gamma) / denominator : 0;
  const refinedLag = bestLag + peakOffset;

  return sampleRate / refinedLag;
}

export function isPitchInTune(detected: number | null, target: number, toleranceCents: number): boolean {
  if (detected == null) return false;
  return Math.abs(centsDifference(detected, target)) <= toleranceCents;
}
