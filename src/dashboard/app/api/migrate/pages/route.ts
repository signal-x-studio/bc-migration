import { NextRequest } from 'next/server';
import { createWPClient, WPPage } from '@/lib/wp-client';
import type { PageMigrationStats } from '@/lib/types';

/**
 * Migrate CMS pages from WordPress to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 *
 * Uses BC V3 Web Pages API
 */

interface MigratePagesRequest {
  wcCredentials: {
    url: string;
    // WP REST API for pages is public, but we use same credential structure for consistency
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  migratedPageIds?: number[];
  includeStatuses?: string[]; // Default: ['publish']
}

interface BCPageCreate {
  name: string;
  type: 'raw' | 'link' | 'contact_form';
  body: string;
  url: string;
  is_visible: boolean;
  meta_description?: string;
  meta_keywords?: string;
  parent_id?: number;
  sort_order?: number;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body: MigratePagesRequest = await request.json();
        const {
          wcCredentials,
          bcCredentials,
          migratedPageIds = [],
          includeStatuses = ['publish'],
        } = body;

        if (!wcCredentials?.url || !bcCredentials) {
          send({ type: 'error', error: 'Missing required credentials' });
          controller.close();
          return;
        }

        // Initialize WP client
        const wpClient = createWPClient(wcCredentials.url);

        // Test WP connection
        const connectionTest = await wpClient.testConnection();
        if (!connectionTest.success) {
          send({ type: 'error', error: connectionTest.error || 'Cannot connect to WordPress' });
          controller.close();
          return;
        }

        // Fetch all pages from WordPress
        const allPages = await wpClient.getAllPages(includeStatuses.join(','));

        // Filter out already migrated pages
        const pagesToMigrate = allPages.filter(
          page => !migratedPageIds.includes(page.id)
        );

        // Sort by parent (parent=0 first) to ensure parents are created before children
        pagesToMigrate.sort((a, b) => a.parent - b.parent);

        send({
          type: 'started',
          totalPages: pagesToMigrate.length,
          totalInWP: allPages.length,
          alreadyMigrated: allPages.length - pagesToMigrate.length,
        });

        const stats: PageMigrationStats = {
          total: pagesToMigrate.length,
          successful: 0,
          skipped: 0,
          failed: 0,
          warnings: [],
        };

        const newlyMigratedPageIds: number[] = [];
        const pageIdMapping: Record<number, number> = {};
        const wpToBcPageIdMap: Record<number, number> = {};

        // Process pages one by one
        for (const page of pagesToMigrate) {
          try {
            send({
              type: 'progress',
              completedPages: stats.successful + stats.skipped + stats.failed,
              currentPage: {
                id: page.id,
                title: page.title?.rendered || 'Untitled',
                slug: page.slug,
              },
              stats,
            });

            // Check if page already exists in BC by URL
            const existingPage = await checkBCPageExists(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              `/${page.slug}`
            );

            if (existingPage) {
              stats.skipped++;
              newlyMigratedPageIds.push(page.id);
              pageIdMapping[page.id] = existingPage;
              wpToBcPageIdMap[page.id] = existingPage;
              await sleep(100);
              continue;
            }

            // Transform and create page in BC
            const bcPage = transformWPPageToBC(page, wpToBcPageIdMap, stats.warnings);

            const createdPage = await createBCPage(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              bcPage
            );

            stats.successful++;
            newlyMigratedPageIds.push(page.id);
            pageIdMapping[page.id] = createdPage.id;
            wpToBcPageIdMap[page.id] = createdPage.id;

            // Rate limiting - 200ms between creates
            await sleep(200);

          } catch (error) {
            stats.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stats.warnings.push(`Page "${page.title?.rendered || page.slug}": ${errorMessage}`);
            console.error(`Failed to migrate page ${page.id}:`, error);
          }
        }

        send({
          type: 'complete',
          stats,
          migratedPageIds: newlyMigratedPageIds,
          pageIdMapping,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Page migration failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Check if a page with this URL already exists in BC
 */
async function checkBCPageExists(
  storeHash: string,
  accessToken: string,
  url: string
): Promise<number | null> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/content/pages?url=${encodeURIComponent(url)}`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (result.data && result.data.length > 0) {
    return result.data[0].id;
  }

  return null;
}

/**
 * Transform WP Page to BC Page format
 */
function transformWPPageToBC(
  wpPage: WPPage,
  wpToBcPageIdMap: Record<number, number>,
  warnings: string[]
): BCPageCreate {
  // Get title - strip HTML entities
  const name = (wpPage.title?.rendered || 'Untitled')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  // Get body content
  const body = wpPage.content?.rendered || '';

  // Build URL from slug
  const url = `/${wpPage.slug}`;

  // Get meta description from excerpt (strip HTML)
  const metaDescription = wpPage.excerpt?.rendered
    ? wpPage.excerpt.rendered.replace(/<[^>]*>/g, '').trim().substring(0, 255)
    : undefined;

  // Map parent page if exists
  let parentId: number | undefined;
  if (wpPage.parent && wpPage.parent > 0) {
    parentId = wpToBcPageIdMap[wpPage.parent];
    if (!parentId) {
      warnings.push(`Page "${name}": Parent page ${wpPage.parent} not yet migrated, creating as top-level`);
    }
  }

  const bcPage: BCPageCreate = {
    name: name.substring(0, 255), // BC has 255 char limit
    type: 'raw',
    body,
    url,
    is_visible: wpPage.status === 'publish',
    ...(metaDescription ? { meta_description: metaDescription } : {}),
    ...(parentId ? { parent_id: parentId } : {}),
    sort_order: wpPage.menu_order || 0,
  };

  return bcPage;
}

/**
 * Create page in BigCommerce (V3 API)
 */
async function createBCPage(
  storeHash: string,
  accessToken: string,
  page: BCPageCreate
): Promise<{ id: number }> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/content/pages`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(page),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to create page';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.title || errorJson.detail || errorJson.errors?.[0]?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
