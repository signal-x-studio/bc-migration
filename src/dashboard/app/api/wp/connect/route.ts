import { NextRequest, NextResponse } from 'next/server';
import { createWPClientExtended, WPSiteInfo } from '@/lib/wp-client';
import { wpCache, WPCache } from '@/lib/wp-cache';

export interface WPConnectRequest {
  url: string;
}

export interface WPConnectResponse {
  success: boolean;
  siteInfo?: WPSiteInfo;
  error?: string;
}

/**
 * POST /api/wp/connect
 * Test connection to a WordPress site and return site info
 */
export async function POST(request: NextRequest): Promise<NextResponse<WPConnectResponse>> {
  try {
    const body = await request.json() as WPConnectRequest;
    const { url } = body;

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

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = WPCache.key(normalizedUrl, 'siteInfo');
    const cachedInfo = wpCache.get<WPSiteInfo>(cacheKey);
    if (cachedInfo) {
      return NextResponse.json({ success: true, siteInfo: cachedInfo });
    }

    // Create client and test connection
    const client = createWPClientExtended(normalizedUrl);

    // Test connection by fetching site info
    const siteInfo = await client.getSiteInfo();

    // Cache the result (longer TTL for site info - 30 minutes)
    wpCache.set(cacheKey, siteInfo, 30 * 60 * 1000);

    return NextResponse.json({ success: true, siteInfo });
  } catch (error) {
    console.error('WordPress connection error:', error);

    const message = error instanceof Error ? error.message : 'Failed to connect to WordPress site';

    // Provide helpful error messages
    let userMessage = message;
    if (message.includes('fetch')) {
      userMessage = 'Unable to reach the WordPress site. Please check the URL and try again.';
    } else if (message.includes('404')) {
      userMessage = 'WordPress REST API not found. Make sure the site has WordPress REST API enabled.';
    } else if (message.includes('401') || message.includes('403')) {
      userMessage = 'Access denied. The site may require authentication.';
    }

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    );
  }
}
