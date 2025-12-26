'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Static navigation structure matching the docs directory
const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'For Merchants', href: '/docs/getting-started/for-merchants' },
      { title: 'For Developers', href: '/docs/getting-started/for-developers' },
      { title: 'For Stakeholders', href: '/docs/getting-started/for-stakeholders' },
      { title: 'For WordPress Developers', href: '/docs/getting-started/for-wordpress-developers' },
      { title: 'For DevOps', href: '/docs/getting-started/for-devops' },
      { title: 'For Architects', href: '/docs/getting-started/for-architects' },
    ],
  },
  {
    title: 'Guides',
    items: [
      {
        title: 'Assessment',
        href: '/docs/guides/assessment/HOW_TO_ASSESS',
      },
      {
        title: 'Migration',
        children: [
          { title: 'Getting Started', href: '/docs/guides/migration/getting-started' },
          { title: 'Step-by-Step', href: '/docs/guides/migration/step-by-step' },
          { title: 'Migration Wizard', href: '/docs/guides/migration/wizard' },
          { title: 'Troubleshooting', href: '/docs/guides/migration/troubleshooting' },
          {
            title: 'Phases',
            children: [
              { title: 'Foundation', href: '/docs/guides/migration/phases/foundation' },
              { title: 'Core Data', href: '/docs/guides/migration/phases/core-data' },
              { title: 'Transactions', href: '/docs/guides/migration/phases/transactions' },
              { title: 'Content', href: '/docs/guides/migration/phases/content' },
            ],
          },
        ],
      },
      {
        title: 'BC Bridge',
        children: [
          { title: 'Installation', href: '/docs/guides/bc-bridge/installation' },
          { title: 'Configuration', href: '/docs/guides/bc-bridge/configuration' },
          { title: 'Development', href: '/docs/guides/bc-bridge/development' },
          { title: 'Customization', href: '/docs/guides/bc-bridge/customization' },
        ],
      },
      {
        title: 'Dashboard',
        children: [
          { title: 'Overview', href: '/docs/guides/dashboard/overview' },
        ],
      },
    ],
  },
  {
    title: 'Platform',
    items: [
      {
        title: 'Architecture',
        children: [
          { title: 'Migration Architecture', href: '/docs/platform/architecture/MIGRATION_ARCHITECTURE' },
          { title: 'Data Mapping', href: '/docs/platform/architecture/DATA_MAPPING_AND_MIGRATION_READINESS' },
          { title: 'Implementation Gap', href: '/docs/platform/architecture/IMPLEMENTATION_GAP_ANALYSIS' },
          { title: 'Rate Limiting', href: '/docs/platform/architecture/rate-limiting' },
          { title: 'Error Handling', href: '/docs/platform/architecture/error-handling' },
          { title: 'State Management', href: '/docs/platform/architecture/state-management' },
          { title: 'Caching', href: '/docs/platform/architecture/caching' },
          { title: 'API Clients', href: '/docs/platform/architecture/api-clients' },
          { title: 'Validation', href: '/docs/platform/architecture/validation' },
          { title: 'Logging', href: '/docs/platform/architecture/logging' },
        ],
      },
      { title: 'Assessment Engine', href: '/docs/platform/assessment-engine/ASSESSMENT_ENGINE' },
      { title: 'BC Bridge', href: '/docs/platform/bc-bridge/BC_BRIDGE_INTENT' },
    ],
  },
  {
    title: 'Reference',
    items: [
      {
        title: 'API',
        children: [
          { title: 'WooCommerce API', href: '/docs/reference/api/woocommerce-api' },
          { title: 'BigCommerce API', href: '/docs/reference/api/bigcommerce-api' },
          { title: 'Dashboard API', href: '/docs/reference/api/dashboard-api' },
        ],
      },
      { title: 'CLI Commands', href: '/docs/reference/cli/commands' },
      { title: 'Data Models', href: '/docs/reference/schemas/data-models' },
      {
        title: 'BC Bridge',
        children: [
          { title: 'Hooks', href: '/docs/reference/bc-bridge/hooks' },
          { title: 'Templates', href: '/docs/reference/bc-bridge/templates' },
          { title: 'Shortcodes', href: '/docs/reference/bc-bridge/shortcodes' },
        ],
      },
      { title: 'ADR 001', href: '/docs/reference/adr/ADR_001_DROP_CATALYST' },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Strategy',
        children: [
          { title: 'Migration Planning', href: '/docs/resources/strategy/migration-planning' },
          { title: 'Risk Assessment', href: '/docs/resources/strategy/risk-assessment' },
          { title: 'Rollback', href: '/docs/resources/strategy/rollback' },
          { title: 'Performance', href: '/docs/resources/strategy/performance' },
          { title: 'Cost Analysis', href: '/docs/resources/strategy/cost-analysis' },
          { title: 'Timeline Estimation', href: '/docs/resources/strategy/timeline-estimation' },
          { title: 'Success Metrics', href: '/docs/resources/strategy/success-metrics' },
        ],
      },
      { title: 'Roadmap (EARS)', href: '/docs/resources/strategy/ROADMAP_EARS' },
      { title: 'Handoff Guide', href: '/docs/resources/strategy/HANDOFF' },
    ],
  },
];

function isItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  if (item.children) {
    return item.children.some(child => pathname === child.href || isItemActive(child, pathname));
  }
  return false;
}

export function DocsSidebarImproved() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(navigation.map(s => s.title))
  );

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/50 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        {navigation.map((section) => {
          const isExpanded = expandedSections.has(section.title);
          const hasActiveItem = section.items.some(item => isItemActive(item, pathname || ''));

          return (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
              >
                <span>{section.title}</span>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
              {isExpanded && (
                <ul className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = isItemActive(item, pathname || '');
                    const hasChildren = item.children && item.children.length > 0;
                    
                    return (
                      <li key={item.href || item.title}>
                        {hasChildren ? (
                          <div>
                            {item.href ? (
                              <Link
                                href={item.href}
                                className={`block px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                                  isActive
                                    ? 'text-slate-100'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {item.title}
                              </Link>
                            ) : (
                              <div className="px-2 py-1.5 text-sm font-medium text-slate-400">
                                {item.title}
                              </div>
                            )}
                            <ul className="ml-2 space-y-0.5">
                              {item.children!.map((child) => {
                                const isChildActive = pathname === child.href;
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                                        isChildActive
                                          ? 'bg-slate-800 text-slate-100 font-medium'
                                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                      }`}
                                    >
                                      {child.title}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                              isActive
                                ? 'bg-slate-800 text-slate-100 font-medium'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                            }`}
                          >
                            {item.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

