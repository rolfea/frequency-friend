import type { SpelledNote } from './note.js';

// Standard B♭ trumpet fingerings by pitch class for lower and upper registers.
// Each tuple is [valve1, valve2, valve3] where 1 means depressed.
// Lower register: octaves 3 and 4 (written pitch, below staff to one-line octave).
// Upper register: octaves 5 and above.
const LOWER_REGISTER_FINGERINGS: Record<number, [number, number, number]> = {
  0: [0, 0, 0],  // C
  1: [1, 1, 1],  // C♯/D♭
  2: [1, 0, 1],  // D
  3: [0, 1, 1],  // D♯/E♭
  4: [1, 1, 0],  // E
  5: [1, 0, 0],  // F
  6: [0, 1, 0],  // F♯/G♭
  7: [0, 0, 0],  // G
  8: [0, 1, 1],  // G♯/A♭
  9: [1, 1, 0],  // A
  10: [1, 0, 0], // A♯/B♭
  11: [0, 1, 0], // B
};

const UPPER_REGISTER_FINGERINGS: Record<number, [number, number, number]> = {
  0: [0, 0, 0],  // C
  1: [1, 1, 0],  // C♯/D♭
  2: [1, 0, 0],  // D
  3: [0, 1, 0],  // D♯/E♭
  4: [0, 0, 0],  // E
  5: [1, 0, 0],  // F
  6: [0, 1, 0],  // F♯/G♭
  7: [0, 0, 0],  // G
  8: [0, 1, 1],  // G♯/A♭
  9: [1, 1, 0],  // A
  10: [1, 0, 0], // A♯/B♭
  11: [0, 1, 0], // B
};

export type Fingering = [number, number, number];

export interface FingeringOption {
  valves: Fingering;
  label: string;
}

function registerForOctave(octave: number): Record<number, [number, number, number]> {
  return octave >= 5 ? UPPER_REGISTER_FINGERINGS : LOWER_REGISTER_FINGERINGS;
}

export function fingeringForNote(note: SpelledNote): Fingering {
  const map = registerForOctave(note.octave);
  return map[note.pitchClass] ?? [0, 0, 0];
}

export function isCorrectFingering(note: SpelledNote, valves: Fingering): boolean {
  const correct = fingeringForNote(note);
  return valves.every((v, i) => v === correct[i]);
}

export function formatFingering(valves: Fingering): string {
  if (valves.every((v) => v === 0)) return 'Open';
  const labels: string[] = [];
  if (valves[0]) labels.push('1');
  if (valves[1]) labels.push('2');
  if (valves[2]) labels.push('3');
  return labels.join('+');
}

export function fingeringOptions(): FingeringOption[] {
  const combinations: Fingering[] = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ];
  return combinations.map((valves) => ({
    valves,
    label: formatFingering(valves) === 'Open' ? 'Open' : '',
  }));
}
