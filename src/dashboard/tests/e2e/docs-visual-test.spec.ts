import { test, expect } from '@playwright/test';

test.describe('Documentation Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
  });

  test('docs homepage renders correctly', async ({ page }) => {
    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'BC Migration Documentation', level: 1 })).toBeVisible();

    // Take full page screenshot
    await page.screenshot({
      path: 'playwright-report/docs-homepage.png',
      fullPage: true
    });

    // Verify key elements
    await expect(page.locator('text=Everything you need to migrate from WooCommerce to BigCommerce')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose Your Path' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Essential Guides' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quick Start Guide' })).toBeVisible();
  });

  test('For Merchants page - complete content and layout', async ({ page }) => {
    // Navigate to merchants page
    await page.click('text=For Merchants >> nth=0');
    await page.waitForLoadState('networkidle');

    // Verify URL
    await expect(page).toHaveURL(/\/docs\/getting-started\/for-merchants/);

    // Verify title
    await expect(page.getByRole('heading', { name: 'Getting Started for Merchants' }).first()).toBeVisible();

    // Check for key sections
    await expect(page.getByRole('heading', { name: "What You'll Need" })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Migration Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Step-by-Step Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What Gets Migrated' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'After Migration' })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'playwright-report/docs-merchants.png',
      fullPage: true
    });

    // Verify content is readable (check prose styling)
    const article = page.locator('article.prose');
    await expect(article).toBeVisible();
  });

  test('For Developers page - complete content and layout', async ({ page }) => {
    await page.click('text=For Developers >> nth=0');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/docs\/getting-started\/for-developers/);
    await expect(page.getByRole('heading', { name: 'Getting Started for Developers' }).first()).toBeVisible();

    // Check for key sections
    await expect(page.getByRole('heading', { name: 'Prerequisites' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Architecture Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'API Integration' })).toBeVisible();

    // Verify code blocks render
    const codeBlocks = page.locator('pre code');
    await expect(codeBlocks.first()).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/docs-developers.png',
      fullPage: true
    });
  });

  test('For Agencies page - complete content and layout', async ({ page }) => {
    await page.click('text=For Agencies >> nth=0');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/docs\/getting-started\/for-agencies/);
    await expect(page.getByRole('heading', { name: 'Getting Started for Agencies' }).first()).toBeVisible();

    // Check for key sections
    await expect(page.getByRole('heading', { name: 'Agency Use Cases' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Multi-Client Management' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'White-Label Deployment' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Service Packaging' })).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/docs-agencies.png',
      fullPage: true
    });
  });

  test('WordPress & WP Engine guide - complete content', async ({ page }) => {
    // Click WordPress card directly from homepage
    await page.click('text=WordPress & WP Engine');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/docs\/guides\/wordpress-wpengine/);
    await expect(page.getByRole('heading', { name: 'WordPress & WP Engine Guide' }).first()).toBeVisible();

    // Check for key sections
    await expect(page.getByRole('heading', { name: 'Why Keep WordPress?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Architecture Options' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'BC Bridge Plugin Setup' })).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/docs-wordpress.png',
      fullPage: true
    });
  });

  test('Quick Start guide - complete content', async ({ page }) => {
    // Click directly on the Quick Start card
    await page.click('text=5-Minute Quick Start');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/docs\/reference\/quick-start/);
    await expect(page.getByRole('heading', { name: 'Quick Start Guide' }).first()).toBeVisible();

    // Check for key sections
    await expect(page.getByRole('heading', { name: 'Prerequisites Checklist' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Step 1: Get WooCommerce API Keys (2 minutes)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Step 2: Get BigCommerce API Token (2 minutes)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Step 5: Start Migration (15-120 minutes)' })).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/docs-quickstart.png',
      fullPage: true
    });
  });

  test('Troubleshooting guide - complete content', async ({ page }) => {
    // Click directly on the troubleshooting card
    await page.click('text=Common Issues & Solutions');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/docs\/troubleshooting\/common-issues/);
    await expect(page.getByRole('heading', { name: 'Common Issues & Solutions' }).first()).toBeVisible();

    // Check for key sections
    await expect(page.getByRole('heading', { name: 'Connection Issues' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Migration Issues' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Performance Issues' })).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/docs-troubleshooting.png',
      fullPage: true
    });
  });

  test('All persona cards are clickable and load content', async ({ page }) => {
    const personas = [
      { text: 'For Merchants', url: /\/for-merchants/, heading: 'Getting Started for Merchants' },
      { text: 'For Developers', url: /\/for-developers/, heading: 'Getting Started for Developers' },
      { text: 'For Agencies', url: /\/for-agencies/, heading: 'Getting Started for Agencies' }
    ];

    for (const persona of personas) {
      await page.goto('http://localhost:3000/docs');
      await page.waitForLoadState('networkidle');

      await page.click(`text=${persona.text} >> nth=0`);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(persona.url);
      await expect(page.getByRole('heading', { name: persona.heading }).first()).toBeVisible();
      await expect(page.locator('article.prose')).toBeVisible();
    }
  });
});
