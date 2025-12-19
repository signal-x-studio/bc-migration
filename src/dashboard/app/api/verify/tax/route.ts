import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify tax settings are configured in BigCommerce
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

    // Check tax classes using V2 API
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/tax_classes`,
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
        notes: 'Unable to auto-verify. Please check tax settings manually.',
      });
    }

    const taxClasses = await response.json();
    const hasClasses = Array.isArray(taxClasses) && taxClasses.length > 0;

    // Check if there's a default tax class
    const hasDefaultClass = hasClasses && taxClasses.some(
      (tc: { name?: string }) => tc.name === 'Default Tax Class' || tc.name === 'Non-Taxable Products'
    );

    // For a basic verification, having tax classes is enough
    // Actual tax rates require manual setup or integration
    const verified = hasClasses;

    return NextResponse.json({
      success: true,
      verified,
      notes: verified
        ? `${taxClasses.length} tax class(es) configured`
        : 'No tax classes found. Configure tax settings in BC admin.',
    });

  } catch (error) {
    console.error('Tax verification error:', error);
    return NextResponse.json({
      success: false,
      verified: false,
      notes: 'Unable to auto-verify. Please check tax settings manually.',
    });
  }
}
