import { NextRequest, NextResponse } from 'next/server';

/**
 * Test BigCommerce API connection
 * Uses the V2 Store API to verify credentials
 */

interface BCStoreResponse {
  id: string;
  domain: string;
  name: string;
  plan_name: string;
  plan_level: string;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeHash, accessToken } = body;

    if (!storeHash || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing store hash or access token' },
        { status: 400 }
      );
    }

    // Clean the store hash (remove any 'stores/' prefix if present)
    const cleanStoreHash = storeHash.replace(/^stores\//, '').trim();

    // Test connection by fetching store info
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${cleanStoreHash}/v2/store`,
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
      let errorMessage = 'Failed to connect to BigCommerce';

      if (response.status === 401) {
        errorMessage = 'Invalid access token. Please check your API credentials.';
      } else if (response.status === 404) {
        errorMessage = 'Store not found. Please check your store hash.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. Please ensure your API token has the required permissions.';
      }

      console.error('BC API Error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const storeData: BCStoreResponse = await response.json();

    return NextResponse.json({
      success: true,
      storeInfo: {
        name: storeData.name,
        domain: storeData.domain,
        plan: storeData.plan_name || storeData.plan_level,
        status: storeData.status,
      },
    });

  } catch (error) {
    console.error('BC connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      },
      { status: 500 }
    );
  }
}
