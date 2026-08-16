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
    if (source.length === 0) break;
    const index = Math.floor(Math.random() * source.length);
    selected.push(source.splice(index, 1)[0]);
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
  return card as Card;
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
