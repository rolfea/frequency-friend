import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';
import { noteKey, type SpelledNote } from './note.js';

export type Progress = Record<string, Card>;

const scheduler = fsrs();

export function emptyProgress(): Progress {
  return {};
}

export function reviewNote(
  progress: Progress,
  note: SpelledNote,
  correct: boolean,
  now: Date,
): { updated: Progress; card: Card } {
  const key = noteKey(note);
  const card = progress[key] ?? createEmptyCard(now);
  const rating = correct ? Rating.Good : Rating.Again;
  const result = scheduler.next(card, now, rating);
  const updated = { ...progress, [key]: result.card };
  return { updated, card: result.card };
}

export function pickDueNotes(
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
  // Prefer unique due cards first so the session starts with variety.
  while (selected.length < count && due.length > 0) {
    const index = Math.floor(Math.random() * due.length);
    selected.push(due.splice(index, 1)[0]);
  }
  // If more cards are still needed, sample with replacement from any available
  // note. This happens when the requested session size exceeds the note pool.
  const fallback = [...pool];
  while (selected.length < count && fallback.length > 0) {
    const index = Math.floor(Math.random() * fallback.length);
    selected.push(fallback[index]);
  }
  return selected;
}

const DATE_FIELDS: (keyof Card)[] = ['due', 'last_review'];

function cardToSerializable(card: Card): unknown {
  const clone: Record<string, unknown> = {};
  for (const key of Object.keys(card) as (keyof Card)[]) {
    const value = card[key];
    clone[key] = value instanceof Date ? value.getTime() : value;
  }
  return clone;
}

function serializableToCard(obj: unknown): Card {
  const card = { ...(obj as Record<string, unknown>) };
  for (const field of DATE_FIELDS) {
    const value = card[field];
    if (typeof value === 'number') {
      card[field] = new Date(value);
    }
  }
  // Type cast: ts-fsrs Card has private/protected Date fields that our plain
  // object does not satisfy structurally, so we go through unknown.
  return card as unknown as Card;
}

export function serializeProgress(progress: Progress): string {
  const serializable: Record<string, unknown> = {};
  for (const [key, card] of Object.entries(progress)) {
    serializable[key] = cardToSerializable(card);
  }
  return JSON.stringify(serializable);
}

export function deserializeProgress(json: string): Progress {
  const parsed = JSON.parse(json) as Record<string, unknown>;
  const progress: Progress = {};
  for (const [key, value] of Object.entries(parsed)) {
    progress[key] = serializableToCard(value);
  }
  return progress;
}
