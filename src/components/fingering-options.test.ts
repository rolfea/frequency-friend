import { describe, expect, it, beforeEach, vi } from 'vitest';
import './fingering-options.js';
import type FingeringOptions from './fingering-options.js';

describe('fingering-options', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders one option per standard fingering', () => {
    document.body.innerHTML = '<fingering-options></fingering-options>';
    const el = document.querySelector('fingering-options')! as unknown as FingeringOptions;
    el.setOptions();
    expect(el.querySelectorAll('fingering-option')).toHaveLength(8);
  });

  it('notifies onSelect with the chosen valves', () => {
    document.body.innerHTML = '<fingering-options></fingering-options>';
    const el = document.querySelector('fingering-options')! as unknown as FingeringOptions;
    const handler = vi.fn();
    el.onSelect(handler);
    el.setOptions();
    const options = el.querySelectorAll('fingering-option');
    (options[0]!.querySelector('button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledWith([0, 0, 0]);
  });
});
