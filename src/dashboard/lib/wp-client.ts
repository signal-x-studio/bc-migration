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

// ============================================
// Extended Types for Embedded Content
// ============================================

export interface WPEmbeddedAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  avatar_urls: Record<string, string>;
}

export interface WPEmbeddedFeaturedMedia {
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

export interface WPPostWithEmbeds extends WPPost {
  _embedded?: {
    author?: WPEmbeddedAuthor[];
    'wp:featuredmedia'?: WPEmbeddedFeaturedMedia[];
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      link: string;
    }>>;
  };
}

export interface WPPageWithEmbeds extends WPPage {
  _embedded?: {
    author?: WPEmbeddedAuthor[];
    'wp:featuredmedia'?: WPEmbeddedFeaturedMedia[];
  };
}

export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
}

// ============================================
// Extended WordPress Client
// ============================================

/**
 * Extended WordPress REST API Client with single item fetch and search
 */
export class WPClientExtended extends WPClient {
  private siteUrl: string;
  private apiBaseUrl: string;

  constructor(siteUrl: string) {
    super(siteUrl);

    // Normalize URL
    let url = siteUrl.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    url = url.replace(/\/+$/, '');

    this.siteUrl = url;
    this.apiBaseUrl = `${url}/wp-json/wp/v2`;
  }

  /**
   * Get site information
   */
  async getSiteInfo(): Promise<WPSiteInfo> {
    const response = await fetch(`${this.siteUrl}/wp-json`);

    if (!response.ok) {
      throw new Error(`Failed to fetch site info: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      name: data.name || '',
      description: data.description || '',
      url: data.url || this.siteUrl,
      home: data.home || this.siteUrl,
      gmt_offset: data.gmt_offset || 0,
      timezone_string: data.timezone_string || 'UTC',
    };
  }

  /**
   * Fetch a single post by ID with optional embedded content
   */
  async getPost(id: number, embed: boolean = true): Promise<WPPostWithEmbeds> {
    const params = new URLSearchParams();
    if (embed) {
      params.set('_embed', 'true');
    }

    const response = await fetch(`${this.apiBaseUrl}/posts/${id}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post ${id}: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch a single page by ID with optional embedded content
   */
  async getPage(id: number, embed: boolean = true): Promise<WPPageWithEmbeds> {
    const params = new URLSearchParams();
    if (embed) {
      params.set('_embed', 'true');
    }

    const response = await fetch(`${this.apiBaseUrl}/pages/${id}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch page ${id}: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Search posts by query
   */
  async searchPosts(query: string, limit: number = 10): Promise<WPPostWithEmbeds[]> {
    const params = new URLSearchParams({
      search: query,
      per_page: limit.toString(),
      _embed: 'true',
    });

    const response = await fetch(`${this.apiBaseUrl}/posts?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Search pages by query
   */
  async searchPages(query: string, limit: number = 10): Promise<WPPageWithEmbeds[]> {
    const params = new URLSearchParams({
      search: query,
      per_page: limit.toString(),
      _embed: 'true',
    });

    const response = await fetch(`${this.apiBaseUrl}/pages?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search pages: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get posts with embedded content and pagination info
   */
  async getPostsWithMeta(params: {
    page?: number;
    per_page?: number;
    search?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ posts: WPPostWithEmbeds[]; total: number; totalPages: number }> {
    const queryParams = new URLSearchParams({
      _embed: 'true',
    });

    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.orderby) queryParams.set('orderby', params.orderby);
    if (params.order) queryParams.set('order', params.order);

    const response = await fetch(`${this.apiBaseUrl}/posts?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

    return { posts, total, totalPages };
  }

  /**
   * Get pages with embedded content and pagination info
   */
  async getPagesWithMeta(params: {
    page?: number;
    per_page?: number;
    search?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ pages: WPPageWithEmbeds[]; total: number; totalPages: number }> {
    const queryParams = new URLSearchParams({
      _embed: 'true',
    });

    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.orderby) queryParams.set('orderby', params.orderby);
    if (params.order) queryParams.set('order', params.order);

    const response = await fetch(`${this.apiBaseUrl}/pages?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
    }

    const pages = await response.json();
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

    return { pages, total, totalPages };
  }
}

/**
 * Create an extended WordPress client instance
 */
export function createWPClientExtended(siteUrl: string): WPClientExtended {
  return new WPClientExtended(siteUrl);
}
