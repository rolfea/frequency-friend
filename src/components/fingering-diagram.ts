import type { Fingering } from '../domain/fingering.js';

class FingeringDiagram extends HTMLElement {
  private valves: SVGCircleElement[] = [];

  connectedCallback(): void {
    this.innerHTML = `
      <svg class="fingering-diagram" viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="160" rx="40" ry="40"
          class="fingering-diagram__casing" fill="none" stroke="currentColor" stroke-width="3" />
        <g class="fingering-diagram__valves">
          <circle cx="50" cy="50" r="14" class="fingering-diagram__valve" />
          <circle cx="50" cy="90" r="14" class="fingering-diagram__valve" />
          <circle cx="50" cy="130" r="14" class="fingering-diagram__valve" />
        </g>
        <text x="50" y="54" text-anchor="middle" class="fingering-diagram__label" font-size="14">1</text>
        <text x="50" y="94" text-anchor="middle" class="fingering-diagram__label" font-size="14">2</text>
        <text x="50" y="134" text-anchor="middle" class="fingering-diagram__label" font-size="14">3</text>
      </svg>
    `;
    this.valves = Array.from(this.querySelectorAll('.fingering-diagram__valve'));
    this.setFingering([0, 0, 0]);
  }

  setFingering(valves: Fingering): void {
    this.valves.forEach((circle, index) => {
      const pressed = valves[index] === 1;
      circle.classList.toggle('fingering-diagram__valve--pressed', pressed);
      circle.setAttribute('fill', pressed ? 'currentColor' : 'none');
    });
  }
}

customElements.define('fingering-diagram', FingeringDiagram);

export default FingeringDiagram;
