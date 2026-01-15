import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DocFile, DocMetadata } from './types.js';

// Resolve docs directory relative to this file, not process.cwd()
// This ensures it works regardless of where the process is started
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// From src/dashboard/lib/docs/loader.ts -> src/dashboard/lib/docs -> src/dashboard -> src -> root -> docs
const DOCS_DIR = path.resolve(__dirname, '../../../../docs');

/**
 * Extract metadata from HTML file
 * Looks for meta tags or a special <!-- frontmatter --> comment
 */
function extractHTMLMetadata(html: string, filename: string, basePath: string[]): DocMetadata {
  const metadata: DocMetadata = {
    title: filename.replace('.html', '').replace(/-/g, ' '),
    description: '',
    category: basePath[0] || 'root',
    order: 999,
  };

  // Try to extract from meta tags
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  const metaDescriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (metaDescriptionMatch) {
    metadata.description = metaDescriptionMatch[1].trim();
  }

  // Try to extract from frontmatter comment
  const frontmatterMatch = html.match(/<!--\s*frontmatter\s*([\s\S]*?)\s*-->/i);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/i);
    const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/i);
    const categoryMatch = frontmatter.match(/category:\s*["']?([^"'\n]+)["']?/i);
    const orderMatch = frontmatter.match(/order:\s*(\d+)/i);
    
    if (titleMatch) metadata.title = titleMatch[1].trim();
    if (descMatch) metadata.description = descMatch[1].trim();
    if (categoryMatch) metadata.category = categoryMatch[1].trim();
    if (orderMatch) metadata.order = parseInt(orderMatch[1], 10);
  }

  return metadata;
}

/**
 * Extract body content from HTML file
 * Returns the content between <body> tags, or the full HTML if no body tag
 */
function extractHTMLContent(html: string): string {
  // Try to extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }

  // If no body tag, try to extract main content area
  const mainMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/i);
  if (mainMatch) {
    return mainMatch[1].trim();
  }

  // If no body or main, return everything after head (or full content)
  const headEndMatch = html.match(/<\/head>([\s\S]*)/i);
  if (headEndMatch) {
    return headEndMatch[1].trim();
  }

  // Fallback: return full HTML
  return html;
}

export function getAllDocs(): DocFile[] {
  const docs: DocFile[] = [];
  
  function walkDir(dir: string, basePath: string[] = []): void {
    if (!fs.existsSync(dir)) {
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and config files
      if (entry.name.startsWith('.') || entry.name === '_config.json') {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      const relativePath = [...basePath, entry.name];
      
      if (entry.isDirectory()) {
        walkDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.html')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf-8');
          const metadata = extractHTMLMetadata(fileContent, entry.name, basePath);
          const content = extractHTMLContent(fileContent);
          
          const slug = entry.name.replace('.html', '');
          const fullDocPath = [...basePath, slug].join('/');
          
          docs.push({
            slug,
            content,
            metadata,
            path: basePath,
            fullPath: fullDocPath,
          });
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error);
        }
      }
    }
  }
  
  walkDir(DOCS_DIR);
  return docs;
}

export function getDocByPath(pathSegments: string[] | undefined): DocFile | null {
  if (!pathSegments || !Array.isArray(pathSegments) || pathSegments.length === 0) {
    return null;
  }
  
  const docs = getAllDocs();
  // Remove .html extension if present and filter out empty segments
  const normalizedSegments = pathSegments
    .map(seg => seg.replace(/\.html$/, ''))
    .filter(seg => seg.length > 0);
  
  if (normalizedSegments.length === 0) {
    return null;
  }
  
  const targetPath = normalizedSegments.join('/');
  
  // Try exact match first
  let doc = docs.find(d => d.fullPath === targetPath);
  if (doc) return doc;
  
  // Try exact match with .html extension (in case fullPath includes it)
  doc = docs.find(d => d.fullPath === `${targetPath}.html`);
  if (doc) return doc;
  
  // Try case-insensitive match
  doc = docs.find(d => d.fullPath.toLowerCase() === targetPath.toLowerCase());
  if (doc) return doc;
  
  doc = docs.find(d => d.fullPath.toLowerCase() === `${targetPath.toLowerCase()}.html`);
  if (doc) return doc;
  
  // Try endsWith match (case-insensitive) - handles partial paths
  doc = docs.find(d => d.fullPath.toLowerCase().endsWith(`/${targetPath.toLowerCase()}`));
  if (doc) return doc;
  
  doc = docs.find(d => d.fullPath.toLowerCase().endsWith(`/${targetPath.toLowerCase()}.html`));
  if (doc) return doc;
  
  // Try matching the last segment only (for deep paths or when path structure differs)
  const lastSegment = normalizedSegments[normalizedSegments.length - 1];
  doc = docs.find(d => {
    const docSegments = d.fullPath.split('/');
    return docSegments[docSegments.length - 1].toLowerCase() === lastSegment.toLowerCase();
  });
  if (doc) return doc;
  
  // Final fallback: try matching any segment in the path
  doc = docs.find(d => {
    const docSegments = d.fullPath.toLowerCase().split('/');
    return normalizedSegments.some(seg => docSegments.includes(seg.toLowerCase()));
  });
  if (doc) return doc;
  
  return null;
}

export function getDocsByCategory(category: string): DocFile[] {
  return getAllDocs()
    .filter(doc => doc.path[0] === category || doc.metadata.category === category)
    .sort((a, b) => (a.metadata.order || 999) - (b.metadata.order || 999));
}

export function getDocCategories(): string[] {
  const docs = getAllDocs();
  const categories = new Set<string>();
  
  docs.forEach(doc => {
    const category = doc.path[0] || doc.metadata.category || 'root';
    categories.add(category);
  });
  
  return Array.from(categories).sort();
}

