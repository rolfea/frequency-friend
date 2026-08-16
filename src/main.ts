import './components/app-card.js';

export function renderApp(target: HTMLElement): void {
  target.innerHTML = '<app-card></app-card>';
}

if (typeof window !== 'undefined') {
  renderApp(document.body);
}
