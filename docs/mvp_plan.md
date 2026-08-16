# Frequency Friend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page browser app that quizzes the user on treble-staff note recognition, gives immediate feedback, and tracks progress with a spaced-repetition engine.

**Architecture:** Tiny central state module in `main.ts`; pure domain logic in `src/domain/`; presentational custom elements in `src/components/`; `ts-fsrs` wrapped by `src/domain/scheduler.ts`; `localStorage` via `src/storage.ts`; vanilla CSS and SVG for the staff.

**Tech Stack:** TypeScript (no framework), `ts-fsrs`, `vitest`, vanilla CSS, VexFlow-rendered SVG, `tsc`, `npx serve`, Render static sites.

**Spec:** `docs/core.md`

## Global Constraints

- No React, Vue, Svelte, or other frontend framework.
- Use browser APIs directly where possible.
- Compile TypeScript with `tsc` to `dist/`.
- Co-locate tests with source: `src/**/*.test.ts`.
- Use BEM-style class names; keep CSS simple and readable.
- Persist progress to `localStorage` only.
- Treble staff only; pitch-letter answers only.
- Binary scoring: Correct → `Rating.Good`, Incorrect → `Rating.Again`.

---

## File Structure

```
frequency-friend/
├── docs/
│   ├── core.md
│   └── mvp_plan.md
├── src/
│   ├── main.ts
│   ├── main.test.ts
│   ├── components/
│   │   ├── app-card.ts
│   │   ├── staff-display.ts
│   │   └── settings-panel.ts
│   ├── domain/
│   │   ├── note.ts
│   │   ├── note.test.ts
│   │   ├── session.ts
│   │   ├── session.test.ts
│   │   ├── scheduler.ts
│   │   └── scheduler.test.ts
│   ├── storage.ts
│   └── storage.test.ts
├── style.css
├── index.html
├── tsconfig.json
├── package.json
├── README.md
└── vitest.config.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `style.css`
- Create: `README.md`

**Interfaces:**
- Consumes: none.
- Produces: build/dev/test entry points and dependencies.

- [x] **Step 1: Initialize `package.json`**

```json
{
  "name": "frequency-friend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "npx serve .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "jsdom": "^24.0.0"
  },
  "dependencies": {
    "ts-fsrs": "^5.4.0"
  }
}
```

- [x] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [x] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
```

- [x] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frequency Friend</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <app-card></app-card>
  <script type="module" src="dist/main.js"></script>
</body>
</html>
```

- [x] **Step 5: Create stub CSS and README**

`style.css`:
```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-accent: #2563eb;
  --color-correct: #16a34a;
  --color-incorrect: #dc2626;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
}

.app-card {
  max-width: 640px;
  margin: 0 auto;
}
```

`README.md`:
```markdown
# Frequency Friend

A lightweight, framework-free note-recognition practice app for music students.

## Development

```bash
npm install
npm run test      # run unit tests
npm run build     # compile TypeScript to dist/
npm run dev       # serve with npx serve
```

## Deploy

Build with `npm run build`, then deploy the repository root (which serves `index.html` and `dist/`) to Render static sites.
```

- [x] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, no errors.

- [x] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts index.html style.css README.md docs/mvp_plan.md docs/core.md

git commit -m "chore: scaffold project and document mvp plan"
```

---

## Task 2: Note Domain

**Files:**
- Create: `src/domain/note.ts`
- Create: `src/domain/note.test.ts`

**Interfaces:**
- Consumes: none.
- Produces:
  - `type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11`
  - `interface Note { midi: number; pitchClass: PitchClass; octave: number; accidentalDisplay: 'natural' | 'sharp' | 'flat'; }`
  - `interface SpelledNote { midi: number; key: string; displayName: string; pitchClass: PitchClass; accidental: 'natural' | 'sharp' | 'flat'; }`
  - `function pitchClassToName(pc: PitchClass, useSharps: boolean): string`
  - `function noteKey(note: SpelledNote): string`
  - `function midiToNote(midi: number, preferSharps: boolean): Note`
  - `function spellNote(midi: number, accidental: 'natural' | 'sharp' | 'flat'): SpelledNote`
  - `function midiToDiatonicStep(midi: number): { step: number; octave: number }`
  - `function notePool(config: { floorMidi: number; ceilingMidi: number; includeAccidentals: boolean }): SpelledNote[]`

