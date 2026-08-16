import { test, expect } from '@playwright/test';

const CONFIG_KEY = 'frequency-friend:config';

async function openWithConfig(
  page,
  config: Record<string, string | boolean | number>,
) {
  await page.goto('/');
  await page.evaluate(
    ({ key, cfg }) => localStorage.setItem(key, JSON.stringify(cfg)),
    { key: CONFIG_KEY, cfg: config },
  );
  await page.reload();
  await expect(page.locator('.staff-display svg')).toBeVisible();
}

test('ledger lines are not over-wide on first load', async ({ page }) => {
  // Middle C (C4, MIDI 60) sits one ledger line below the treble staff.
  await openWithConfig(page, {
    floorMidi: 60,
    ceilingMidi: 60,
    includeAccidentals: false,
    cardsPerSession: 1,
  });

  const svg = page.locator('.staff-display svg');
  await expect(svg).toBeVisible();

  // VexFlow draws ledger lines inside the .vf-stavenote group as short
  // horizontal paths. Their width should be modest (roughly the notehead width
  // plus a small pad), never spanning the whole staff.
  const ledgerLineWidths = await svg.evaluate((el: SVGSVGElement) => {
    const stavenote = el.querySelector('.vf-stavenote');
    if (!stavenote) return [];
    return Array.from(stavenote.querySelectorAll('path'))
      .filter((p) => {
        const d = p.getAttribute('d') ?? '';
        // Horizontal line: M x y L x' y (same y). VexFlow does not add a
        // space between the y coordinate and the L command.
        return /^M[\d.\-]+\s+[\d.\-]+\s*L\s*[\d.\-]+\s+[\d.\-]+$/.test(d);
      })
      .map((p) => p.getBBox().width);
  });

  expect(ledgerLineWidths.length).toBeGreaterThan(0);
  for (const width of ledgerLineWidths) {
    expect(width).toBeLessThan(40);
  }
});

test('accidentals render for sharp and flat notes', async ({ page }) => {
  await openWithConfig(page, {
    floorMidi: 61,
    ceilingMidi: 61,
    includeAccidentals: true,
    cardsPerSession: 1,
  });

  const svg = page.locator('.staff-display svg');
  await expect(svg).toBeVisible();

  // Bravura accidental glyphs live in the U+E260–U+E263 private-use block.
  const hasAccidental = await svg.evaluate((el: SVGSVGElement) => {
    const texts = Array.from(el.querySelectorAll('text'));
    return texts.some((t) => /[\u{E260}-\u{E263}]/u.test(t.textContent ?? ''));
  });
  expect(hasAccidental).toBe(true);
});
