'use client';

import { useEffect, useState } from 'react';

interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

interface TableOfContentsProps {
  headings?: TocEntry[];
}

export function TableOfContents({ headings = [] }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -80% 0%',
      }
    );

    const elements = document.querySelectorAll('h2[id], h3[id], h4[id]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Flatten nested TOC structure
  const flattenToc = (entries: TocEntry[], depth = 0): Array<{ entry: TocEntry; depth: number }> => {
    return entries.flatMap((entry) => [
      { entry, depth },
      ...flattenToc(entry.items, depth + 1),
    ]);
  };

  const flatHeadings = flattenToc(headings);

  if (flatHeadings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">
        On This Page
      </p>
      <nav>
        <ul className="space-y-2 text-sm">
          {flatHeadings.map(({ entry, depth }, index) => {
            // Extract the ID from the URL (remove the # prefix)
            const id = entry.url.replace(/^#/, '');
            const isActive = activeId === id;
            const indent = depth * 12;

            return (
              <li key={index} style={{ paddingLeft: `${indent}px` }}>
                <a
                  href={entry.url}
                  className={`block py-1 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  {entry.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
