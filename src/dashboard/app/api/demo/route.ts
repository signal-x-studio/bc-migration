import { NextResponse } from 'next/server';

// This endpoint returns demo credentials from environment variables
// Used for internal stakeholder demos to bypass manual credential entry
export async function GET() {
  const wcUrl = process.env.DEMO_WC_URL;
  const wcConsumerKey = process.env.DEMO_WC_CONSUMER_KEY;
  const wcConsumerSecret = process.env.DEMO_WC_CONSUMER_SECRET;
  const bcStoreHash = process.env.DEMO_BC_STORE_HASH;
  const bcAccessToken = process.env.DEMO_BC_ACCESS_TOKEN;

  // Check if demo credentials are configured
  if (!wcUrl || !wcConsumerKey || !wcConsumerSecret) {
    return NextResponse.json(
      {
        success: false,
        error: 'Demo credentials not configured. Set DEMO_WC_URL, DEMO_WC_CONSUMER_KEY, and DEMO_WC_CONSUMER_SECRET environment variables.'
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    wc: {
      url: wcUrl,
      consumerKey: wcConsumerKey,
      consumerSecret: wcConsumerSecret,
    },
    bc: bcStoreHash && bcAccessToken ? {
      storeHash: bcStoreHash,
      accessToken: bcAccessToken,
    } : null,
  });
}
