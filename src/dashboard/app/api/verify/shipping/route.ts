import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify that shipping zones are configured in BigCommerce
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

    // Check shipping zones using V2 API
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/shipping/zones`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        verified: false,
        notes: 'Unable to auto-verify. Please check shipping settings manually.',
      });
    }

    const zones = await response.json();
    const hasZones = Array.isArray(zones) && zones.length > 0;

    // If zones exist, check if they have shipping methods
    let hasShippingMethods = false;
    if (hasZones) {
      // Check first zone for methods
      const methodsResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/shipping/zones/${zones[0].id}/methods`,
        {
          headers: {
            'X-Auth-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (methodsResponse.ok) {
        const methods = await methodsResponse.json();
        hasShippingMethods = Array.isArray(methods) && methods.length > 0;
      }
    }

    const verified = hasZones && hasShippingMethods;

    return NextResponse.json({
      success: true,
      verified,
      notes: verified
        ? `${zones.length} shipping zone(s) with methods configured`
        : hasZones
        ? 'Shipping zones exist but no methods configured'
        : 'No shipping zones configured',
    });

  } catch (error) {
    console.error('Shipping verification error:', error);
    return NextResponse.json({
      success: false,
      verified: false,
      notes: 'Unable to auto-verify. Please check shipping settings manually.',
    });
  }
}
