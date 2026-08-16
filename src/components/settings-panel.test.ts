import { describe, expect, it, beforeEach, vi } from 'vitest';
import './settings-panel.js';
import type { Config } from '../domain/note.js';
import type SettingsPanel from './settings-panel.js';

describe('settings-panel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function baseConfig(overrides?: Partial<Config>): Config {
    return {
      floorMidi: 60,
      ceilingMidi: 79,
      includeAccidentals: false,
      sessionMode: 'cards',
      cardsPerSession: 10,
      sessionDurationMinutes: 5,
      showFingerings: false,
      ...overrides,
    };
  }

  it('renders inputs from config', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')! as unknown as SettingsPanel;
    el.setConfig(baseConfig());
    expect(el.querySelector('form')).not.toBeNull();
  });

  it('calls onSave with updated config', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')! as unknown as SettingsPanel;
    el.setConfig(baseConfig());
    const handler = vi.fn();
    el.onSave(handler);

    const input = el.querySelector('[name="cardsPerSession"]') as HTMLInputElement;
    input.value = '12';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ cardsPerSession: 12 }));
  });

  it('exposes session mode and duration fields', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')! as unknown as SettingsPanel;
    el.setConfig(baseConfig({ sessionMode: 'minutes', sessionDurationMinutes: 10 }));
    expect((el.querySelector('[name="sessionMode"]') as HTMLSelectElement).value).toBe('minutes');
    expect((el.querySelector('[name="sessionDurationMinutes"]') as HTMLSelectElement).value).toBe('10');
  });

  it('exposes the fingerings toggle', () => {
    document.body.innerHTML = '<settings-panel></settings-panel>';
    const el = document.querySelector('settings-panel')! as unknown as SettingsPanel;
    el.setConfig(baseConfig({ showFingerings: true }));
    expect((el.querySelector('[name="showFingerings"]') as HTMLInputElement).checked).toBe(true);
  });
});
