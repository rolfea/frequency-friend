import { describe, expect, it, beforeEach } from 'vitest';
import './staff-display.js';
import { spellNote } from '../domain/note.js';

describe('staff-display', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an svg', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')!;
    el.setNote(spellNote(64, 'natural')); // E4
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('renders a note head for middle C', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')!;
    el.setNote(spellNote(60, 'natural')); // C4
    expect(el.querySelector('.note-head')).not.toBeNull();
  });
});
