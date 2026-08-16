import { describe, expect, it, beforeEach } from 'vitest';
import { renderApp } from './main.js';

describe('renderApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('mounts an app-card element', async () => {
    await renderApp(document.body);
    expect(document.querySelector('app-card')).not.toBeNull();
  });
});
