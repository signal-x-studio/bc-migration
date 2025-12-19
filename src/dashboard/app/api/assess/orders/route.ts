import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// WC to BC status mapping
const STATUS_MAPPING = [
  { wcStatus: 'pending', bcStatus: 'Pending', notes: 'Direct mapping' },
  { wcStatus: 'processing', bcStatus: 'Awaiting Fulfillment', notes: 'Direct mapping' },
  { wcStatus: 'on-hold', bcStatus: 'Manual Verification Required', notes: 'May need review' },
  { wcStatus: 'completed', bcStatus: 'Completed', notes: 'Direct mapping' },
  { wcStatus: 'cancelled', bcStatus: 'Cancelled', notes: 'Direct mapping' },
  { wcStatus: 'refunded', bcStatus: 'Refunded', notes: 'Direct mapping' },
  { wcStatus: 'failed', bcStatus: 'Declined', notes: 'Direct mapping' },
];

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Fetch orders (sample)
    let page = 1;
    let allOrders: any[] = [];
    while (true) {
      const response = await api.get('orders', { page, per_page: 100 });
      if (!response.data || response.data.length === 0) break;
      allOrders = allOrders.concat(response.data);
      page++;
      if (page > 10) break;
    }

    // Analyze orders
    const byStatus: Record<string, number> = {};
    let withRefunds = 0;
    let totalItems = 0;
    let oldest: Date | null = null;
    let newest: Date | null = null;

    for (const order of allOrders) {
      const status = order.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;

      if (order.refunds?.length > 0) withRefunds++;
      totalItems += order.line_items?.length || 0;

      const orderDate = new Date(order.date_created);
      if (!oldest || orderDate < oldest) oldest = orderDate;
      if (!newest || orderDate > newest) newest = orderDate;
    }

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Status mapping with counts
    const statusMapping = STATUS_MAPPING.map(m => ({
      ...m,
      count: byStatus[m.wcStatus] || 0,
    }));

    // Check for custom statuses
    const knownStatuses = STATUS_MAPPING.map(m => m.wcStatus);
    const customStatuses = Object.keys(byStatus).filter(s => !knownStatuses.includes(s));
    if (customStatuses.length > 0) {
      issues.warnings.push({
        id: 'custom-statuses',
        severity: 'warning',
        title: 'Custom order statuses found',
        description: `Custom statuses: ${customStatuses.join(', ')}. Manual mapping required.`,
        affectedItems: customStatuses.reduce((sum, s) => sum + (byStatus[s] || 0), 0),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allOrders.length,
          byStatus,
          withRefunds,
          avgItemsPerOrder: allOrders.length > 0 ? totalItems / allOrders.length : 0,
          dateRange: oldest && newest ? {
            oldest: oldest.toISOString(),
            newest: newest.toISOString(),
          } : null,
        },
        issues,
        statusMapping,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
