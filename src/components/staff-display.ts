import type { SpelledNote } from '../domain/note.js';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';

class StaffDisplay extends HTMLElement {
  private container: HTMLDivElement;
  private pendingNote: SpelledNote | null = null;
  private fontsPrimed = false;
  private priming: Promise<void> | null = null;

  constructor() {
    super();
    this.container = document.createElement('div');
    this.container.className = 'staff-display';
    this.appendChild(this.container);
  }

  setNote(note: SpelledNote): void {
    this.pendingNote = note;
    if (this.fontsPrimed) {
      this.render(note);
      return;
    }
    const needsAsync = typeof document !== 'undefined' && !!document.fonts;
    if (!needsAsync) {
      this.fontsPrimed = true;
      this.render(note);
      return;
    }
    if (!this.priming) {
      this.priming = this.primeFonts().then(() => {
        this.fontsPrimed = true;
        this.priming = null;
        if (this.pendingNote) {
          this.render(this.pendingNote);
        }
      });
    }
  }

  private async primeFonts(): Promise<void> {
    // VexFlow measures notehead widths via canvas text metrics using the
    // Bravura music font. On first load the font may technically be loaded
    // but the browser needs one more paint frame before canvas metrics use
    // it. Wait here so the first visible render has correct glyph widths and
    // therefore correctly-sized ledger lines.
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }
    if (typeof requestAnimationFrame !== 'undefined') {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
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
    if (note.accidental !== 'natural') {
      const symbol = note.accidental === 'sharp' ? '#' : 'b';
      staveNote.addModifier(new Accidental(symbol), 0);
    }

    // Use a single-note Voice formatted to the stave. This positions one note
    // cleanly without the measure-wide spacing that FormatAndDraw applies.
    const voice = new Voice({ numBeats: 1, beatValue: 4 });
    voice.addTickable(staveNote);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context, stave);
  }

  private vexflowKey(note: SpelledNote): string {
    const letter = note.key[0].toLowerCase();
    // VexFlow needs the key to reflect the actual pitch class so the notehead
    // is placed on the correct staff line. The accidental is added as a
    // separate Accidental modifier so it is rendered explicitly.
    const octave = note.key.slice(-1);
    return `${letter}/${octave}`;
  }
}

customElements.define('staff-display', StaffDisplay);

export default StaffDisplay;
