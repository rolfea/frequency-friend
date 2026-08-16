import { test, expect } from '@playwright/test';

const CONFIG_KEY = 'frequency-friend:config';

test('session size matches configured cardsPerSession even when note pool is smaller', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        floorMidi: 60,
        ceilingMidi: 77,
        includeAccidentals: false,
        cardsPerSession: 15,
      }),
    );
    localStorage.removeItem('frequency-friend:progress');
  }, CONFIG_KEY);
  await page.reload();
  await expect(page.locator('.staff-display svg')).toBeVisible();

  const stats = page.locator('.app-card__stats');
  await expect(stats).toContainText('15 remaining');
});
