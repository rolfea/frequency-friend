export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface Note {
  midi: number;
  pitchClass: PitchClass;
  octave: number;
  accidentalDisplay: 'natural' | 'sharp' | 'flat';
}

export interface SpelledNote {
  midi: number;
  key: string;
  displayName: string;
  pitchClass: PitchClass;
  accidental: 'natural' | 'sharp' | 'flat';
}

export interface Config {
  floorMidi: number;
  ceilingMidi: number;
  includeAccidentals: boolean;
  sessionMode: 'cards' | 'minutes';
  cardsPerSession: number;
  sessionDurationMinutes: number;
}

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const ASCII_KEYS: Record<number, { sharp?: string; flat?: string }> = {
  0: { sharp: 'C' },
  1: { sharp: 'C#', flat: 'Db' },
  2: { sharp: 'D' },
  3: { sharp: 'D#', flat: 'Eb' },
  4: { sharp: 'E' },
  5: { sharp: 'F' },
  6: { sharp: 'F#', flat: 'Gb' },
  7: { sharp: 'G' },
  8: { sharp: 'G#', flat: 'Ab' },
  9: { sharp: 'A' },
  10: { sharp: 'A#', flat: 'Bb' },
  11: { sharp: 'B' },
};

export function pitchClassToName(pc: PitchClass, useSharps: boolean): string {
  return useSharps ? SHARP_NAMES[pc] : FLAT_NAMES[pc];
}

export function noteKey(note: SpelledNote): string {
  return note.key;
}

export function spellNote(
  midi: number,
  accidental: 'natural' | 'sharp' | 'flat',
): SpelledNote {
  const pitchClass = (midi % 12) as PitchClass;
  const octave = Math.floor(midi / 12) - 1;
  const names = ASCII_KEYS[pitchClass];
  const ascii = accidental === 'flat' && names.flat ? names.flat : names.sharp!;
  const display = pitchClassToName(pitchClass, accidental !== 'flat');
  return {
    midi,
    key: `${ascii}${octave}`,
    displayName: `${display}${octave}`,
    pitchClass,
    accidental,
  };
}

export function notePool(config: {
  floorMidi: number;
  ceilingMidi: number;
  includeAccidentals: boolean;
}): SpelledNote[] {
  const notes: SpelledNote[] = [];
  for (let midi = config.floorMidi; midi <= config.ceilingMidi; midi++) {
    const pitchClass = (midi % 12) as PitchClass;
    const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(pitchClass);
    if (isNatural) {
      notes.push(spellNote(midi, 'natural'));
    } else if (config.includeAccidentals) {
      notes.push(spellNote(midi, 'sharp'));
      notes.push(spellNote(midi, 'flat'));
    }
  }
  return notes;
}
