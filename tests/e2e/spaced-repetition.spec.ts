import { test, expect } from '@playwright/test';

function answerCurrentNote(page, pitchClass: number) {
  return page.click(`.answer-buttons__button[data-pitch-class="${pitchClass}"]`);
}

test('correctly answered note is scheduled into the future and skipped until due', async ({ page }) => {
  // Fix the pool to a single note (C4, MIDI 60) and one card per session.
  const config = {
    floorMidi: 60,
    ceilingMidi: 60,
    includeAccidentals: false,
    cardsPerSession: 1,
  };

  // Seed progress with a card already reviewed correctly an hour ago.
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const progress = {
    C4: {
      due: oneHourAgo + 24 * 60 * 60 * 1000, // not due until tomorrow
      stability: 86400,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 1,
      reps: 1,
      lapses: 0,
      state: 2,
      last_review: oneHourAgo,
    },
  };

  await page.goto('/');
  await page.evaluate(
    ({ cfg, prg }) => {
      localStorage.setItem('frequency-friend:config', JSON.stringify(cfg));
      localStorage.setItem('frequency-friend:progress', JSON.stringify(prg));
    },
    { cfg: config, prg: progress },
  );
  await page.reload();

  // With only C4 in the pool and C4 not due, the app should still render it
  // (because the session builder falls back to not-due notes when the pool is
  // exhausted), but the card.due date should remain in the future.
  await expect(page.locator('.staff-display svg')).toBeVisible();

  // Answer correctly again and verify the card due date moves further out.
  const dueBefore = await page.evaluate(() => {
    const raw = localStorage.getItem('frequency-friend:progress');
    return JSON.parse(raw!).C4.due;
  });

  await answerCurrentNote(page, 0); // pitch class 0 = C
  await page.waitForTimeout(1300); // wait for feedback + next card timeout

  const dueAfter = await page.evaluate(() => {
    const raw = localStorage.getItem('frequency-friend:progress');
    return JSON.parse(raw!).C4.due;
  });

  expect(dueAfter).toBeGreaterThan(dueBefore);
});

test('incorrectly answered note is due again soon', async ({ page }) => {
  const config = {
    floorMidi: 60,
    ceilingMidi: 60,
    includeAccidentals: false,
    cardsPerSession: 1,
  };

  await page.goto('/');
  await page.evaluate(
    (cfg) => {
      localStorage.setItem('frequency-friend:config', JSON.stringify(cfg));
      localStorage.removeItem('frequency-friend:progress');
    },
    config,
  );
  await page.reload();
  await expect(page.locator('.staff-display svg')).toBeVisible();

  // Answer incorrectly (anything other than C / pitch class 0).
  await answerCurrentNote(page, 2);
  await page.waitForTimeout(1300);

  const card = await page.evaluate(() => {
    const raw = localStorage.getItem('frequency-friend:progress');
    return JSON.parse(raw!).C4;
  });

  expect(card.due).toBeLessThanOrEqual(Date.now() + 60 * 60 * 1000); // due within an hour
});
