'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search } from 'lucide-react';

const navSections = [
  { name: 'Getting Started', path: '/docs/getting-started' },
  { name: 'Platform', path: '/docs/platform' },
  { name: 'Guides', path: '/docs/guides' },
  { name: 'Reference', path: '/docs/reference' },
  { name: 'Resources', path: '/docs/resources' },
];

export function DocsNav() {
  const pathname = usePathname();
  
  return (
    <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/docs" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="w-5 h-5 text-slate-300" />
            <span className="font-semibold text-slate-100">BC Migration Docs</span>
          </Link>
          
          <div className="flex items-center gap-8">
            {navSections.map(section => (
              <Link
                key={section.path}
                href={section.path}
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith(section.path)
                    ? 'text-slate-100 border-b-2 border-slate-100 pb-1'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {section.name}
              </Link>
            ))}
          </div>
          
          <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Search documentation">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

