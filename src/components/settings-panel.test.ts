import { describe, expect, it, beforeEach, vi } from 'vitest';
import './settings-panel.js';
import type { Config } from '../domain/note.js';
import type SettingsPanel from './settings-panel.js';

describe('settings-panel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders inputs from config', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')! as unknown as SettingsPanel;
    const config: Config = { floorMidi: 60, ceilingMidi: 79, includeAccidentals: false, cardsPerSession: 10 };
    el.setConfig(config);
    expect(el.querySelector('form')).not.toBeNull();
  });

  it('calls onSave with updated config', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')! as unknown as SettingsPanel;
    const config: Config = { floorMidi: 60, ceilingMidi: 79, includeAccidentals: false, cardsPerSession: 10 };
    el.setConfig(config);
    const handler = vi.fn();
    el.onSave(handler);

    const input = el.querySelector('[name="cardsPerSession"]') as HTMLInputElement;
    input.value = '12';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ cardsPerSession: 12 }));
  });
});
