'use client';

import { useState, useEffect } from 'react';
import { Star, FileText, Newspaper, CheckCircle, AlertTriangle } from 'lucide-react';
import { MigrationStep } from '../MigrationStep';
import { ContentPhaseData } from '../../types';
import { Alert } from '@/components/ui/Alert';

interface ContentPhaseProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  productIdMapping: Record<number, number>;
  phaseData?: ContentPhaseData;
  onComplete: (data: ContentPhaseData) => void;
  onSkip: () => void;
}

export function ContentPhase({
  wcCredentials,
  bcCredentials,
  productIdMapping,
  phaseData,
  onComplete,
  onSkip,
}: ContentPhaseProps) {
  const [reviewsComplete, setReviewsComplete] = useState(!!phaseData?.reviews);
  const [pagesComplete, setPagesComplete] = useState(!!phaseData?.pages);
  const [blogComplete, setBlogComplete] = useState(!!phaseData?.blog);

  const [reviewStats, setReviewStats] = useState(phaseData?.reviews || null);
  const [pageStats, setPageStats] = useState(phaseData?.pages || null);
  const [blogStats, setBlogStats] = useState(phaseData?.blog || null);

  // Check if products have been migrated (required for reviews)
  const hasProductMapping = Object.keys(productIdMapping).length > 0;

  // Check if phase is complete
  useEffect(() => {
    if (reviewsComplete && pagesComplete && blogComplete) {
      onComplete({
        reviews: reviewStats || undefined,
        pages: pageStats || undefined,
        blog: blogStats || undefined,
      });
    }
  }, [reviewsComplete, pagesComplete, blogComplete, reviewStats, pageStats, blogStats, onComplete]);

  const handleReviewsComplete = (stats: { total: number; successful: number; skipped: number; failed: number }) => {
    setReviewsComplete(true);
    setReviewStats({
      total: stats.total,
      migrated: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
    });
  };

  const handlePagesComplete = (stats: { total: number; successful: number; skipped: number; failed: number }) => {
    setPagesComplete(true);
    setPageStats({
      total: stats.total,
      migrated: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
    });
  };

  const handleBlogComplete = (stats: { total: number; successful: number; skipped: number; failed: number }) => {
    setBlogComplete(true);
    setBlogStats({
      total: stats.total,
      migrated: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
    });
  };

  const completedCount = [reviewsComplete, pagesComplete, blogComplete].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
          <FileText className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Phase 4: Content</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Migrate product reviews, CMS pages, and blog posts to BigCommerce.
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
          <span>Optional phase</span>
          <button
            onClick={onSkip}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Dependency warning for reviews */}
      {!hasProductMapping && (
        <Alert variant="warning" className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Reviews require products</p>
              <p className="text-sm text-gray-400 mt-1">
                Product reviews need products to be migrated first to maintain the association.
                Pages and blog posts can be migrated independently.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Migration steps grid */}
      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Reviews Migration */}
        <MigrationStep
          title="Migrate Reviews"
          description="Transfer product reviews and ratings"
          icon={Star}
          iconColorClass="text-yellow-400"
          stepNumber={1}
          endpoint="/api/migrate/reviews"
          entityName="reviews"
          wcCredentials={wcCredentials}
          bcCredentials={bcCredentials}
          dependencies={{
            productIdMapping,
          }}
          disabled={!hasProductMapping}
          disabledReason={
            !hasProductMapping
              ? 'Requires products to be migrated first'
              : undefined
          }
          onComplete={(stats) => handleReviewsComplete(stats)}
        />

        {/* Pages Migration */}
        <MigrationStep
          title="Migrate Pages"
          description="Transfer CMS pages and content"
          icon={FileText}
          iconColorClass="text-cyan-400"
          stepNumber={2}
          endpoint="/api/migrate/pages"
          entityName="pages"
          wcCredentials={wcCredentials}
          bcCredentials={bcCredentials}
          onComplete={(stats) => handlePagesComplete(stats)}
        />

        {/* Blog Migration */}
        <MigrationStep
          title="Migrate Blog"
          description="Transfer blog posts and articles"
          icon={Newspaper}
          iconColorClass="text-indigo-400"
          stepNumber={3}
          endpoint="/api/migrate/blog"
          entityName="posts"
          wcCredentials={wcCredentials}
          bcCredentials={bcCredentials}
          onComplete={(stats) => handleBlogComplete(stats)}
        />
      </div>

      {/* Completion status */}
      {completedCount > 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Migration Progress ({completedCount}/3)
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className={`p-3 rounded ${reviewsComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Reviews</span>
                  {reviewsComplete && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
                {reviewStats && (
                  <div className="text-xs text-gray-400">
                    {reviewStats.migrated} migrated
                  </div>
                )}
              </div>
              <div className={`p-3 rounded ${pagesComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">Pages</span>
                  {pagesComplete && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
                {pageStats && (
                  <div className="text-xs text-gray-400">
                    {pageStats.migrated} migrated
                  </div>
                )}
              </div>
              <div className={`p-3 rounded ${blogComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Newspaper className="w-4 h-4 text-indigo-400" />
                  <span className="text-gray-300">Blog</span>
                  {blogComplete && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
                {blogStats && (
                  <div className="text-xs text-gray-400">
                    {blogStats.migrated} migrated
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
        Complete all three content types to finish this phase.
        You can skip this phase if you don&apos;t need to transfer content.
      </p>
    </div>
  );
}
