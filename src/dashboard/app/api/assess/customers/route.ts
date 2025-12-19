import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Fetch customers (sample)
    let page = 1;
    let allCustomers: any[] = [];
    while (true) {
      const response = await api.get('customers', { page, per_page: 100 });
      if (!response.data || response.data.length === 0) break;
      allCustomers = allCustomers.concat(response.data);
      page++;
      if (page > 10) break; // Sample first 1000
    }

    // Analyze customers
    let withAddresses = 0;
    let withoutEmail = 0;
    const countries: Record<string, number> = {};

    for (const customer of allCustomers) {
      if (customer.billing?.address_1 || customer.shipping?.address_1) {
        withAddresses++;
      }
      if (!customer.email) {
        withoutEmail++;
      }
      const country = customer.billing?.country || customer.shipping?.country;
      if (country) {
        countries[country] = (countries[country] || 0) + 1;
      }
    }

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Password reset info
    issues.info.push({
      id: 'password-reset',
      severity: 'info',
      title: 'Password reset required',
      description: 'All customers will need to reset their passwords after migration.',
      affectedItems: allCustomers.length,
    });

    if (withoutEmail > 0) {
      issues.warnings.push({
        id: 'missing-emails',
        severity: 'warning',
        title: 'Customers without email',
        description: `${withoutEmail} customers have no email address.`,
        affectedItems: withoutEmail,
        recommendation: 'These customers cannot be migrated without email addresses.',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allCustomers.length,
          withOrders: allCustomers.filter(c => c.orders_count > 0).length,
          withAddresses,
          withoutEmail,
          guestOrders: 0,
          countries,
        },
        issues,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
