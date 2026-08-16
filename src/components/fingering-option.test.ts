import { describe, expect, it, beforeEach, vi } from 'vitest';
import './fingering-option.js';
import type FingeringOption from './fingering-option.js';

describe('fingering-option', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an svg diagram', () => {
    document.body.innerHTML = '<fingering-option></fingering-option>';
    const el = document.querySelector('fingering-option')! as unknown as FingeringOption;
    el.setValves([1, 0, 1]);
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.querySelectorAll('.fingering-option__valve')).toHaveLength(3);
  });

  it('highlights pressed valves', () => {
    document.body.innerHTML = '<fingering-option></fingering-option>';
    const el = document.querySelector('fingering-option')! as unknown as FingeringOption;
    el.setValves([1, 0, 1]);
    const valves = el.querySelectorAll('.fingering-option__valve');
    expect(valves[0]!.classList.contains('fingering-option__valve--pressed')).toBe(true);
    expect(valves[1]!.classList.contains('fingering-option__valve--pressed')).toBe(false);
    expect(valves[2]!.classList.contains('fingering-option__valve--pressed')).toBe(true);
  });

  it('calls onSelect with its valves when clicked', () => {
    document.body.innerHTML = '<fingering-option></fingering-option>';
    const el = document.querySelector('fingering-option')! as unknown as FingeringOption;
    el.setValves([0, 1, 0]);
    const handler = vi.fn();
    el.onSelect(handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledWith([0, 1, 0]);
  });
});
