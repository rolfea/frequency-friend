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
    const showFingerings = Boolean(parsed.showFingerings);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      floorMidi,
      ceilingMidi,
      sessionMode,
      cardsPerSession,
      sessionDurationMinutes,
      showFingerings,
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
