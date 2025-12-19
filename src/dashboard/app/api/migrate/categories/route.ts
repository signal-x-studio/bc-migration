import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';
import type { MigrationCategoryInfo } from '@/lib/types';
import { MIGRATION_PRODUCT_LIMIT } from '@/lib/types';

/**
 * Fetch WooCommerce categories with product counts
 * Returns a hierarchical tree with migration eligibility info
 */

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, consumerKey, consumerSecret } = body;

    if (!url || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const wcClient = await createWCClient(url, consumerKey, consumerSecret);

    // Fetch all categories
    const categories: WCCategory[] = [];
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
        categories.push(...response.data);
        page++;
      }

      if (page > 10) break; // Safety limit
    }

    // Build category map for depth calculation
    const categoryMap = new Map<number, WCCategory>();
    categories.forEach(cat => categoryMap.set(cat.id, cat));

    // Calculate depth for each category
    function getDepth(categoryId: number): number {
      const category = categoryMap.get(categoryId);
      if (!category || category.parent === 0) return 1;
      return 1 + getDepth(category.parent);
    }

    // Build hierarchical tree
    function buildTree(parentId: number, currentDepth: number): MigrationCategoryInfo[] {
      return categories
        .filter(cat => cat.parent === parentId)
        .map(cat => {
          const children = buildTree(cat.id, currentDepth + 1);
          const totalProductCount = getTotalProductCount(cat.id);

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent: cat.parent,
            productCount: totalProductCount,
            depth: currentDepth,
            children,
            isOverLimit: totalProductCount > MIGRATION_PRODUCT_LIMIT,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    // Get total product count including children
    function getTotalProductCount(categoryId: number): number {
      const category = categoryMap.get(categoryId);
      if (!category) return 0;

      // Just return the category's direct count
      // (products in children are counted when those children are selected)
      return category.count;
    }

    const tree = buildTree(0, 0);

    return NextResponse.json({
      success: true,
      data: tree,
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
