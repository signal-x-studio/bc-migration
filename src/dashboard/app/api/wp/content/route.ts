import { NextRequest, NextResponse } from 'next/server';
import { createWPClientExtended, WPPostWithEmbeds, WPPageWithEmbeds } from '@/lib/wp-client';
import { wpCache, WPCache } from '@/lib/wp-cache';

export interface WPContentRequest {
  url: string;
  id: number;
  type: 'post' | 'page';
}

export interface WPContentResponse {
  success: boolean;
  data?: WPPostWithEmbeds | WPPageWithEmbeds;
  error?: string;
}

/**
 * POST /api/wp/content
 * Fetch a single post or page by ID with embedded content
 */
export async function POST(request: NextRequest): Promise<NextResponse<WPContentResponse>> {
  try {
    const body = await request.json() as WPContentRequest;
    const { url, id, type } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'post' && type !== 'page')) {
      return NextResponse.json(
        { success: false, error: 'Content type must be "post" or "page"' },
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
    const cacheKey = WPCache.key(normalizedUrl, type, id.toString());

    // Check cache (longer TTL for single items - 10 minutes)
    const cached = wpCache.get<WPPostWithEmbeds | WPPageWithEmbeds>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Fetch from WordPress
    const client = createWPClientExtended(normalizedUrl);
    let data: WPPostWithEmbeds | WPPageWithEmbeds;

    if (type === 'post') {
      data = await client.getPost(id, true);
    } else {
      data = await client.getPage(id, true);
    }

    // Cache the result
    wpCache.set(cacheKey, data, 10 * 60 * 1000);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('WordPress content fetch error:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch content';

    // Handle 404 specifically
    if (message.includes('404')) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
