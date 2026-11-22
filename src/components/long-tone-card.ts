import type { Config, SpelledNote } from '../domain/note.js';
import { createLongToneState, currentHoldMs, startCountIn, startListening, stopLongTone, updateHold, type LongToneState } from '../domain/long-tone.js';
import { createMetronome, startMetronome } from '../domain/metronome.js';
import { autocorrelationPitch, FrequencyBuffer, midiToFrequency, readTuner, type TunerReading } from '../domain/tuner.js';
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
  private frequencyBuffer = new FrequencyBuffer(8);
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

    this.innerHTML = `
      <section class="long-tone-card">
        <p class="long-tone-card__hint" aria-live="polite">Play a long tone on ${targetName}</p>
        <staff-display class="long-tone-card__staff"></staff-display>
        <div class="long-tone-card__count-in ${this.countInClass()}" aria-hidden="true">
          ${this.countInDots()}
        </div>
        <canvas class="long-tone-card__waveform ${this.waveformClass()}" width="300" height="80"></canvas>
        <div class="long-tone-card__timer">${this.formatSeconds()}s</div>
        ${this.tunerMarkup()}
        <div class="long-tone-card__feedback" aria-live="polite"></div>
        <div class="long-tone-card__controls">
          <button type="button" class="long-tone-card__start" ${this.startDisabled()}>
            ${this.startButtonLabel()}
          </button>
          <button type="button" class="long-tone-card__stop" ${this.stopDisabled()}>Stop</button>
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

  private isRunning(): boolean {
    return this.state.phase === 'count-in' || this.state.phase === 'listening';
  }

  private countInClass(): string {
    return this.state.phase === 'count-in' ? '' : 'long-tone-card__count-in--hidden';
  }

  private waveformClass(): string {
    return this.isRunning() ? '' : 'long-tone-card__waveform--hidden';
  }

  private startDisabled(): string {
    return this.isRunning() ? 'disabled' : '';
  }

  private stopDisabled(): string {
    return this.isRunning() ? '' : 'disabled';
  }

  private tunerMarkup(): string {
    const hidden = this.state.phase !== 'listening' ? 'long-tone-card__tuner--hidden' : '';
    return `
      <div class="long-tone-card__tuner ${hidden}">
        <div class="long-tone-card__tuner-reading" aria-live="polite">—</div>
        <div class="long-tone-card__cents-meter">
          <div class="long-tone-card__cents-zero"></div>
          <div class="long-tone-card__cents-bar"></div>
        </div>
        <div class="long-tone-card__cents-label">cents</div>
      </div>
    `;
  }

  private countInDots(): string {
    const beats = this.config?.longToneBeats ?? 2;
    return Array.from({ length: beats }, (_, i) =>
      `<span class="long-tone-card__count-in-dot" data-beat="${i}"></span>`,
    ).join('');
  }

  private pulseCountIn(beatIndex: number): void {
    const dot = this.querySelector(`.long-tone-card__count-in-dot[data-beat="${beatIndex}"]`);
    if (!dot) return;
    dot.classList.add('long-tone-card__count-in-dot--active');
    setTimeout(() => dot.classList.remove('long-tone-card__count-in-dot--active'), 250);
  }

  private formatSeconds(): string {
    if (this.state.phase === 'done') return (this.state.totalHoldMs / 1000).toFixed(2);
    return '0.00';
  }

  private startButtonLabel(): string {
    if (this.isRunning()) return 'Listening...';
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
      this.frequencyBuffer = new FrequencyBuffer(8);
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      // Start drawing the waveform immediately so the user sees mic activity.
      this.rafHandle = requestAnimationFrame(() => this.tick());

      const metronome = createMetronome(
        this.audioContext,
        this.config.longToneTempo,
        this.config.longToneBeats,
        () => this.onCountInDone(),
        (beatIndex) => this.pulseCountIn(beatIndex),
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
  }

  private tick(): void {
    if (this.requestStop || !this.analyser) return;

    const canvas = this.querySelector('.long-tone-card__waveform') as HTMLCanvasElement | null;
    if (canvas) {
      this.drawWaveform(canvas);
    }

    if (this.state.phase === 'listening' && this.note && this.config) {
      const now = performance.now();
      const buffer = new Float32Array(this.analyser.fftSize);
      this.analyser.getFloatTimeDomainData(buffer);

      const sampleRate = this.analyser.context.sampleRate;
      const detected = autocorrelationPitch(buffer, sampleRate);
      const target = midiToFrequency(this.note.midi, true); // transpose for Bb trumpet
      const reading = readTuner(detected, target, this.config.longToneCentsTolerance, this.frequencyBuffer);

      this.state = updateHold(this.state, now, reading.inTune, this.config.longToneMinDurationMs);
      this.updateTimer(now);
      this.updateTuner(reading);
      this.updateInTuneUi(reading.inTune);
    }

    this.rafHandle = requestAnimationFrame(() => this.tick());
  }

  private updateInTuneUi(inTune: boolean): void {
    this.classList.toggle('long-tone-card--in-tune', inTune);
  }

  private drawWaveform(canvas: HTMLCanvasElement): void {
    if (!this.analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = this.classList.contains('long-tone-card--in-tune') ? 'var(--color-correct)' : 'var(--color-accent)';
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] ?? 0;
      // Amplify signal for better visibility
      const y = height / 2 + (v * height * 5);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
  }

  private updateTimer(now: number): void {
    if (!this.config) return;
    const holdMs = currentHoldMs(this.state, now, this.config.longToneMinDurationMs);
    const timerEl = this.querySelector('.long-tone-card__timer');
    if (timerEl) timerEl.textContent = `${(holdMs / 1000).toFixed(2)}s`;
  }

  private updateTuner(reading: TunerReading): void {
    const readingEl = this.querySelector('.long-tone-card__tuner-reading');
    const bar = this.querySelector('.long-tone-card__cents-bar') as HTMLElement | null;
    if (!readingEl || !bar) return;

    if (reading.frequency == null || reading.cents == null) {
      readingEl.textContent = '—';
      bar.style.width = '0%';
      bar.style.left = '50%';
      bar.classList.remove('long-tone-card__cents-bar--in-tune');
      return;
    }

    const cents = Math.max(-100, Math.min(100, reading.cents));
    const percent = 50 + cents / 2;
    readingEl.textContent = `${reading.noteName} · ${reading.frequency.toFixed(1)} Hz · ${Math.round(reading.cents)} cents`;
    bar.style.width = '4px';
    bar.style.left = `${percent}%`;
    bar.classList.toggle('long-tone-card__cents-bar--in-tune', reading.inTune);
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
