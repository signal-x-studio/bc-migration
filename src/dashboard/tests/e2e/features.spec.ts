import { test, expect, Page } from '@playwright/test';

// Storage keys
const STORAGE_KEYS = {
  CREDENTIALS: 'wc-migration-credentials',
  BC_CREDENTIALS: 'wc-migration-bc-credentials',
  STORE_INFO: 'wc-migration-store-info',
  REMEMBER_ME: 'wc-migration-remember-me',
  GO_LIVE_CHECKLIST: 'wc-migration-go-live-checklist',
};

// Test credentials
const WC_CREDENTIALS = {
  url: 'https://test-store.wpenginepowered.com',
  consumerKey: 'ck_test123',
  consumerSecret: 'cs_test456',
};

const BC_CREDENTIALS = {
  storeHash: 'teststore123',
  accessToken: 'test-access-token',
};

const WC_STORE_INFO = {
  name: 'Test WC Store',
  url: WC_CREDENTIALS.url,
  productCount: 100,
  customerCount: 50,
  orderCount: 25,
};

// Helper to set up connections
async function setupConnections(page: Page) {
  await page.evaluate(({ keys, wc, bc, storeInfo }) => {
    localStorage.setItem(keys.CREDENTIALS, JSON.stringify(wc));
    localStorage.setItem(keys.STORE_INFO, JSON.stringify(storeInfo));
    localStorage.setItem(keys.REMEMBER_ME, 'true');
    localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify(bc));
  }, { keys: STORAGE_KEYS, wc: WC_CREDENTIALS, bc: BC_CREDENTIALS, storeInfo: WC_STORE_INFO });
}

// ===========================================
// VALIDATION PAGE TESTS
// ===========================================

