import { describe, expect, it, beforeEach } from 'vitest';
import './fingering-diagram.js';
import type FingeringDiagram from './fingering-diagram.js';

describe('fingering-diagram', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an svg with three valves', () => {
    document.body.innerHTML = '<fingering-diagram></fingering-diagram>';
    const el = document.querySelector('fingering-diagram')! as unknown as FingeringDiagram;
    el.setFingering([1, 0, 1]);
    const svg = el.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(el.querySelectorAll('.fingering-diagram__valve')).toHaveLength(3);
  });

  it('fills the pressed valves', () => {
    document.body.innerHTML = '<fingering-diagram></fingering-diagram>';
    const el = document.querySelector('fingering-diagram')! as unknown as FingeringDiagram;
    el.setFingering([1, 0, 1]);
    const valves = el.querySelectorAll('.fingering-diagram__valve');
    expect(valves[0]!.classList.contains('fingering-diagram__valve--pressed')).toBe(true);
    expect(valves[1]!.classList.contains('fingering-diagram__valve--pressed')).toBe(false);
    expect(valves[2]!.classList.contains('fingering-diagram__valve--pressed')).toBe(true);
  });
});
