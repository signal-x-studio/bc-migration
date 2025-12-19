import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

const BC_MAX_CATEGORY_DEPTH = 5;

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Fetch all categories
    let page = 1;
    let allCategories: any[] = [];
    while (true) {
      const response = await api.get('products/categories', { page, per_page: 100 });
      if (!response.data || response.data.length === 0) break;
      allCategories = allCategories.concat(response.data);
      page++;
      if (page > 20) break;
    }

    // Build hierarchy and calculate depth
    const categoryMap = new Map(allCategories.map(c => [c.id, c]));
    const getDepth = (cat: any): number => {
      if (!cat.parent || cat.parent === 0) return 1;
      const parent = categoryMap.get(cat.parent);
      return parent ? 1 + getDepth(parent) : 1;
    };

    let maxDepth = 0;
    const deepCategories: any[] = [];
    let emptyCategories = 0;
    let totalProducts = 0;

    for (const cat of allCategories) {
      const depth = getDepth(cat);
      if (depth > maxDepth) maxDepth = depth;
      if (depth > BC_MAX_CATEGORY_DEPTH) {
        deepCategories.push({ id: cat.id, name: cat.name, depth });
      }
      if (cat.count === 0) emptyCategories++;
      totalProducts += cat.count || 0;
    }

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Check for depth violations
    if (maxDepth > BC_MAX_CATEGORY_DEPTH) {
      issues.blockers.push({
        id: 'category-depth-exceeded',
        severity: 'blocker',
        title: `Category depth exceeds BC limit`,
        description: `Max depth is ${maxDepth} levels. BigCommerce supports max ${BC_MAX_CATEGORY_DEPTH} levels.`,
        affectedItems: deepCategories.length,
        recommendation: 'Flatten category hierarchy to 5 levels or less.',
      });
    }

    if (emptyCategories > 0) {
      issues.info.push({
        id: 'empty-categories',
        severity: 'info',
        title: 'Empty categories found',
        description: `${emptyCategories} categories have no products assigned.`,
        affectedItems: emptyCategories,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allCategories.length,
          maxDepth,
          avgProductsPerCategory: allCategories.length > 0 ? totalProducts / allCategories.length : 0,
          emptyCategories,
          orphanProducts: 0,
        },
        issues,
        hierarchy: [],
        deepCategories,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
