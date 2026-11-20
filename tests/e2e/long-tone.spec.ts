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
      showFingerings: false,
      practiceMode: 'long-tone',
      longToneBeats: 2,
      longToneTempo: 120,
      longToneCentsTolerance: 50,
      longToneMinDurationMs: 100,
    }));
  });
  await page.reload();
});

test('switches to long-tone mode and shows the long-tone card', async ({ page }) => {
  await expect(page.locator('.long-tone-card')).toBeVisible();
  await expect(page.locator('.long-tone-card__hint')).toContainText('Play a long tone');
  await expect(page.locator('.long-tone-card__timer')).toHaveText('0.00s');
  await expect(page.locator('.long-tone-card__start')).toBeEnabled();
});
