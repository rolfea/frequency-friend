import { describe, expect, it, beforeEach } from 'vitest';
import { loadConfig, saveConfig, loadProgress, saveProgress } from './storage.js';

describe('config storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    const config = loadConfig();
    expect(config.floorMidi).toBe(60);
    expect(config.ceilingMidi).toBe(77);
    expect(config.includeAccidentals).toBe(false);
    expect(config.cardsPerSession).toBe(10);
  });

  it('round-trips config changes', () => {
    const config = { floorMidi: 55, ceilingMidi: 72, includeAccidentals: true, cardsPerSession: 15 };
    saveConfig(config);
    expect(loadConfig()).toEqual(config);
  });

  it('normalizes an inverted range so floor is not above ceiling', () => {
    localStorage.setItem('frequency-friend:config', JSON.stringify({ floorMidi: 72, ceilingMidi: 60 }));
    const config = loadConfig();
    expect(config.floorMidi).toBeLessThanOrEqual(config.ceilingMidi);
    expect(config.floorMidi).toBe(60);
    expect(config.ceilingMidi).toBe(72);
  });

  it('clamps cardsPerSession to at least 1', () => {
    localStorage.setItem('frequency-friend:config', JSON.stringify({ cardsPerSession: 0 }));
    expect(loadConfig().cardsPerSession).toBe(1);
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
    const loaded = loadProgress();
    expect(loaded['60'].due).toBeInstanceOf(Date);
    expect(loaded['60'].due.getTime()).toBe(progress['60'].due);
  });
});
