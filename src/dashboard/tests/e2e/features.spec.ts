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

  test('detailed validation shows score and entity sections', async ({ page }) => {
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

    // Find and click Run Validation in the Data Quality section
    const detailedSection = page.locator('text=Data Quality Validation').locator('..');
    await detailedSection.getByRole('button', { name: 'Run Validation' }).click();

    // Should show overall score
    await expect(page.getByText('87%')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Data Quality Score')).toBeVisible();

    // Should show entity sections
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByText('Orders')).toBeVisible();
  });

  test('can expand entity section to see issues', async ({ page }) => {
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

    const detailedSection = page.locator('text=Data Quality Validation').locator('..');
    await detailedSection.getByRole('button', { name: 'Run Validation' }).click();

    await expect(page.getByText('90%')).toBeVisible({ timeout: 10000 });

    // Click on Products section to expand
    await page.getByText('Products').first().click();

    // Should show issues
    await expect(page.getByText('Missing image')).toBeVisible();
    await expect(page.getByText('Zero price')).toBeVisible();
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

  test('can toggle checklist items', async ({ page }) => {
    await page.goto('/go-live');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the Payment Gateway item and click to toggle
    const paymentItem = page.locator('text=Payment Gateway Configured').locator('..').locator('..');
    const checkbox = paymentItem.locator('button').first();

    // Click to mark as verified
    await checkbox.click();

    // Progress should update
    await expect(page.locator('text=Complete').first()).toBeVisible();
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
    // Mock the analytics verify endpoint
    await page.route('**/api/verify/analytics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          notes: 'Analytics tracking detected',
        }),
      });
    });

    await page.goto('/go-live');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find Analytics item and click verify button
    const analyticsItem = page.locator('text=Analytics Configured').locator('..').locator('..');
    const verifyButton = analyticsItem.getByRole('button').filter({ has: page.locator('svg') });

    await verifyButton.first().click();

    // Should show verified status after API call
    await expect(analyticsItem.locator('text=Analytics tracking detected')).toBeVisible({ timeout: 5000 });
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

  test('shows preview UI when connected', async ({ page }) => {
    await page.goto('/preview');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Store Preview')).toBeVisible();
    await expect(page.getByText('Product List')).toBeVisible();
    await expect(page.getByText('Product Detail')).toBeVisible();
    await expect(page.getByText('SEO Preview')).toBeVisible();
  });

  test('shows path switcher with three options', async ({ page }) => {
    await page.goto('/preview');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Catalyst')).toBeVisible();
    await expect(page.getByText('Stencil')).toBeVisible();
    await expect(page.getByText('Makeswift')).toBeVisible();
  });

  test('SEO Preview tab shows Google preview', async ({ page }) => {
    await page.goto('/preview');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click SEO Preview tab
    await page.getByText('SEO Preview').click();

    // Should show SEO Preview UI
    await expect(page.getByText('SEO Preview').first()).toBeVisible();

    // Select a product first
    await page.getByRole('combobox').first().click();
    await page.getByRole('option').first().click();

    // Should show preview options
    await expect(page.getByText('Google')).toBeVisible();
    await expect(page.getByText('Social Card')).toBeVisible();
    await expect(page.getByText('Schema')).toBeVisible();
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

    await expect(page.getByText('Clear BigCommerce Data')).toBeVisible();
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();
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

    // Select products
    await page.getByLabel('Products').check();

    // Click Preview
    await page.getByRole('button', { name: /preview/i }).click();

    // Should show preview results
    await expect(page.getByText('10')).toBeVisible({ timeout: 5000 });
  });
});

// ===========================================
// SETTINGS PAGE TESTS
// ===========================================

test.describe('Settings Page', () => {
  test('shows export and import options', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByText('Migration Settings')).toBeVisible();
    await expect(page.getByText('Export Migration State')).toBeVisible();
    await expect(page.getByText('Import Migration State')).toBeVisible();
  });

  test('export button downloads JSON file', async ({ page }) => {
    await page.goto('/settings');

    // Set up some migration state
    await page.evaluate((keys) => {
      localStorage.setItem(keys.CREDENTIALS, JSON.stringify({
        url: 'https://test-store.wpenginepowered.com',
        consumerKey: 'ck_test123',
        consumerSecret: 'cs_test456',
      }));
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));
    }, STORAGE_KEYS);

    await page.reload();

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click Export
    await page.getByRole('button', { name: /export/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('migration-export');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('clear local data button clears storage', async ({ page }) => {
    await page.goto('/settings');

    // Set up some data
    await page.evaluate((keys) => {
      localStorage.setItem(keys.CREDENTIALS, JSON.stringify({
        url: 'https://test-store.wpenginepowered.com',
        consumerKey: 'ck_test123',
        consumerSecret: 'cs_test456',
      }));
    }, STORAGE_KEYS);

    await page.reload();

    // Click Clear Local Data
    await page.getByRole('button', { name: /clear local data/i }).click();

    // Confirm in dialog if present
    const confirmButton = page.getByRole('button', { name: /confirm/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify data is cleared
    const credentials = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.CREDENTIALS);
    expect(credentials).toBeNull();
  });
});