- [x] **Step 1: Write the failing test**

`src/domain/note.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { midiToNote, notePool, pitchClassToName, noteKey, spellNote } from './note.js';

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

describe('midiToNote', () => {
  it('produces the correct natural note for C4', () => {
    const note = midiToNote(60, true);
    expect(note.midi).toBe(60);
    expect(note.pitchClass).toBe(0);
    expect(note.octave).toBe(4);
    expect(note.accidentalDisplay).toBe('natural');
  });

  it('produces a sharp note for C#4', () => {
    const note = midiToNote(61, true);
    expect(note.pitchClass).toBe(1);
    expect(note.accidentalDisplay).toBe('sharp');
  });

  it('produces a flat note for Db4 when flats preferred', () => {
    const note = midiToNote(61, false);
    expect(note.pitchClass).toBe(1);
    expect(note.accidentalDisplay).toBe('flat');
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
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/note.test.ts`
Expected: FAIL — functions not defined or empty implementation.

- [x] **Step 3: Write minimal implementation**

`src/domain/note.ts`:
```ts
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface Note {
  midi: number;
  pitchClass: PitchClass;
  octave: number;
  accidentalDisplay: 'natural' | 'sharp' | 'flat';
}

export interface SpelledNote {
  midi: number;
  key: string;
  displayName: string;
  pitchClass: PitchClass;
  accidental: 'natural' | 'sharp' | 'flat';
}

export interface Config {
  floorMidi: number;
  ceilingMidi: number;
  includeAccidentals: boolean;
  cardsPerSession: number;
}

export interface DiatonicStep {
  step: number; // 0 = bottom line E4, positive upward; even steps are lines, odd steps are spaces
  octave: number;
}

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const ASCII_KEYS: Record<number, { sharp?: string; flat?: string }> = {
  0: { sharp: 'C' },
  1: { sharp: 'C#', flat: 'Db' },
  2: { sharp: 'D' },
  3: { sharp: 'D#', flat: 'Eb' },
  4: { sharp: 'E' },
  5: { sharp: 'F' },
  6: { sharp: 'F#', flat: 'Gb' },
  7: { sharp: 'G' },
  8: { sharp: 'G#', flat: 'Ab' },
  9: { sharp: 'A' },
  10: { sharp: 'A#', flat: 'Bb' },
  11: { sharp: 'B' },
};

export function pitchClassToName(pc: PitchClass, useSharps: boolean): string {
  return useSharps ? SHARP_NAMES[pc] : FLAT_NAMES[pc];
}

export function noteKey(note: SpelledNote): string {
  return note.key;
}

export function midiToNote(midi: number, preferSharps: boolean): Note {
  const pitchClass = (midi % 12) as PitchClass;
  const octave = Math.floor(midi / 12) - 1;
  const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(pitchClass);
  return {
    midi,
    pitchClass,
    octave,
    accidentalDisplay: isNatural ? 'natural' : preferSharps ? 'sharp' : 'flat',
  };
}

export function spellNote(
  midi: number,
  accidental: 'natural' | 'sharp' | 'flat',
): SpelledNote {
  const pitchClass = (midi % 12) as PitchClass;
  const octave = Math.floor(midi / 12) - 1;
  const names = ASCII_KEYS[pitchClass];
  const ascii = accidental === 'flat' && names.flat ? names.flat : names.sharp!;
  const display = pitchClassToName(pitchClass, accidental !== 'flat');
  return {
    midi,
    key: `${ascii}${octave}`,
    displayName: `${display}${octave}`,
    pitchClass,
    accidental,
  };
}

export function midiToDiatonicStep(midi: number): DiatonicStep {
  // Staff lines in treble clef: E4(step 0), G4(2), B4(4), D5(6), F5(8).
  // Diatonic letter indices: C=0, D=1, E=2, F=3, G=4, A=5, B=6.
  const octave = Math.floor(midi / 12) - 1;
  const letterIndex = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][midi % 12];
  const stepFromC0 = octave * 7 + letterIndex;
  // E4 is letter 2 in octave 4 => step 4*7+2 = 30. Staff step 0 corresponds to E4.
  const step = stepFromC0 - 30;
  return { step, octave };
}

export function notePool(config: {
  floorMidi: number;
  ceilingMidi: number;
  includeAccidentals: boolean;
}): SpelledNote[] {
  const notes: SpelledNote[] = [];
  for (let midi = config.floorMidi; midi <= config.ceilingMidi; midi++) {
    const pitchClass = (midi % 12) as PitchClass;
    const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(pitchClass);
    if (isNatural) {
      notes.push(spellNote(midi, 'natural'));
    } else if (config.includeAccidentals) {
      notes.push(spellNote(midi, 'sharp'));
      notes.push(spellNote(midi, 'flat'));
    }
  }
  return notes;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/note.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/domain/note.ts src/domain/note.test.ts

git commit -m "feat: add note domain with pitch classes and note pool generation"
```