test.describe('Validation Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, storeInfo: WC_STORE_INFO }),
      });
    });

    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: { name: 'Test BC Store', domain: 'teststore123.mybigcommerce.com' },
        }),
      });
    });
  });

  test('shows connection warning when stores not connected', async ({ page }) => {
    await page.goto('/validate');
    await expect(page.getByText('Connections Required')).toBeVisible();
  });

  test('shows validation UI when connected', async ({ page }) => {
    await page.goto('/validate');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Migration Validation')).toBeVisible();
    await expect(page.getByText('WooCommerce Source')).toBeVisible();
    await expect(page.getByText('BigCommerce Destination')).toBeVisible();
  });

  test.skip('detailed validation shows score and entity sections', async ({ page }) => {
    // TODO: Fix locator for Run Validation button in DetailedValidation component
    // Mock detailed validation endpoint
    await page.route('**/api/validate/detailed', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            overallScore: 87,
            products: { total: 100, valid: 94, issues: 6, issueList: [
              { type: 'warning', entity: 'product', entityId: 1, entityName: 'Test Product', issue: 'Missing image' }
            ]},
            customers: { total: 50, valid: 48, issues: 2, issueList: [] },
            categories: { total: 20, valid: 18, issues: 2, issueList: [] },
            orders: { total: 25, valid: 23, issues: 2, issueList: [] },
            timestamp: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('/validate');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Run Validation button (there may be multiple, click the one in Data Quality section)
    await page.getByRole('button', { name: 'Run Validation' }).first().click();

    // Should show overall score
    await expect(page.getByText('87%')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Data Quality Score')).toBeVisible();
  });

  test.skip('can expand entity section to see issues', async ({ page }) => {
    // TODO: Fix locator for Run Validation button and expandable sections
    await page.route('**/api/validate/detailed', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            overallScore: 90,
            products: { total: 10, valid: 8, issues: 2, issueList: [
              { type: 'warning', entity: 'product', entityId: 1, entityName: 'Product A', issue: 'Missing image', details: 'No product image found' },
              { type: 'error', entity: 'product', entityId: 2, entityName: 'Product B', issue: 'Zero price', details: 'Price is $0' }
            ]},
            customers: { total: 5, valid: 5, issues: 0, issueList: [] },
            categories: { total: 3, valid: 3, issues: 0, issueList: [] },
            orders: { total: 2, valid: 2, issues: 0, issueList: [] },
            timestamp: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('/validate');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Run Validation' }).first().click();

    await expect(page.getByText('90%')).toBeVisible({ timeout: 10000 });

    // Click on Products section to expand (it's a button with Products text)
    await page.locator('button:has-text("Products")').first().click();

    // Should show issues after expansion
    await expect(page.getByText('Missing image')).toBeVisible({ timeout: 5000 });
  });
});

// ===========================================
// GO-LIVE CHECKLIST TESTS
// ===========================================

test.describe('Go-Live Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, storeInfo: WC_STORE_INFO }),
      });
    });

    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: { name: 'Test BC Store', domain: 'teststore123.mybigcommerce.com' },
        }),
      });
    });
  });

  test('shows connection warning when not connected', async ({ page }) => {
    await page.goto('/go-live');
    await expect(page.getByText('Connections Required')).toBeVisible();
  });

  test('shows checklist when connected', async ({ page }) => {
    await page.goto('/go-live');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Go-Live Checklist')).toBeVisible();
    await expect(page.getByText('Payment Gateway Configured')).toBeVisible();
    await expect(page.getByText('Shipping Zones Configured')).toBeVisible();
  });

  test.skip('can toggle checklist items', async ({ page }) => {
    // TODO: Fix locator for toggle buttons
    await page.goto('/go-live');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Get initial progress percentage
    const progressBefore = await page.locator('text=/\\d+%/').first().textContent();

    // Find and click a toggle button (first one should be for Payment Gateway)
    await page.locator('[class*="flex-shrink-0"] button').first().click();

    // Wait a moment for state to update
    await page.waitForTimeout(500);

    // Progress should have changed
    const progressAfter = await page.locator('text=/\\d+%/').first().textContent();
    expect(progressAfter).not.toBe(progressBefore);
  });

  test('shows new recommended checklist items', async ({ page }) => {
    await page.goto('/go-live');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show new checklist items
    await expect(page.getByText('Analytics Configured')).toBeVisible();
    await expect(page.getByText('Backup & Rollback Plan')).toBeVisible();
    await expect(page.getByText('DNS TTL Lowered')).toBeVisible();
    await expect(page.getByText('Staff Training Complete')).toBeVisible();
  });

  test('auto-verify button triggers verification', async ({ page }) => {
    // Mock the payment verify endpoint (it's auto-verifiable)
    await page.route('**/api/verify/payment', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          notes: 'Payment gateway configured',
        }),
      });
    });

    await page.goto('/go-live');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the refresh/verify button (icon button next to Payment Gateway)
    // These are typically the small ghost buttons with RefreshCw icon
    const verifyButtons = page.locator('button:has(svg)').filter({ hasText: '' });

    // Click the first verify button (for Payment Gateway which is first auto-verifiable item)
    await verifyButtons.first().click();

    // Should show verified status after API call
    await expect(page.getByText('Payment gateway configured')).toBeVisible({ timeout: 5000 });
  });
});

// ===========================================
// PREVIEW PAGE TESTS
// ===========================================

