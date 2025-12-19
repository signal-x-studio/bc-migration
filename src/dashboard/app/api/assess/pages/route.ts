import { NextResponse } from 'next/server';
import { createWPClient } from '@/lib/wp-client';

interface AssessRequest {
  url: string;
  // Note: WP REST API pages/posts are public, no auth needed
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

    // Fetch all published pages
    const allPages = await wpClient.getAllPages('publish');

    // Analyze pages
    const byStatus: Record<string, number> = {};
    let withContent = 0;
    let withExcerpt = 0;
    let withFeaturedImage = 0;
    let topLevelPages = 0;
    let childPages = 0;
    let totalContentLength = 0;

    for (const page of allPages) {
      // Count by status
      byStatus[page.status] = (byStatus[page.status] || 0) + 1;

      // Check content
      if (page.content?.rendered && page.content.rendered.trim().length > 0) {
        withContent++;
        totalContentLength += page.content.rendered.length;
      }

      // Check excerpt
      if (page.excerpt?.rendered && page.excerpt.rendered.trim().length > 0) {
        withExcerpt++;
      }

      // Check featured image
      if (page.featured_media && page.featured_media > 0) {
        withFeaturedImage++;
      }

      // Check hierarchy
      if (page.parent === 0) {
        topLevelPages++;
      } else {
        childPages++;
      }
    }

    const avgContentLength = allPages.length > 0
      ? Math.round(totalContentLength / allPages.length)
      : 0;

    const issues = { blockers: [] as any[], warnings: [] as any[], info: [] as any[] };

    // Check for pages with no content
    const emptyPages = allPages.length - withContent;
    if (emptyPages > 0) {
      issues.info.push({
        id: 'empty-pages',
        severity: 'info',
        title: 'Pages with no content',
        description: `${emptyPages} pages have no content. These will be migrated as empty pages.`,
        affectedItems: emptyPages,
      });
    }

    // Check for child pages (hierarchy may be lost in BC)
    if (childPages > 0) {
      issues.info.push({
        id: 'child-pages',
        severity: 'info',
        title: 'Nested page structure',
        description: `${childPages} pages are nested under parent pages. BC Pages API supports parent_id but hierarchy display depends on theme.`,
        affectedItems: childPages,
      });
    }

    // Check for pages with featured images
    if (withFeaturedImage > 0) {
      issues.info.push({
        id: 'featured-images',
        severity: 'info',
        title: 'Pages with featured images',
        description: `${withFeaturedImage} pages have featured images. Images embedded in content will be preserved, but featured images may need manual handling.`,
        affectedItems: withFeaturedImage,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics: {
          total: allPages.length,
          byStatus,
          withContent,
          withExcerpt,
          withFeaturedImage,
          topLevelPages,
          childPages,
          avgContentLength,
        },
        issues,
        samples: allPages.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title?.rendered || 'Untitled',
          slug: p.slug,
          status: p.status,
          parent: p.parent,
          contentLength: p.content?.rendered?.length || 0,
          link: p.link,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