---

## Task 3: Scheduler / Spaced-Repetition Wrapper

**Files:**
- Create: `src/domain/scheduler.ts`
- Create: `src/domain/scheduler.test.ts`

**Interfaces:**
- Consumes: `SpelledNote`, `noteKey` from `src/domain/note.ts`.
- Produces:
  - `type Progress = Record<string, Card>` where `Card` is `ts-fsrs`'s `Card` type.
  - `function emptyProgress(): Progress`
  - `function reviewNote(progress: Progress, note: SpelledNote, correct: boolean, now: Date): { updated: Progress; card: Card }`
  - `function pickDueNotes(pool: SpelledNote[], progress: Progress, now: Date, count: number): SpelledNote[]`
  - `function serializeProgress(progress: Progress): string`
  - `function deserializeProgress(json: string): Progress`

- [x] **Step 1: Write the failing test**

`src/domain/scheduler.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { deserializeProgress, emptyProgress, pickDueNotes, reviewNote, serializeProgress } from './scheduler.js';
import { midiToNote, spellNote } from './note.js';

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
    const progress = emptyProgress();
    const reviewed = reviewNote(progress, pool[0], true, new Date('2024-01-01T12:00:00Z'));
    const selected = pickDueNotes(pool, reviewed.updated, now, 1);
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
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/scheduler.test.ts`
Expected: FAIL — functions not defined.

- [x] **Step 3: Write minimal implementation**

`src/domain/scheduler.ts`:
```ts
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

export function pickDueNotes(pool: SpelledNote[], progress: Progress, now: Date, count: number): SpelledNote[] {
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

const DATE_FIELDS = ['due', 'last_review'];

export function serializeProgress(progress: Progress): string {
  return JSON.stringify(progress, (_key, value) => {
    if (value instanceof Date) {
      return value.getTime();
    }
    return value;
  });
}

export function deserializeProgress(json: string): Progress {
  return JSON.parse(json, (_key, value) => {
    if (DATE_FIELDS.includes(_key) && typeof value === 'number') {
      return new Date(value);
    }
    return value;
  });
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/scheduler.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/domain/scheduler.ts src/domain/scheduler.test.ts

git commit -m "feat: wrap ts-fsrs scheduler for note review and due-note selection"
```

---

## Task 4: Session Logic

**Files:**
- Create: `src/domain/session.ts`
- Create: `src/domain/session.test.ts`

