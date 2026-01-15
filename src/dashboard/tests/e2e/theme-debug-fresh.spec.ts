import { test, expect } from '@playwright/test';

test.describe('Theme Debug - Fresh Start', () => {
  test('should work in light mode when system is light', async ({ page, context }) => {
    // Clear everything
    await context.clearCookies();
    await page.goto('http://localhost:3000/docs');
    await page.evaluate(() => localStorage.clear());

    // Set system to light
    await page.emulateMedia({ colorScheme: 'light' });

    // Reload to apply system preference
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/light-mode-fresh.png', fullPage: true });

    // Check HTML class
    const htmlClass = await page.locator('html').getAttribute('class');
    console.log('Light mode - HTML class:', htmlClass);

    // Should NOT have dark class
    expect(htmlClass || '').not.toContain('dark');

    // Check computed background color of body
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('Light mode - Body background:', bodyBg);

    // Should be white or very light (rgb(255, 255, 255) or similar)
    expect(bodyBg).toMatch(/rgb\(25[0-5], 25[0-5], 25[0-5]\)/);
  });

  test('should toggle to dark mode and stay dark', async ({ page, context }) => {
    // Clear everything
    await context.clearCookies();
    await page.goto('http://localhost:3000/docs');
    await page.evaluate(() => localStorage.clear());

    // Set system to light (so we start in light mode)
    await page.emulateMedia({ colorScheme: 'light' });

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify starting in light mode
    let htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass || '').not.toContain('dark');

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label*="Switch to dark"]');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Take screenshot after toggle
    await page.screenshot({ path: 'test-results/dark-mode-toggled.png', fullPage: true });

    // Check HTML class
    htmlClass = await page.locator('html').getAttribute('class');
    console.log('After toggle - HTML class:', htmlClass);
    expect(htmlClass).toContain('dark');

    // Check computed background color of body
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('Dark mode - Body background:', bodyBg);

    // Should be very dark (rgb(10, 10, 10) or similar)
    expect(bodyBg).toMatch(/rgb\(1[0-5], 1[0-5], 1[0-5]\)/);
  });
});
