'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWPConnection } from '@/lib/contexts/WPConnectionContext';
import { WPPostWithEmbeds, WPPageWithEmbeds } from '@/lib/wp-client';
import { ChevronDown, FileText, File, Search, Loader2 } from 'lucide-react';

type ContentType = 'post' | 'page';
type ContentItem = WPPostWithEmbeds | WPPageWithEmbeds;

interface WPPostSelectorProps {
  value?: ContentItem | null;
  onChange: (item: ContentItem | null) => void;
  contentType?: ContentType;
  onContentTypeChange?: (type: ContentType) => void;
}

export function WPPostSelector({
  value,
  onChange,
  contentType = 'post',
  onContentTypeChange,
}: WPPostSelectorProps) {
  const { siteUrl, isConnected } = useWPConnection();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          per_page: 20,
          search: search || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setIsLoading(false);
    }
  }, [siteUrl, isConnected, contentType, search]);

  // Fetch items when dropdown opens or search/type changes
  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, fetchItems]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, isOpen, fetchItems]);

  const handleSelect = (item: ContentItem) => {
    onChange(item);
    setIsOpen(false);
    setSearch('');
  };

  const getFeaturedImage = (item: ContentItem): string | null => {
    const media = item._embedded?.['wp:featuredmedia']?.[0];
    if (media?.media_details?.sizes?.thumbnail?.source_url) {
      return media.media_details.sizes.thumbnail.source_url;
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

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-center text-sm text-slate-500">
        Connect to a WordPress site to select content
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Content Type Toggle */}
      {onContentTypeChange && (
        <div className="mb-2 flex gap-1 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => onContentTypeChange('post')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
              contentType === 'post'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Posts
          </button>
          <button
            type="button"
            onClick={() => onContentTypeChange('page')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
              contentType === 'page'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <File className="h-4 w-4" />
            Pages
          </button>
        </div>
      )}

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left transition-colors hover:border-slate-600"
      >
        {value ? (
          <div className="flex items-center gap-3 overflow-hidden">
            {getFeaturedImage(value) ? (
              <img
                src={getFeaturedImage(value)!}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-700">
                {contentType === 'post' ? (
                  <FileText className="h-5 w-5 text-slate-400" />
                ) : (
                  <File className="h-5 w-5 text-slate-400" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div
                className="truncate font-medium text-slate-100"
                dangerouslySetInnerHTML={{ __html: value.title.rendered }}
              />
              <div className="text-xs text-slate-500">{formatDate(value.date)}</div>
            </div>
          </div>
        ) : (
          <span className="text-slate-500">
            Select a {contentType === 'post' ? 'post' : 'page'}...
          </span>
        )}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
          {/* Search */}
          <div className="border-b border-slate-700 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={`Search ${contentType === 'post' ? 'posts' : 'pages'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-700 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-72 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="py-4 text-center text-sm text-red-400">{error}</div>
            ) : items.length === 0 ? (
              <div className="py-4 text-center text-sm text-slate-500">
                No {contentType === 'post' ? 'posts' : 'pages'} found
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-slate-700 ${
                      value?.id === item.id ? 'bg-slate-700' : ''
                    }`}
                  >
                    {getFeaturedImage(item) ? (
                      <img
                        src={getFeaturedImage(item)!}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-600">
                        {contentType === 'post' ? (
                          <FileText className="h-5 w-5 text-slate-400" />
                        ) : (
                          <File className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-sm font-medium text-slate-100"
                        dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                      />
                      <div className="text-xs text-slate-500">{formatDate(item.date)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