**Interfaces:**
- Consumes: `Note`, `notePool` from `src/domain/note.ts`; `pickDueNotes`, `reviewNote` from `src/domain/scheduler.ts`.
- Produces:
  - `interface Session { config: Config; queue: SpelledNote[]; currentIndex: number; stats: { correct: number; total: number }; }`
  - `function createSession(config: Config, progress: Progress, now: Date): Session`
  - `function currentNote(session: Session): SpelledNote | null`
  - `function answer(session: Session, progress: Progress, selectedPitchClass: PitchClass, now: Date): { updatedSession: Session; updatedProgress: Progress; wasCorrect: boolean; correctPitchClass: PitchClass }`

- [x] **Step 1: Write the failing test**

`src/domain/session.test.ts`:
```ts
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
    const wrong = ((note.pitchClass + 1) % 12);
    const { updatedSession } = answer(session, emptyProgress(), wrong, new Date());
    expect(updatedSession.queue.slice(updatedSession.currentIndex + 1)).toContainEqual(note);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/session.test.ts`
Expected: FAIL.

- [x] **Step 3: Write minimal implementation**

`src/domain/session.ts`:
```ts
import { notePool, type SpelledNote, type PitchClass, type Config } from './note.js';
import { emptyProgress, pickDueNotes, reviewNote, type Progress } from './scheduler.js';

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
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/session.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/domain/session.ts src/domain/session.test.ts

git commit -m "feat: add practice session queue with re-quiz on wrong answers"
```

---

## Task 5: Storage Helpers

**Files:**
- Create: `src/storage.ts`
- Create: `src/storage.test.ts`

**Interfaces:**
- Consumes: `Config` type from `src/domain/note.ts`; `Progress` type from `src/domain/scheduler.ts`.
- Produces:
  - `function loadConfig(): Config`
  - `function saveConfig(config: Config): void`
  - `function loadProgress(): Progress`
  - `function saveProgress(progress: Progress): void`

- [x] **Step 1: Write the failing test**

`src/storage.test.ts`:
```ts
import { describe, expect, it, beforeEach } from 'vitest';
import { loadConfig, saveConfig, loadProgress, saveProgress } from './storage.js';

describe('config storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    const config = loadConfig();
    expect(config.floorMidi).toBe(60);
    expect(config.ceilingMidi).toBe(79);
    expect(config.includeAccidentals).toBe(false);
    expect(config.cardsPerSession).toBe(10);
  });

  it('round-trips config changes', () => {
    const config = { floorMidi: 55, ceilingMidi: 72, includeAccidentals: true, cardsPerSession: 15 };
    saveConfig(config);
    expect(loadConfig()).toEqual(config);
  });
});

describe('progress storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty object by default', () => {
    expect(loadProgress()).toEqual({});
  });

  it('round-trips progress', () => {
    const progress = { '60': { due: new Date('2024-01-01').getTime() } } as any;
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/storage.test.ts`
Expected: FAIL.

- [x] **Step 3: Write minimal implementation**

`src/storage.ts`:
```ts
import type { Config } from './domain/note.js';
import { deserializeProgress, serializeProgress, type Progress } from './domain/scheduler.js';

const CONFIG_KEY = 'frequency-friend:config';
const PROGRESS_KEY = 'frequency-friend:progress';

export const DEFAULT_CONFIG: Config = {
  floorMidi: 60, // C4
  ceilingMidi: 79, // G5
  includeAccidentals: false,
  cardsPerSession: 10,
};

export function loadConfig(): Config {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Config): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadProgress(): Progress {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return {};
  try {
    return deserializeProgress(raw);
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(PROGRESS_KEY, serializeProgress(progress));
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/storage.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/storage.ts src/storage.test.ts

git commit -m "feat: add localStorage helpers for config and progress"
```

---

## Task 6: SVG Staff Display Custom Element

**Files:**
- Create: `src/components/staff-display.ts`
- Create: `src/components/staff-display.test.ts`

**Interfaces:**
- Consumes: `Note`, `midiToDiatonicStep`, `pitchClassToName` from `src/domain/note.ts`.
- Produces: `class StaffDisplay extends HTMLElement` registered as `<staff-display>` with `setNote(note: Note)` method.

- [x] **Step 1: Write the failing test**

