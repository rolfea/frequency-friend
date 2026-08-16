import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('frequency-friend:config', JSON.stringify({
      floorMidi: 60,
      ceilingMidi: 77,
      includeAccidentals: false,
      cardsPerSession: 10,
    }));
  });
  await page.reload();
});

test('renders the app with title and answer buttons', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('Frequency Friend');
  await expect(page.locator('.answer-buttons__button')).toHaveCount(7);
  await expect(page.locator('.app-card__hint')).toHaveText('Name the pitch!');

  const stats = page.locator('.app-card__stats');
  await expect(stats).toContainText('10 remaining');
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

test('settings panel swaps range when floor is above ceiling', async ({ page }) => {
  await page.click('text=Settings');

  // Set an inverted range: floor > ceiling.
  await page.selectOption('select[name="floorMidi"]', '72');
  await page.selectOption('select[name="ceilingMidi"]', '60');
  await page.click('text=Save');
  await page.click('text=Settings');

  await expect(page.locator('select[name="floorMidi"]')).toHaveValue('60');
  await expect(page.locator('select[name="ceilingMidi"]')).toHaveValue('72');
});
