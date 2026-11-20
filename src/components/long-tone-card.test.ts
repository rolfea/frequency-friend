import { describe, expect, it, beforeEach, vi } from 'vitest';
import './long-tone-card.js';
import type LongToneCard from './long-tone-card.js';
import { DEFAULT_CONFIG } from '../storage.js';
import { spellNote } from '../domain/note.js';

describe('long-tone-card', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders start and stop buttons', () => {
    document.body.innerHTML = '<long-tone-card></long-tone-card>';
    const el = document.querySelector('long-tone-card')! as unknown as LongToneCard;
    el.setConfig(DEFAULT_CONFIG);
    el.setNote(spellNote(60, 'natural'));
    expect(el.querySelector('.long-tone-card__start')).not.toBeNull();
    expect(el.querySelector('.long-tone-card__stop')).not.toBeNull();
    expect(el.querySelector('.long-tone-card__timer')?.textContent).toBe('0.00s');
  });

  it('shows the target note name', () => {
    document.body.innerHTML = '<long-tone-card></long-tone-card>';
    const el = document.querySelector('long-tone-card')! as unknown as LongToneCard;
    el.setConfig(DEFAULT_CONFIG);
    el.setNote(spellNote(64, 'natural'));
    expect(el.querySelector('.long-tone-card__hint')?.textContent).toContain('E4');
  });
});
