import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * BigCommerce Customer CSV Export
 * Transforms WooCommerce customers to BC-ready CSV format
 */

interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

// BC CSV columns for customer import
const BC_CUSTOMER_COLUMNS = [
  'Customer ID', // Leave blank for new
  'Email',
  'First Name',
  'Last Name',
  'Company',
  'Phone',
  'Address Line 1',
  'Address Line 2',
  'City',
  'State/Province',
  'Zip/Postal Code',
  'Country',
  'Customer Group',
  'Store Credit',
  'Notes',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, consumerKey, consumerSecret } = body;

    if (!url || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const wcClient = await createWCClient(url, consumerKey, consumerSecret);

    // Fetch all customers
    const customers: WCCustomer[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await wcClient.get('customers', {
        per_page: 100,
        page,
      });

      if (response.data.length === 0) {
        hasMore = false;
      } else {
        customers.push(...response.data);
        page++;
      }

      // Safety limit
      if (page > 100) break;
    }

    // Transform to BC CSV rows
    const csvRows: string[][] = [];
    csvRows.push(BC_CUSTOMER_COLUMNS); // Header row

    for (const customer of customers) {
      // Skip customers without email
      if (!customer.email) continue;

      const row = transformCustomerToBC(customer);
      csvRows.push(row);
    }

    // Convert to CSV string
    const csv = csvRows.map(row =>
      row.map(cell => escapeCSVCell(cell)).join(',')
    ).join('\n');

    return NextResponse.json({
      success: true,
      data: {
        csv,
        rowCount: csvRows.length - 1,
        customerCount: customers.length,
        format: 'bigcommerce-customer-import',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}

function transformCustomerToBC(customer: WCCustomer): string[] {
  // Use billing address as primary
  const billing = customer.billing;

  return [
    '', // Customer ID - leave blank for new
    customer.email,
    customer.first_name || billing.first_name || '',
    customer.last_name || billing.last_name || '',
    billing.company || '',
    billing.phone || '',
    billing.address_1 || '',
    billing.address_2 || '',
    billing.city || '',
    billing.state || '',
    billing.postcode || '',
    billing.country || '',
    '', // Customer Group - default
    '0', // Store Credit
    `Migrated from WooCommerce. Original ID: ${customer.id}. Password reset required.`,
  ];
}

function escapeCSVCell(cell: string): string {
  if (!cell) return '';

  if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
}
