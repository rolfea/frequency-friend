import { describe, expect, it } from 'vitest';
import { deserializeProgress, emptyProgress, pickDueNotes, reviewNote, serializeProgress } from './scheduler.js';
import { spellNote } from './note.js';

describe('emptyProgress', () => {
  it('returns an empty object', () => {
    expect(emptyProgress()).toEqual({});
  });
});

describe('reviewNote', () => {
  it('creates a new card for an unseen note', () => {
    const progress = emptyProgress();
    const note = spellNote(60, 'natural');
    const { updated, card } = reviewNote(progress, note, true, new Date());
    expect(updated['C4']).toBeDefined();
    expect(card.due).toBeInstanceOf(Date);
  });

  it('schedules an incorrect answer sooner than a correct answer', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    const progress = emptyProgress();
    const note = spellNote(60, 'natural');
    const correct = reviewNote(progress, note, true, now);
    const incorrect = reviewNote(correct.updated, note, false, now);
    expect(incorrect.card.due.getTime()).toBeLessThanOrEqual(correct.card.due.getTime());
  });
});

describe('pickDueNotes', () => {
  it('returns the requested count when all notes are new', () => {
    const pool = [60, 62, 64, 65, 67, 69, 71].map((m) => spellNote(m, 'natural'));
    const selected = pickDueNotes(pool, emptyProgress(), new Date(), 3);
    expect(selected).toHaveLength(3);
    expect(selected.every((n) => pool.some((p) => p.key === n.key))).toBe(true);
  });

  it('prefers notes that are due', () => {
    const pool = [spellNote(60, 'natural'), spellNote(64, 'natural')];
    const now = new Date('2024-01-02T12:00:00Z');
    let progress = emptyProgress();
    const reviewedC = reviewNote(progress, pool[0], true, new Date('2024-01-01T12:00:00Z'));
    progress = reviewedC.updated;
    const reviewedE = reviewNote(progress, pool[1], true, now);
    progress = reviewedE.updated;
    const selected = pickDueNotes(pool, progress, now, 1);
    expect(selected[0].key).toBe(pool[0].key);
  });
});

describe('serializeProgress / deserializeProgress', () => {
  it('round-trips card dates as numbers', () => {
    const progress = emptyProgress();
    const { updated } = reviewNote(progress, spellNote(60, 'natural'), true, new Date('2024-01-01T12:00:00Z'));
    const json = serializeProgress(updated);
    const restored = deserializeProgress(json);
    expect(restored['C4'].due).toBeInstanceOf(Date);
    expect(restored['C4'].due.getTime()).toBe(updated['C4'].due.getTime());
  });
});
