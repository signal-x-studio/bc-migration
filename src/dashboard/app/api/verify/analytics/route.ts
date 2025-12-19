import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify that analytics/tracking is configured on the BigCommerce store
 * Checks for Google Analytics or other tracking scripts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bcCredentials } = body;

    if (!bcCredentials?.storeHash || !bcCredentials?.accessToken) {
      return NextResponse.json(
        { verified: false, notes: 'Missing BC credentials' },
        { status: 400 }
      );
    }

    // Check store settings for analytics
    const settingsResponse = await fetch(
      `https://api.bigcommerce.com/stores/${bcCredentials.storeHash}/v2/store`,
      {
        headers: {
          'X-Auth-Token': bcCredentials.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!settingsResponse.ok) {
      return NextResponse.json({
        verified: false,
        notes: 'Failed to fetch store settings',
      });
    }

    const storeSettings = await settingsResponse.json();

    // Check for Google Analytics ID
    const hasGoogleAnalytics = !!(
      storeSettings.google_analytics_global_settings?.site_id ||
      storeSettings.google_analytics_tracking_code
    );

    // Check for scripts via Script Manager API
    const scriptsResponse = await fetch(
      `https://api.bigcommerce.com/stores/${bcCredentials.storeHash}/v3/content/scripts`,
      {
        headers: {
          'X-Auth-Token': bcCredentials.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    let hasTrackingScripts = false;
    if (scriptsResponse.ok) {
      const scriptsData = await scriptsResponse.json();
      const scripts = scriptsData.data || [];

      // Look for common analytics patterns
      hasTrackingScripts = scripts.some((script: { html?: string; src?: string }) => {
        const content = (script.html || '') + (script.src || '');
        return (
          content.includes('google-analytics') ||
          content.includes('googletagmanager') ||
          content.includes('gtag') ||
          content.includes('facebook.net') ||
          content.includes('fbq(') ||
          content.includes('segment.com') ||
          content.includes('hotjar') ||
          content.includes('clarity.ms')
        );
      });
    }

    const verified = hasGoogleAnalytics || hasTrackingScripts;

    return NextResponse.json({
      verified,
      notes: verified
        ? 'Analytics tracking detected'
        : 'No analytics tracking found. Consider adding Google Analytics.',
    });
  } catch (error) {
    console.error('Analytics verification error:', error);
    return NextResponse.json({
      verified: false,
      notes: error instanceof Error ? error.message : 'Verification failed',
    });
  }
}
