import type { FingeringOption } from '../domain/fingering.js';

class FingeringButtons extends HTMLElement {
  private selectCallback: ((valves: [number, number, number]) => void) | null = null;

  setOptions(options: FingeringOption[]): void {
    this.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'fingering-buttons__grid';
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fingering-buttons__button';
      button.textContent = option.label;
      button.dataset.valves = JSON.stringify(option.valves);
      button.addEventListener('click', () => {
        if (this.selectCallback) this.selectCallback(option.valves);
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

  onSelect(callback: (valves: [number, number, number]) => void): void {
    this.selectCallback = callback;
  }
}

customElements.define('fingering-buttons', FingeringButtons);

export default FingeringButtons;
