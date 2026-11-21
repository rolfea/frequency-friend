# Long Tone Utility — Implementation Plan

## Goal
Add long-tone practice as an alternative session type. Instead of naming the pitch and picking a fingering, the user sees a note, hears a count-in, plays/sings it, and gets feedback on how long they held the target pitch.

## Scope (naive first cut)
- **Entry point:** a session-mode toggle in Settings: "Practice mode" with options `quiz` and `long-tone`.
- **Quiz mode:** existing behavior (pitch name + optional fingering).
- **Long-tone mode:** each card shows a note, counts the user in, then uses the microphone + tuner to measure how long the user sustains the target pitch.
- **Count-in:** configurable beats (2 or 4) at a configurable tempo (60–120 BPM). Audio click via WebAudio oscillator.
- **Tuning:** real-time pitch detection via WebAudio `AnalyserNode` + autocorrelation. Compare detected frequency to target pitch frequency.
- **Transposition:** for B♭ trumpet, the target pitch is transposed down a whole step, so the player fingers the displayed note.
- **Strictness:** configurable cents tolerance and minimum duration within tolerance.
- **Results:** show hold duration. No saving of results for now.

## New files

| File | Purpose |
| --- | --- |
| `src/domain/long-tone.ts` | Pure state machine: `LongToneState`, `startCountIn`, `startListening`, `stop`, `durationMs`, hold detection. |
| `src/domain/long-tone.test.ts` | Unit tests for state transitions and timing math. |
| `src/domain/metronome.ts` | Simple WebAudio click generator. |
| `src/domain/metronome.test.ts` | Mock WebAudio and verify scheduling. |
| `src/domain/tuner.ts` | Pitch detection via autocorrelation; cents calculation; B♭ transposition helper. |
| `src/domain/tuner.test.ts` | Tests with synthetic signals and frequency math. |
| `src/components/long-tone-card.ts` | Custom element for the long-tone practice UI. |
| `src/components/long-tone-card.test.ts` | Basic render/state tests. |

## Modified files
- `src/components/app-card.ts` — branch between quiz and long-tone based on `Config.practiceMode`.
- `src/components/settings-panel.ts` — add practice-mode selector, count-in beats, tempo, cents tolerance, minimum hold duration.
- `src/storage.ts` / `src/domain/note.ts` — extend `Config` with `practiceMode`, long-tone fields.
- `style.css` — layout for long-tone card, tuner feedback, timer.
- `tests/e2e/long-tone.spec.ts` — basic Playwright test for switching mode and running through a card.

## Data model additions

```ts
interface Config {
  // existing fields...
  practiceMode: 'quiz' | 'long-tone';
  longToneBeats: number;           // 2 or 4
  longToneTempo: number;           // 60–120 BPM
  longToneCentsTolerance: number;  // e.g. 25, 50, 100 cents
  longToneMinDurationMs: number;   // e.g. 500 ms
}
```

## Flow

1. User sets **Practice mode** to **Long tone** in Settings, saves.
2. `app-card` creates a session and renders `<long-tone-card>` for each card instead of the quiz controls.
3. `long-tone-card` displays the note on `<staff-display>` and a **Start** button.
4. On **Start**, it schedules count-in clicks via `metronome.ts`.
5. After count-in, it opens the mic and runs an `AnalyserNode` loop calling `tuner.ts`.
6. When detected pitch is within `longToneCentsTolerance` of the B♭-transposed target for `longToneMinDurationMs`, the hold timer starts.
7. Timer continues while pitch stays within tolerance; pauses if pitch leaves tolerance for more than a short grace window.
8. When the user clicks **Stop** or the sound drops out, show final hold duration and a **Next** button.
9. On **Next**, advance to the next card via existing `session.answer` path (mark as correct for now so scheduling moves forward).

## Pitch detection approach

- Autocorrelation on `AnalyserNode.getFloatTimeDomainData()`.
- `centsDiff(detected, target) = 1200 * log2(detected / target)`.
- Target frequency = `440 * 2^((midi - 69) / 12)` transposed down a whole step when trumpet/B♭ mode is active (so the displayed note is the fingered note).
- Smoothing: maintain a short ring buffer of detected frequencies; drop outliers, then use median.

## Global constraints
- No new npm dependencies. Use WebAudio API, `getUserMedia`.
- Co-locate tests with source.
- Keep CSS simple/BEM-style.
- No persistence of long-tone results yet.

## Risks / open questions
1. Microphone permission UX varies by browser. Need a clear prompt/explanation.
2. Pitch detection accuracy in noisy environments. Tolerance and smoothing should help.
3. Octave detection: if the user plays/sings an octave above or below, autocorrelation may pick a different partial. Tolerance won’t catch octaves; acceptable for naive cut.

## Verification
- Unit: `npm run test`
- E2E: `npm run test:e2e`
- Manual: run `npm run dev`, switch to long-tone mode, verify count-in, tuner feedback, and timer.

## Task order
1. Add `practiceMode` and long-tone config fields; update storage tests.
2. Build metronome domain + tests.
3. Build tuner domain (autocorrelation, cents, transposition) + tests.
4. Build long-tone state machine + tests.
5. Build `<long-tone-card>` component + tests.
6. Wire into `app-card` and settings panel.
7. Add CSS.
8. Add e2e test.
9. Self-review and manual UI check.
