import { describe, expect, it } from 'vitest';
import {
  createLongToneState,
  currentHoldMs,
  startCountIn,
  startListening,
  stopLongTone,
  updateHold,
} from './long-tone.js';

describe('long-tone state machine', () => {
  it('starts in idle', () => {
    expect(createLongToneState().phase).toBe('idle');
  });

  it('moves from idle to count-in', () => {
    const state = startCountIn(createLongToneState());
    expect(state.phase).toBe('count-in');
  });

  it('moves from count-in to listening', () => {
    let state = startCountIn(createLongToneState());
    state = startListening(state, 1000);
    expect(state.phase).toBe('listening');
    expect(state.startTime).toBe(1000);
  });

  it('tracks a continuous in-tune segment', () => {
    let state = startCountIn(createLongToneState());
    state = startListening(state, 0);
    state = updateHold(state, 300, true, 100);
    state = updateHold(state, 800, true, 100);
    state = stopLongTone(state, 800, 100);
    expect(state.phase).toBe('done');
    expect(state.totalHoldMs).toBe(500);
  });

  it('ignores segments shorter than min duration', () => {
    let state = startCountIn(createLongToneState());
    state = startListening(state, 0);
    state = updateHold(state, 50, true, 100);
    state = updateHold(state, 100, false, 100);
    state = stopLongTone(state, 100, 100);
    expect(state.totalHoldMs).toBe(0);
  });

  it('bridges a short gap with the grace window', () => {
    let state = startCountIn(createLongToneState());
    state = startListening(state, 0);
    state = updateHold(state, 300, true, 100); // hold starts
    state = updateHold(state, 350, false, 100); // 50ms gap, within grace
    state = updateHold(state, 430, true, 100); // back in tune
    state = updateHold(state, 500, false, 100); // 70ms gap, still within grace
    state = updateHold(state, 600, false, 100); // gap now 170ms, exceeds grace
    state = stopLongTone(state, 600, 100);
    expect(state.phase).toBe('done');
    expect(state.totalHoldMs).toBe(130); // 430 - 300 = 130, gaps counted within grace
  });

  it('ends the hold when out-of-tune gap exceeds the grace window', () => {
    let state = startCountIn(createLongToneState());
    state = startListening(state, 0);
    state = updateHold(state, 300, true, 100); // 0ms segment so far
    state = updateHold(state, 500, false, 100); // 200ms gap > grace, ends hold at 300
    state = updateHold(state, 700, true, 100); // new hold starts at 700
    state = updateHold(state, 900, true, 100); // in tune until 900
    state = stopLongTone(state, 900, 100);
    expect(state.totalHoldMs).toBe(200); // 900 - 700 = 200
  });

  it('reports current hold during listening', () => {
    let state = startCountIn(createLongToneState());
    state = startListening(state, 0);
    state = updateHold(state, 300, true, 100);
    state = updateHold(state, 600, true, 100);
    expect(currentHoldMs(state, 600, 100)).toBe(300);
  });
});
