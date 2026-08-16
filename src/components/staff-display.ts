import type { SpelledNote } from '../domain/note.js';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';

class StaffDisplay extends HTMLElement {
  private container: HTMLDivElement;

  constructor() {
    super();
    this.container = document.createElement('div');
    this.container.className = 'staff-display';
    this.appendChild(this.container);
  }

  setNote(note: SpelledNote): void {
    this.render(note);
  }

  private render(note: SpelledNote): void {
    this.container.innerHTML = '';

    const width = 320;
    const height = 160;
    const renderer = new Renderer(this.container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const stave = new Stave(10, 30, width - 20);
    stave.addClef('treble');
    stave.setContext(context).draw();

    const keys = [this.vexflowKey(note)];
    const staveNote = new StaveNote({
      clef: 'treble',
      keys,
      duration: 'q',
      autoStem: true,
    });

    // Use a single-note Voice formatted to the stave. This positions one note
    // cleanly without the measure-wide spacing that FormatAndDraw applies.
    const voice = new Voice({ numBeats: 1, beatValue: 4 });
    voice.addTickable(staveNote);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context, stave);
  }

  private vexflowKey(note: SpelledNote): string {
    const letter = note.key[0].toLowerCase();
    const accidental = note.accidental === 'sharp' ? '#' : note.accidental === 'flat' ? 'b' : '';
    const octave = note.key.slice(-1);
    return `${letter}${accidental}/${octave}`;
  }
}

customElements.define('staff-display', StaffDisplay);

export default StaffDisplay;
