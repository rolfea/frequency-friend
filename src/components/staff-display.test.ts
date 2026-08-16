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

  it('renders a note head for middle C', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')! as unknown as StaffDisplay;
    el.setNote(spellNote(60, 'natural')); // C4
    expect(el.querySelector('.note-head')).not.toBeNull();
  });

  it('renders a ledger line for A5', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')! as unknown as StaffDisplay;
    el.setNote(spellNote(81, 'natural')); // A5 (step 10, first ledger line above)
    expect(el.querySelectorAll('.staff-display__ledger-line')).toHaveLength(1);
  });

  it('renders two ledger lines for C6', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')! as unknown as StaffDisplay;
    el.setNote(spellNote(84, 'natural')); // C6 (step 12, second ledger line above)
    expect(el.querySelectorAll('.staff-display__ledger-line')).toHaveLength(2);
  });

  it('does not render a ledger line for G5 in the first space above', () => {
    document.body.innerHTML = '<staff-display></staff-display>';
    const el = document.querySelector('staff-display')! as unknown as StaffDisplay;
    el.setNote(spellNote(79, 'natural')); // G5 (step 9, first space above)
    expect(el.querySelectorAll('.staff-display__ledger-line')).toHaveLength(0);
  });
});
