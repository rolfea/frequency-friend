export type LongTonePhase = 'idle' | 'count-in' | 'listening' | 'done';

export interface LongToneState {
  phase: LongTonePhase;
  startTime: number | null;
  holdStartTime: number | null;
  totalHoldMs: number;
  lastInTuneTime: number | null;
  graceWindowMs: number;
}

export function createLongToneState(): LongToneState {
  return {
    phase: 'idle',
    startTime: null,
    holdStartTime: null,
    totalHoldMs: 0,
    lastInTuneTime: null,
    graceWindowMs: 150,
  };
}

export function startCountIn(state: LongToneState): LongToneState {
  if (state.phase !== 'idle' && state.phase !== 'done') return state;
  return {
    ...createLongToneState(),
    phase: 'count-in',
  };
}

export function startListening(state: LongToneState, now: number): LongToneState {
  if (state.phase !== 'count-in') return state;
  return {
    ...state,
    phase: 'listening',
    startTime: now,
  };
}

export function updateHold(
  state: LongToneState,
  now: number,
  inTune: boolean,
  minDurationMs: number,
): LongToneState {
  if (state.phase !== 'listening') return state;

  let { holdStartTime, totalHoldMs, lastInTuneTime } = state;

  if (inTune) {
    if (holdStartTime == null) {
      holdStartTime = now;
    }
    lastInTuneTime = now;
  } else if (holdStartTime != null && lastInTuneTime != null) {
    const gapMs = now - lastInTuneTime;
    if (gapMs > state.graceWindowMs) {
      // Pitch has been out of tolerance long enough to end the current hold.
      const segment = lastInTuneTime - holdStartTime;
      if (segment >= minDurationMs) {
        totalHoldMs += segment;
      }
      holdStartTime = null;
      lastInTuneTime = null;
    }
  }

  return {
    ...state,
    holdStartTime,
    lastInTuneTime,
    totalHoldMs,
  };
}

function activeSegmentMs(state: LongToneState, now: number, minDurationMs: number): number {
  if (state.holdStartTime == null || state.lastInTuneTime == null) return 0;
  const gapMs = now - state.lastInTuneTime;
  const segment = gapMs <= state.graceWindowMs ? now - state.holdStartTime : state.lastInTuneTime - state.holdStartTime;
  return segment >= minDurationMs ? segment : 0;
}

export function stopLongTone(state: LongToneState, now: number, minDurationMs: number): LongToneState {
  if (state.phase !== 'listening') return state;

  const totalHoldMs = state.totalHoldMs + activeSegmentMs(state, now, minDurationMs);

  return {
    ...state,
    phase: 'done',
    holdStartTime: null,
    lastInTuneTime: null,
    totalHoldMs,
  };
}

export function currentHoldMs(state: LongToneState, now: number, minDurationMs: number): number {
  return state.totalHoldMs + activeSegmentMs(state, now, minDurationMs);
}
