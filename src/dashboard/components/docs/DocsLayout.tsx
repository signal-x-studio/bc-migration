'use client';

import { ReactNode } from 'react';
import { DocsNav } from './DocsNav';
import { DocsSidebarImproved } from './DocsSidebarImproved';
import { TableOfContents } from './TableOfContents';

interface DocsLayoutProps {
  children: ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DocsNav />
      <div className="flex">
        <DocsSidebarImproved />
        <main className="flex-1 min-w-0 px-8 py-12 max-w-4xl mx-auto">
          {children}
        </main>
        <TableOfContents />
      </div>
    </div>
  );
}

