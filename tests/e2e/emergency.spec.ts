// =============================================================================
// ELECTRA — E2E Tests: Emergency Mode Flow
// System 1: Full QA Expansion — Playwright
// =============================================================================

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function goToEmergency(page: Page) {
  await page.goto(`${BASE_URL}/emergency`);
  await page.waitForLoadState('networkidle');
}

// ── Emergency Mode Visual Tests ───────────────────────────────────────────────
test.describe('Emergency Mode', () => {
  test('emergency page has dark red background', async ({ page }) => {
    await goToEmergency(page);
    const main = page.locator('main');
    await expect(main).toHaveClass(/emergency-mode/);
  });

  test('helpline phone button is visible and callable', async ({ page }) => {
    await goToEmergency(page);
    // Select India first
    await page.click('button:has-text("IND")');
    const helplineBtn = page.locator('a[href^="tel:"]');
    await expect(helplineBtn).toBeVisible();
    await expect(helplineBtn).toContainText('1950');
  });

  test('scenario selector shows 6 options', async ({ page }) => {
    await goToEmergency(page);
    await page.click('button:has-text("IND")');
    const scenarios = page.locator('[data-testid="scenario-option"], button').filter({
      hasText: /name isn't on|lost my Voter|moved|can't find|accessibility|Technical/i,
    });
    await expect(scenarios).toHaveCount(6);
  });

  test('selecting T01 scenario loads resolution steps', async ({ page }) => {
    await goToEmergency(page);
    await page.click('button:has-text("IND")');
    await page.click('button:has-text("name isn")');
    // Steps should appear
    const steps = page.locator('[data-step]');
    await expect(steps.first()).toBeVisible({ timeout: 5000 });
  });

  test('emergency page is accessible via keyboard only', async ({ page }) => {
    await goToEmergency(page);
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

// ── Homepage Tests ────────────────────────────────────────────────────────────
test.describe('Homepage', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/ELECTRA.*Navigate Every Election/i);
  });

  test('hero heading is visible', async ({ page }) => {
    await page.goto(BASE_URL);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('5 country cards are rendered', async ({ page }) => {
    await page.goto(BASE_URL);
    const countryButtons = page.locator('[role="radio"]');
    await expect(countryButtons).toHaveCount(5);
  });

  test('emergency FAB is visible on homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    const fab = page.locator('a[href="/emergency"]').last();
    await expect(fab).toBeVisible();
  });

  test('selecting India navigates to persona onboarding', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[role="radio"]:has-text("India")');
    await expect(page).toHaveURL(/onboarding.*IND/, { timeout: 3000 });
  });
});

// ── Accessibility Tests ───────────────────────────────────────────────────────
test.describe('Accessibility', () => {
  test('all interactive elements have accessible names', async ({ page }) => {
    await page.goto(BASE_URL);
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const el = buttons.nth(i);
      const ariaLabel = await el.getAttribute('aria-label');
      const text = await el.textContent();
      expect(ariaLabel || (text?.trim().length ?? 0) > 0).toBe(true);
    }
  });

  test('focus ring is visible on keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.keyboard.press('Tab');
    // After Tab, something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });
});
