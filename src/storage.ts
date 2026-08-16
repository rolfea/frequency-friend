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
