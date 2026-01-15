import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');

    // Get initial theme
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    console.log('Initial HTML classes:', initialClass);

    // Check if dark mode is initially active
    const initialIsDark = initialClass?.includes('dark') || false;
    console.log('Initial is dark mode:', initialIsDark);

    // Find and click theme toggle button - it has a Moon or Sun icon
    const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(themeToggle).toBeVisible();

    // Take screenshot before click
    await page.screenshot({ path: 'test-results/theme-before-toggle.png' });

    // Click the toggle
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for transition

    // Get new theme
    const newClass = await htmlElement.getAttribute('class');
    console.log('After toggle HTML classes:', newClass);

    const newIsDark = newClass?.includes('dark') || false;
    console.log('After toggle is dark mode:', newIsDark);

    // Take screenshot after click
    await page.screenshot({ path: 'test-results/theme-after-toggle.png' });

    // Verify theme changed
    expect(initialIsDark).not.toBe(newIsDark);

    // Click again to toggle back
    await themeToggle.click();
    await page.waitForTimeout(500);

    const finalClass = await htmlElement.getAttribute('class');
    const finalIsDark = finalClass?.includes('dark') || false;

    console.log('After second toggle HTML classes:', finalClass);
    console.log('After second toggle is dark mode:', finalIsDark);

    // Should be back to initial state
    expect(finalIsDark).toBe(initialIsDark);
  });

  test('should persist theme across page reloads', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');

    // Set to light mode
    const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    const htmlElement = page.locator('html');

    // Ensure we're in light mode
    let isDark = (await htmlElement.getAttribute('class'))?.includes('dark') || false;
    if (isDark) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    // Verify light mode
    let currentClass = await htmlElement.getAttribute('class');
    const hasInitialDark = currentClass?.includes('dark') ?? false;
    expect(hasInitialDark).toBe(false);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if theme persisted
    currentClass = await htmlElement.getAttribute('class');
    console.log('After reload HTML classes:', currentClass);
    const hasDarkAfterReload = currentClass?.includes('dark') ?? false;
    expect(hasDarkAfterReload).toBe(false);

    // Now toggle to dark and reload
    await themeToggle.click();
    await page.waitForTimeout(500);

    currentClass = await htmlElement.getAttribute('class');
    let hasDarkBeforeReload = currentClass?.includes('dark') ?? false;
    expect(hasDarkBeforeReload).toBe(true);

    await page.reload();
    await page.waitForLoadState('networkidle');

    currentClass = await htmlElement.getAttribute('class');
    console.log('After reload (dark) HTML classes:', currentClass);
    const hasDarkAfterDarkReload = currentClass?.includes('dark') ?? false;
    expect(hasDarkAfterDarkReload).toBe(true);
  });
});
