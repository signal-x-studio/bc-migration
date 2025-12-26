import { getAllDocs, getDocCategories } from './loader.js';
import type { DocFile, DocNavigation } from './types.js';

export function buildNavigation(): DocNavigation[] {
  const categories = getDocCategories();
  const docs = getAllDocs();
  
  return categories.map(category => ({
    category,
    items: docs
      .filter(doc => doc.path[0] === category || doc.metadata.category === category)
      .sort((a, b) => (a.metadata.order || 999) - (b.metadata.order || 999)),
  }));
}

export function getBreadcrumbs(pathSegments: string[]): Array<{ label: string; href: string }> {
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: 'Docs', href: '/docs' },
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      href: `/docs${currentPath}`,
    });
  });
  
  return breadcrumbs;
}

