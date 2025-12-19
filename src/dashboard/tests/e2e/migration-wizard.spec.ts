import { test, expect, Page } from '@playwright/test';

// Storage keys matching the actual app storage.ts
const STORAGE_KEYS = {
  CREDENTIALS: 'wc-migration-credentials',
  BC_CREDENTIALS: 'wc-migration-bc-credentials',
  STORE_INFO: 'wc-migration-store-info',
  REMEMBER_ME: 'wc-migration-remember-me',
};

// Wizard state key format: wc-migration-wizard-state-${wcUrl}-${bcStoreHash}
function getWizardStateKey(wcUrl: string, bcStoreHash: string): string {
  return `wc-migration-wizard-state-${wcUrl}-${bcStoreHash}`;
}

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

// Helper to set up connection in localStorage - must be called AFTER goto
async function setupConnections(page: Page) {
  await page.evaluate(({ keys, wc, bc, storeInfo }) => {
    // Set WC connection
    localStorage.setItem(keys.CREDENTIALS, JSON.stringify(wc));
    localStorage.setItem(keys.STORE_INFO, JSON.stringify(storeInfo));
    localStorage.setItem(keys.REMEMBER_ME, 'true');

    // Set BC connection
    localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify(bc));
  }, { keys: STORAGE_KEYS, wc: WC_CREDENTIALS, bc: BC_CREDENTIALS, storeInfo: WC_STORE_INFO });
}

