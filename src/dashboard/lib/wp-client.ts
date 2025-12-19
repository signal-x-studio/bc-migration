/**
 * WordPress REST API Client
 *
 * Used for fetching WordPress content (pages, posts, media, authors)
 * that exists outside WooCommerce's API scope.
 *
 * WordPress REST API is available at /wp-json/wp/v2/
 */

export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending' | 'future' | 'trash';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  template: string;
}

export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending' | 'future' | 'trash';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  sticky: boolean;
  format: string;
  categories: number[];
  tags: number[];
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  caption: { rendered: string };
  alt_text: string;
  media_type: 'image' | 'file';
  mime_type: string;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes?: Record<string, {
      file: string;
      width: number;
      height: number;
      source_url: string;
    }>;
  };
}

export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  avatar_urls: Record<string, string>;
}

export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  parent: number;
}

/**
 * WordPress REST API Client
 */
export class WPClient {
  private baseUrl: string;

  constructor(siteUrl: string) {
    // Normalize URL
    let url = siteUrl.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    // Remove trailing slash
    url = url.replace(/\/+$/, '');
    this.baseUrl = `${url}/wp-json/wp/v2`;
  }

  /**
   * Fetch pages from WordPress
   */
  async getPages(params: {
    page?: number;
    per_page?: number;
    status?: string | string[];
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WPPage[]> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status.join(',') : params.status;
      queryParams.set('status', statuses);
    }
    if (params.orderby) queryParams.set('orderby', params.orderby);
    if (params.order) queryParams.set('order', params.order);

    const response = await fetch(`${this.baseUrl}/pages?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch all pages with pagination
   */
  async getAllPages(status: string | string[] = 'publish'): Promise<WPPage[]> {
    const allPages: WPPage[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pages = await this.getPages({
        page,
        per_page: 100,
        status,
      });

      if (pages.length === 0) {
        hasMore = false;
      } else {
        allPages.push(...pages);
        page++;
      }

      if (page > 50) break; // Safety limit
    }

    return allPages;
  }

  /**
   * Fetch posts from WordPress
   */
  async getPosts(params: {
    page?: number;
    per_page?: number;
    status?: string | string[];
    categories?: number[];
    tags?: number[];
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WPPost[]> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status.join(',') : params.status;
      queryParams.set('status', statuses);
    }
    if (params.categories) queryParams.set('categories', params.categories.join(','));
    if (params.tags) queryParams.set('tags', params.tags.join(','));
    if (params.orderby) queryParams.set('orderby', params.orderby);
    if (params.order) queryParams.set('order', params.order);

    const response = await fetch(`${this.baseUrl}/posts?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch all posts with pagination
   */
  async getAllPosts(status: string | string[] = 'publish'): Promise<WPPost[]> {
    const allPosts: WPPost[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const posts = await this.getPosts({
        page,
        per_page: 100,
        status,
      });

      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts.push(...posts);
        page++;
      }

      if (page > 100) break; // Safety limit (10000 posts)
    }

    return allPosts;
  }

  /**
   * Fetch a single media item
   */
  async getMedia(id: number): Promise<WPMedia | null> {
    try {
      const response = await fetch(`${this.baseUrl}/media/${id}`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch a user/author
   */
  async getUser(id: number): Promise<WPUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch all users
   */
  async getAllUsers(): Promise<WPUser[]> {
    const allUsers: WPUser[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '100',
      });

      const response = await fetch(`${this.baseUrl}/users?${queryParams.toString()}`);

      if (!response.ok) {
        hasMore = false;
        continue;
      }

      const users = await response.json();

      if (users.length === 0) {
        hasMore = false;
      } else {
        allUsers.push(...users);
        page++;
      }

      if (page > 10) break; // Safety limit
    }

    return allUsers;
  }

  /**
   * Fetch tags
   */
  async getTags(): Promise<WPTag[]> {
    const allTags: WPTag[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '100',
      });

      const response = await fetch(`${this.baseUrl}/tags?${queryParams.toString()}`);

      if (!response.ok) {
        hasMore = false;
        continue;
      }

      const tags = await response.json();

      if (tags.length === 0) {
        hasMore = false;
      } else {
        allTags.push(...tags);
        page++;
      }

      if (page > 10) break; // Safety limit
    }

    return allTags;
  }

  /**
   * Fetch categories (blog categories, not WC product categories)
   */
  async getCategories(): Promise<WPCategory[]> {
    const allCategories: WPCategory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '100',
      });

      const response = await fetch(`${this.baseUrl}/categories?${queryParams.toString()}`);

      if (!response.ok) {
        hasMore = false;
        continue;
      }

      const categories = await response.json();

      if (categories.length === 0) {
        hasMore = false;
      } else {
        allCategories.push(...categories);
        page++;
      }

      if (page > 10) break; // Safety limit
    }

    return allCategories;
  }

  /**
   * Test connection to WordPress REST API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to fetch a single page to verify API access
      const response = await fetch(`${this.baseUrl}/pages?per_page=1`);

      if (!response.ok) {
        // Try posts if pages fail (some sites might have pages disabled)
        const postsResponse = await fetch(`${this.baseUrl}/posts?per_page=1`);

        if (!postsResponse.ok) {
          return {
            success: false,
            error: `WordPress REST API not accessible: ${response.status}`,
          };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to WordPress',
      };
    }
  }
}

/**
 * Create a WordPress client instance
 */
export function createWPClient(siteUrl: string): WPClient {
  return new WPClient(siteUrl);
}
