import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface ConnectRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export async function POST(request: Request) {
  try {
    const body: ConnectRequest = await request.json();

    // Validate request body
    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: url, consumerKey, consumerSecret' },
        { status: 400 }
      );
    }

    const wcUrl = normalizeUrl(body.url);

    // Create WooCommerce API client
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Test connection by fetching system status and counts
    const [systemStatus, productsResponse, ordersResponse, customersResponse] = await Promise.all([
      api.get('system_status').catch(() => null),
      api.get('products', { per_page: 1 }),
      api.get('orders', { per_page: 1 }),
      api.get('customers', { per_page: 1 }),
    ]);

    // Extract store info
    const wcVersion = systemStatus?.data?.environment?.version || 'Unknown';
    const storeName = systemStatus?.data?.environment?.site_url || wcUrl;

    const productCount = parseInt(productsResponse.headers['x-wp-total'] || '0', 10);
    const orderCount = parseInt(ordersResponse.headers['x-wp-total'] || '0', 10);
    const customerCount = parseInt(customersResponse.headers['x-wp-total'] || '0', 10);

    return NextResponse.json({
      success: true,
      storeInfo: {
        name: storeName,
        wcVersion,
        productCount,
        orderCount,
        customerCount,
      },
    });
  } catch (error: any) {
    console.error('Connection error:', error);

    // Parse WooCommerce API errors
    let errorMessage = 'Failed to connect to WooCommerce store';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        errorMessage = 'Invalid API credentials. Please check your Consumer Key and Secret.';
      } else if (status === 404) {
        errorMessage = 'WooCommerce REST API not found. Make sure WooCommerce is installed and permalinks are configured.';
      } else if (status === 403) {
        errorMessage = 'Access forbidden. Check that your API key has Read permissions.';
      } else if (data?.message) {
        errorMessage = data.message;
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to the store URL. Please verify the URL is correct.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