`src/components/staff-display.test.ts`:
```ts
import { describe, expect, it, beforeEach } from 'vitest';
import './staff-display.js';
import { spellNote } from '../domain/note.js';

describe('staff-display', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an svg', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')!;
    el.setNote(spellNote(64, 'natural')); // E4
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('renders a note head for middle C', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')!;
    el.setNote(spellNote(60, 'natural')); // C4
    expect(el.querySelector('.note-head')).not.toBeNull();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/staff-display.test.ts`
Expected: FAIL.

- [x] **Step 3: Write minimal implementation using VexFlow**

`src/components/staff-display.ts` uses VexFlow's `Renderer`, `Stave`, `StaveNote`, and `Accidental` to render the treble staff, note, and accidental as SVG. It co-locates a single note in a `Voice` and primes the Bravura font before first render to avoid ledger-line sizing flicker on initial load.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/staff-display.test.ts`
Expected: PASS.

The unit test only asserts that an SVG is produced and contains note-head paths; the Playwright e2e suite (`tests/e2e/staff.spec.ts`) covers visual behavior such as ledger-line width and accidental rendering.

- [x] **Step 5: Commit**

```bash
git add src/components/staff-display.ts src/components/staff-display.test.ts

git commit -m "feat: render staff and notes with VexFlow"
```

---

## Task 7: Settings Panel Custom Element

**Files:**
- Create: `src/components/settings-panel.ts`
- Create: `src/components/settings-panel.test.ts`

**Interfaces:**
- Consumes: `Config` from `src/domain/note.ts`.
- Produces: `class SettingsPanel extends HTMLElement` registered as `<settings-panel>` with `setConfig(config: Config)` and `onSave(callback: (config: Config) => void)`.

- [x] **Step 1: Write the failing test**

`src/components/settings-panel.test.ts`:
```ts
import { describe, expect, it, beforeEach, vi } from 'vitest';
import './settings-panel.js';
import type { Config } from '../domain/note.js';

describe('settings-panel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders inputs from config', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')!;
    const config: Config = { floorMidi: 60, ceilingMidi: 77, includeAccidentals: false, cardsPerSession: 10 };
    el.setConfig(config);
    expect(el.querySelector('form')).not.toBeNull();
  });

  it('calls onSave with updated config', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')!;
    const config: Config = { floorMidi: 60, ceilingMidi: 77, includeAccidentals: false, cardsPerSession: 10 };
    el.setConfig(config);
    const handler = vi.fn();
    el.onSave(handler);

    const input = el.querySelector('[name="cardsPerSession"]') as HTMLInputElement;
    input.value = '12';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ cardsPerSession: 12 }));
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/settings-panel.test.ts`
Expected: FAIL.

- [x] **Step 3: Write minimal implementation**

`src/components/settings-panel.ts`:
```ts
import type { Config } from '../domain/note.js';

const MIDI_NAMES: Record<number, string> = {};
for (let midi = 48; midi <= 84; midi++) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  MIDI_NAMES[midi] = `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

class SettingsPanel extends HTMLElement {
  private config: Config | null = null;
  private saveCallback: ((config: Config) => void) | null = null;