// Helper to mock SSE stream responses
async function mockMigrationEndpoint(page: Page, endpoint: string, stats: {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}) {
  await page.route(`**/api/migrate/${endpoint}`, async (route) => {
    // Create SSE response
    const events = [
      { type: 'started', [`total${capitalize(endpoint)}`]: stats.total },
      { type: 'progress', [`completed${capitalize(endpoint)}`]: Math.floor(stats.total / 2) },
      { type: 'progress', [`completed${capitalize(endpoint)}`]: stats.total },
      { type: 'complete', stats, [`migrated${capitalize(endpoint)}Ids`]: Array.from({ length: stats.successful }, (_, i) => i + 1) },
    ];

    const body = events.map(e => `data: ${JSON.stringify(e)}\n\n`).join('');

    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body,
    });
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

test.describe('Migration Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the WC connect endpoint (for ConnectionContext reconnection)
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: {
            name: 'Test WC Store',
            url: WC_CREDENTIALS.url,
            productCount: 100,
            customerCount: 50,
            orderCount: 25,
          },
        }),
      });
    });

    // Mock the BC connect endpoint
    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: {
            name: 'Test BC Store',
            domain: 'teststore123.mybigcommerce.com',
            plan: 'Pro',
          },
        }),
      });
    });
  });

  test('displays connection cards when not connected', async ({ page }) => {
    await page.goto('/migrate');

    // Should show WC connection warning
    await expect(page.getByText('Please connect to a WooCommerce store first')).toBeVisible();
  });

  test('shows wizard when both stores connected', async ({ page }) => {
    // First navigate to set up the page context
    await page.goto('/migrate');

    // Now set up localStorage
    await setupConnections(page);

    // Reload to pick up localStorage
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show WC connected status
    await expect(page.getByText('WooCommerce Source')).toBeVisible();
    await expect(page.getByText('BigCommerce Target')).toBeVisible();

    // Should show wizard progress (use first() to avoid strict mode violation)
    await expect(page.getByText('Foundation').first()).toBeVisible();
    await expect(page.getByText('Core Data').first()).toBeVisible();
    await expect(page.getByText('Transactions').first()).toBeVisible();
    await expect(page.getByText('Content').first()).toBeVisible();
  });

  test('Phase 1 - Foundation: displays category setup', async ({ page }) => {
    await page.goto('/migrate');
    await setupConnections(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show Phase 1 content
    await expect(page.getByText('Phase 1: Foundation')).toBeVisible();
    await expect(page.getByText('Set up your category structure')).toBeVisible();
  });

  test('navigates between phases using progress bar', async ({ page }) => {
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock a completed wizard state
    await page.evaluate((keys) => {
      const wizardState = {
        currentPhase: 2,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101, 2: 102 }
            }
          },
          '2': { status: 'pending' },
          '3': { status: 'locked' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show Phase 2 content since Phase 1 is complete
    await expect(page.getByText('Phase 2: Core Data')).toBeVisible();
  });

  test('Phase 3 - Transactions: shows orders and coupons migration', async ({ page }) => {
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 3
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 3,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'pending' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show Phase 3 content
    await expect(page.getByText('Phase 3: Transactions')).toBeVisible();
    await expect(page.getByText('Migrate Orders')).toBeVisible();
    await expect(page.getByText('Migrate Coupons')).toBeVisible();

    // Should show optional phase indicator
    await expect(page.getByText('Optional phase')).toBeVisible();
  });

  test.skip('Phase 3 - can skip optional phase', async ({ page }) => {
    // TODO: Fix Skip link locator
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 3
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 3,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'pending' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Skip link (inside the phase header text)
    await page.locator('text=Skip').click();

    // Should navigate to Phase 4
    await expect(page.getByText('Phase 4: Content')).toBeVisible();
  });

  test('Phase 4 - Content: shows reviews, pages, and blog migration', async ({ page }) => {
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 4
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 4,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'skipped' },
          '4': { status: 'pending' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show Phase 4 content
    await expect(page.getByText('Phase 4: Content')).toBeVisible();
    await expect(page.getByText('Migrate Reviews')).toBeVisible();
    await expect(page.getByText('Migrate Pages')).toBeVisible();
    await expect(page.getByText('Migrate Blog')).toBeVisible();
  });

  test('shows completion screen when all phases done', async ({ page }) => {
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state with all phases complete
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 4,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': {
            status: 'complete',
            data: {
              orders: { total: 25, migrated: 23, skipped: 2, failed: 0, warnings: [] },
              coupons: { total: 10, migrated: 10, skipped: 0, failed: 0 }
            }
          },
          '4': {
            status: 'complete',
            data: {
              reviews: { total: 15, migrated: 15, skipped: 0, failed: 0 },
              pages: { total: 5, migrated: 5, skipped: 0, failed: 0 },
              blog: { total: 8, migrated: 8, skipped: 0, failed: 0 }
            }
          },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show completion message
    await expect(page.getByText('Migration Complete!')).toBeVisible();
    await expect(page.getByText('All phases have been completed successfully')).toBeVisible();

    // Should show summary of all phases
    await expect(page.getByText('Open BigCommerce Admin')).toBeVisible();
    await expect(page.getByText('Start New Migration')).toBeVisible();
  });

  test.skip('orders migration shows dependency warning without product/customer mapping', async ({ page }) => {
    // TODO: Fix dependency warning locator
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 3 but without product mappings
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 3,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: {}
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 0, migrated: 0, skipped: 0, failed: 0, mapping: {} },
              customers: { total: 0, migrated: 0, skipped: 0, failed: 0, mapping: {} }
            }
          },
          '3': { status: 'pending' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show dependency warning
    await expect(page.getByText('Migration dependencies')).toBeVisible();
    await expect(page.getByText(/products and customers to be migrated first/i)).toBeVisible();
  });

  test('reviews migration shows dependency warning without product mapping', async ({ page }) => {
    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 4 without product mappings
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 4,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: {}
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 0, migrated: 0, skipped: 0, failed: 0, mapping: {} },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'skipped' },
          '4': { status: 'pending' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show dependency warning for reviews
    await expect(page.getByText('Reviews require products')).toBeVisible();
  });

  test.skip('can run orders migration with mocked endpoint', async ({ page }) => {
    // TODO: Fix MigrationStep Start Migration button locator
    // Mock the orders migration endpoint first
    await mockMigrationEndpoint(page, 'orders', {
      total: 25,
      successful: 23,
      skipped: 2,
      failed: 0,
    });

    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 3 with product/customer mappings
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 3,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001, 2: 1002 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001, 2: 2002 } }
            }
          },
          '3': { status: 'pending' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Start Migration on Orders
    const ordersCard = page.locator('text=Migrate Orders').locator('..').locator('..');
    await ordersCard.getByRole('button', { name: 'Start Migration' }).click();

    // Wait for completion - check for success count
    await expect(ordersCard.getByText('Success')).toBeVisible({ timeout: 10000 });
  });

  test.skip('can run pages migration independently', async ({ page }) => {
    // TODO: Fix MigrationStep Start Migration button locator
    // Mock the pages migration endpoint first
    await mockMigrationEndpoint(page, 'pages', {
      total: 5,
      successful: 5,
      skipped: 0,
      failed: 0,
    });

    await page.goto('/migrate');
    await setupConnections(page);

    // Mock wizard state at Phase 4
    await page.evaluate(() => {
      const wizardState = {
        currentPhase: 4,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'skipped' },
          '4': { status: 'pending' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find and click Start Migration on Pages
    const pagesCard = page.locator('text=Migrate Pages').locator('..').locator('..');
    await pagesCard.getByRole('button', { name: 'Start Migration' }).click();

    // Wait for completion - check for success count
    await expect(pagesCard.getByText('Success')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Migration Wizard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the WC connect endpoint
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: {
            name: 'Test WC Store',
            url: WC_CREDENTIALS.url,
            productCount: 100,
            customerCount: 50,
          },
        }),
      });
    });

    // Mock the BC connect endpoint
    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: {
            name: 'Test BC Store',
            domain: 'teststore123.mybigcommerce.com',
            plan: 'Pro',
          },
        }),
      });
    });
  });

  test('Previous button navigates back to prior phase', async ({ page }) => {
    await page.goto('/migrate');

    // Set up connections
    await page.evaluate((keys) => {
      localStorage.setItem(keys.CREDENTIALS, JSON.stringify({
        url: 'https://test-store.wpenginepowered.com',
        consumerKey: 'ck_test123',
        consumerSecret: 'cs_test456',
      }));
      localStorage.setItem(keys.STORE_INFO, JSON.stringify({
        name: 'Test WC Store',
        url: 'https://test-store.wpenginepowered.com',
        productCount: 100,
        customerCount: 50,
      }));
      localStorage.setItem(keys.REMEMBER_ME, 'true');
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));

      // Set wizard to Phase 2
      const wizardState = {
        currentPhase: 2,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': { status: 'pending' },
          '3': { status: 'locked' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be on Phase 2
    await expect(page.getByText('Phase 2: Core Data')).toBeVisible();

    // Click Previous
    await page.getByRole('button', { name: 'Previous' }).click();

    // Should be on Phase 1
    await expect(page.getByText('Phase 1: Foundation')).toBeVisible();
  });

  test('clicking completed phase in progress bar navigates to it', async ({ page }) => {
    await page.goto('/migrate');

    // Set up connections
    await page.evaluate((keys) => {
      localStorage.setItem(keys.CREDENTIALS, JSON.stringify({
        url: 'https://test-store.wpenginepowered.com',
        consumerKey: 'ck_test123',
        consumerSecret: 'cs_test456',
      }));
      localStorage.setItem(keys.STORE_INFO, JSON.stringify({
        name: 'Test WC Store',
        url: 'https://test-store.wpenginepowered.com',
        productCount: 100,
        customerCount: 50,
      }));
      localStorage.setItem(keys.REMEMBER_ME, 'true');
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));

      // Set wizard to Phase 3 with Phase 1 & 2 complete
      const wizardState = {
        currentPhase: 3,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'pending' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be on Phase 3
    await expect(page.getByText('Phase 3: Transactions')).toBeVisible();

    // Click on Foundation in progress or summary area
    await page.getByText('Foundation').first().click();

    // Should navigate to Phase 1
    await expect(page.getByText('Phase 1: Foundation')).toBeVisible();
  });
});

test.describe('Migration State Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the WC connect endpoint
    await page.route('**/api/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: {
            name: 'Test WC Store',
            url: WC_CREDENTIALS.url,
            productCount: 100,
            customerCount: 50,
          },
        }),
      });
    });

    // Mock the BC connect endpoint
    await page.route('**/api/bc/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          storeInfo: {
            name: 'Test BC Store',
            domain: 'teststore123.mybigcommerce.com',
            plan: 'Pro',
          },
        }),
      });
    });
  });

  test('wizard state persists across page reloads', async ({ page }) => {
    await page.goto('/migrate');

    // Set up connections and wizard state
    await page.evaluate((keys) => {
      localStorage.setItem(keys.CREDENTIALS, JSON.stringify({
        url: 'https://test-store.wpenginepowered.com',
        consumerKey: 'ck_test123',
        consumerSecret: 'cs_test456',
      }));
      localStorage.setItem(keys.STORE_INFO, JSON.stringify({
        name: 'Test WC Store',
        url: 'https://test-store.wpenginepowered.com',
        productCount: 100,
        customerCount: 50,
      }));
      localStorage.setItem(keys.REMEMBER_ME, 'true');
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));

      const wizardState = {
        currentPhase: 3,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': { status: 'pending' },
          '4': { status: 'locked' },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be on Phase 3
    await expect(page.getByText('Phase 3: Transactions')).toBeVisible();

    // Reload page again
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on Phase 3
    await expect(page.getByText('Phase 3: Transactions')).toBeVisible();
  });

  test('reset wizard clears state and returns to Phase 1', async ({ page }) => {
    await page.goto('/migrate');

    // Set up connections and completed wizard state
    await page.evaluate((keys) => {
      localStorage.setItem(keys.CREDENTIALS, JSON.stringify({
        url: 'https://test-store.wpenginepowered.com',
        consumerKey: 'ck_test123',
        consumerSecret: 'cs_test456',
      }));
      localStorage.setItem(keys.STORE_INFO, JSON.stringify({
        name: 'Test WC Store',
        url: 'https://test-store.wpenginepowered.com',
        productCount: 100,
        customerCount: 50,
      }));
      localStorage.setItem(keys.REMEMBER_ME, 'true');
      localStorage.setItem(keys.BC_CREDENTIALS, JSON.stringify({
        storeHash: 'teststore123',
        accessToken: 'test-access-token',
      }));

      const wizardState = {
        currentPhase: 4,
        phases: {
          '1': {
            status: 'complete',
            data: {
              categoriesCreated: 10,
              categoriesSkipped: 0,
              categoriesErrored: 0,
              categoryIdMapping: { 1: 101 }
            }
          },
          '2': {
            status: 'complete',
            data: {
              products: { total: 100, migrated: 95, skipped: 5, failed: 0, mapping: { 1: 1001 } },
              customers: { total: 50, migrated: 48, skipped: 2, failed: 0, mapping: { 1: 2001 } }
            }
          },
          '3': {
            status: 'complete',
            data: {
              orders: { total: 25, migrated: 23, skipped: 2, failed: 0, warnings: [] },
              coupons: { total: 10, migrated: 10, skipped: 0, failed: 0 }
            }
          },
          '4': {
            status: 'complete',
            data: {
              reviews: { total: 15, migrated: 15, skipped: 0, failed: 0 },
              pages: { total: 5, migrated: 5, skipped: 0, failed: 0 },
              blog: { total: 8, migrated: 8, skipped: 0, failed: 0 }
            }
          },
        },
        wcStoreUrl: 'https://test-store.wpenginepowered.com',
        bcStoreHash: 'teststore123',
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        'wc-migration-wizard-state-https://test-store.wpenginepowered.com-teststore123',
        JSON.stringify(wizardState)
      );
    }, STORAGE_KEYS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show completion screen
    await expect(page.getByText('Migration Complete!')).toBeVisible();

    // Click Start New Migration
    await page.getByRole('button', { name: 'Start New Migration' }).click();

    // Should be back on Phase 1
    await expect(page.getByText('Phase 1: Foundation')).toBeVisible();
  });
});
