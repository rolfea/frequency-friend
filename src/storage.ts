import type { Config } from './domain/note.js';
import { deserializeProgress, serializeProgress, type Progress } from './domain/scheduler.js';

const CONFIG_KEY = 'frequency-friend:config';
const PROGRESS_KEY = 'frequency-friend:progress';

export const DEFAULT_CONFIG: Config = {
  floorMidi: 60, // C4
  ceilingMidi: 77, // F5 (top line of treble staff)
  includeAccidentals: false,
  sessionMode: 'cards',
  cardsPerSession: 10,
  sessionDurationMinutes: 5,
  showFingerings: false,
  practiceMode: 'quiz',
  longToneBeats: 2,
  longToneTempo: 80,
  longToneCentsTolerance: 50,
  longToneMinDurationMs: 500,
};

export function loadConfig(): Config {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    let floorMidi = Number.isFinite(parsed.floorMidi) ? parsed.floorMidi : DEFAULT_CONFIG.floorMidi;
    let ceilingMidi = Number.isFinite(parsed.ceilingMidi) ? parsed.ceilingMidi : DEFAULT_CONFIG.ceilingMidi;
    if (floorMidi > ceilingMidi) {
      [floorMidi, ceilingMidi] = [ceilingMidi, floorMidi];
    }
    let cardsPerSession = Number.isFinite(parsed.cardsPerSession) ? parsed.cardsPerSession : DEFAULT_CONFIG.cardsPerSession;
    cardsPerSession = Math.max(1, cardsPerSession);
    let sessionDurationMinutes = Number.isFinite(parsed.sessionDurationMinutes) ? parsed.sessionDurationMinutes : DEFAULT_CONFIG.sessionDurationMinutes;
    sessionDurationMinutes = Math.max(1, sessionDurationMinutes);
    const sessionMode = parsed.sessionMode === 'minutes' ? 'minutes' : 'cards';
    const practiceMode = parsed.practiceMode === 'long-tone' ? 'long-tone' : 'quiz';
    const showFingerings = Boolean(parsed.showFingerings);
    let longToneBeats = Number.isFinite(parsed.longToneBeats) ? parsed.longToneBeats : DEFAULT_CONFIG.longToneBeats;
    longToneBeats = longToneBeats === 4 ? 4 : 2;
    let longToneTempo = Number.isFinite(parsed.longToneTempo) ? parsed.longToneTempo : DEFAULT_CONFIG.longToneTempo;
    longToneTempo = Math.max(40, Math.min(208, longToneTempo));
    let longToneCentsTolerance = Number.isFinite(parsed.longToneCentsTolerance) ? parsed.longToneCentsTolerance : DEFAULT_CONFIG.longToneCentsTolerance;
    longToneCentsTolerance = Math.max(5, Math.min(200, longToneCentsTolerance));
    let longToneMinDurationMs = Number.isFinite(parsed.longToneMinDurationMs) ? parsed.longToneMinDurationMs : DEFAULT_CONFIG.longToneMinDurationMs;
    longToneMinDurationMs = Math.max(100, longToneMinDurationMs);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      floorMidi,
      ceilingMidi,
      sessionMode,
      cardsPerSession,
      sessionDurationMinutes,
      showFingerings,
      practiceMode,
      longToneBeats,
      longToneTempo,
      longToneCentsTolerance,
      longToneMinDurationMs,
    };
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