  connectedCallback(): void {
    this.innerHTML = `
      <form class="settings-panel__form">
        <label class="settings-panel__field">
          <span>Lowest note</span>
          <select name="floorMidi" class="settings-panel__select"></select>
        </label>
        <label class="settings-panel__field">
          <span>Highest note</span>
          <select name="ceilingMidi" class="settings-panel__select"></select>
        </label>
        <label class="settings-panel__field">
          <span>Include accidentals</span>
          <input name="includeAccidentals" type="checkbox" class="settings-panel__checkbox">
        </label>
        <label class="settings-panel__field">
          <span>Cards per session</span>
          <input name="cardsPerSession" type="number" min="1" max="50" class="settings-panel__number">
        </label>
        <button type="submit" class="settings-panel__button">Save</button>
      </form>
    `;
    this.populateMidiSelects();
    const form = this.querySelector('form')!;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.saveCallback) {
        this.saveCallback(this.readConfig());
      }
    });
  }

  setConfig(config: Config): void {
    this.config = config;
    const form = this.querySelector('form') as HTMLFormElement;
    (form.elements.namedItem('floorMidi') as HTMLSelectElement).value = String(config.floorMidi);
    (form.elements.namedItem('ceilingMidi') as HTMLSelectElement).value = String(config.ceilingMidi);
    (form.elements.namedItem('includeAccidentals') as HTMLInputElement).checked = config.includeAccidentals;
    (form.elements.namedItem('cardsPerSession') as HTMLInputElement).value = String(config.cardsPerSession);
  }

  onSave(callback: (config: Config) => void): void {
    this.saveCallback = callback;
  }

  private populateMidiSelects(): void {
    this.querySelectorAll('select[name$="Midi"]').forEach((select) => {
      for (let midi = 48; midi <= 84; midi++) {
        const option = document.createElement('option');
        option.value = String(midi);
        option.textContent = MIDI_NAMES[midi];
        select.appendChild(option);
      }
    });
  }

  private readConfig(): Config {
    const form = this.querySelector('form') as HTMLFormElement;
    return {
      floorMidi: Number((form.elements.namedItem('floorMidi') as HTMLSelectElement).value),
      ceilingMidi: Number((form.elements.namedItem('ceilingMidi') as HTMLSelectElement).value),
      includeAccidentals: (form.elements.namedItem('includeAccidentals') as HTMLInputElement).checked,
      cardsPerSession: Number((form.elements.namedItem('cardsPerSession') as HTMLInputElement).value),
    };
  }
}

customElements.define('settings-panel', SettingsPanel);
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/settings-panel.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/components/settings-panel.ts src/components/settings-panel.test.ts

git commit -m "feat: add settings panel custom element"
```

---

## Task 8: App Card Custom Element and Main Wiring

**Files:**
- Create: `src/components/app-card.ts`
- Create: `src/components/answer-buttons.ts`
- Create: `src/main.ts`
- Create: `src/main.test.ts`
- Modify: `style.css`

**Interfaces:**
- Consumes: all prior modules.
- Produces: A working single-page app rendered by `<app-card>`.

- [x] **Step 1: Write the failing test for answer-buttons**

`src/components/answer-buttons.ts` (presentational, no test file required) will expose `setOptions(options: { pitchClass: number; label: string }[])` and `onSelect(callback: (pitchClass: number) => void)`.

`src/components/answer-buttons.ts`:
```ts
class AnswerButtons extends HTMLElement {
  private selectCallback: ((pitchClass: number) => void) | null = null;

  setOptions(options: { pitchClass: number; label: string }[]): void {
    this.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'answer-buttons__grid';
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-buttons__button';
      button.textContent = option.label;
      button.dataset.pitchClass = String(option.pitchClass);
      button.addEventListener('click', () => {
        if (this.selectCallback) this.selectCallback(option.pitchClass);
      });
      grid.appendChild(button);
    }
    this.appendChild(grid);
  }

  setEnabled(enabled: boolean): void {
    this.querySelectorAll('button').forEach((btn) => {
      btn.disabled = !enabled;
    });
  }

  onSelect(callback: (pitchClass: number) => void): void {
    this.selectCallback = callback;
  }
}

customElements.define('answer-buttons', AnswerButtons);
```

`src/main.test.ts`:
```ts
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderApp } from './main.js';

