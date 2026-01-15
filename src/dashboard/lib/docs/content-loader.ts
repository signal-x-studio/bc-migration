/**
 * Content Loader for MDX Documentation
 * Loads and processes MDX files from docs/content directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import type { DocFile, DocMetadata } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_CONTENT_DIR = path.resolve(__dirname, '../../../../docs/content');

export interface MDXDoc {
  slug: string;
  title: string;
  description?: string;
  category: string;
  section?: string;
  order: number;
  content: string;
  code: string; // Compiled MDX code (for Velite compatibility)
  toc?: Array<{ id: string; title: string; level: number }>;
}

/**
 * Extract frontmatter and content from MDX file
 */
function parseMDXFile(filePath: string): { frontmatter: DocMetadata; content: string } {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    frontmatter: {
      title: data.title || path.basename(filePath, '.mdx'),
      description: data.description || '',
      category: data.category || 'reference',
      order: data.order || 999,
      section: data.section,
      ...data,
    },
    content: content.trim(),
  };
}

/**
 * Extract table of contents from markdown content
 */
function extractTOC(content: string): Array<{ id: string; title: string; level: number }> {
  const toc: Array<{ id: string; title: string; level: number }> = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    toc.push({ id, title, level });
  }

  return toc;
}

/**
 * Generate slug from file path
 */
function generateSlug(filePath: string, baseDir: string): string {
  const relative = path.relative(baseDir, filePath);
  return relative
    .replace(/\.mdx$/, '')
    .replace(/\\/g, '/')
    .toLowerCase();
}

/**
 * Load all MDX documentation files
 */
export function loadAllMDXDocs(): MDXDoc[] {
  const docs: MDXDoc[] = [];

  if (!fs.existsSync(DOCS_CONTENT_DIR)) {
    console.warn(`Docs content directory not found: ${DOCS_CONTENT_DIR}`);
    return docs;
  }

  function walkDir(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files and node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.mdx')) {
        try {
          const { frontmatter, content } = parseMDXFile(fullPath);
          const slug = generateSlug(fullPath, DOCS_CONTENT_DIR);
          const toc = extractTOC(content);

          // For Velite compatibility, we'd compile MDX here
          // For now, we'll store the raw content and compile at runtime
          const code = content; // Placeholder - would be compiled MDX

          docs.push({
            slug,
            title: frontmatter.title,
            description: frontmatter.description,
            category: frontmatter.category || 'reference',
            section: frontmatter.section,
            order: frontmatter.order || 999,
            content,
            code,
            toc: toc.length > 0 ? toc : undefined,
          });
        } catch (error) {
          console.error(`Error loading MDX file ${fullPath}:`, error);
        }
      }
    }
  }

  walkDir(DOCS_CONTENT_DIR);
  return docs.sort((a, b) => a.order - b.order);
}

/**
 * Convert MDXDoc to DocFile format (for compatibility with existing system)
 */
export function convertMDXToDocFile(mdxDoc: MDXDoc): DocFile {
  const pathSegments = mdxDoc.slug.split('/');
  const slug = pathSegments[pathSegments.length - 1];
  const pathWithoutSlug = pathSegments.slice(0, -1);

  return {
    slug,
    content: mdxDoc.content,
    metadata: {
      title: mdxDoc.title,
      description: mdxDoc.description,
      category: mdxDoc.category,
      order: mdxDoc.order,
      section: mdxDoc.section,
      toc: mdxDoc.toc,
    },
    path: pathWithoutSlug,
    fullPath: mdxDoc.slug,
  };
}

/**
 * Get all docs in DocFile format
 */
export function getAllDocsAsFiles(): DocFile[] {
  return loadAllMDXDocs().map(convertMDXToDocFile);
}

