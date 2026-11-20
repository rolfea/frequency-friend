import type { Fingering } from '../domain/fingering.js';
import { renderFingeringSvg } from './fingering-svg.js';

const OPTION_PROPS = {
  width: 60,
  height: 100,
  casingRx: 25,
  casingRy: 25,
  casingStroke: 3,
  valveRadius: 11,
  valveStroke: 2,
  valveCy: [28, 50, 72] as [number, number, number],
  classPrefix: 'fingering-option',
};

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
    const ariaLabel = this.label || (this.valves.every((v) => v === 0) ? 'Open' : 'Pressed valves');
    this.innerHTML = `
      <button type="button" class="fingering-option" aria-label="${ariaLabel}">
        ${renderFingeringSvg(this.valves, OPTION_PROPS)}
      </button>
    `;
    this.querySelector('button')!.addEventListener('click', () => {
      if (this.selectCallback) this.selectCallback(this.valves);
    });
  }
}

customElements.define('fingering-option', FingeringOption);

export default FingeringOption;
