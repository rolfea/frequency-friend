import type { Fingering } from '../domain/fingering.js';

class FingeringOption extends HTMLElement {
  private valves: Fingering = [0, 0, 0];
  private label: string = '';
  private selectCallback: ((valves: Fingering) => void) | null = null;

  connectedCallback(): void {
    this.render();
  }

  setValves(valves: Fingering, label?: string): void {
    this.valves = valves;
    if (label) this.label = label;
    this.render();
  }

  onSelect(callback: (valves: Fingering) => void): void {
    this.selectCallback = callback;
  }

  private render(): void {
    const [v1, v2, v3] = this.valves;
    const ariaLabel = this.label || `Valves ${this.valves.join('-')}`;
    this.innerHTML = `
      <button type="button" class="fingering-option" aria-label="${ariaLabel}">
        <svg class="fingering-option__svg" viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="50" height="90" rx="25" ry="25"
            class="fingering-option__casing" fill="none" stroke="currentColor" stroke-width="3" />
          <circle cx="30" cy="28" r="11"
            class="fingering-option__valve ${v1 ? 'fingering-option__valve--pressed' : ''}" />
          <circle cx="30" cy="50" r="11"
            class="fingering-option__valve ${v2 ? 'fingering-option__valve--pressed' : ''}" />
          <circle cx="30" cy="72" r="11"
            class="fingering-option__valve ${v3 ? 'fingering-option__valve--pressed' : ''}" />
        </svg>
      </button>
    `;
    this.querySelector('button')!.addEventListener('click', () => {
      if (this.selectCallback) this.selectCallback(this.valves);
    });
  }
}

customElements.define('fingering-option', FingeringOption);

export default FingeringOption;
