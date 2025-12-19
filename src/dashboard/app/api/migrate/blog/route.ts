import { NextRequest } from 'next/server';
import { createWPClient, WPPost, WPTag, WPCategory, WPUser } from '@/lib/wp-client';
import type { BlogMigrationStats } from '@/lib/types';

/**
 * Migrate blog posts from WordPress to BigCommerce
 * Uses Server-Sent Events (SSE) for real-time progress updates
 *
 * Uses BC V2 Blog Posts API
 */

interface MigrateBlogRequest {
  wcCredentials: {
    url: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  migratedPostIds?: number[];
  includeStatuses?: string[]; // Default: ['publish']
}

interface BCBlogPostCreate {
  title: string;
  body: string;
  url?: string;
  is_published: boolean;
  published_date?: string;
  author?: string;
  meta_description?: string;
  meta_keywords?: string;
  thumbnail_path?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body: MigrateBlogRequest = await request.json();
        const {
          wcCredentials,
          bcCredentials,
          migratedPostIds = [],
          includeStatuses = ['publish'],
        } = body;

        if (!wcCredentials?.url || !bcCredentials) {
          send({ type: 'error', error: 'Missing required credentials' });
          controller.close();
          return;
        }

        // Initialize WP client
        const wpClient = createWPClient(wcCredentials.url);

        // Test WP connection
        const connectionTest = await wpClient.testConnection();
        if (!connectionTest.success) {
          send({ type: 'error', error: connectionTest.error || 'Cannot connect to WordPress' });
          controller.close();
          return;
        }

        // Fetch metadata for lookups
        const [tags, categories, authors] = await Promise.all([
          wpClient.getTags(),
          wpClient.getCategories(),
          wpClient.getAllUsers(),
        ]);

        // Build lookup maps
        const tagMap = new Map<number, string>(tags.map(t => [t.id, t.name]));
        const categoryMap = new Map<number, string>(categories.map(c => [c.id, c.name]));
        const authorMap = new Map<number, string>(authors.map(a => [a.id, a.name]));

        // Fetch all posts from WordPress
        const allPosts = await wpClient.getAllPosts(includeStatuses.join(','));

        // Filter out already migrated posts
        const postsToMigrate = allPosts.filter(
          post => !migratedPostIds.includes(post.id)
        );

        send({
          type: 'started',
          totalPosts: postsToMigrate.length,
          totalInWP: allPosts.length,
          alreadyMigrated: allPosts.length - postsToMigrate.length,
        });

        const stats: BlogMigrationStats = {
          total: postsToMigrate.length,
          successful: 0,
          skipped: 0,
          failed: 0,
          warnings: [],
        };

        const newlyMigratedPostIds: number[] = [];
        const postIdMapping: Record<number, number> = {};

        // Process posts one by one
        for (const post of postsToMigrate) {
          try {
            send({
              type: 'progress',
              completedPosts: stats.successful + stats.skipped + stats.failed,
              currentPost: {
                id: post.id,
                title: post.title?.rendered || 'Untitled',
                slug: post.slug,
                author: authorMap.get(post.author) || 'Unknown',
              },
              stats,
            });

            // Check if post already exists in BC by URL
            const existingPost = await checkBCBlogPostExists(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              post.slug
            );

            if (existingPost) {
              stats.skipped++;
              newlyMigratedPostIds.push(post.id);
              postIdMapping[post.id] = existingPost;
              await sleep(100);
              continue;
            }

            // Transform and create post in BC
            const bcPost = transformWPPostToBC(
              post,
              tagMap,
              categoryMap,
              authorMap,
              stats.warnings
            );

            const createdPost = await createBCBlogPost(
              bcCredentials.storeHash,
              bcCredentials.accessToken,
              bcPost
            );

            stats.successful++;
            newlyMigratedPostIds.push(post.id);
            postIdMapping[post.id] = createdPost.id;

            // Rate limiting - 200ms between creates
            await sleep(200);

          } catch (error) {
            stats.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            stats.warnings.push(`Post "${post.title?.rendered || post.slug}": ${errorMessage}`);
            console.error(`Failed to migrate post ${post.id}:`, error);
          }
        }