describe('renderApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('mounts an app-card element', () => {
    renderApp(document.body);
    expect(document.querySelector('app-card')).not.toBeNull();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/main.test.ts`
Expected: FAIL.

- [x] **Step 3: Write minimal implementation**

`src/components/app-card.ts`:
```ts
import type { Config, PitchClass, SpelledNote } from '../domain/note.js';
import { createSession, currentNote, answer } from '../domain/session.js';
import { loadConfig, loadProgress, saveConfig, saveProgress } from '../storage.js';
import { pitchClassToName } from '../domain/note.js';
import './staff-display.js';
import './answer-buttons.js';
import './settings-panel.js';

class AppCard extends HTMLElement {
  private config: Config = loadConfig();
  private progress = loadProgress();
  private session = createSession(this.config, this.progress, new Date());

  connectedCallback(): void {
    this.render();
    this.showCurrentNote();
  }

  private render(): void {
    this.innerHTML = `
      <section class="app-card">
        <header class="app-card__header">
          <h1 class="app-card__title">Frequency Friend</h1>
          <button class="app-card__settings-toggle" type="button">Settings</button>
        </header>
        <div class="app-card__stats"></div>
        <staff-display class="app-card__staff"></staff-display>
        <div class="app-card__feedback" aria-live="polite"></div>
        <answer-buttons class="app-card__answers"></answer-buttons>
        <settings-panel class="app-card__settings app-card__settings--hidden"></settings-panel>
      </section>
    `;

    const staff = this.querySelector('staff-display')!;
    const answers = this.querySelector('answer-buttons')!;
    const feedback = this.querySelector('.app-card__feedback')!;
    const settingsPanel = this.querySelector('settings-panel')!;
    const toggle = this.querySelector('.app-card__settings-toggle')!;

    this.updateAnswerButtons();

    answers.onSelect((pitchClass: PitchClass) => {
      const now = new Date();
      const note = currentNote(this.session)!;
      const result = answer(this.session, this.progress, pitchClass, now);
      this.session = result.updatedSession;
      this.progress = result.updatedProgress;
      saveProgress(this.progress);

      const correctName = pitchClassToName(result.correctPitchClass, note.accidental !== 'flat');
      feedback.textContent = result.wasCorrect
        ? 'Correct!'
        : `Incorrect. The correct answer was ${correctName}.`;
      feedback.className = `app-card__feedback app-card__feedback--${result.wasCorrect ? 'correct' : 'incorrect'}`;

      this.updateStats();
      answers.setEnabled(false);

      setTimeout(() => {
        if (currentNote(this.session)) {
          this.showCurrentNote();
          answers.setEnabled(true);
          feedback.textContent = '';
        } else {
          this.showSummary();
        }
      }, 1200);
    });

    settingsPanel.setConfig(this.config);
    settingsPanel.onSave((config) => {
      this.config = config;
      saveConfig(config);
      this.session = createSession(this.config, this.progress, new Date());
      settingsPanel.classList.add('app-card__settings--hidden');
      this.showCurrentNote();
    });

    toggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('app-card__settings--hidden');
    });
  }

  private showCurrentNote(): void {
    const note = currentNote(this.session);
    if (!note) {
      this.showSummary();
      return;
    }
    const staff = this.querySelector('staff-display') as HTMLElement;
    (staff as any).setNote(note);
    this.updateAnswerButtons();
    this.updateStats();
  }

  private updateAnswerButtons(): void {
    const answers = this.querySelector('answer-buttons')!;
    const options: { pitchClass: number; label: string }[] = [];
    if (this.config.includeAccidentals) {
      for (let pc = 0; pc < 12; pc++) {
        options.push({ pitchClass: pc, label: this.labelForPitchClass(pc as PitchClass) });
      }
    } else {
      for (const pc of [0, 2, 4, 5, 7, 9, 11]) {
        options.push({ pitchClass: pc, label: pitchClassToName(pc as PitchClass, true) });
      }
    }
    (answers as any).setOptions(options);
  }

  private labelForPitchClass(pc: PitchClass): string {
    const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(pc);
    if (isNatural) return pitchClassToName(pc, true);
    return `${pitchClassToName(pc, true)} / ${pitchClassToName(pc, false)}`;
  }

  private updateStats(): void {
    const statsEl = this.querySelector('.app-card__stats')!;
    const remaining = this.session.queue.length - this.session.currentIndex;
    statsEl.textContent = `${this.session.stats.correct} / ${this.session.stats.total} correct · ${remaining} remaining`;
  }

  private showSummary(): void {
    this.innerHTML = `
      <section class="app-card app-card--summary">
        <h2 class="app-card__title">Session complete</h2>
        <p class="app-card__score">${this.session.stats.correct} / ${this.session.stats.total} correct</p>
        <button class="app-card__restart" type="button">Practice again</button>
      </section>
    `;
    this.querySelector('.app-card__restart')!.addEventListener('click', () => {
      this.session = createSession(this.config, this.progress, new Date());
      this.render();
      this.showCurrentNote();
    });
  }
}

