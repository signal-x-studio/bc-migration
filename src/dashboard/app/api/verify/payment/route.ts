import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify that at least one payment method is configured in BigCommerce
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bcCredentials } = body;

    if (!bcCredentials?.storeHash || !bcCredentials?.accessToken) {
      return NextResponse.json(
        { success: false, verified: false, error: 'Missing BC credentials' },
        { status: 400 }
      );
    }

    const { storeHash, accessToken } = bcCredentials;

    // Check payment methods using V2 API
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/payments/methods`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // V2 endpoint might not be available on all plans
      // Try checking store settings instead
      const storeResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/store`,
        {
          headers: {
            'X-Auth-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (storeResponse.ok) {
        // Store exists, assume payment needs manual verification
        return NextResponse.json({
          success: true,
          verified: false,
          notes: 'Unable to auto-verify. Please check payment settings manually.',
        });
      }

      throw new Error('Failed to check payment configuration');
    }

    const methods = await response.json();
    const enabledMethods = Array.isArray(methods)
      ? methods.filter((m: { enabled?: boolean }) => m.enabled)
      : [];

    const verified = enabledMethods.length > 0;

    return NextResponse.json({
      success: true,
      verified,
      notes: verified
        ? `${enabledMethods.length} payment method(s) enabled`
        : 'No payment methods configured',
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({
      success: false,
      verified: false,
      notes: 'Unable to auto-verify. Please check payment settings manually.',
    });
  }
}
