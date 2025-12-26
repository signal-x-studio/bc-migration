'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Simple navigation structure - can be enhanced with API call later
const navigation = [
  {
    category: 'getting-started',
    items: [
      { title: 'For Merchants', href: '/docs/getting-started/for-merchants' },
      { title: 'For Developers', href: '/docs/getting-started/for-developers' },
      { title: 'For Stakeholders', href: '/docs/getting-started/for-stakeholders' },
    ],
  },
  {
    category: 'platform',
    items: [
      { title: 'Architecture', href: '/docs/platform/architecture/MIGRATION_ARCHITECTURE' },
      { title: 'Assessment Engine', href: '/docs/platform/assessment-engine/ASSESSMENT_ENGINE' },
      { title: 'BC Bridge', href: '/docs/platform/bc-bridge/BC_BRIDGE_INTENT' },
    ],
  },
  {
    category: 'guides',
    items: [
      { title: 'Assessment', href: '/docs/guides/assessment/HOW_TO_ASSESS' },
      { title: 'Migration Getting Started', href: '/docs/guides/migration/getting-started' },
      { title: 'Step-by-Step Migration', href: '/docs/guides/migration/step-by-step' },
      { title: 'Troubleshooting', href: '/docs/guides/migration/troubleshooting' },
      { title: 'BC Bridge Installation', href: '/docs/guides/bc-bridge/installation' },
      { title: 'BC Bridge Configuration', href: '/docs/guides/bc-bridge/configuration' },
    ],
  },
  {
    category: 'reference',
    items: [
      { title: 'WooCommerce API', href: '/docs/reference/api/woocommerce-api' },
      { title: 'BigCommerce API', href: '/docs/reference/api/bigcommerce-api' },
      { title: 'CLI Commands', href: '/docs/reference/cli/commands' },
      { title: 'Data Models', href: '/docs/reference/schemas/data-models' },
      { title: 'ADR 001', href: '/docs/reference/adr/ADR_001_DROP_CATALYST' },
    ],
  },
  {
    category: 'resources',
    items: [
      { title: 'Roadmap (EARS)', href: '/docs/resources/strategy/ROADMAP_EARS' },
      { title: 'Handoff Guide', href: '/docs/resources/strategy/HANDOFF' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/50 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
      <nav className="space-y-6">
        {navigation.map(({ category, items }) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {category.replace(/-/g, ' ')}
            </h3>
            <ul className="space-y-1">
              {items.map(item => {
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-slate-100 font-medium border-l-2 border-slate-100'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

