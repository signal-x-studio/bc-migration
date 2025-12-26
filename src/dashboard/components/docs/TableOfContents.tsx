'use client';

import { useEffect, useState, useCallback } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Header offset for scroll positioning
  const HEADER_OFFSET = 100;

  useEffect(() => {
    // Wait for content to be rendered
    const extractHeadings = () => {
      const content = document.querySelector('.docs-html-content');
      if (!content) {
        // Retry after a short delay if content isn't ready
        setTimeout(extractHeadings, 100);
        return;
      }

      const headingElements = content.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      const extracted: Heading[] = [];

      headingElements.forEach((el) => {
        const id = el.id;
        const text = el.textContent?.trim() || '';
        const level = parseInt(el.tagName.charAt(1), 10);
        
        if (id && text) {
          extracted.push({ id, text, level });
        }
      });

      setHeadings(extracted);

      // Set up intersection observer for active heading tracking
      const observer = new IntersectionObserver(
        (entries) => {
          // Find the entry that's most visible in the viewport
          let mostVisible: IntersectionObserverEntry | null = null;
          let maxRatio = 0;

          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
              maxRatio = entry.intersectionRatio;
              mostVisible = entry;
            }
          });

          // Also check for entries that are above the viewport (scrolled past)
          if (!mostVisible) {
            entries.forEach((entry) => {
              const rect = entry.boundingClientRect;
              if (rect.top < HEADER_OFFSET && rect.bottom > HEADER_OFFSET) {
                mostVisible = entry;
              }
            });
          }

          if (mostVisible) {
            setActiveId(mostVisible.target.id);
          }
        },
        {
          rootMargin: `-${HEADER_OFFSET}px 0% -60% 0%`,
          threshold: [0, 0.1, 0.5, 1],
        }
      );

      headingElements.forEach((el) => observer.observe(el));

      // Handle initial hash in URL
      if (window.location.hash) {
        const hash = window.location.hash.slice(1);
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(hash);
          }, 100);
        }
      }

      // Handle hash changes
      const handleHashChange = () => {
        const hash = window.location.hash.slice(1);
        if (hash) {
          const element = document.getElementById(hash);
          if (element) {
            const yOffset = -HEADER_OFFSET;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveId(hash);
          }
        }
      };

      window.addEventListener('hashchange', handleHashChange);

      return () => {
        headingElements.forEach((el) => observer.unobserve(el));
        window.removeEventListener('hashchange', handleHashChange);
      };
    };

    const cleanup = extractHeadings();
    return cleanup;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, headingId: string) => {
    e.preventDefault();
    const element = document.getElementById(headingId);
    if (element) {
      const yOffset = -HEADER_OFFSET;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.pushState(null, '', `#${headingId}`);
      setActiveId(headingId);
    }
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="w-64 border-l border-slate-800 bg-slate-950/50 p-6 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          On This Page
        </h3>
        <nav className="space-y-1">
          {headings.map((heading) => {
            // Better indentation based on heading level
            const indent = heading.level === 1 ? 0 
              : heading.level === 2 ? 0 
              : heading.level === 3 ? 12 
              : heading.level === 4 ? 24
              : heading.level === 5 ? 36
              : 48;
            const isActive = activeId === heading.id;
            
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`block text-sm transition-colors py-1 ${
                  isActive
                    ? 'text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ paddingLeft: `${indent}px` }}
                onClick={(e) => handleClick(e, heading.id)}
              >
                {heading.text}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

