import { describe, expect, it } from 'vitest';
import { createSession, currentNote, answer, formatRemainingTime } from './session.js';
import { emptyProgress, reviewNote } from './scheduler.js';
import { spellNote, type Config } from './note.js';

describe('createSession', () => {
  function baseConfig(overrides?: Partial<Config>): Config {
    return {
      floorMidi: 60,
      ceilingMidi: 71,
      includeAccidentals: false,
      sessionMode: 'cards',
      cardsPerSession: 5,
      sessionDurationMinutes: 5,
      showFingerings: false,
      practiceMode: 'quiz',
      longToneBeats: 2,
      longToneTempo: 80,
      longToneCentsTolerance: 50,
      longToneMinDurationMs: 500,
      ...overrides,
    };
  }

  it('builds a queue of the requested length', () => {
    const session = createSession(baseConfig(), emptyProgress(), new Date());
    expect(session.queue).toHaveLength(5);
    expect(session.currentIndex).toBe(0);
  });

  it('records an end time when mode is minutes', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    const session = createSession(baseConfig({ sessionMode: 'minutes', cardsPerSession: 10, sessionDurationMinutes: 3 }), emptyProgress(), now);
    expect(session.endTime).toEqual(new Date('2024-01-01T12:03:00Z'));
  });
});

describe('answer', () => {
  function baseConfig(overrides?: Partial<Config>): Config {
    return {
      floorMidi: 60,
      ceilingMidi: 62,
      includeAccidentals: false,
      sessionMode: 'cards',
      cardsPerSession: 3,
      sessionDurationMinutes: 5,
      showFingerings: false,
      practiceMode: 'quiz',
      longToneBeats: 2,
      longToneTempo: 80,
      longToneCentsTolerance: 50,
      longToneMinDurationMs: 500,
      ...overrides,
    };
  }

  it('marks a correct answer and advances', () => {
    const session = createSession(baseConfig(), emptyProgress(), new Date());
    const note = currentNote(session)!;
    const result = answer(session, emptyProgress(), note.pitchClass, new Date());
    expect(result).not.toBeNull();
    expect(result!.wasCorrect).toBe(true);
    expect(result!.updatedSession.currentIndex).toBe(1);
  });

  it('inserts an incorrect note later in the queue', () => {
    const session = createSession(baseConfig({ ceilingMidi: 64 }), emptyProgress(), new Date());
    const note = currentNote(session)!;
    const wrong = ((note.pitchClass + 1) % 12) as typeof note.pitchClass;
    const result = answer(session, emptyProgress(), wrong, new Date());
    expect(result).not.toBeNull();
    expect(result!.updatedSession.queue.slice(result!.updatedSession.currentIndex + 1)).toContainEqual(note);
  });

  it('returns null when the session is exhausted', () => {
    const session = createSession(
      baseConfig({ ceilingMidi: 60, cardsPerSession: 1 }),
      emptyProgress(),
      new Date(),
    );
    const note = currentNote(session)!;
    const after = answer(session, emptyProgress(), note.pitchClass, new Date());
    const result = answer(after!.updatedSession, after!.updatedProgress, 0, new Date());
    expect(result).toBeNull();
  });
});

describe('formatRemainingTime', () => {
  it('formats minutes and seconds with zero padding', () => {
    expect(formatRemainingTime(0)).toBe('0:00');
    expect(formatRemainingTime(59000)).toBe('0:59');
    expect(formatRemainingTime(125000)).toBe('2:05');
    expect(formatRemainingTime(61000)).toBe('1:01');
  });
});
