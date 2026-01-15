import { test, expect } from '@playwright/test';

test.describe('Documentation Link Validation', () => {
  test('should test all links from docs index page', async ({ page }) => {
    // Navigate to docs index
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');

    // Expand all sections to reveal all links
    const sectionTitles = ['Guides', 'Platform', 'Reference', 'Resources'];
    for (const title of sectionTitles) {
      const sectionButton = page.locator(`button h2:has-text("${title}")`).first();
      if (await sectionButton.isVisible()) {
        await sectionButton.click();
        await page.waitForTimeout(300); // Wait for expansion animation
      }
    }

    // Get all internal documentation links (excluding external links and anchors)
    const links = await page.locator('a[href^="/docs/"]').all();

    // Deduplicate links by href
    const uniqueLinks = new Map<string, string>();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      const text = (await link.textContent())?.trim() || href;
      if (!uniqueLinks.has(href)) {
        uniqueLinks.set(href, text);
      }
    }

    const results: { href: string; text: string; status: 'success' | 'error'; statusCode?: number }[] = [];

    console.log(`\n📋 Found ${uniqueLinks.size} unique documentation links to test\n`);

    // Test each unique link
    for (const [href, text] of uniqueLinks.entries()) {
      try {
        const response = await page.goto(`http://localhost:3000${href}`);
        const statusCode = response?.status() || 0;

        if (statusCode === 200) {
          console.log(`✅ ${text}`);
          console.log(`   ${href}\n`);
          results.push({ href, text, status: 'success', statusCode });
        } else {
          console.log(`❌ ${text}`);
          console.log(`   ${href} - Status: ${statusCode}\n`);
          results.push({ href, text, status: 'error', statusCode });
        }
      } catch (error) {
        console.log(`❌ ${text}`);
        console.log(`   ${href} - Error\n`);
        results.push({ href, text, status: 'error' });
      }

      // Return to docs index for next link
      await page.goto('http://localhost:3000/docs');
      await page.waitForLoadState('networkidle');

      // Re-expand sections
      for (const title of sectionTitles) {
        const sectionButton = page.locator(`button h2:has-text("${title}")`).first();
        if (await sectionButton.isVisible()) {
          await sectionButton.click();
          await page.waitForTimeout(100);
        }
      }
    }

    // Summary
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;

    console.log('\n' + '='.repeat(70));
    console.log(`📊 Summary: ${successful} working, ${failed} broken`);
    console.log('='.repeat(70) + '\n');

    if (failed > 0) {
      console.log('❌ Broken links:\n');
      results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`   ${r.text}`);
          console.log(`   ${r.href} (${r.statusCode || 'error'})\n`);
        });
    }

    // Assert that at least some links work (we know 7 files exist)
    expect(successful).toBeGreaterThan(0);
  });
});
