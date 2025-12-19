import { NextRequest } from 'next/server';
import { createWCClient } from '@/lib/wc-client';
import type { WCProductReview, ReviewMigrationStats } from '@/lib/types';

/**
 * Migrate product reviews from WooCommerce to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 *
 * Uses BC V3 Product Reviews API
 * Prerequisite: Products must be migrated first for product ID mapping
 */

interface MigrateReviewsRequest {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  migratedReviewIds?: number[];
  productIdMapping: Record<number, number>; // WC product ID -> BC product ID (required)
  includeStatuses?: string[]; // Default: ['approved', 'hold']
}

interface BCReviewCreate {
  title: string;
  text: string;
  status: 'approved' | 'pending';
  rating: number;
  name: string;
  email: string;
  date_reviewed?: string;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body: MigrateReviewsRequest = await request.json();
        const {
          wcCredentials,
          bcCredentials,
          migratedReviewIds = [],
          productIdMapping,
          includeStatuses = ['approved', 'hold'],
        } = body;

        if (!wcCredentials || !bcCredentials) {
          send({ type: 'error', error: 'Missing required credentials' });
          controller.close();
          return;
        }

        if (!productIdMapping || Object.keys(productIdMapping).length === 0) {
          send({ type: 'error', error: 'Product ID mapping required. Please migrate products first.' });
          controller.close();
          return;
        }

        // Initialize WC client
        const wcClient = await createWCClient(
          wcCredentials.url,
          wcCredentials.consumerKey,
          wcCredentials.consumerSecret
        );

        // Fetch all reviews from WooCommerce
        const allReviews: WCProductReview[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await wcClient.get('products/reviews', {
            per_page: 100,
            page,
          });

          if (response.data.length === 0) {
            hasMore = false;
          } else {
            allReviews.push(...response.data);
            page++;
          }

          if (page > 50) break; // Safety limit (5000 reviews)
        }

        // Filter reviews:
        // - Not already migrated
        // - Has approved or hold status (exclude spam/trash)
        // - Product exists in BC mapping
        const reviewsToMigrate = allReviews.filter(review => {
          if (migratedReviewIds.includes(review.id)) return false;
          if (!includeStatuses.includes(review.status)) return false;
          if (!productIdMapping[review.product_id]) return false;
          return true;
        });

        const skippedNoProduct = allReviews.filter(
          r => !migratedReviewIds.includes(r.id) &&
               includeStatuses.includes(r.status) &&
               !productIdMapping[r.product_id]
        ).length;

        send({
          type: 'started',
          totalReviews: reviewsToMigrate.length,
          totalInWC: allReviews.length,
          alreadyMigrated: migratedReviewIds.length,
          skippedNoProduct,
        });

        const stats: ReviewMigrationStats = {
          total: reviewsToMigrate.length,
          successful: 0,
          skipped: 0,
          failed: 0,
          warnings: [],
        };

        if (skippedNoProduct > 0) {
          stats.warnings.push(`${skippedNoProduct} reviews skipped - product not found in BC`);
        }

        const newlyMigratedReviewIds: number[] = [];
        const reviewIdMapping: Record<number, number> = {};

        // Process reviews one by one
        for (const review of reviewsToMigrate) {
          try {
            const bcProductId = productIdMapping[review.product_id];

            send({
              type: 'progress',
              completedReviews: stats.successful + stats.skipped + stats.failed,
              currentReview: {
                id: review.id,
                productId: review.product_id,
                bcProductId,
                reviewer: review.reviewer,
                rating: review.rating,
              },
              stats,
            });

            // Transform and create review in BC
            const bcReview = transformWCReviewToBC(review);

            const createdReview = await createBCReview(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              bcProductId,
              bcReview
            );

            stats.successful++;
            newlyMigratedReviewIds.push(review.id);
            reviewIdMapping[review.id] = createdReview.id;

            // Rate limiting - 200ms between creates
            await sleep(200);

          } catch (error) {
            stats.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stats.warnings.push(`Review #${review.id} by ${review.reviewer}: ${errorMessage}`);
            console.error(`Failed to migrate review ${review.id}:`, error);
          }
        }

        send({
          type: 'complete',
          stats,
          migratedReviewIds: newlyMigratedReviewIds,
          reviewIdMapping,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Review migration failed',
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

/**
 * Transform WC Review to BC Review format
 */
function transformWCReviewToBC(wcReview: WCProductReview): BCReviewCreate {
  // Extract title from review (first sentence or first 50 chars)
  let title = 'Product Review';
  if (wcReview.review) {
    // Strip HTML tags
    const plainText = wcReview.review.replace(/<[^>]*>/g, '').trim();
    // Get first sentence or first 50 chars
    const firstSentence = plainText.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 5) {
      title = firstSentence.substring(0, 50) + (firstSentence.length > 50 ? '...' : '');
    }
  }

  // Map status: approved -> approved, hold/pending -> pending
  const status: 'approved' | 'pending' = wcReview.status === 'approved' ? 'approved' : 'pending';

  // Ensure rating is 1-5
  const rating = Math.min(5, Math.max(1, wcReview.rating || 5));

  // Strip HTML from review text
  const text = wcReview.review
    ? wcReview.review.replace(/<[^>]*>/g, '').trim()
    : 'No review text provided';

  const bcReview: BCReviewCreate = {
    title,
    text,
    status,
    rating,
    name: wcReview.reviewer || 'Anonymous',
    email: wcReview.reviewer_email || 'anonymous@example.com',
    date_reviewed: wcReview.date_created,
  };

  return bcReview;
}

/**
 * Create review in BigCommerce (V3 API)
 */
async function createBCReview(
  storeHash: string,
  accessToken: string,
  productId: number,
  review: BCReviewCreate
): Promise<{ id: number }> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products/${productId}/reviews`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(review),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to create review';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.title || errorJson.detail || errorJson.errors?.[0]?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
