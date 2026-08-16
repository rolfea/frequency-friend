import { describe, expect, it, beforeEach } from 'vitest';
import { renderApp } from './main.js';

describe('renderApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('mounts an app-card element', () => {
    renderApp(document.body);
    expect(document.querySelector('app-card')).not.toBeNull();
  });

  it('shows the onboarding hint on first load', () => {
    renderApp(document.body);
    const hint = document.querySelector('.app-card__hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Name the pitch!');
  });
});
