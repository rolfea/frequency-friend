import { test, expect } from '@playwright/test';

const CONFIG_KEY = 'frequency-friend:config';
const PROGRESS_KEY = 'frequency-friend:progress';
const FEEDBACK_TIMEOUT = 1200;

function singleC4Config() {
  return {
    floorMidi: 60,
    ceilingMidi: 60,
    includeAccidentals: false,
    cardsPerSession: 1,
  };
}

function answerCurrentNote(page, pitchClass: number) {
  return page.click(`.answer-buttons__button[data-pitch-class="${pitchClass}"]`);
}

async function waitForFeedbackToClear(page) {
  // The app shows feedback for ~1200 ms before advancing to the next card.
  await page.waitForTimeout(FEEDBACK_TIMEOUT + 100);
}

test.describe('spaced repetition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('correctly answered note is scheduled further into the future', async ({ page }) => {
    const config = singleC4Config();

    // Seed progress with a card reviewed an hour ago and scheduled for tomorrow.
    // state 2 corresponds to ts-fsrs State.Review.
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const progress = {
      C4: {
        due: oneHourAgo + 24 * 60 * 60 * 1000,
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
      ({ cfg, prg, configKey, progressKey }) => {
        localStorage.setItem(configKey, JSON.stringify(cfg));
        localStorage.setItem(progressKey, JSON.stringify(prg));
      },
      { cfg: config, prg: progress, configKey: CONFIG_KEY, progressKey: PROGRESS_KEY },
    );
    await page.reload();
    await expect(page.locator('.staff-display svg')).toBeVisible();

    const dueBefore = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).C4.due : null;
    }, PROGRESS_KEY);
    expect(dueBefore).not.toBeNull();

    await answerCurrentNote(page, 0); // pitch class 0 = C
    await waitForFeedbackToClear(page);

    const dueAfter = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).C4.due : null;
    }, PROGRESS_KEY);

    expect(dueAfter).toBeGreaterThan(dueBefore);
  });

  test('incorrectly answered note is due again soon', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ({ cfg, configKey, progressKey }) => {
        localStorage.setItem(configKey, JSON.stringify(cfg));
        localStorage.removeItem(progressKey);
      },
      { cfg: singleC4Config(), configKey: CONFIG_KEY, progressKey: PROGRESS_KEY },
    );
    await page.reload();
    await expect(page.locator('.staff-display svg')).toBeVisible();

    await answerCurrentNote(page, 2); // D is incorrect for C4
    await waitForFeedbackToClear(page);

    const card = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).C4 : null;
    }, PROGRESS_KEY);

    expect(card).not.toBeNull();
    expect(card.due).toBeLessThanOrEqual(Date.now() + 60 * 60 * 1000);
  });
});
