import type { Doc } from '#site/content';

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
}

/**
 * Generate navigation tree from flat list of docs
 * Handles both manual documentation and auto-generated API reference
 */
export function generateNavigation(docs: Doc[]): NavItem[] {
  const navigation: NavItem[] = [
    { title: 'Get Started', items: [] },
    { title: 'Guides', items: [] },
    { title: 'Reference', items: [] },
  ];

  // Map category names to navigation titles
  const categoryMap: Record<string, string> = {
    'getting-started': 'Get Started',
    'guides': 'Guides',
    'reference': 'Reference',
  };

  // Group docs by category
  const byCategory = docs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Doc[]>);

  // Build navigation for each category
  Object.entries(byCategory).forEach(([category, categoryDocs]) => {
    const navTitle = categoryMap[category] || category;
    const navItem = navigation.find((item) => item.title === navTitle);

    if (!navItem) return;

    // For reference category, organize by section
    if (category === 'reference') {
      navItem.items = [];
      
      const apiDocs = categoryDocs.filter(d => d.section === 'api');
      const cliDocs = categoryDocs.filter(d => d.section === 'cli');
      
      // Add CLI docs section
      if (cliDocs.length > 0) {
        navItem.items.push({
          title: 'CLI',
          items: cliDocs
            .sort((a, b) => a.order - b.order)
            .map(doc => ({
              title: doc.title,
              href: `/docs/${doc.slug}`,
            })),
        });
      }
      
      // Add API docs - group by module path for better organization
      if (apiDocs.length > 0) {
        // Group API docs by module path (e.g., "src/assessment", "src/migration")
        const apiByModule = new Map<string, Doc[]>();
        
        apiDocs.forEach(doc => {
          // Extract module from slug (e.g., "reference/api/src/assessment/orchestrator" -> "src/assessment")
          const parts = doc.slug.split('/');
          const apiIndex = parts.indexOf('api');
          if (apiIndex >= 0 && parts.length > apiIndex + 1) {
            const modulePath = parts.slice(apiIndex + 1, -1).join('/'); // Everything except last (filename)
            const moduleKey = modulePath || 'root';
            
            if (!apiByModule.has(moduleKey)) {
              apiByModule.set(moduleKey, []);
            }
            apiByModule.get(moduleKey)!.push(doc);
          } else {
            // Fallback for unexpected structure
            if (!apiByModule.has('other')) {
              apiByModule.set('other', []);
            }
            apiByModule.get('other')!.push(doc);
          }
        });

        // Build API navigation with module grouping (limit to top-level modules for cleaner nav)
        const topLevelModules = new Set<string>();
        Array.from(apiByModule.keys()).forEach(key => {
          if (key !== 'root' && key !== 'other') {
            const topLevel = key.split('/')[0];
            topLevelModules.add(topLevel);
          }
        });

        // Group by top-level module
        const topLevelGroups = new Map<string, Doc[]>();
        Array.from(topLevelModules).forEach(module => {
          Array.from(apiByModule.entries()).forEach(([path, docs]) => {
            if (path.startsWith(module)) {
              if (!topLevelGroups.has(module)) {
                topLevelGroups.set(module, []);
              }
              topLevelGroups.get(module)!.push(...docs);
            }
          });
        });

        // Add top-level module groups
        Array.from(topLevelGroups.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([module, moduleDocs]) => {
            moduleDocs.sort((a, b) => a.order - b.order);
            navItem.items!.push({
              title: module.charAt(0).toUpperCase() + module.slice(1),
              items: moduleDocs.slice(0, 20).map(doc => ({ // Limit per group for performance
                title: doc.title,
                href: `/docs/${doc.slug}`,
              })),
            });
          });

        // Add root and other items if any
        ['root', 'other'].forEach(key => {
          if (apiByModule.has(key) && apiByModule.get(key)!.length > 0) {
            const docs = apiByModule.get(key)!;
            docs.sort((a, b) => a.order - b.order);
            navItem.items!.push({
              title: key === 'root' ? 'API' : 'Other',
              items: docs.slice(0, 20).map(doc => ({
                title: doc.title,
                href: `/docs/${doc.slug}`,
              })),
            });
          }
        });
      }
    } else {
      // For other categories, use section-based grouping
      const bySection = categoryDocs.reduce((acc, doc) => {
        const section = doc.section || 'General';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(doc);
        return acc;
      }, {} as Record<string, Doc[]>);

      Object.entries(bySection).forEach(([section, sectionDocs]) => {
        sectionDocs.sort((a, b) => a.order - b.order);

        if (Object.keys(bySection).length === 1 && section === 'General') {
          navItem.items = sectionDocs.map((doc) => ({
            title: doc.title,
            href: `/docs/${doc.slug}`,
          }));
        } else {
          navItem.items = navItem.items || [];
          navItem.items.push({
            title: section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' '),
            items: sectionDocs.map((doc) => ({
              title: doc.title,
              href: `/docs/${doc.slug}`,
            })),
          });
        }
      });
    }
  });

  // Remove empty categories
  return navigation.filter((item) => item.items && item.items.length > 0);
}
