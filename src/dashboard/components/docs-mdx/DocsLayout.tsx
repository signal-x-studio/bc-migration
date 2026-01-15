'use client';

import { ReactNode, useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DocsLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  toc?: ReactNode;
}

export function DocsLayout({ children, sidebar, toc }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-16 items-center px-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <Link href="/docs" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">BC Migration</span>
          </Link>

          {/* Search and Theme Toggle */}
          <div className="ml-auto flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
              aria-label="Search documentation"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline px-2 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded">
                ⌘K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 w-full">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_240px] gap-6 lg:gap-10 px-4 py-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            {sidebar}
          </aside>

          {/* Sidebar - Mobile */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 lg:hidden">
                {sidebar}
              </aside>
            </>
          )}

          {/* Main content */}
          <main className="min-w-0">
            <div className="mx-auto max-w-3xl">
              {children}
            </div>
          </main>

          {/* Table of Contents - Desktop only */}
          {toc && (
            <aside className="hidden xl:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
              {toc}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
