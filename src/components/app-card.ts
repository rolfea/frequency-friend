import type { Config, PitchClass, SpelledNote } from '../domain/note.js';
import { createSession, currentNote, answer, formatRemainingTime } from '../domain/session.js';
import { loadConfig, loadProgress, saveConfig, saveProgress } from '../storage.js';
import { pitchClassToName } from '../domain/note.js';
import type StaffDisplay from './staff-display.js';
import type AnswerButtons from './answer-buttons.js';
import type SettingsPanel from './settings-panel.js';
import './staff-display.js';
import './answer-buttons.js';
import './settings-panel.js';

class AppCard extends HTMLElement {
  private config: Config = loadConfig();
  private progress = loadProgress();
  private session = createSession(this.config, this.progress, new Date());
  private timerHandle: number | null = null;

  connectedCallback(): void {
    this.render();
    this.showCurrentNote();
  }

  disconnectedCallback(): void {
    this.stopTimer();
  }

  private render(): void {
    this.innerHTML = `
      <section class="app-card">
        <header class="app-card__header">
          <h1 class="app-card__title">Frequency Friend</h1>
          <button class="app-card__settings-toggle" type="button">Settings</button>
        </header>
        <div class="app-card__stats"></div>
        <p class="app-card__hint" aria-live="polite">Name the pitch!</p>
        <staff-display class="app-card__staff"></staff-display>
        <div class="app-card__feedback" aria-live="polite"></div>
        <answer-buttons class="app-card__answers"></answer-buttons>
        <settings-panel class="app-card__settings app-card__settings--hidden"></settings-panel>
      </section>
    `;

    const staff = this.querySelector('staff-display')! as unknown as StaffDisplay;
    const answers = this.querySelector('answer-buttons')! as unknown as AnswerButtons;
    const feedback = this.querySelector('.app-card__feedback')!;
    const settingsPanel = this.querySelector('settings-panel')! as unknown as SettingsPanel;
    const toggle = this.querySelector('.app-card__settings-toggle')!;

    this.updateAnswerButtons();

    answers.onSelect((pitchClass: PitchClass) => {
      const now = new Date();
      const result = answer(this.session, this.progress, pitchClass, now);
      if (!result) {
        this.showSummary();
        return;
      }
      this.session = result.updatedSession;
      this.progress = result.updatedProgress;
      saveProgress(this.progress);

      const note = this.session.queue[this.session.currentIndex - 1]!;
      const correctName = pitchClassToName(result.correctPitchClass, note.accidental !== 'flat');
      feedback.textContent = result.wasCorrect
        ? 'Correct!'
        : `Incorrect. The correct answer was ${correctName}.`;
      feedback.className = `app-card__feedback app-card__feedback--${result.wasCorrect ? 'correct' : 'incorrect'}`;

      const hint = this.querySelector('.app-card__hint');
      if (hint) {
        hint.classList.add('app-card__hint--hidden');
      }

      this.updateStats();
      answers.setEnabled(false);

      setTimeout(() => {
        if (currentNote(this.session)) {
          this.showCurrentNote();
          answers.setEnabled(true);
          feedback.textContent = '';
        } else {
          this.showSummary();
        }
      }, 1200);
    });

    settingsPanel.setConfig(this.config);
    settingsPanel.onSave((config) => {
      this.config = config;
      saveConfig(config);
      this.session = createSession(this.config, this.progress, new Date());
      settingsPanel.classList.add('app-card__settings--hidden');
      settingsPanel.setConfig(this.config);
      this.showCurrentNote();
    });

    toggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('app-card__settings--hidden');
    });

    this.startTimer();
  }

  private showCurrentNote(): void {
    const note = currentNote(this.session);
    if (!note) {
      this.showSummary();
      return;
    }
    const staff = this.querySelector('staff-display') as unknown as StaffDisplay;
    staff.setNote(note);
    this.updateAnswerButtons();
    this.updateStats();
    this.startTimer();
  }

  private updateAnswerButtons(): void {
    const answers = this.querySelector('answer-buttons')! as unknown as AnswerButtons;
    const options: { pitchClass: PitchClass; label: string }[] = [];
    if (this.config.includeAccidentals) {
      for (let pc = 0; pc < 12; pc++) {
        const pitchClass = pc as PitchClass;
        options.push({ pitchClass, label: this.labelForPitchClass(pitchClass) });
      }
    } else {
      for (const pc of [0, 2, 4, 5, 7, 9, 11] as PitchClass[]) {
        options.push({ pitchClass: pc, label: pitchClassToName(pc, true) });
      }
    }
    (answers as unknown as AnswerButtons).setOptions(options);
  }

  private labelForPitchClass(pc: PitchClass): string {
    const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(pc);
    if (isNatural) return pitchClassToName(pc, true);
    return `${pitchClassToName(pc, true)} / ${pitchClassToName(pc, false)}`;
  }

  private updateStats(): void {
    const statsEl = this.querySelector('.app-card__stats')!;
    const remainingCards = this.session.queue.length - this.session.currentIndex;
    const mode = this.config.sessionMode;
    if (mode === 'minutes' && this.session.endTime) {
      const remainingMs = this.session.endTime.getTime() - Date.now();
      const timeText = formatRemainingTime(remainingMs);
      statsEl.textContent = `${this.session.stats.correct} / ${this.session.stats.total} correct · ${timeText} remaining`;
    } else {
      statsEl.textContent = `${this.session.stats.correct} / ${this.session.stats.total} correct · ${remainingCards} remaining`;
    }
  }

  private startTimer(): void {
    this.stopTimer();
    if (this.config.sessionMode !== 'minutes' || !this.session.endTime) {
      return;
    }
    const tick = () => {
      if (!this.session.endTime) {
        this.stopTimer();
        return;
      }
      const remainingMs = this.session.endTime.getTime() - Date.now();
      this.updateStats();
      if (remainingMs <= 0) {
        this.stopTimer();
        const answers = this.querySelector('answer-buttons') as unknown as AnswerButtons | null;
        if (answers) answers.setEnabled(false);
        const feedback = this.querySelector('.app-card__feedback');
        if (feedback) {
          feedback.textContent = "Time's up!";
          feedback.className = 'app-card__feedback app-card__feedback--incorrect';
        }
        setTimeout(() => this.showSummary(), 1500);
      }
    };
    tick();
    this.timerHandle = window.setInterval(tick, 1000);
  }

  private stopTimer(): void {
    if (this.timerHandle !== null) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  private showSummary(): void {
    this.stopTimer();
    this.innerHTML = `
      <section class="app-card app-card--summary">
        <h2 class="app-card__title">Session complete</h2>
        <p class="app-card__score">${this.session.stats.correct} / ${this.session.stats.total} correct</p>
        <button class="app-card__restart" type="button">Practice again</button>
      </section>
    `;
    this.querySelector('.app-card__restart')!.addEventListener('click', () => {
      this.session = createSession(this.config, this.progress, new Date());
      this.render();
      this.showCurrentNote();
    });
  }
}

customElements.define('app-card', AppCard);