customElements.define('app-card', AppCard);
```

`src/main.ts`:
```ts
import './components/app-card.js';

export function renderApp(target: HTMLElement): void {
  target.innerHTML = '<app-card></app-card>';
}

if (typeof window !== 'undefined') {
  renderApp(document.body);
}
```

- [x] **Step 4: Add minimal CSS**

Append to `style.css`:
```css
.app-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-card__title {
  margin: 0;
  font-size: 1.5rem;
}

.app-card__stats {
  font-size: 0.875rem;
  color: #666;
}

.app-card__feedback {
  min-height: 1.5rem;
  font-weight: 600;
}

.app-card__feedback--correct {
  color: var(--color-correct);
}

.app-card__feedback--incorrect {
  color: var(--color-incorrect);
}

.answer-buttons__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.answer-buttons__button {
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.2;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  background: #fff;
  cursor: pointer;
  white-space: normal;
}

.answer-buttons__button:hover:not(:disabled) {
  background: #f3f4f6;
}

.answer-buttons__button:disabled {
  opacity: 0.5;
  cursor: default;
}

.settings-panel__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.settings-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-card__settings--hidden {
  display: none;
}
```

- [x] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: PASS.

- [x] **Step 6: Build and smoke test**

Run: `npm run build`
Expected: `dist/` produced with no TypeScript errors.

Run: `npm run dev` and open the served URL in a browser.
Expected: App renders, shows a note, answer buttons work, settings panel toggles.

- [x] **Step 7: Commit**

```bash
git add src/components/app-card.ts src/components/answer-buttons.ts src/main.ts src/main.test.ts style.css

git commit -m "feat: wire app card, answer buttons, and main entry point"
```

---

## Task 9: Build Verification and Render Deploy Prep

**Files:**
- Modify: `package.json` scripts (if needed).
- Create: `render.yaml` or document Render deploy steps in README.

**Interfaces:**
- Consumes: `dist/` and `index.html`.
- Produces: Deployable static site.

- [x] **Step 1: Verify build output is served correctly**

Run: `npm run build && npx serve .`
Expected: `index.html` loads `dist/main.js` and `style.css` without 404s.

- [x] **Step 2: Add Render static site instructions**

Append to `README.md`:
```markdown
## Deploy to Render

1. Create a new static site on Render.
2. Connect this repository.
3. Set:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `.` (root)
4. Click deploy.
```

- [x] **Step 3: Add `.gitignore`**

Create `.gitignore`:
```gitignore
node_modules/
dist/
*.log
.DS_Store
```

- [x] **Step 4: Final test run and commit**

Run: `npx vitest run`
Expected: PASS.

Run: `npm run build`
Expected: clean build.

```bash
git add README.md .gitignore

git commit -m "docs: add render deploy instructions and ignore build artifacts"
```

---

## Self-Review

- [x] **Spec coverage:** Each requirement in `docs/core.md` maps to a task:
  - Treble staff SVG rendering → Task 6.
  - Pitch-letter answers → Tasks 7/8.
  - Spaced-repetition engine → Task 3.
  - Fixed-count sessions and re-quiz → Task 4.
  - Config (range, accidentals, count) → Task 7/8.
  - localStorage persistence → Task 5.
  - Tests and deployment → Tasks 2–9.
- [x] **Placeholder scan:** No TBD/TODO/fill-in steps remain.
- [x] **Type consistency:** `Config`, `Note`, `PitchClass`, `Progress`, and `Session` types are used consistently across tasks.
