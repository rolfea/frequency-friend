import { describe, expect, it } from 'vitest';
import { fingeringForNote, fingeringOptions, isCorrectFingering, formatFingering } from './fingering.js';
import { spellNote } from './note.js';

describe('fingeringForNote', () => {
  it('returns open for C4', () => {
    expect(fingeringForNote(spellNote(60, 'natural'))).toEqual([0, 0, 0]);
  });

  it('returns standard low-register fingerings for C4 chromatic notes', () => {
    expect(fingeringForNote(spellNote(60, 'natural'))).toEqual([0, 0, 0]); // C
    expect(fingeringForNote(spellNote(61, 'sharp'))).toEqual([1, 1, 1]); // C#
    expect(fingeringForNote(spellNote(62, 'natural'))).toEqual([1, 0, 1]); // D
    expect(fingeringForNote(spellNote(63, 'flat'))).toEqual([0, 1, 1]); // Eb
    expect(fingeringForNote(spellNote(64, 'natural'))).toEqual([1, 1, 0]); // E
    expect(fingeringForNote(spellNote(65, 'natural'))).toEqual([1, 0, 0]); // F
    expect(fingeringForNote(spellNote(66, 'sharp'))).toEqual([0, 1, 0]); // F#
    expect(fingeringForNote(spellNote(67, 'natural'))).toEqual([0, 0, 0]); // G
    expect(fingeringForNote(spellNote(68, 'flat'))).toEqual([0, 1, 1]); // Ab
    expect(fingeringForNote(spellNote(69, 'natural'))).toEqual([1, 1, 0]); // A
    expect(fingeringForNote(spellNote(70, 'flat'))).toEqual([1, 0, 0]); // Bb
    expect(fingeringForNote(spellNote(71, 'natural'))).toEqual([0, 1, 0]); // B
  });

  it('returns upper-register fingerings for C5 chromatic notes', () => {
    expect(fingeringForNote(spellNote(72, 'natural'))).toEqual([0, 0, 0]); // C
    expect(fingeringForNote(spellNote(73, 'sharp'))).toEqual([1, 1, 0]); // C#
    expect(fingeringForNote(spellNote(74, 'natural'))).toEqual([1, 0, 0]); // D
    expect(fingeringForNote(spellNote(75, 'flat'))).toEqual([0, 1, 0]); // Eb
    expect(fingeringForNote(spellNote(76, 'natural'))).toEqual([0, 0, 0]); // E
    expect(fingeringForNote(spellNote(77, 'natural'))).toEqual([1, 0, 0]); // F
  });

  it('returns same fingering for enharmonic spellings', () => {
    expect(fingeringForNote(spellNote(61, 'sharp'))).toEqual(fingeringForNote(spellNote(61, 'flat')));
    expect(fingeringForNote(spellNote(63, 'sharp'))).toEqual(fingeringForNote(spellNote(63, 'flat')));
  });
});

describe('isCorrectFingering', () => {
  it('accepts the canonical fingering', () => {
    const note = spellNote(62, 'natural'); // D4
    expect(isCorrectFingering(note, [1, 0, 1])).toBe(true);
  });

  it('rejects wrong fingering', () => {
    const note = spellNote(64, 'natural'); // E4
    expect(isCorrectFingering(note, [0, 0, 0])).toBe(false);
  });

  it('distinguishes octaves', () => {
    expect(isCorrectFingering(spellNote(62, 'natural'), [1, 0, 1])).toBe(true); // D4
    expect(isCorrectFingering(spellNote(74, 'natural'), [1, 0, 0])).toBe(true); // D5
  });
});

describe('formatFingering', () => {
  it('renders open for no valves', () => {
    expect(formatFingering([0, 0, 0])).toBe('Open');
  });

  it('renders single valves', () => {
    expect(formatFingering([1, 0, 0])).toBe('1');
    expect(formatFingering([0, 1, 0])).toBe('2');
    expect(formatFingering([0, 0, 1])).toBe('3');
  });

  it('renders combined valves', () => {
    expect(formatFingering([1, 1, 0])).toBe('1+2');
    expect(formatFingering([1, 1, 1])).toBe('1+2+3');
  });
});

describe('fingeringOptions', () => {
  it('includes all eight standard combinations', () => {
    const options = fingeringOptions();
    expect(options).toHaveLength(8);
    expect(options.map((o) => o.label)).toContain('Open');
    expect(options.map((o) => o.valves.join(''))).toContain('111');
  });
});
