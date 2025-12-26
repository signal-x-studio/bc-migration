'use client';

import { useState } from 'react';
import { WPConnectionForm } from '@/components/wordpress/WPConnectionForm';
import { WPPostSelector } from '@/components/wordpress/WPPostSelector';
import { WPPostList } from '@/components/wordpress/WPPostList';
import { WPContentBlockDirect } from '@/components/wordpress/WPContentBlock';
import { useWPConnection } from '@/lib/contexts/WPConnectionContext';
import { WPPostWithEmbeds, WPPageWithEmbeds } from '@/lib/wp-client';
import { WPContentTheme } from '@/lib/wp-content-themes';
import { ArrowLeft, FileText, File, Palette, LayoutGrid, MonitorPlay } from 'lucide-react';
import Link from 'next/link';

type ContentType = 'post' | 'page';
type ContentItem = WPPostWithEmbeds | WPPageWithEmbeds;
type ViewMode = 'browse' | 'preview';

const THEMES: { id: WPContentTheme; name: string; description: string }[] = [
  { id: 'catalyst', name: 'Catalyst', description: 'Modern, minimal React/Next.js theme' },
  { id: 'stencil', name: 'Stencil', description: 'Traditional BigCommerce theme' },
  { id: 'makeswift', name: 'Makeswift', description: 'Visual builder with bold styling' },
];

export default function WordPressPage() {
  const { isConnected, siteInfo } = useWPConnection();
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [theme, setTheme] = useState<WPContentTheme>('catalyst');
  const [viewMode, setViewMode] = useState<ViewMode>('browse');

  const handleSelectFromList = (item: ContentItem) => {
    setSelectedContent(item);
    setViewMode('preview');
  };

  const handleSelectFromSelector = (item: ContentItem | null) => {
    setSelectedContent(item);
    if (item) {
      setViewMode('preview');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <h1 className="text-lg font-semibold">WordPress Content Preview</h1>
            </div>

            {isConnected && siteInfo && (
              <div className="text-sm text-slate-500">
                Connected to <span className="text-slate-300">{siteInfo.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Connection */}
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
                WordPress Connection
              </h2>
              <WPConnectionForm />
            </section>

            {isConnected && (
              <>
                {/* Content Type & Selector */}
                <section>
                  <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
                    Select Content
                  </h2>
                  <WPPostSelector
                    value={selectedContent}
                    onChange={handleSelectFromSelector}
                    contentType={contentType}
                    onContentTypeChange={setContentType}
                  />
                </section>

                {/* Theme Selector */}
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-slate-500">
                    <Palette className="h-4 w-4" />
                    Theme Preview
                  </h2>
                  <div className="space-y-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          theme === t.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-medium text-slate-100">{t.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* View Mode Toggle */}
                <section>
                  <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
                    View Mode
                  </h2>
                  <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
                    <button
                      onClick={() => setViewMode('browse')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
                        viewMode === 'browse'
                          ? 'bg-slate-700 text-slate-100'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Browse
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
                        viewMode === 'preview'
                          ? 'bg-slate-700 text-slate-100'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <MonitorPlay className="h-4 w-4" />
                      Preview
                    </button>
                  </div>
                </section>
              </>
            )}
          </aside>

          {/* Main Content */}
          <div className="min-h-[600px]">
            {!isConnected ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                    <FileText className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-400">
                    Connect to a WordPress Site
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Enter a WordPress site URL to browse and preview content with different theme
                    styling.
                  </p>
                  <p className="mt-4 text-xs text-slate-600">
                    Try: <code className="rounded bg-slate-800 px-2 py-0.5">developer.wordpress.org</code>
                  </p>
                </div>
              </div>
            ) : viewMode === 'browse' ? (
              <div>
                {/* Content Type Tabs */}
                <div className="mb-6 flex gap-1 rounded-lg bg-slate-800 p-1">
                  <button
                    onClick={() => setContentType('post')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
                      contentType === 'post'
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Posts
                  </button>
                  <button
                    onClick={() => setContentType('page')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
                      contentType === 'page'
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <File className="h-4 w-4" />
                    Pages
                  </button>
                </div>

                <WPPostList
                  contentType={contentType}
                  onSelect={handleSelectFromList}
                  selectedId={selectedContent?.id}
                />
              </div>
            ) : selectedContent ? (
              <div
                className={`rounded-xl border p-8 ${
                  theme === 'catalyst'
                    ? 'border-slate-700 bg-slate-900/50'
                    : theme === 'stencil'
                      ? 'border-slate-700 bg-slate-900'
                      : 'border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-950'
                }`}
              >
                <WPContentBlockDirect content={selectedContent} theme={theme} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                    <MonitorPlay className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-400">No Content Selected</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Select a post or page from the dropdown above or switch to Browse mode to see
                    available content.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        {isConnected && (
          <div className="mt-12 rounded-xl border border-slate-700 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-lg font-medium">About This Demo</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-medium text-slate-300">WordPress REST API</h4>
                <p className="text-sm text-slate-500">
                  Content is fetched via the WordPress REST API, which is enabled by default on all
                  WordPress sites. No authentication required for public content.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-slate-300">Theme Styling</h4>
                <p className="text-sm text-slate-500">
                  Each theme applies different typography, spacing, and color treatments to show how
                  WordPress content would look in Catalyst, Stencil, or Makeswift storefronts.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-slate-300">Makeswift Integration</h4>
                <p className="text-sm text-slate-500">
                  This component can be registered with Makeswift to allow marketers to embed
                  WordPress content directly into visual page layouts.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
