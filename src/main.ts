import './components/app-card.js';

export async function renderApp(target: HTMLElement): Promise<void> {
  // Wait for VexFlow's Bravura/Academico fonts to finish loading before
  // rendering notation. Otherwise text metrics fall back to a system font and
  // can produce over-wide ledger lines on first load.
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  target.innerHTML = '<app-card></app-card>';
}

if (typeof window !== 'undefined') {
  renderApp(document.body);
}
