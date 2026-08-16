import { notePool, type SpelledNote, type PitchClass, type Config } from './note.js';
import { pickDueNotes, reviewNote, type Progress } from './scheduler.js';

export interface Session {
  config: Config;
  queue: SpelledNote[];
  currentIndex: number;
  stats: { correct: number; total: number };
}

export function createSession(config: Config, progress: Progress, now: Date): Session {
  const pool = notePool(config);
  const queue = pickDueNotes(pool, progress, now, config.cardsPerSession);
  return {
    config,
    queue,
    currentIndex: 0,
    stats: { correct: 0, total: 0 },
  };
}

export function currentNote(session: Session): SpelledNote | null {
  return session.queue[session.currentIndex] ?? null;
}

export function answer(
  session: Session,
  progress: Progress,
  selectedPitchClass: PitchClass,
  now: Date,
): { updatedSession: Session; updatedProgress: Progress; wasCorrect: boolean; correctPitchClass: PitchClass } {
  const note = currentNote(session)!;
  const wasCorrect = note.pitchClass === selectedPitchClass;
  const { updated } = reviewNote(progress, note, wasCorrect, now);

  const newQueue = [...session.queue];
  let newIndex = session.currentIndex + 1;

  if (!wasCorrect) {
    const insertAt = Math.min(newIndex + 2, newQueue.length);
    newQueue.splice(insertAt, 0, note);
  }

  const updatedSession: Session = {
    ...session,
    queue: newQueue,
    currentIndex: newIndex,
    stats: {
      correct: session.stats.correct + (wasCorrect ? 1 : 0),
      total: session.stats.total + 1,
    },
  };

  return {
    updatedSession,
    updatedProgress: updated,
    wasCorrect,
    correctPitchClass: note.pitchClass,
  };
}
