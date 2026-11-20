import type { Config, SpelledNote } from '../domain/note.js';
import { createLongToneState, currentHoldMs, startCountIn, startListening, stopLongTone, updateHold, type LongToneState } from '../domain/long-tone.js';
import { createMetronome, startMetronome } from '../domain/metronome.js';
import { autocorrelationPitch, isPitchInTune, midiToFrequency } from '../domain/tuner.js';
import './staff-display.js';
import type StaffDisplay from './staff-display.js';

type LongTonePhase = LongToneState['phase'];

class LongToneCard extends HTMLElement {
  private config: Config | null = null;
  private note: SpelledNote | null = null;
  private state = createLongToneState();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private rafHandle: number | null = null;
  private doneCallback: ((durationMs: number) => void) | null = null;
  private requestStop = false;

  connectedCallback(): void {
    this.render();
  }

  setConfig(config: Config): void {
    this.config = config;
    this.render();
  }

  setNote(note: SpelledNote): void {
    this.note = note;
    this.render();
  }

  // fallow-ignore-next-line unused-class-member
  onDone(callback: (durationMs: number) => void): void {
    this.doneCallback = callback;
  }

  private render(): void {
    const targetName = this.note?.displayName ?? 'Select a note';
    const isRunning = this.state.phase === 'count-in' || this.state.phase === 'listening';
    const seconds = this.formatSeconds();

    this.innerHTML = `
      <section class="long-tone-card">
        <p class="long-tone-card__hint" aria-live="polite">Play a long tone on ${targetName}</p>
        <staff-display class="long-tone-card__staff"></staff-display>
        <div class="long-tone-card__timer">${seconds}s</div>
        <div class="long-tone-card__feedback" aria-live="polite"></div>
        <div class="long-tone-card__controls">
          <button type="button" class="long-tone-card__start" ${isRunning ? 'disabled' : ''}>
            ${this.startButtonLabel(isRunning)}
          </button>
          <button type="button" class="long-tone-card__stop" ${!isRunning ? 'disabled' : ''}>Stop</button>
        </div>
      </section>
    `;

    if (this.note) {
      const staff = this.querySelector('staff-display') as unknown as StaffDisplay | null;
      if (staff) staff.setNote(this.note);
    }

    this.querySelector('.long-tone-card__start')?.addEventListener('click', () => this.start());
    this.querySelector('.long-tone-card__stop')?.addEventListener('click', () => this.stop());
  }

  private formatSeconds(): string {
    if (this.state.phase === 'done') return (this.state.totalHoldMs / 1000).toFixed(2);
    return '0.00';
  }

  private startButtonLabel(isRunning: boolean): string {
    if (isRunning) return 'Listening...';
    if (this.state.phase === 'done') return 'Try again';
    return 'Start';
  }

  disconnectedCallback(): void {
    this.stop();
  }

  private async start(): Promise<void> {
    if (!this.config || !this.note || this.state.phase === 'count-in' || this.state.phase === 'listening') return;

    this.requestStop = false;
    this.state = createLongToneState();
    this.state = startCountIn(this.state);
    this.render();

    try {
      this.audioContext = new AudioContext();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      const metronome = createMetronome(
        this.audioContext,
        this.config.longToneTempo,
        this.config.longToneBeats,
        () => this.onCountInDone(),
      );
      startMetronome(metronome);
    } catch (err) {
      this.showFeedback('Microphone access is required for long-tone practice.');
      this.state = createLongToneState();
      this.render();
    }
  }

  private onCountInDone(): void {
    if (this.requestStop) return;
    this.state = startListening(this.state, performance.now());
    this.render();
    this.rafHandle = requestAnimationFrame(() => this.sample());
  }

  private sample(): void {
    if (this.requestStop || this.state.phase !== 'listening' || !this.analyser || !this.note || !this.config) {
      return;
    }

    const now = performance.now();
    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    const sampleRate = this.analyser.context.sampleRate;
    const detected = autocorrelationPitch(buffer, sampleRate);
    const target = midiToFrequency(this.note.midi, true); // transpose for Bb trumpet
    const inTune = isPitchInTune(detected, target, this.config.longToneCentsTolerance);

    this.state = updateHold(this.state, now, inTune, this.config.longToneMinDurationMs);
    this.updateTimer(now);

    this.rafHandle = requestAnimationFrame(() => this.sample());
  }

  private updateTimer(now: number): void {
    if (!this.config) return;
    const holdMs = currentHoldMs(this.state, now, this.config.longToneMinDurationMs);
    const timerEl = this.querySelector('.long-tone-card__timer');
    if (timerEl) timerEl.textContent = `${(holdMs / 1000).toFixed(2)}s`;
  }

  private stop(): void {
    this.requestStop = true;
    if (this.rafHandle != null) cancelAnimationFrame(this.rafHandle);
    if (this.audioContext) this.audioContext.close();
    this.mediaStream?.getTracks().forEach((track) => track.stop());

    const now = performance.now();
    if (this.config && this.state.phase === 'listening') {
      this.state = stopLongTone(this.state, now, this.config.longToneMinDurationMs);
    } else if (this.state.phase === 'count-in') {
      this.state = { ...this.state, phase: 'done' };
    }

    this.showFeedback(`Held for ${(this.state.totalHoldMs / 1000).toFixed(2)} seconds.`);
    this.render();

    if (this.doneCallback) this.doneCallback(this.state.totalHoldMs);
  }

  private showFeedback(message: string): void {
    const feedback = this.querySelector('.long-tone-card__feedback');
    if (feedback) feedback.textContent = message;
  }
}

customElements.define('long-tone-card', LongToneCard);

export default LongToneCard;
