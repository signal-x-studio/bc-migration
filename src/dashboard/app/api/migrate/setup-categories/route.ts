import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * Auto-create BigCommerce categories from WooCommerce category hierarchy
 *
 * This is a key automation step - BC doesn't support category creation via CSV,
 * so we must use the API to create the category structure before product import.
 *
 * Process:
 * 1. Fetch all WC categories
 * 2. Sort by depth (parents first)
 * 3. Create each category in BC, mapping parent IDs
 * 4. Return WC→BC ID mapping for product migration
 */

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
}

interface BCCategory {
  id: number;
  name: string;
  parent_id: number;
}

interface CategoryMapping {
  wcId: number;
  bcId: number;
  name: string;
  wcParent: number;
  bcParent: number;
}

// BC has a max category depth of 5
const BC_MAX_DEPTH = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wcCredentials, bcCredentials, dryRun = false } = body;

    if (!wcCredentials || !bcCredentials) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const wcClient = await createWCClient(
      wcCredentials.url,
      wcCredentials.consumerKey,
      wcCredentials.consumerSecret
    );

    // Step 1: Fetch all WC categories
    const wcCategories: WCCategory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await wcClient.get('products/categories', {
        per_page: 100,
        page,
      });

      if (response.data.length === 0) {
        hasMore = false;
      } else {
        wcCategories.push(...response.data);
        page++;
      }

      if (page > 10) break;
    }

    // Step 2: Build hierarchy and calculate depths
    const categoryMap = new Map<number, WCCategory>();
    wcCategories.forEach(cat => categoryMap.set(cat.id, cat));

    function getDepth(categoryId: number): number {
      const category = categoryMap.get(categoryId);
      if (!category || category.parent === 0) return 1;
      return 1 + getDepth(category.parent);
    }

    // Sort by depth (parents first) and filter out too-deep categories
    const sortedCategories = wcCategories
      .map(cat => ({ ...cat, depth: getDepth(cat.id) }))
      .filter(cat => cat.depth <= BC_MAX_DEPTH)
      .sort((a, b) => a.depth - b.depth);

    const skippedCategories = wcCategories
      .map(cat => ({ ...cat, depth: getDepth(cat.id) }))
      .filter(cat => cat.depth > BC_MAX_DEPTH);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        data: {
          totalWcCategories: wcCategories.length,
          categoriesToCreate: sortedCategories.length,
          categoriesSkipped: skippedCategories.length,
          skippedReason: `Depth exceeds BC limit of ${BC_MAX_DEPTH}`,
          categories: sortedCategories.map(c => ({
            id: c.id,
            name: c.name,
            parent: c.parent,
            depth: c.depth,
            productCount: c.count,
          })),
          skipped: skippedCategories.map(c => ({
            id: c.id,
            name: c.name,
            depth: c.depth,
          })),
        },
      });
    }

    // Step 3: Create categories in BC
    const mappings: CategoryMapping[] = [];
    const wcToBcIdMap = new Map<number, number>(); // WC ID → BC ID
    const errors: Array<{ wcId: number; name: string; error: string }> = [];

    for (const wcCategory of sortedCategories) {
      try {
        // Check if category already exists in BC by name
        const existingCategory = await findBCCategoryByName(
          bcCredentials.storeHash,
          bcCredentials.accessToken,
          wcCategory.name
        );

        if (existingCategory) {
          // Category already exists, use existing ID
          wcToBcIdMap.set(wcCategory.id, existingCategory.id);
          mappings.push({
            wcId: wcCategory.id,
            bcId: existingCategory.id,
            name: wcCategory.name,
            wcParent: wcCategory.parent,
            bcParent: existingCategory.parent_id,
          });
          continue;
        }

        // Determine BC parent ID
        let bcParentId = 0;
        if (wcCategory.parent !== 0) {
          bcParentId = wcToBcIdMap.get(wcCategory.parent) || 0;
        }

        // Create category in BC
        const bcCategory = await createBCCategory(
          bcCredentials.storeHash,
          bcCredentials.accessToken,
          {
            name: wcCategory.name,
            parent_id: bcParentId,
            description: wcCategory.description || '',
            is_visible: true,
          }
        );

        wcToBcIdMap.set(wcCategory.id, bcCategory.id);
        mappings.push({
          wcId: wcCategory.id,
          bcId: bcCategory.id,
          name: wcCategory.name,
          wcParent: wcCategory.parent,
          bcParent: bcParentId,
        });

        // Small delay to respect rate limits
        await sleep(100);

      } catch (error) {
        errors.push({
          wcId: wcCategory.id,
          name: wcCategory.name,
          error: error instanceof Error ? error.message : 'Failed to create category',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCreated: mappings.length,
        totalSkipped: skippedCategories.length,
        totalErrors: errors.length,
        mappings,
        errors: errors.length > 0 ? errors : undefined,
        skippedCategories: skippedCategories.length > 0
          ? skippedCategories.map(c => ({ id: c.id, name: c.name, depth: c.depth }))
          : undefined,
      },
    });

  } catch (error) {
    console.error('Category setup error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Category setup failed' },
      { status: 500 }
    );
  }
}

async function findBCCategoryByName(
  storeHash: string,
  accessToken: string,
  name: string
): Promise<BCCategory | null> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories?name=${encodeURIComponent(name)}`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.data && result.data.length > 0 ? result.data[0] : null;
}

async function createBCCategory(
  storeHash: string,
  accessToken: string,
  category: {
    name: string;
    parent_id: number;
    description: string;
    is_visible: boolean;
  }
): Promise<BCCategory> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.title || error.detail || 'Failed to create category');
  }

  const result = await response.json();
  return result.data;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
