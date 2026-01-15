'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
}

interface DocsSidebarProps {
  navigation: NavItem[];
}

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.items && item.items.length > 0;
  const isActive = pathname === item.href;

  const paddingLeft = level * 12 + 12;

  return (
    <div>
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <span>{item.title}</span>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isOpen && (
            <div className="mt-1 space-y-1">
              {item.items?.map((child, i) => (
                <NavItemComponent key={i} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.href || '#'}
          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {item.title}
        </Link>
      )}
    </div>
  );
}

export function DocsSidebar({ navigation }: DocsSidebarProps) {
  return (
    <nav className="space-y-1">
      {navigation.map((item, i) => (
        <NavItemComponent key={i} item={item} />
      ))}
    </nav>
  );
}
