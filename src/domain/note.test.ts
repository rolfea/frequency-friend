import { describe, expect, it } from 'vitest';
import { notePool, pitchClassToName, noteKey, spellNote } from './note.js';

describe('pitchClassToName', () => {
  it('returns natural names for white-key pitch classes', () => {
    expect(pitchClassToName(0, true)).toBe('C');
    expect(pitchClassToName(2, true)).toBe('D');
    expect(pitchClassToName(4, true)).toBe('E');
  });

  it('prefers sharps when requested', () => {
    expect(pitchClassToName(1, true)).toBe('C♯');
    expect(pitchClassToName(6, true)).toBe('F♯');
    expect(pitchClassToName(10, true)).toBe('A♯');
  });

  it('prefers flats when requested', () => {
    expect(pitchClassToName(1, false)).toBe('D♭');
    expect(pitchClassToName(6, false)).toBe('G♭');
    expect(pitchClassToName(10, false)).toBe('B♭');
  });
});

describe('spellNote', () => {
  it('returns C#4 for a sharp spelling of midi 61', () => {
    const spelled = spellNote(61, 'sharp');
    expect(spelled.key).toBe('C#4');
    expect(spelled.displayName).toBe('C♯4');
    expect(spelled.pitchClass).toBe(1);
  });

  it('returns Db4 for a flat spelling of midi 61', () => {
    const spelled = spellNote(61, 'flat');
    expect(spelled.key).toBe('Db4');
    expect(spelled.displayName).toBe('D♭4');
    expect(spelled.pitchClass).toBe(1);
  });
});

describe('noteKey', () => {
  it('uses the spelling key', () => {
    expect(noteKey(spellNote(61, 'sharp'))).toBe('C#4');
    expect(noteKey(spellNote(61, 'flat'))).toBe('Db4');
  });
});

describe('notePool', () => {
  it('returns only natural notes when accidentals are off', () => {
    const pool = notePool({ floorMidi: 60, ceilingMidi: 71, includeAccidentals: false });
    expect(pool.map((n) => n.key)).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
    expect(pool.every((n) => n.accidental === 'natural')).toBe(true);
  });

  it('returns both sharp and flat spellings for black keys when accidentals are on', () => {
    const pool = notePool({ floorMidi: 60, ceilingMidi: 62, includeAccidentals: true });
    expect(pool.map((n) => n.key)).toEqual(['C4', 'C#4', 'Db4', 'D4']);
  });
});
