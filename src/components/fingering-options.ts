import type { Fingering } from '../domain/fingering.js';
import { fingeringOptions, type FingeringOption as FingeringOptionData } from '../domain/fingering.js';
import './fingering-option.js';
import type FingeringOption from './fingering-option.js';

class FingeringOptions extends HTMLElement {
  private selectCallback: ((valves: Fingering) => void) | null = null;

  setOptions(options: FingeringOptionData[] = fingeringOptions()): void {
    this.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'fingering-options__grid';
    for (const option of options) {
      const el = document.createElement('fingering-option') as unknown as FingeringOption;
      el.setValves(option.valves, option.label);
      el.onSelect((valves) => {
        if (this.selectCallback) this.selectCallback(valves);
      });
      grid.appendChild(el as unknown as Node);
    }
    this.appendChild(grid);
  }

  setEnabled(enabled: boolean): void {
    this.querySelectorAll('fingering-option').forEach((el) => {
      const btn = el.querySelector('button') as HTMLButtonElement | null;
      if (btn) btn.disabled = !enabled;
    });
  }

  onSelect(callback: (valves: Fingering) => void): void {
    this.selectCallback = callback;
  }
}

customElements.define('fingering-options', FingeringOptions);

export default FingeringOptions;
