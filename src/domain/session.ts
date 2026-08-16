import { notePool, noteKey, type SpelledNote, type PitchClass, type Config } from './note.js';
import { reviewNote, type Progress } from './scheduler.js';

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

function pickDueNotes(
  pool: SpelledNote[],
  progress: Progress,
  now: Date,
  count: number,
): SpelledNote[] {
  if (pool.length === 0) return [];
  const due: SpelledNote[] = [];
  const notDue: SpelledNote[] = [];
  for (const note of pool) {
    const card = progress[noteKey(note)];
    if (!card || card.due.getTime() <= now.getTime()) {
      due.push(note);
    } else {
      notDue.push(note);
    }
  }
  const selected: SpelledNote[] = [];
  for (let i = 0; i < count; i++) {
    const source = due.length > 0 ? due : notDue;
    const index = Math.floor(Math.random() * source.length);
    selected.push(source[index]);
    // Allow duplicates when the pool is smaller than the requested session size.
    // Remove only from due cards; once due is exhausted, sample notDue with replacement.
    if (source === due) {
      due.splice(index, 1);
    }
  }
  return selected;
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
