import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('frequency-friend:config', JSON.stringify({
      floorMidi: 60,
      ceilingMidi: 64,
      includeAccidentals: false,
      sessionMode: 'cards',
      cardsPerSession: 10,
      sessionDurationMinutes: 5,
      showFingerings: true,
    }));
  });
  await page.reload();
});

test('after naming the pitch, asks for the fingering', async ({ page }) => {
  await expect(page.locator('.app-card__hint')).toHaveText('Name the pitch!');

  // Pick the pitch name for the displayed note. The note is one of C4/D4/E4/F4/G4;
  // choose the first matching answer button.
  const pitchButtons = page.locator('.answer-buttons__button');
  const count = await pitchButtons.count();
  expect(count).toBeGreaterThan(0);
  await pitchButtons.first().click();

  await expect(page.locator('.app-card__hint')).toHaveText('Now pick the fingering!');
  await expect(page.locator('.fingering-buttons__button')).toHaveCount(8);
  await expect(page.locator('fingering-diagram svg')).toBeVisible();
});

test('gives feedback on the chosen fingering', async ({ page }) => {
  const pitchButtons = page.locator('.answer-buttons__button');
  await pitchButtons.first().click();

  const fingeringButtons = page.locator('.fingering-buttons__button');
  await fingeringButtons.first().click();

  await expect(page.locator('.app-card__feedback')).toContainText(/fingering/);
});
