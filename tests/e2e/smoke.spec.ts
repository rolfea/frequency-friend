import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders the app with title and answer buttons', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('Frequency Friend');
  await expect(page.locator('.answer-buttons__button')).toHaveCount(7);
});

test('settings panel shows defaults and can save new config', async ({ page }) => {
  await page.click('text=Settings');
  await expect(page.locator('select[name="floorMidi"]')).toHaveValue('60');
  await expect(page.locator('select[name="ceilingMidi"]')).toHaveValue('77');
  await expect(page.locator('input[name="cardsPerSession"]')).toHaveValue('10');

  await page.fill('input[name="cardsPerSession"]', '5');
  await page.click('text=Save');
  await page.click('text=Settings');
  await expect(page.locator('input[name="cardsPerSession"]')).toHaveValue('5');
});
