import { getAllDocs } from './loader';
import type { DocFile } from './types';

export interface SearchResult {
  doc: DocFile;
  score: number;
  matches: Array<{
    field: 'title' | 'content' | 'description';
    text: string;
    context?: string;
  }>;
}

/**
 * Simple text search through documentation
 * Searches in title, description, and content
 */
export function searchDocs(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const docs = getAllDocs();
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);

  const results: SearchResult[] = [];

  docs.forEach(doc => {
    let score = 0;
    const matches: SearchResult['matches'] = [];

    // Search in title
    const titleLower = doc.metadata.title.toLowerCase();
    if (titleLower.includes(normalizedQuery)) {
      score += 10;
      matches.push({
        field: 'title',
        text: doc.metadata.title,
      });
    } else {
      // Partial match in title
      const titleMatches = queryTerms.filter(term => titleLower.includes(term));
      if (titleMatches.length > 0) {
        score += titleMatches.length * 5;
        matches.push({
          field: 'title',
          text: doc.metadata.title,
        });
      }
    }

    // Search in description
    if (doc.metadata.description) {
      const descLower = doc.metadata.description.toLowerCase();
      if (descLower.includes(normalizedQuery)) {
        score += 5;
        matches.push({
          field: 'description',
          text: doc.metadata.description,
        });
      } else {
        const descMatches = queryTerms.filter(term => descLower.includes(term));
        if (descMatches.length > 0) {
          score += descMatches.length * 2;
          matches.push({
            field: 'description',
            text: doc.metadata.description,
          });
        }
      }
    }

    // Search in content (first 500 chars for performance)
    const contentPreview = doc.content.substring(0, 500).toLowerCase();
    if (contentPreview.includes(normalizedQuery)) {
      score += 2;
      // Extract context around match
      const matchIndex = contentPreview.indexOf(normalizedQuery);
      const start = Math.max(0, matchIndex - 50);
      const end = Math.min(contentPreview.length, matchIndex + normalizedQuery.length + 50);
      const context = doc.content.substring(start, end).trim();
      
      matches.push({
        field: 'content',
        text: normalizedQuery,
        context: context.length > 100 ? `...${context}...` : context,
      });
    } else {
      const contentMatches = queryTerms.filter(term => contentPreview.includes(term));
      if (contentMatches.length > 0) {
        score += contentMatches.length;
        matches.push({
          field: 'content',
          text: queryTerms.join(' '),
        });
      }
    }

    if (score > 0) {
      results.push({ doc, score, matches });
    }
  });

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 20); // Limit to top 20 results
}

