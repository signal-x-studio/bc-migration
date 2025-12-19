import { NextResponse } from 'next/server';
import { createWPClient } from '@/lib/wp-client';

interface AssessRequest {
  url: string;
}

export async function POST(request: Request) {
  try {
    const body: AssessRequest = await request.json();

    if (!body.url) {
      return NextResponse.json({ success: false, error: 'Missing site URL' }, { status: 400 });
    }

    const wpClient = createWPClient(body.url);

    // Test connection first
    const connectionTest = await wpClient.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: connectionTest.error || 'Failed to connect to WordPress REST API',
      }, { status: 400 });
    }

    // Fetch all published posts
    const allPosts = await wpClient.getAllPosts('publish');

    // Fetch tags and categories for reference
    const tags = await wpClient.getTags();
    const categories = await wpClient.getCategories();

    // Fetch authors
    const authors = await wpClient.getAllUsers();
    const authorMap = new Map(authors.map(a => [a.id, a.name]));

    // Analyze posts
    const byStatus: Record<string, number> = {};
    let withFeaturedImage = 0;
    let withTags = 0;
    let withCategories = 0;
    let totalContentLength = 0;
    const uniqueAuthors = new Set<number>();
    const postsByYear: Record<string, number> = {};

    for (const post of allPosts) {
      // Count by status
      byStatus[post.status] = (byStatus[post.status] || 0) + 1;

      // Check featured image
      if (post.featured_media && post.featured_media > 0) {
        withFeaturedImage++;
      }

      // Check tags
      if (post.tags && post.tags.length > 0) {
        withTags++;
      }

      // Check categories
      if (post.categories && post.categories.length > 0) {
        withCategories++;
      }

      // Content length
      if (post.content?.rendered) {
        totalContentLength += post.content.rendered.length;
      }

      // Track authors
      if (post.author) {
        uniqueAuthors.add(post.author);
      }

      // Posts by year
      if (post.date) {
        const year = new Date(post.date).getFullYear().toString();
        postsByYear[year] = (postsByYear[year] || 0) + 1;
      }
    }

    const avgContentLength = allPosts.length > 0
      ? Math.round(totalContentLength / allPosts.length)
      : 0;

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Check for posts with featured images
    if (withFeaturedImage > 0) {
      issues.info.push({
        id: 'featured-images',
        severity: 'info',
        title: 'Posts with featured images',
        description: `${withFeaturedImage} posts have featured images. BC Blog supports thumbnail_path but images need to be uploaded separately.`,
        affectedItems: withFeaturedImage,
      });
    }

    // Check for categories (BC Blog uses tags only)
    if (withCategories > 0) {
      issues.info.push({
        id: 'categories',
        severity: 'info',
        title: 'Posts with categories',
        description: `${withCategories} posts have categories. BC Blog API uses tags instead of categories - categories will be converted to tags.`,
        affectedItems: withCategories,
      });
    }

    // Check for multiple authors
    if (uniqueAuthors.size > 1) {
      issues.info.push({
        id: 'multiple-authors',
        severity: 'info',
        title: 'Multiple authors found',
        description: `${uniqueAuthors.size} different authors across posts. Author names will be preserved in the author field.`,
        affectedItems: uniqueAuthors.size,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allPosts.length,
          byStatus,
          withFeaturedImage,
          withTags,
          withCategories,
          avgContentLength,
          uniqueAuthors: uniqueAuthors.size,
          uniqueTags: tags.length,
          uniqueCategories: categories.length,
          postsByYear,
        },
        issues,
        authors: Array.from(uniqueAuthors).map(id => ({
          id,
          name: authorMap.get(id) || 'Unknown',
          postCount: allPosts.filter(p => p.author === id).length,
        })),
        samples: allPosts.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title?.rendered || 'Untitled',
          slug: p.slug,
          date: p.date,
          author: authorMap.get(p.author) || 'Unknown',
          hasFeaturedImage: (p.featured_media || 0) > 0,
          tagCount: p.tags?.length || 0,
          contentLength: p.content?.rendered?.length || 0,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
