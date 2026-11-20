import type { SpelledNote } from './note.js';

// Standard B♭ trumpet fingerings indexed by pitch class.
// Each tuple is [valve1, valve2, valve3] where 1 means depressed.
const FINGERINGS_BY_PITCH_CLASS: Record<number, [number, number, number]> = {
  0: [0, 0, 0],  // C
  1: [1, 0, 1],  // C♯/D♭
  2: [1, 0, 0],  // D
  3: [1, 1, 0],  // D♯/E♭
  4: [0, 1, 0],  // E
  5: [0, 0, 1],  // F
  6: [0, 1, 1],  // F♯/G♭
  7: [0, 0, 0],  // G
  8: [1, 0, 0],  // G♯/A♭
  9: [0, 1, 0],  // A
  10: [1, 0, 1], // A♯/B♭
  11: [1, 1, 0], // B
};

export type Fingering = [number, number, number];

export interface FingeringOption {
  valves: Fingering;
  label: string;
}

export function fingeringForNote(note: SpelledNote): Fingering {
  return FINGERINGS_BY_PITCH_CLASS[note.pitchClass] ?? [0, 0, 0];
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
