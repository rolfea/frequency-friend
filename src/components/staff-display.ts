import { midiToDiatonicStep, pitchClassToName, type SpelledNote } from '../domain/note.js';

const STAFF_WIDTH = 320;
const STAFF_HEIGHT = 160;
const LINE_SPACING = 12;
const CENTER_X = STAFF_WIDTH / 2;
const MIDDLE_LINE_Y = STAFF_HEIGHT / 2; // B4

class StaffDisplay extends HTMLElement {
  private svg: SVGSVGElement;

  constructor() {
    super();
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', `0 0 ${STAFF_WIDTH} ${STAFF_HEIGHT}`);
    this.svg.setAttribute('class', 'staff-display__svg');
    this.appendChild(this.svg);
    this.render();
  }

  setNote(note: SpelledNote): void {
    this.render(note);
  }

  private render(note?: SpelledNote): void {
    this.svg.innerHTML = '';

    // Staff lines: E4, G4, B4, D5, F5
    for (let i = -2; i <= 2; i++) {
      const y = MIDDLE_LINE_Y - i * LINE_SPACING;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '20');
      line.setAttribute('x2', String(STAFF_WIDTH - 20));
      line.setAttribute('y1', String(y));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '1');
      this.svg.appendChild(line);
    }

    // Treble clef
    const clef = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    clef.setAttribute('x', '30');
    clef.setAttribute('y', String(MIDDLE_LINE_Y + 18));
    clef.setAttribute('font-size', '48');
    clef.setAttribute('class', 'staff-display__clef');
    clef.textContent = '𝄞';
    this.svg.appendChild(clef);

    if (note) {
      this.renderNote(note);
    }
  }

  private renderNote(note: SpelledNote): void {
    const step = midiToDiatonicStep(note.midi);
    const y = MIDDLE_LINE_Y - step.step * (LINE_SPACING / 2);

    // Ledger lines extend the staff for line notes outside the [0, 8] range.
    const isLine = step.step % 2 === 0;
    if (isLine && step.step > 8) {
      for (let lineStep = 10; lineStep <= step.step; lineStep += 2) {
        this.drawLedgerLine(lineStep);
      }
    } else if (isLine && step.step < 0) {
      for (let lineStep = -2; lineStep >= step.step; lineStep -= 2) {
        this.drawLedgerLine(lineStep);
      }
    }

    // Note head
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    head.setAttribute('cx', String(CENTER_X));
    head.setAttribute('cy', String(y));
    head.setAttribute('rx', '8');
    head.setAttribute('ry', '6');
    head.setAttribute('class', 'note-head');
    head.setAttribute('fill', 'currentColor');
    this.svg.appendChild(head);

    // Accidental
    if (note.accidental !== 'natural') {
      const accidental = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      accidental.setAttribute('x', String(CENTER_X - 22));
      accidental.setAttribute('y', String(y + 5));
      accidental.setAttribute('font-size', '24');
      accidental.setAttribute('class', 'staff-display__accidental');
      accidental.textContent = note.accidental === 'sharp' ? '♯' : '♭';
      this.svg.appendChild(accidental);
    }
  }

  private drawLedgerLine(step: number): void {
    const y = MIDDLE_LINE_Y - step * (LINE_SPACING / 2);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(CENTER_X - 14));
    line.setAttribute('x2', String(CENTER_X + 14));
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', 'currentColor');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('class', 'staff-display__ledger-line');
    this.svg.appendChild(line);
  }
}

customElements.define('staff-display', StaffDisplay);

export default StaffDisplay;
