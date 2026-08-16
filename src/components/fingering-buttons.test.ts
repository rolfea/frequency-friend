import { describe, expect, it, beforeEach, vi } from 'vitest';
import './fingering-buttons.js';
import type FingeringButtons from './fingering-buttons.js';

describe('fingering-buttons', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders valve buttons', () => {
    document.body.innerHTML = '<fingering-buttons></fingering-buttons>';
    const el = document.querySelector('fingering-buttons')! as unknown as FingeringButtons;
    el.setOptions([
      { valves: [0, 0, 0], label: 'Open' },
      { valves: [1, 0, 0], label: '1' },
    ]);
    const buttons = el.querySelectorAll('.fingering-buttons__button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]!.textContent).toBe('Open');
    expect(buttons[1]!.textContent).toBe('1');
  });

  it('calls onSelect with the chosen valves', () => {
    document.body.innerHTML = '<fingering-buttons></fingering-buttons>';
    const el = document.querySelector('fingering-buttons')! as unknown as FingeringButtons;
    el.setOptions([{ valves: [1, 0, 1], label: '1+3' }]);
    const handler = vi.fn();
    el.onSelect(handler);
    (el.querySelector('.fingering-buttons__button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledWith([1, 0, 1]);
  });
});
