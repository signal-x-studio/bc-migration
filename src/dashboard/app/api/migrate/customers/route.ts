import { NextRequest } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * Migrate customers from WooCommerce to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 */

interface WCAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing?: WCAddress;
  shipping?: WCAddress;
}

interface BCAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  address_type: 'residential' | 'commercial';
}

interface BCCustomerCreate {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  addresses?: BCAddress[];
  authentication?: {
    force_password_reset: boolean;
  };
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = await request.json();
        const { wcCredentials, bcCredentials, migratedEmails = [] } = body;

        if (!wcCredentials || !bcCredentials) {
          send({ type: 'error', error: 'Missing required credentials' });
          controller.close();
          return;
        }

        // Initialize WC client
        const wcClient = await createWCClient(
          wcCredentials.url,
          wcCredentials.consumerKey,
          wcCredentials.consumerSecret
        );

        // Fetch all customers from WooCommerce
        const allCustomers: WCCustomer[] = [];
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
            allCustomers.push(...response.data);
            page++;
          }

          if (page > 50) break; // Safety limit (5000 customers)
        }

        // Filter out already migrated customers by email
        const customersToMigrate = allCustomers.filter(
          c => c.email && !migratedEmails.includes(c.email.toLowerCase())
        );

        send({
          type: 'started',
          totalCustomers: customersToMigrate.length,
          totalInWC: allCustomers.length,
          alreadyMigrated: allCustomers.length - customersToMigrate.length,
        });

        const stats = {
          total: customersToMigrate.length,
          successful: 0,
          skipped: 0,
          failed: 0,
          warnings: [] as string[],
        };

        const newlyMigratedEmails: string[] = [];

        // Process customers one by one
        for (const customer of customersToMigrate) {
          try {
            // Validate email
            if (!customer.email) {
              stats.skipped++;
              stats.warnings.push(`Customer ID ${customer.id} has no email`);
              continue;
            }

            const email = customer.email.toLowerCase();

            send({
              type: 'progress',
              completedCustomers: stats.successful + stats.skipped + stats.failed,
              currentCustomer: {
                email: customer.email,
                name: `${customer.first_name} ${customer.last_name}`.trim(),
              },
            });

            // Check if customer already exists in BC (idempotency)
            const existsInBC = await checkBCCustomerExists(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              email
            );

            if (existsInBC) {
              stats.skipped++;
              newlyMigratedEmails.push(email);
              await sleep(100);
              continue;
            }

            // Create customer in BC
            await createBCCustomer(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              customer
            );

            stats.successful++;
            newlyMigratedEmails.push(email);

            // Rate limiting - 200ms between creates
            await sleep(200);

          } catch (error) {
            stats.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stats.warnings.push(`Failed to migrate ${customer.email}: ${errorMessage}`);
            console.error(`Failed to migrate customer ${customer.email}:`, error);
          }
        }

        send({
          type: 'complete',
          stats,
          migratedEmails: newlyMigratedEmails,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Customer migration failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function checkBCCustomerExists(
  storeHash: string,
  accessToken: string,
  email: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/customers?email:in=${encodeURIComponent(email)}`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.data && result.data.length > 0;
}

async function createBCCustomer(
  storeHash: string,
  accessToken: string,
  wcCustomer: WCCustomer
): Promise<void> {
  // Build addresses array
  const addresses: BCAddress[] = [];

  // Add billing address if present
  if (wcCustomer.billing?.address_1) {
    addresses.push({
      first_name: wcCustomer.billing.first_name || wcCustomer.first_name,
      last_name: wcCustomer.billing.last_name || wcCustomer.last_name,
      address1: wcCustomer.billing.address_1,
      address2: wcCustomer.billing.address_2 || undefined,
      city: wcCustomer.billing.city,
      state_or_province: wcCustomer.billing.state,
      postal_code: wcCustomer.billing.postcode,
      country_code: wcCustomer.billing.country,
      phone: wcCustomer.billing.phone || undefined,
      address_type: 'residential',
    });
  }

  // Add shipping address if different from billing
  if (
    wcCustomer.shipping?.address_1 &&
    wcCustomer.shipping.address_1 !== wcCustomer.billing?.address_1
  ) {
    addresses.push({
      first_name: wcCustomer.shipping.first_name || wcCustomer.first_name,
      last_name: wcCustomer.shipping.last_name || wcCustomer.last_name,
      address1: wcCustomer.shipping.address_1,
      address2: wcCustomer.shipping.address_2 || undefined,
      city: wcCustomer.shipping.city,
      state_or_province: wcCustomer.shipping.state,
      postal_code: wcCustomer.shipping.postcode,
      country_code: wcCustomer.shipping.country,
      address_type: 'residential',
    });
  }

  const payload: BCCustomerCreate[] = [{
    email: wcCustomer.email,
    first_name: wcCustomer.first_name || 'Customer',
    last_name: wcCustomer.last_name || wcCustomer.id.toString(),
    phone: wcCustomer.billing?.phone || undefined,
    addresses: addresses.length > 0 ? addresses : undefined,
    authentication: {
      force_password_reset: true, // Critical - passwords cannot be migrated
    },
  }];

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/customers`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.title || error.errors?.[0]?.message || 'Failed to create customer');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
