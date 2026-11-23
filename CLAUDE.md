# Frequency Friend Architecture

This project is a framework-free browser app for music students, focusing on low-complexity, high-performance practice tools.

## Core Design Principles

- **No Frameworks:** Vanilla TypeScript, compiled to JS via `tsc`.
- **Custom Elements:** Web Components used for modular UI encapsulation.
- **Web APIs:** Browser APIs (WebAudio, MediaRecorder, getUserMedia) for audio/mic.
- **Testing:** Co-located vitest unit tests + Playwright E2E.
- **State Management:** Centralized state in `app-card` with pure domain logic (`src/domain/`).

## Key Utility Domains

### Spaced Repetition (Scheduler)
Wraps `ts-fsrs` for card scheduling. State is persisted to `localStorage`.

### Tuner (Pitch Detection)
Real-time pitch detection via WebAudio `AnalyserNode` and autocorrelation with parabolic interpolation for sub-lag precision. Used for `long-tone` practice mode.

### Metronome
WebAudio-based click generator using square-wave oscillators for precise timing in count-ins.

### Fingering Engine
Maps note pitch classes to standard B♭ trumpet fingering combinations. Octave-aware logic selects between lower and upper register fingerings.

## User Stories

### Long Tone Mode (Bb Trumpet)
As a Bb trumpet player, I want to practice long tones on written pitches.
- **Target Pitch:** When the app prompts me to play a note (e.g., written D5), it transposes the target frequency down a whole step (to concert C5). This allows me to finger the displayed note.
- **Pitch Detection:** The tuner reflects the pitch I finger on the instrument, transposing the detection frequency back to written pitch. If the app prompts me to play written D5, and I play it (producing concert C5), the tuner correctly identifies and displays "D5".

## Project Structure
- `src/domain/`: Pure domain logic, state machines, and algorithms.
- `src/components/`: Presentational Web Components (`app-card`, `staff-display`, `long-tone-card`, etc.).
- `tests/e2e/`: Playwright suites for behavioral testing.
