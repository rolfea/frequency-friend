import { describe, expect, it } from 'vitest';
import { createSession, currentNote, answer } from './session.js';
import { emptyProgress } from './scheduler.js';

describe('createSession', () => {
  it('builds a queue of the requested length', () => {
    const session = createSession(
      { floorMidi: 60, ceilingMidi: 71, includeAccidentals: false, cardsPerSession: 5 },
      emptyProgress(),
      new Date(),
    );
    expect(session.queue).toHaveLength(5);
    expect(session.currentIndex).toBe(0);
  });
});

describe('answer', () => {
  it('marks a correct answer and advances', () => {
    const session = createSession(
      { floorMidi: 60, ceilingMidi: 62, includeAccidentals: false, cardsPerSession: 3 },
      emptyProgress(),
      new Date(),
    );
    const note = currentNote(session)!;
    const { updatedSession, wasCorrect } = answer(session, emptyProgress(), note.pitchClass, new Date());
    expect(wasCorrect).toBe(true);
    expect(updatedSession.currentIndex).toBe(1);
  });

  it('inserts an incorrect note later in the queue', () => {
    const session = createSession(
      { floorMidi: 60, ceilingMidi: 64, includeAccidentals: false, cardsPerSession: 3 },
      emptyProgress(),
      new Date(),
    );
    const note = currentNote(session)!;
    const wrong = ((note.pitchClass + 1) % 12) as typeof note.pitchClass;
    const { updatedSession } = answer(session, emptyProgress(), wrong, new Date());
    expect(updatedSession.queue.slice(updatedSession.currentIndex + 1)).toContainEqual(note);
  });
});
