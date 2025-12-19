import { NextRequest, NextResponse } from 'next/server';

/**
 * BigCommerce 301 Redirects API
 * Creates URL redirects in BigCommerce for migrated products/categories
 *
 * BC API Endpoint: PUT /stores/{store_hash}/v3/storefront/redirects
 */

interface RedirectInput {
  fromPath: string;
  toPath?: string;
  toEntityId?: number;
  toType: 'url' | 'product' | 'category' | 'brand' | 'page';
}

interface BCRedirectRequest {
  from_path: string;
  site_id: number;
  to: {
    type: 'url' | 'product' | 'category' | 'brand' | 'page';
    url?: string;
    entity_id?: number;
  };
}

interface RedirectResult {
  created: number;
  failed: number;
  errors: string[];
}

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeHash,
      accessToken,
      redirects,
      siteId = 1000, // Default site ID for single storefront
      dryRun = false
    } = body;

    if (!storeHash || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing BigCommerce credentials' },
        { status: 400 }
      );
    }

    if (!Array.isArray(redirects) || redirects.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No redirects provided' },
        { status: 400 }
      );
    }

    // Preview mode - just return what would be created
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        data: {
          redirectCount: redirects.length,
          redirects: redirects.slice(0, 10), // Preview first 10
          willCreate: redirects.length,
        },
      });
    }

    // Transform redirects to BC format
    const bcRedirects: BCRedirectRequest[] = redirects.map((r: RedirectInput) => ({
      from_path: r.fromPath,
      site_id: siteId,
      to: r.toType === 'url'
        ? { type: 'url', url: r.toPath }
        : { type: r.toType, entity_id: r.toEntityId },
    }));

    // BC API allows batch upsert up to 1000 redirects
    const BATCH_SIZE = 100;
    const results: RedirectResult = {
      created: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < bcRedirects.length; i += BATCH_SIZE) {
      const batch = bcRedirects.slice(i, i + BATCH_SIZE);

      try {
        const response = await fetch(
          `https://api.bigcommerce.com/stores/${storeHash}/v3/storefront/redirects`,
          {
            method: 'PUT',
            headers: {
              'X-Auth-Token': accessToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(batch),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.title || errorJson.detail || errorMessage;
          } catch {
            // Keep default message
          }
          results.failed += batch.length;
          results.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${errorMessage}`);
        } else {
          const data = await response.json();
          results.created += data.data?.length || batch.length;
        }
      } catch (error) {
        results.failed += batch.length;
        results.errors.push(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Rate limiting - wait between batches
      if (i + BATCH_SIZE < bcRedirects.length) {
        await delay(200);
      }
    }

    return NextResponse.json({
      success: results.failed === 0,
      data: results,
    });

  } catch (error) {
    console.error('Redirects API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create redirects'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch existing redirects from BigCommerce
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeHash = searchParams.get('storeHash');
  const accessToken = searchParams.get('accessToken');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!storeHash || !accessToken) {
    return NextResponse.json(
      { success: false, error: 'Missing BigCommerce credentials' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/storefront/redirects?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data || [],
      meta: data.meta || {},
    });

  } catch (error) {
    console.error('Redirects GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch redirects'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint to remove redirects from BigCommerce
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeHash, accessToken, redirectIds } = body;

    if (!storeHash || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing BigCommerce credentials' },
        { status: 400 }
      );
    }

    if (!Array.isArray(redirectIds) || redirectIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No redirect IDs provided' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/storefront/redirects?id:in=${redirectIds.join(',')}`,
      {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': accessToken,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: redirectIds.length,
    });

  } catch (error) {
    console.error('Redirects DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete redirects'
      },
      { status: 500 }
    );
  }
}
