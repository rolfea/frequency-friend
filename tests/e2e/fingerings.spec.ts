import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('frequency-friend:config', JSON.stringify({
      floorMidi: 60,
      ceilingMidi: 60,
      includeAccidentals: false,
      sessionMode: 'cards',
      cardsPerSession: 1,
      sessionDurationMinutes: 5,
      showFingerings: true,
    }));
  });
  await page.reload();
});

test('after naming the pitch, asks for the fingering', async ({ page }) => {
  await expect(page.locator('.app-card__hint')).toHaveText('Name the pitch!');
  await page.locator('.answer-buttons__button', { hasText: 'C' }).click();
  await expect(page.locator('.app-card__feedback')).toContainText('Correct');

  await expect(page.locator('.app-card__hint')).toHaveText('Now pick the fingering!');
  await expect(page.locator('fingering-diagram svg')).toBeVisible();
  await expect(page.locator('fingering-option')).toHaveCount(8);
});

test('selecting the correct fingering reports correct', async ({ page }) => {
  await page.locator('.answer-buttons__button', { hasText: 'C' }).click();
  await expect(page.locator('.app-card__feedback')).toContainText('Correct');
  await expect(page.locator('.app-card__hint')).toHaveText('Now pick the fingering!');

  // C4 is open on a Bb trumpet.
  await page.getByRole('button', { name: 'Open' }).click();

  await expect(page.locator('.app-card__feedback')).toContainText('Correct fingering');
});

test('selecting an incorrect fingering reports incorrect', async ({ page }) => {
  await page.locator('.answer-buttons__button', { hasText: 'C' }).click();
  await expect(page.locator('.app-card__feedback')).toContainText('Correct');
  await expect(page.locator('.app-card__hint')).toHaveText('Now pick the fingering!');

  // Pick a non-open diagram (first pressed-valves option).
  await page.getByRole('button', { name: 'Pressed valves' }).first().click();

  await expect(page.locator('.app-card__feedback')).toContainText('Incorrect fingering');
});
