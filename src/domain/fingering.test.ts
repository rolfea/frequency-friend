import { describe, expect, it } from 'vitest';
import { fingeringForNote, fingeringOptions, isCorrectFingering, formatFingering } from './fingering.js';
import { spellNote } from './note.js';

describe('fingeringForNote', () => {
  it('returns open for C4', () => {
    expect(fingeringForNote(spellNote(60, 'natural'))).toEqual([0, 0, 0]);
  });

  it('returns first-valve for C#4', () => {
    expect(fingeringForNote(spellNote(61, 'sharp'))).toEqual([1, 0, 1]);
  });

  it('returns same fingering for enharmonic spellings', () => {
    expect(fingeringForNote(spellNote(61, 'sharp'))).toEqual(fingeringForNote(spellNote(61, 'flat')));
  });
});

describe('isCorrectFingering', () => {
  it('accepts the canonical fingering', () => {
    const note = spellNote(61, 'sharp');
    expect(isCorrectFingering(note, [1, 0, 1])).toBe(true);
  });

  it('rejects wrong fingering', () => {
    const note = spellNote(64, 'natural');
    expect(isCorrectFingering(note, [0, 0, 0])).toBe(false);
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
    expect(fingeringOptions()).toHaveLength(8);
    expect(fingeringOptions().map((o) => o.label)).toContain('Open');
    expect(fingeringOptions().map((o) => o.label)).toContain('1+2+3');
  });
});
