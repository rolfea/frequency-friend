import { describe, expect, it, beforeEach } from 'vitest';
import './staff-display.js';
import { spellNote } from '../domain/note.js';
import type StaffDisplay from './staff-display.js';

describe('staff-display', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an svg', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')! as unknown as StaffDisplay;
    el.setNote(spellNote(64, 'natural')); // E4
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('renders a stave with a note head', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')! as unknown as StaffDisplay;
    el.setNote(spellNote(60, 'natural')); // C4
    const svg = el.querySelector('svg')!;
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
  });
});
