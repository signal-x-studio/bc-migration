import { NextRequest, NextResponse } from 'next/server';
import { docs } from '#site/content';

export interface SearchResult {
  slug: string;
  title: string;
  description?: string;
  category: string;
  section?: string;
  score: number;
  matches: Array<{
    field: 'title' | 'content' | 'description';
    text: string;
  }>;
}

/**
 * Search documentation content
 * Searches in title, description, and content (including API reference)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
    const results: SearchResult[] = [];

    docs.forEach(doc => {
      let score = 0;
      const matches: SearchResult['matches'] = [];

      // Search in title
      const titleLower = doc.title.toLowerCase();
      if (titleLower.includes(normalizedQuery)) {
        score += 10;
        matches.push({
          field: 'title',
          text: doc.title,
        });
      } else {
        const titleMatches = queryTerms.filter(term => titleLower.includes(term));
        if (titleMatches.length > 0) {
          score += titleMatches.length * 5;
          matches.push({
            field: 'title',
            text: doc.title,
          });
        }
      }

      // Search in description
      if (doc.description) {
        const descLower = doc.description.toLowerCase();
        if (descLower.includes(normalizedQuery)) {
          score += 5;
          matches.push({
            field: 'description',
            text: doc.description,
          });
        } else {
          const descMatches = queryTerms.filter(term => descLower.includes(term));
          if (descMatches.length > 0) {
            score += descMatches.length * 2;
            matches.push({
              field: 'description',
              text: doc.description,
            });
          }
        }
      }

      // Search in content (raw MDX content)
      const content = doc.content || '';
      const contentLower = content.toLowerCase();
      if (contentLower.includes(normalizedQuery)) {
        score += 2;
        matches.push({
          field: 'content',
          text: normalizedQuery,
        });
      } else {
        const contentMatches = queryTerms.filter(term => contentLower.includes(term));
        if (contentMatches.length > 0) {
          score += contentMatches.length;
          matches.push({
            field: 'content',
            text: queryTerms.join(' '),
          });
        }
      }

      // Boost API reference docs if they match
      if (doc.section === 'api' && score > 0) {
        score += 1;
      }

      if (score > 0) {
        results.push({
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          section: doc.section,
          score,
          matches,
        });
      }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return NextResponse.json({ 
      results: results.slice(0, 20), // Limit to top 20 results
      total: results.length 
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