        send({
          type: 'complete',
          stats,
          migratedPostIds: newlyMigratedPostIds,
          postIdMapping,
        });

      } catch (error) {
        send({
          type: 'error',
          error: error instanceof Error ? error.message : 'Blog migration failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Check if a blog post with this URL already exists in BC
 */
async function checkBCBlogPostExists(
  storeHash: string,
  accessToken: string,
  slug: string
): Promise<number | null> {
  // BC V2 Blog API - fetch all and check URL
  // Note: V2 doesn't support filtering by URL, so we fetch recent posts
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/blog/posts?limit=250`,
    {
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const posts = await response.json();
  if (Array.isArray(posts)) {
    // Check for matching URL or slug in the URL
    const matching = posts.find(p =>
      p.url === `/${slug}` ||
      p.url === slug ||
      p.url?.endsWith(`/${slug}`)
    );
    if (matching) {
      return matching.id;
    }
  }

  return null;
}

/**
 * Transform WP Post to BC Blog Post format
 */
function transformWPPostToBC(
  wpPost: WPPost,
  tagMap: Map<number, string>,
  categoryMap: Map<number, string>,
  authorMap: Map<number, string>,
  warnings: string[]
): BCBlogPostCreate {
  // Get title - decode HTML entities
  const title = (wpPost.title?.rendered || 'Untitled')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  // Get body content
  const body = wpPost.content?.rendered || '';

  // Get meta description from excerpt (strip HTML)
  const metaDescription = wpPost.excerpt?.rendered
    ? wpPost.excerpt.rendered.replace(/<[^>]*>/g, '').trim().substring(0, 255)
    : undefined;

  // Get author name
  const author = authorMap.get(wpPost.author) || undefined;

  // Build tags array (combine WP tags + categories since BC uses tags only)
  const bcTags: string[] = [];

  // Add WP tags
  if (wpPost.tags && wpPost.tags.length > 0) {
    for (const tagId of wpPost.tags) {
      const tagName = tagMap.get(tagId);
      if (tagName) {
        bcTags.push(tagName);
      }
    }
  }

  // Add WP categories as tags (BC Blog doesn't have categories)
  if (wpPost.categories && wpPost.categories.length > 0) {
    for (const catId of wpPost.categories) {
      const catName = categoryMap.get(catId);
      if (catName && catName.toLowerCase() !== 'uncategorized') {
        bcTags.push(catName);
      }
    }
  }

  // Format published date (BC expects RFC 2822 format)
  let publishedDate: string | undefined;
  if (wpPost.date) {
    const date = new Date(wpPost.date);
    publishedDate = date.toUTCString();
  }

  // Note about featured image
  if (wpPost.featured_media && wpPost.featured_media > 0) {
    warnings.push(`Post "${title}": Has featured image (ID: ${wpPost.featured_media}). Manual image upload required for thumbnail.`);
  }

  const bcPost: BCBlogPostCreate = {
    title: title.substring(0, 255), // BC has 255 char limit
    body,
    url: `/${wpPost.slug}`,
    is_published: wpPost.status === 'publish',
    ...(publishedDate ? { published_date: publishedDate } : {}),
    ...(author ? { author } : {}),
    ...(metaDescription ? { meta_description: metaDescription } : {}),
    ...(bcTags.length > 0 ? { tags: bcTags } : {}),
  };

  return bcPost;
}

/**
 * Create blog post in BigCommerce (V2 API)
 */
async function createBCBlogPost(
  storeHash: string,
  accessToken: string,
  post: BCBlogPostCreate
): Promise<{ id: number }> {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/blog/posts`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(post),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to create blog post';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.title || errorJson.message || errorJson[0]?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
