# Frequency Friend

## Idea

An anki-like app that uses a flash card system in conjunction with spaced repetition to help music students drill different concepts.

For our MVP, we will be building single note recognition for the trumpet. What this will require is:

- Generate a series of "flash cards" to display to the user for each practice session
- Each card will show a single note on a traditional music staff.
- the user will select the Pitch name (ie., A, B, C, D, E, F, G) and the app will show the user whether they are correct or not
- The app will track the user's success on each note in a spaced-repetition engine that will drive the current and subsequent sessions, similar to the anki app. (If this engine is open source and available, we should avail ourselves of that library, rather than recreating from scractch, if practical)
- Initial light configuration will include a floor and ceiling to the range within which the notes can be selected, a preferred staff (bass, treble, grand staff, alto, and tenor), and ability to toggle accidentals on and off
- When "trumpet mode" is selected, both the pitch and the fingering will be selectable, and the pitch that plays must be transposed to match the trumpet (if the user is using a Bb trumpet)
- After identifying the note, the student can optionally play or sing the note. The app will count them in with 2 or 4 beats (configurable) at a specified tempo, and then record how long they can hold the note. We can call this "long tone mode"

## Personas

### Beginning Trumpet Student

This student wants to participate in brief, effective sessions that will help them learn to recognize, name, and play or sing pitches on the staff.
The student wants to be quizzed on notes they struggle to recognize, name, or play.
The student wants to be able to set the range of notes they will be quizzed on, including whether or not the quizzed notes include accidentals (C#, Eb, etc.)
When prompted to play the note, they should be given a configurable number of beats to count them in, and then the app will help them track how long they are able to hold the individual note.

## Tech Stack

Initially, the bulk of the work here will be in the front end. We might want to eventually support accounts, saving progress across devices, etc., but for now, let's build a self-contained front end app and save flash card performance and progress in the browser memory.

The client side will be built without front end frameworks (No react, no vue, no svelte) - we'll use typescript and then compile to js using tsc. The goal is maintainable, readable, and low complexity. Aim to use the browser APIs whenever possible, and always ask before integrating new libraries.
WebComponents can be used to manage and support modular development.
For example, we'll just use the WebAudio API for any pitch generation or processing/play back. I want the app to be lightning fast, to build almost instantly, and deploys must be simple and fast.

The same goes for CSS - just use vanilla CSS, aim for plain, readable, simple implementations. Don't be fancy or clever.

## MVP Scope (confirmed)

- Core single-note recognition only for the first build.
- Treble staff only; answer is pitch class (natural or accidental depending on settings).
- No trumpet transposition/fingering and no long-tone recording in the MVP.
- Fixed-count practice sessions; time-boxed sessions are a fast-follow feature.
- Progress is saved in `localStorage`; no backend or accounts.

## Decisions

| Topic | Choice |
| --- | --- |
| Spaced-repetition engine | `ts-fsrs` (npm dependency) |
| Persistence | `localStorage` |
| Session length | Fixed card count, default 10, user-configurable |
| Scoring | Binary Correct / Incorrect, mapped to `Rating.Good` / `Rating.Again` |
| Wrong answer flow | Show correct answer immediately, then re-quiz the note later in the same session |
| Staff rendering | Inline SVG |
| UI framework | None; vanilla TypeScript + CSS |
| CSS naming | BEM-style class names, kept simple |
| Build output | `tsc` compiles `src/**/*.ts` to `dist/` |
| Local dev server | `npx serve` |
| Deploy target | Render static sites |
| Unit tests | `vitest`, co-located with source as `src/**/*.test.ts` |
| E2E tests | Playwright, fast-follow after MVP |

## Architecture

A single-page browser app. State lives in a small module owned by `main.ts`. Domain logic is pure and lives under `src/domain/`. The UI is built with plain DOM and a few custom elements where they help isolate structure; these elements are stateless/presentational and are driven by props from `main.ts`.

## File Structure

```
frequency-friend/
├── docs/
│   ├── core.md          # this document
│   └── mvp_plan.md      # implementation plan
├── src/
│   ├── main.ts          # app bootstrap, central state, event wiring
│   ├── main.test.ts
│   ├── components/
│   │   ├── app-card.ts      # root practice-card custom element
│   │   ├── staff-display.ts # SVG staff + note custom element
│   │   └── settings-panel.ts # settings form custom element
│   ├── domain/
│   │   ├── note.ts      # pitch classes, note pool, range logic
│   │   ├── note.test.ts
│   │   ├── session.ts   # session queue, scoring, re-quiz logic
│   │   ├── session.test.ts
│   │   ├── scheduler.ts # ts-fsrs wrapper + persistence adapter
│   │   └── scheduler.test.ts
│   ├── storage.ts       # localStorage read/write helpers
│   └── storage.test.ts
├── style.css
├── index.html
├── tsconfig.json
├── package.json
└── README.md
```

## Data Model

- `PitchClass` — `0..11` representing C, C♯/D♭, D, … B.
- `Note` — `{ midi: number; pitchClass: PitchClass; octave: number; accidentalDisplay: 'natural' | 'sharp' | 'flat' }`.
- `SpelledNote` — `{ midi: number; key: string; displayName: string; pitchClass: PitchClass; accidental: 'natural' | 'sharp' | 'flat' }`. A single MIDI pitch may have multiple spellings (e.g. C♯4 and D♭4), and each spelling is tracked independently.
- `Config` — `{ floorMidi: number; ceilingMidi: number; includeAccidentals: boolean; cardsPerSession: number }`.
- `Session` — `{ config: Config; queue: SpelledNote[]; currentIndex: number; stats: { correct: number; total: number } }`.
- `Progress` — map from a spelling key (e.g. `"C#4"` or `"Db4"`) to a serializable `ts-fsrs` card state.

## Components & Flow

1. `main.ts` loads `Config` and `Progress` from `storage.ts`, builds the note pool with `note.ts`, and asks `scheduler.ts` which notes are due.
2. `session.ts` creates a queue of the requested length, injecting failed notes again later in the session.
3. `staff-display.ts` receives a `Note` and renders the treble clef, staff, note head, ledger lines, and accidental as SVG.
4. The answer UI shows the set of possible pitch-class buttons (7 when accidentals are off, 12 when on).
5. On answer: compare selected pitch class to the note, show feedback, update the `ts-fsrs` card state via `scheduler.ts`, and persist progress.
6. Settings panel toggles open over the practice view and writes `Config` back to `storage.ts`.

## Rendering

The staff is drawn with SVG:
- 5 staff lines as horizontal `<line>` elements.
- Treble clef as the music-symbol glyph `𝄞` inside the SVG text element.
- Note head as an ellipse placed on the correct line/space; ledger lines added when the note sits outside the staff.
- Accidentals rendered left of the note head when `accidentalDisplay` is `sharp` or `flat`.

Positioning is computed from the note’s MIDI number and its chosen spelling, so enharmonic variants land on the same staff location but are tracked separately in the spaced-repetition engine.

The treble clef is rendered as the `𝄞` music-symbol glyph inside the SVG, which avoids hand-maintaining a complex path and provides a reliable, scalable visual.

## Configuration

Settings panel exposes:
- Note range floor and ceiling (shown as note names, stored as MIDI numbers).
- Include accidentals toggle (when off, only natural notes A–G appear; when on, all 12 pitch classes appear).
- Cards per session.

Defaults: C4 to F5, accidentals off, 10 cards.

## Answer Buttons

- When accidentals are **off**, answer buttons are the seven natural pitch classes: **C, D, E, F, G, A, B**.
- When accidentals are **on**, answer buttons are all twelve pitch classes, labeled with enharmonic pairs where appropriate (e.g., **C♯ / D♭**).

## Scheduling

`scheduler.ts` wraps `ts-fsrs`:
- `createCard()` → `createEmptyCard()`.
- `reviewCard(card, correct, now)` → `scheduler.next(card, now, correct ? Rating.Good : Rating.Again)`.
- `pickDueNotes(pool, progress, now, count)` picks spelled notes whose `due` date is at or before `now`, falling back to random/weighted selection if not enough are due.

Progress is serialized to `localStorage` as JSON after each review.

## Testing

- `vitest` runs unit tests for pure domain modules.
- Each `.test.ts` file lives next to the module it tests.
- Tests cover: note pool generation, range filtering, enharmonic display, session queue construction, re-quiz behavior, scheduler rating transitions, and localStorage serialization.

## Deployment

Render static sites:
1. `npm install`
2. `npm run build` (`tsc`)
3. Publish the repository root (`index.html`, `style.css`, and `dist/`) as the static site.

## Future Phases

Features captured but not in the MVP:
- Time-boxed sessions.
- Bass / alto / tenor / grand staff support.
- Trumpet mode: B♭ transposition, fingering diagrams, fingering answer option.
- Long-tone mode: count-in metronome, microphone input, hold-time tracking.
- Accounts and cross-device sync.
