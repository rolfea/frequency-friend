import type { Fingering } from '../domain/fingering.js';
import { renderFingeringSvg } from './fingering-svg.js';

const DIAGRAM_PROPS = {
  width: 100,
  height: 180,
  casingRx: 40,
  casingRy: 40,
  casingStroke: 3,
  valveRadius: 14,
  valveStroke: 2,
  valveCy: [130, 90, 50] as [number, number, number],
  classPrefix: 'fingering-diagram',
};

class FingeringDiagram extends HTMLElement {
  private valves: SVGCircleElement[] = [];

  connectedCallback(): void {
    this.innerHTML = renderFingeringSvg([0, 0, 0], DIAGRAM_PROPS);
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
