import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULT_CONFIG, loadConfig, saveConfig, loadProgress, saveProgress } from './storage.js';

describe('config storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it('round-trips config changes', () => {
    const config = {
      ...DEFAULT_CONFIG,
      floorMidi: 55,
      ceilingMidi: 72,
      includeAccidentals: true,
      sessionMode: 'minutes' as const,
      cardsPerSession: 15,
      sessionDurationMinutes: 3,
      showFingerings: true,
      practiceMode: 'long-tone' as const,
      longToneBeats: 4,
      longToneTempo: 100,
      longToneCentsTolerance: 25,
      longToneMinDurationMs: 750,
    };
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

  it('clamps long-tone settings', () => {
    localStorage.setItem(
      'frequency-friend:config',
      JSON.stringify({
        longToneBeats: 6,
        longToneTempo: 300,
        longToneCentsTolerance: 300,
        longToneMinDurationMs: -50,
      }),
    );
    const config = loadConfig();
    expect(config.longToneBeats).toBe(2);
    expect(config.longToneTempo).toBe(208);
    expect(config.longToneCentsTolerance).toBe(200);
    expect(config.longToneMinDurationMs).toBe(100);
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
