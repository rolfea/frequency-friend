import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('frequency-friend:config', JSON.stringify({
      floorMidi: 60,
      ceilingMidi: 77,
      includeAccidentals: false,
      sessionMode: 'cards',
      cardsPerSession: 10,
      sessionDurationMinutes: 5,
    }));
  });
  await page.reload();
});

test('can switch to a timed session and see a countdown', async ({ page }) => {
  await page.click('text=Settings');
  await page.selectOption('select[name="sessionMode"]', 'minutes');
  await page.selectOption('select[name="sessionDurationMinutes"]', '1');
  await page.click('text=Save');

  const stats = page.locator('.app-card__stats');
  await expect(stats).toContainText('remaining');
  const text = await stats.textContent();
  expect(text).toMatch(/^\d+ \/ \d+ correct · \d:\d{2} remaining$/);
});

test('timed session ends after the configured duration', async ({ page }) => {
  await page.clock.install();

  await page.click('text=Settings');
  await page.selectOption('select[name="sessionMode"]', 'minutes');
  await page.selectOption('select[name="sessionDurationMinutes"]', '1');
  await page.click('text=Save');

  await expect(page.locator('.app-card__stats')).toContainText('1:00 remaining');

  // Fast-forward past the one-minute timer expiry.
  await page.clock.fastForward(61_000);

  await expect(page.locator("text=Time's up!")).toBeVisible();
  await expect(page.locator('text=Session complete')).toBeVisible();
});
