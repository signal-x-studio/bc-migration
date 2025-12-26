import { NextRequest, NextResponse } from 'next/server';
import { createWPClientExtended, WPPageWithEmbeds } from '@/lib/wp-client';
import { wpCache, WPCache } from '@/lib/wp-cache';

export interface WPPagesRequest {
  url: string;
  page?: number;
  per_page?: number;
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}

export interface WPPagesResponse {
  success: boolean;
  data?: WPPageWithEmbeds[];
  total?: number;
  totalPages?: number;
  error?: string;
}

/**
 * POST /api/wp/pages
 * Fetch pages from a WordPress site with pagination and search
 */
export async function POST(request: NextRequest): Promise<NextResponse<WPPagesResponse>> {
  try {
    const body = await request.json() as WPPagesRequest;
    const { url, page = 1, per_page = 10, search, orderby = 'date', order = 'desc' } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    normalizedUrl = normalizedUrl.replace(/\/+$/, '');

    // Generate cache key
    const cacheKey = WPCache.key(normalizedUrl, 'pages', page.toString(), per_page.toString(), search || '', orderby, order);

    // Check cache (shorter TTL for lists - 5 minutes)
    const cached = wpCache.get<{ pages: WPPageWithEmbeds[]; total: number; totalPages: number }>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.pages,
        total: cached.total,
        totalPages: cached.totalPages,
      });
    }

    // Fetch from WordPress
    const client = createWPClientExtended(normalizedUrl);
    const result = await client.getPagesWithMeta({
      page,
      per_page,
      search,
      orderby,
      order,
    });

    // Cache the result
    wpCache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: result.pages,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('WordPress pages fetch error:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch pages';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
