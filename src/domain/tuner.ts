export function midiToFrequency(midi: number, transposeForBbTrumpet: boolean): number {
  const transposedMidi = transposeForBbTrumpet ? midi - 2 : midi;
  return 440 * Math.pow(2, (transposedMidi - 69) / 12);
}

export function centsDifference(detected: number, target: number): number {
  return 1200 * Math.log2(detected / target);
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