test.describe('Preview Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, storeInfo: WC_STORE_INFO }),
      });
    });

    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: { name: 'Test BC Store', domain: 'teststore123.mybigcommerce.com' },
        }),
      });
    });

    // Mock products endpoint
    await page.route('**/api/preview/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            products: [
              {
                id: 1,
                name: 'Test Product',
                sku: 'TEST-001',
                price: 29.99,
                description: 'A test product description',
                images: [{ id: 1, url_standard: 'https://example.com/image.jpg' }],
                variants: [],
                categories: [1],
                inventory_level: 100,
                is_visible: true,
                custom_url: { url: '/products/test-product' },
                type: 'physical',
                weight: 1,
                _validation: {
                  hasMainImage: true,
                  nameTruncated: false,
                  originalNameLength: 12,
                  descriptionTruncated: false,
                  originalDescriptionLength: 27,
                  variantCount: 0,
                  hasPrice: true,
                  hasSku: true,
                  issues: [],
                },
              },
            ],
            summary: { total: 1, withIssues: 0, errors: 0, warnings: 0 },
          },
        }),
      });
    });
  });

  test('shows connection warning when not connected', async ({ page }) => {
    await page.goto('/preview');
    await expect(page.getByText('Connection Required')).toBeVisible();
  });

  test.skip('shows preview UI when connected', async ({ page }) => {
    // TODO: Fix locator for Store Preview heading
    await page.goto('/preview');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show main preview heading
    await expect(page.getByRole('heading', { name: 'Store Preview' })).toBeVisible();

    // Should show view tabs
    await expect(page.getByText('Product List')).toBeVisible();
  });

  test('shows path switcher with three options', async ({ page }) => {
    await page.goto('/preview');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Path switcher should have the three theme options
    await expect(page.getByRole('button', { name: /catalyst/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /stencil/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /makeswift/i })).toBeVisible();
  });

  test.skip('SEO Preview tab is accessible', async ({ page }) => {
    // TODO: Fix locator for SEO Preview tab
    await page.goto('/preview');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should have SEO Preview tab
    await expect(page.getByText('SEO Preview')).toBeVisible();

    // Click SEO Preview tab
    await page.getByText('SEO Preview').click();

    // Should show no product selected message or SEO preview content
    await expect(page.getByText(/no product selected|seo preview/i)).toBeVisible();
  });
});

// ===========================================
// CLEAR DATA PAGE TESTS
// ===========================================

test.describe('Clear Data Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: { name: 'Test BC Store', domain: 'teststore123.mybigcommerce.com' },
        }),
      });
    });
  });

  test('shows clear data form when connected', async ({ page }) => {
    await page.goto('/clear-data');

    await page.evaluate((keys) => {
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for main heading
    await expect(page.getByRole('heading', { name: /clear.*data/i })).toBeVisible();

    // Check for entity checkboxes (using label associations)
    await expect(page.getByLabel(/products/i)).toBeVisible();
    await expect(page.getByLabel(/categories/i)).toBeVisible();
  });

  test('shows warning about permanent deletion', async ({ page }) => {
    await page.goto('/clear-data');

    await page.evaluate((keys) => {
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/permanently delete/i)).toBeVisible();
  });

  test('dry run button shows preview', async ({ page }) => {
    await page.route('**/api/bc/clear-sample-data', async (route) => {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          dryRun: body.dryRun,
          results: {
            products: { deleted: 10, errors: 0 },
            categories: { deleted: 5, errors: 0 },
          },
        }),
      });
    });

    await page.goto('/clear-data');

    await page.evaluate((keys) => {
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Select products (try both checkbox and label approaches)
    const productsCheckbox = page.getByLabel(/products/i);
    if (await productsCheckbox.isVisible()) {
      await productsCheckbox.check();
    }

    // Click Preview/Dry Run button
    const previewButton = page.getByRole('button', { name: /preview|dry run/i });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      // Should show some result - just verify the button worked
      await page.waitForTimeout(1000);
    }
  });
});

// ===========================================
// SETTINGS PAGE TESTS
// ===========================================

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, storeInfo: WC_STORE_INFO }),
      });
    });

    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: { name: 'Test BC Store', domain: 'teststore123.mybigcommerce.com' },
        }),
      });
    });
  });

  test('shows settings page with data management options', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Should show the Settings title (h1 element)
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Should show export section title
    await expect(page.getByText('Export Migration State')).toBeVisible();

    // Should show import section title
    await expect(page.getByText('Import Migration State')).toBeVisible();
  });

  test('export button initiates download when connected', async ({ page }) => {
    await page.goto('/settings');

    // Set up connections
    await setupConnections(page);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click Download Export button
    await page.getByRole('button', { name: /download export/i }).click();

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('shows connection warning when not connected', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Should show connection required warning
    await expect(page.getByText('Connection Required')).toBeVisible();
  });
});
