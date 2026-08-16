import type { PitchClass } from '../domain/note.js';

class AnswerButtons extends HTMLElement {
  private selectCallback: ((pitchClass: PitchClass) => void) | null = null;

  setOptions(options: { pitchClass: PitchClass; label: string }[]): void {
    this.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'answer-buttons__grid';
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-buttons__button';
      button.textContent = option.label;
      button.dataset.pitchClass = String(option.pitchClass);
      button.addEventListener('click', () => {
        if (this.selectCallback) this.selectCallback(option.pitchClass);
      });
      grid.appendChild(button);
    }
    this.appendChild(grid);
  }

  setEnabled(enabled: boolean): void {
    this.querySelectorAll('button').forEach((btn) => {
      btn.disabled = !enabled;
    });
  }

  onSelect(callback: (pitchClass: PitchClass) => void): void {
    this.selectCallback = callback;
  }
}

customElements.define('answer-buttons', AnswerButtons);

export default AnswerButtons;
