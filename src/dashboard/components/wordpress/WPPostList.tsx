'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWPConnection } from '@/lib/contexts/WPConnectionContext';
import { WPPostWithEmbeds, WPPageWithEmbeds } from '@/lib/wp-client';
import {
  FileText,
  File,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutGrid,
  List,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ContentType = 'post' | 'page';
type ContentItem = WPPostWithEmbeds | WPPageWithEmbeds;
type ViewMode = 'grid' | 'list';

interface WPPostListProps {
  contentType?: ContentType;
  onSelect?: (item: ContentItem) => void;
  selectedId?: number;
  perPage?: number;
  className?: string;
}

export function WPPostList({
  contentType = 'post',
  onSelect,
  selectedId,
  perPage = 9,
  className = '',
}: WPPostListProps) {
  const { siteUrl, isConnected } = useWPConnection();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const fetchItems = useCallback(async () => {
    if (!siteUrl || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = contentType === 'post' ? '/api/wp/posts' : '/api/wp/pages';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: siteUrl,
          page,
          per_page: perPage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setIsLoading(false);
    }
  }, [siteUrl, isConnected, contentType, page, perPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset page when content type changes
  useEffect(() => {
    setPage(1);
  }, [contentType]);

  const getFeaturedImage = (item: ContentItem): string | null => {
    const media = item._embedded?.['wp:featuredmedia']?.[0];
    if (media?.media_details?.sizes?.medium?.source_url) {
      return media.media_details.sizes.medium.source_url;
    }
    return media?.source_url || null;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExcerpt = (item: ContentItem): string => {
    const excerpt = item.excerpt?.rendered || '';
    // Strip HTML and limit length
    const text = excerpt.replace(/<[^>]*>/g, '').trim();
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
        <p className="text-slate-500">Connect to a WordPress site to browse content</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {total > 0 ? (
            <>
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total}{' '}
              {contentType === 'post' ? 'posts' : 'pages'}
            </>
          ) : (
            <>No {contentType === 'post' ? 'posts' : 'pages'} found</>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchItems} className="mt-2">
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
          <p className="text-slate-500">
            No {contentType === 'post' ? 'posts' : 'pages'} found
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect?.(item)}
              className={`group overflow-hidden rounded-xl border text-left transition-all ${
                selectedId === item.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-video overflow-hidden bg-slate-800">
                {getFeaturedImage(item) ? (
                  <img
                    src={getFeaturedImage(item)!}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {contentType === 'post' ? (
                      <FileText className="h-12 w-12 text-slate-700" />
                    ) : (
                      <File className="h-12 w-12 text-slate-700" />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3
                  className="line-clamp-2 font-medium text-slate-100"
                  dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                />
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.date)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect?.(item)}
              className={`flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-colors ${
                selectedId === item.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              {/* Thumbnail */}
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-800">
                {getFeaturedImage(item) ? (
                  <img
                    src={getFeaturedImage(item)!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {contentType === 'post' ? (
                      <FileText className="h-6 w-6 text-slate-700" />
                    ) : (
                      <File className="h-6 w-6 text-slate-700" />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3
                  className="truncate font-medium text-slate-100"
                  dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                />
                <p className="mt-0.5 line-clamp-1 text-sm text-slate-400">
                  {getExcerpt(item)}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="px-4 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
