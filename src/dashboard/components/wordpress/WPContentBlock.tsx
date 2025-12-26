'use client';

import { useState, useEffect } from 'react';
import { useWPConnection } from '@/lib/contexts/WPConnectionContext';
import { WPPostWithEmbeds, WPPageWithEmbeds } from '@/lib/wp-client';
import { WPContentRenderer } from './WPContentRenderer';
import { WPContentTheme } from '@/lib/wp-content-themes';
import { Loader2, AlertCircle, RefreshCw, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ContentItem = WPPostWithEmbeds | WPPageWithEmbeds;

interface WPContentBlockProps {
  contentId: number;
  contentType: 'post' | 'page';
  theme?: WPContentTheme;
  showMeta?: boolean;
  showFeaturedImage?: boolean;
  className?: string;
}

/**
 * Fetches and displays WordPress content by ID
 */
export function WPContentBlock({
  contentId,
  contentType,
  theme = 'catalyst',
  showMeta = true,
  showFeaturedImage = true,
  className = '',
}: WPContentBlockProps) {
  const { siteUrl, isConnected } = useWPConnection();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    if (!siteUrl || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wp/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: siteUrl,
          id: contentId,
          type: contentType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setContent(data.data);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contentId && siteUrl && isConnected) {
      fetchContent();
    }
  }, [contentId, contentType, siteUrl, isConnected]);

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
        <p className="text-slate-500">Connect to a WordPress site to view content</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="font-medium text-red-400">Failed to load content</p>
            <p className="mt-1 text-sm text-red-400/80">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchContent}
              className="mt-3 text-red-400 hover:text-red-300"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
        <p className="text-slate-500">No content found</p>
      </div>
    );
  }

  const featuredMedia = content._embedded?.['wp:featuredmedia']?.[0];
  const author = content._embedded?.author?.[0];
  const categories = 'categories' in content ? (content._embedded?.['wp:term']?.[0] || []) : [];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article className={className}>
      {/* Featured Image */}
      {showFeaturedImage && featuredMedia?.source_url && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img
            src={featuredMedia.source_url}
            alt={featuredMedia.alt_text || ''}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1
        className={`mb-4 text-3xl font-bold tracking-tight text-slate-100 ${
          theme === 'makeswift' ? 'text-4xl' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: content.title.rendered }}
      />

      {/* Meta */}
      {showMeta && (
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(content.date)}</span>
          </div>

          {author && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{author.name}</span>
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <WPContentRenderer content={content.content.rendered} theme={theme} />
    </article>
  );
}

/**
 * Alternative version that accepts content directly (no fetching)
 */
interface WPContentBlockDirectProps {
  content: ContentItem;
  theme?: WPContentTheme;
  showMeta?: boolean;
  showFeaturedImage?: boolean;
  className?: string;
}

export function WPContentBlockDirect({
  content,
  theme = 'catalyst',
  showMeta = true,
  showFeaturedImage = true,
  className = '',
}: WPContentBlockDirectProps) {
  const featuredMedia = content._embedded?.['wp:featuredmedia']?.[0];
  const author = content._embedded?.author?.[0];
  const categories = 'categories' in content ? (content._embedded?.['wp:term']?.[0] || []) : [];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article className={className}>
      {/* Featured Image */}
      {showFeaturedImage && featuredMedia?.source_url && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img
            src={featuredMedia.source_url}
            alt={featuredMedia.alt_text || ''}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1
        className={`mb-4 text-3xl font-bold tracking-tight text-slate-100 ${
          theme === 'makeswift' ? 'text-4xl' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: content.title.rendered }}
      />

      {/* Meta */}
      {showMeta && (
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(content.date)}</span>
          </div>

          {author && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{author.name}</span>
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <WPContentRenderer content={content.content.rendered} theme={theme} />
    </article>
  );
}
