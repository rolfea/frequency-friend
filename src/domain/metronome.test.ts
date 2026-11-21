import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createMetronome, startMetronome } from './metronome.js';

function createMockAudioContext(): AudioContext {
  const scheduled: { time: number; type: string }[] = [];
  const mock = {
    currentTime: 0,
    destination: {} as AudioDestinationNode,
    createOscillator: vi.fn(() => ({
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn((time: number) => scheduled.push({ time, type: 'start' })),
      stop: vi.fn((time: number) => scheduled.push({ time, type: 'stop' })),
    })),
    createGain: vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    })),
    setTimeout: undefined,
  } as unknown as AudioContext;
  (mock as any).scheduled = scheduled;
  return mock;
}

describe('metronome', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('schedules the requested number of clicks', () => {
    const ctx = createMockAudioContext();
    const done = vi.fn();
    const metronome = createMetronome(ctx, 60, 4, done);

    startMetronome(metronome);

    const starts = (ctx as any).scheduled.filter((e: { type: string }) => e.type === 'start');
    expect(starts).toHaveLength(4);
    expect(starts.map((e: { time: number }) => e.time)).toEqual([0, 1, 2, 3]);
  });

  it('spaces clicks by tempo', () => {
    const ctx = createMockAudioContext();
    const done = vi.fn();
    const metronome = createMetronome(ctx, 120, 2, done);

    startMetronome(metronome);

    const starts = (ctx as any).scheduled.filter((e: { type: string }) => e.type === 'start');
    expect(starts.map((e: { time: number }) => e.time)).toEqual([0, 0.5]);
  });

  it('fires onClick for each beat', () => {
    const ctx = createMockAudioContext();
    const done = vi.fn();
    const click = vi.fn();
    const metronome = createMetronome(ctx, 120, 3, done, click);

    startMetronome(metronome);
    vi.advanceTimersByTime(1000);

    expect(click).toHaveBeenCalledTimes(3);
    expect(click).toHaveBeenLastCalledWith(2);
  });
});
