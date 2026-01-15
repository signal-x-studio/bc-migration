import { test, expect } from '@playwright/test';

test.describe('Theme Toggle Manual Debug', () => {
  test('should show correct icon for current theme', async ({ page }) => {
    // Clear localStorage first
    await page.goto('http://localhost:3000/docs');
    await page.evaluate(() => localStorage.clear());

    // Reload to start fresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for React hydration

    // Check actual DOM state
    const htmlClass = await page.locator('html').getAttribute('class');
    const isDark = htmlClass?.includes('dark') ?? false;

    console.log('HTML class after fresh load:', htmlClass);
    console.log('Is dark mode:', isDark);

    // Check which icon is showing
    const moonIcon = page.locator('button svg').filter({ hasText: '' }).first();
    const hasMoon = await moonIcon.count() > 0;

    console.log('Has Moon icon (should show in light mode):', hasMoon);

    // The icon should match the state:
    // - If dark mode is active, should show SUN icon (to switch to light)
    // - If light mode is active, should show MOON icon (to switch to dark)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/theme-state-debug.png',
      fullPage: true
    });

    // Get button aria-label
    const themeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    const ariaLabel = await themeButton.getAttribute('aria-label');
    console.log('Button aria-label:', ariaLabel);

    // If dark mode is ON, button should say "Switch to light mode" and show SUN
    // If light mode is ON, button should say "Switch to dark mode" and show MOON
    if (isDark) {
      expect(ariaLabel).toContain('light');
    } else {
      expect(ariaLabel).toContain('dark');
    }

    // Now click and verify it toggles
    await themeButton.click();
    await page.waitForTimeout(500);

    const newHtmlClass = await page.locator('html').getAttribute('class');
    const newIsDark = newHtmlClass?.includes('dark') ?? false;

    console.log('HTML class after toggle:', newHtmlClass);
    console.log('Is dark mode after toggle:', newIsDark);

    // Should have toggled
    expect(newIsDark).not.toBe(isDark);
  });

  test('should sync with system preference on first visit', async ({ page }) => {
    // Clear localStorage
    await page.goto('http://localhost:3000/docs');
    await page.evaluate(() => localStorage.clear());

    // Set system preference to dark
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const htmlClass = await page.locator('html').getAttribute('class');
    const isDark = htmlClass?.includes('dark') ?? false;

    console.log('With dark system preference, HTML class:', htmlClass);
    expect(isDark).toBe(true);

    // Now test with light system preference
    await page.evaluate(() => localStorage.clear());
    await page.emulateMedia({ colorScheme: 'light' });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const lightHtmlClass = await page.locator('html').getAttribute('class');
    const isStillDark = lightHtmlClass?.includes('dark') ?? false;

    console.log('With light system preference, HTML class:', lightHtmlClass);
    expect(isStillDark).toBe(false);
  });
});
