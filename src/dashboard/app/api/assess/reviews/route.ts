import { NextResponse } from 'next/server';
import { createWCClient, normalizeUrl } from '@/lib/wc-client';

interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

interface WCProductReview {
  id: number;
  date_created: string;
  product_id: number;
  status: 'approved' | 'hold' | 'spam' | 'trash';
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
}

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url || !body.consumerKey || !body.consumerSecret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const wcUrl = normalizeUrl(body.url);
    const api = await createWCClient(wcUrl, body.consumerKey.trim(), body.consumerSecret.trim());

    // Fetch all reviews using the products/reviews endpoint
    let page = 1;
    const allReviews: WCProductReview[] = [];
    while (true) {
      const response = await api.get('products/reviews', { page, per_page: 100 });
      if (!response.data || response.data.length === 0) break;
      allReviews.push(...response.data);
      page++;
      if (page > 50) break; // Safety limit (5000 reviews)
    }

    // Analyze reviews
    const byStatus: Record<string, number> = {};
    const byRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let verifiedCount = 0;
    let withEmailCount = 0;
    const uniqueProducts = new Set<number>();
    const uniqueReviewers = new Set<string>();

    for (const review of allReviews) {
      // Count by status
      const status = review.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Count by rating
      const rating = Math.min(5, Math.max(1, review.rating || 5));
      byRating[rating] = (byRating[rating] || 0) + 1;

      // Check verified
      if (review.verified) verifiedCount++;

      // Check email
      if (review.reviewer_email) {
        withEmailCount++;
        uniqueReviewers.add(review.reviewer_email.toLowerCase());
      }

      // Track unique products
      if (review.product_id) uniqueProducts.add(review.product_id);
    }

    // Calculate average rating
    let totalRatingSum = 0;
    let totalRatingCount = 0;
    for (const [rating, count] of Object.entries(byRating)) {
      totalRatingSum += parseInt(rating) * count;
      totalRatingCount += count;
    }
    const avgRating = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(2) : '0';

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Check for reviews without email (can't match to BC customer)
    const withoutEmail = allReviews.length - withEmailCount;
    if (withoutEmail > 0) {
      issues.info.push({
        id: 'reviews-without-email',
        severity: 'info',
        title: 'Reviews without email addresses',
        description: `${withoutEmail} reviews don't have an email. These will be created with the reviewer name only.`,
        affectedItems: withoutEmail,
      });
    }

    // Check for pending/held reviews
    const pendingCount = (byStatus['hold'] || 0) + (byStatus['pending'] || 0);
    if (pendingCount > 0) {
      issues.info.push({
        id: 'pending-reviews',
        severity: 'info',
        title: 'Pending reviews found',
        description: `${pendingCount} reviews are pending/on-hold. These will be migrated as pending in BC.`,
        affectedItems: pendingCount,
      });
    }

    // Check for spam/trash (won't migrate)
    const excludedCount = (byStatus['spam'] || 0) + (byStatus['trash'] || 0);
    if (excludedCount > 0) {
      issues.info.push({
        id: 'excluded-reviews',
        severity: 'info',
        title: 'Spam/Trash reviews excluded',
        description: `${excludedCount} reviews are marked as spam or trash and will not be migrated.`,
        affectedItems: excludedCount,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allReviews.length,
          byStatus,
          byRating,
          verifiedCount,
          withEmailCount,
          uniqueProducts: uniqueProducts.size,
          uniqueReviewers: uniqueReviewers.size,
          avgRating: parseFloat(avgRating),
          migratable: allReviews.filter(r => r.status === 'approved' || r.status === 'hold').length,
        },
        issues,
        samples: allReviews.slice(0, 5).map(r => ({
          id: r.id,
          productId: r.product_id,
          reviewer: r.reviewer,
          rating: r.rating,
          status: r.status,
          verified: r.verified,
          preview: r.review?.substring(0, 100) + (r.review?.length > 100 ? '...' : ''),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
