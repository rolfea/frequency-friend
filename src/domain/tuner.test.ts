import { describe, expect, it } from 'vitest';
import { autocorrelationPitch, centsDifference, isPitchInTune, midiToFrequency } from './tuner.js';

function generateSine(frequency: number, sampleRate: number, durationSeconds: number): Float32Array {
  const samples = new Float32Array(sampleRate * durationSeconds);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }
  return samples;
}

describe('midiToFrequency', () => {
  it('returns A440 for A4', () => {
    expect(midiToFrequency(69, false)).toBeCloseTo(440, 1);
  });

  it('transposes down a whole step for Bb trumpet', () => {
    expect(midiToFrequency(69, true)).toBeCloseTo(391.995, 1); // G4
  });
});

describe('centsDifference', () => {
  it('returns 0 for identical frequencies', () => {
    expect(centsDifference(440, 440)).toBe(0);
  });

  it('returns positive cents for sharp', () => {
    expect(centsDifference(466.16, 440)).toBeCloseTo(100, 0);
  });

  it('returns negative cents for flat', () => {
    expect(centsDifference(415.3, 440)).toBeCloseTo(-100, 0);
  });
});

describe('autocorrelationPitch', () => {
  it('detects A440', () => {
    const samples = generateSine(440, 44100, 0.2);
    const pitch = autocorrelationPitch(samples, 44100);
    expect(pitch).toBeCloseTo(440, 0);
  });

  it('detects C4', () => {
    const samples = generateSine(261.63, 44100, 0.2);
    const pitch = autocorrelationPitch(samples, 44100);
    expect(pitch).toBeCloseTo(261.63, 0);
  });

  it('returns null for silence', () => {
    const samples = new Float32Array(4410);
    expect(autocorrelationPitch(samples, 44100)).toBeNull();
  });
});

describe('isPitchInTune', () => {
  it('accepts in-tolerance pitch', () => {
    expect(isPitchInTune(445, 440, 50)).toBe(true);
  });

  it('rejects out-of-tolerance pitch', () => {
    expect(isPitchInTune(466, 440, 50)).toBe(false);
  });

  it('rejects null', () => {
    expect(isPitchInTune(null, 440, 50)).toBe(false);
  });
});
