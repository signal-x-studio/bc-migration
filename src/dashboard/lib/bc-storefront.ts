/**
 * BigCommerce Storefront API Client
 *
 * Use this to build your own custom storefront with BigCommerce as the backend.
 * Works with any Next.js/React project.
 *
 * Usage:
 *   const bc = new BCStorefront({ storeHash: 'xxx', storefrontToken: 'yyy' });
 *   const products = await bc.getProducts({ first: 12 });
 */

// =============================================================================
// TYPES
// =============================================================================

export interface BCStorefrontConfig {
  storeHash: string;
  storefrontToken: string;  // Different from REST API token - get from Channel settings
  channelId?: number;       // Default: 1 (main storefront)
}

export interface BCProduct {
  id: string;
  entityId: number;
  name: string;
  sku: string;
  path: string;
  description: string;
  plainTextDescription: string;
  defaultImage: {
    url: string;
    altText: string;
  } | null;
  images: {
    url: string;
    altText: string;
  }[];
  prices: {
    price: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
    retailPrice: { value: number; currencyCode: string } | null;
  };
  brand: { name: string } | null;
  categories: { name: string; path: string }[];
  variants: BCVariant[];
  inventory: {
    isInStock: boolean;
    aggregated: { availableToSell: number };
  };
  productOptions: BCProductOption[];
}

export interface BCVariant {
  entityId: number;
  sku: string;
  prices: {
    price: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
  };
  inventory: {
    isInStock: boolean;
    aggregated: { availableToSell: number };
  };
  options: { displayName: string; values: { label: string }[] }[];
}

export interface BCProductOption {
  entityId: number;
  displayName: string;
  isRequired: boolean;
  values: { entityId: number; label: string }[];
}

export interface BCCategory {
  entityId: number;
  name: string;
  path: string;
  description: string;
  productCount: number;
  image: { url: string; altText: string } | null;
  children: BCCategory[];
}

export interface BCCart {
  id: string;
  lineItems: {
    physicalItems: BCCartItem[];
    digitalItems: BCCartItem[];
  };
  baseAmount: number;
  discountedAmount: number;
  amount: number;
  currencyCode: string;
  checkoutUrl: string;
}

export interface BCCartItem {
  id: string;
  variantEntityId: number;
  productEntityId: number;
  name: string;
  sku: string;
  quantity: number;
  listPrice: number;
  salePrice: number;
  extendedListPrice: number;
  extendedSalePrice: number;
  imageUrl: string;
}

// =============================================================================
// GRAPHQL QUERIES
// =============================================================================

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    entityId
    name
    sku
    path
    description
    plainTextDescription(characterLimit: 500)
    defaultImage {
      url(width: 800)
      altText
    }
    images {
      edges {
        node {
          url(width: 800)
          altText
        }
      }
    }
    prices {
      price { value currencyCode }
      salePrice { value currencyCode }
      retailPrice { value currencyCode }
    }
    brand { name }
    categories {
      edges {
        node {
          name
          path
        }
      }
    }
    inventory {
      isInStock
      aggregated { availableToSell }
    }
    productOptions(first: 10) {
      edges {
        node {
          entityId
          displayName
          isRequired
          ... on MultipleChoiceOption {
            values(first: 50) {
              edges {
                node {
                  entityId
                  label
                }
              }
            }
          }
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          entityId
          sku
          prices {
            price { value currencyCode }
            salePrice { value currencyCode }
          }
          inventory {
            isInStock
            aggregated { availableToSell }
          }
          options {
            edges {
              node {
                displayName
                values {
                  edges {
                    node { label }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $categoryEntityId: Int) {
    site {
      products(first: $first, after: $after, hideOutOfStock: false) @skip(if: $categoryEntityId) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...ProductFields
          }
        }
      }
      category(entityId: $categoryEntityId) @include(if: $categoryEntityId) {
        products(first: $first, after: $after, hideOutOfStock: false) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              ...ProductFields
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_SLUG_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductBySlug($path: String!) {
    site {
      route(path: $path) {
        node {
          ... on Product {
            ...ProductFields
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_ID_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductById($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        ...ProductFields
      }
    }
  }
`;

const CATEGORIES_QUERY = `
  query GetCategories($first: Int!) {
    site {
      categoryTree {
        entityId
        name
        path
        description
        productCount
        image {
          url(width: 400)
          altText
        }
        children {
          entityId
          name
          path
          productCount
          children {
            entityId
            name
            path
            productCount
          }
        }
      }
    }
  }
`;

const SEARCH_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query SearchProducts($searchTerm: String!, $first: Int!) {
    site {
      search {
        searchProducts(filters: { searchTerm: $searchTerm }) {
          products(first: $first) {
            edges {
              node {
                ...ProductFields
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation CreateCart($lineItems: [CartLineItemInput!]!) {
    cart {
      createCart(input: { lineItems: $lineItems }) {
        cart {
          entityId
          lineItems {
            physicalItems {
              entityId
              variantEntityId
              productEntityId
              name
              sku
              quantity
              listPrice { value }
              salePrice { value }
              extendedListPrice { value }
              extendedSalePrice { value }
              imageUrl
            }
          }
          amount { value currencyCode }
          baseAmount { value }
          discountedAmount { value }
        }
        errors {
          message
        }
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation AddToCart($cartEntityId: String!, $lineItems: [CartLineItemInput!]!) {
    cart {
      addCartLineItems(input: { cartEntityId: $cartEntityId, data: { lineItems: $lineItems } }) {
        cart {
          entityId
          lineItems {
            physicalItems {
              entityId
              variantEntityId
              productEntityId
              name
              sku
              quantity
              listPrice { value }
              salePrice { value }
              extendedListPrice { value }
              extendedSalePrice { value }
              imageUrl
            }
          }
          amount { value currencyCode }
          baseAmount { value }
          discountedAmount { value }
        }
        errors {
          message
        }
      }
    }
  }
`;

const GET_CART_QUERY = `
  query GetCart($cartEntityId: String!) {
    site {
      cart(entityId: $cartEntityId) {
        entityId
        lineItems {
          physicalItems {
            entityId
            variantEntityId
            productEntityId
            name
            sku
            quantity
            listPrice { value }
            salePrice { value }
            extendedListPrice { value }
            extendedSalePrice { value }
            imageUrl
          }
          digitalItems {
            entityId
            variantEntityId
            productEntityId
            name
            sku
            quantity
            listPrice { value }
            salePrice { value }
            extendedListPrice { value }
            extendedSalePrice { value }
            imageUrl
          }
        }
        amount { value currencyCode }
        baseAmount { value }
        discountedAmount { value }
      }
    }
  }
`;

// =============================================================================
// CLIENT CLASS
// =============================================================================

export class BCStorefront {
  private storeHash: string;
  private storefrontToken: string;
  private channelId: number;
  private endpoint: string;

  constructor(config: BCStorefrontConfig) {
    this.storeHash = config.storeHash;
    this.storefrontToken = config.storefrontToken;
    this.channelId = config.channelId || 1;
    this.endpoint = `https://store-${this.storeHash}.mybigcommerce.com/graphql`;
  }

  /**
   * Execute a GraphQL query against the BC Storefront API
   */
  private async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.storefrontToken}`,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // Cache for 60 seconds in Next.js
    });

    if (!response.ok) {
      throw new Error(`BC Storefront API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`GraphQL Error: ${json.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return json.data;
  }

  /**
   * Transform raw GraphQL edges to clean arrays
   */
  private normalizeEdges<T>(edges: { node: T }[] | undefined): T[] {
    return edges?.map(e => e.node) || [];
  }

  /**
   * Transform raw product data to clean BCProduct
   */
  private normalizeProduct(raw: Record<string, unknown>): BCProduct {
    const r = raw as Record<string, unknown>;
    return {
      id: r.id as string,
      entityId: r.entityId as number,
      name: r.name as string,
      sku: r.sku as string,
      path: r.path as string,
      description: r.description as string,
      plainTextDescription: r.plainTextDescription as string,
      defaultImage: r.defaultImage as BCProduct['defaultImage'],
      images: this.normalizeEdges((r.images as { edges?: { node: unknown }[] })?.edges) as BCProduct['images'],
      prices: r.prices as BCProduct['prices'],
      brand: r.brand as BCProduct['brand'],
      categories: this.normalizeEdges((r.categories as { edges?: { node: unknown }[] })?.edges) as BCProduct['categories'],
      inventory: r.inventory as BCProduct['inventory'],
      productOptions: (this.normalizeEdges((r.productOptions as { edges?: { node: unknown }[] })?.edges) as Record<string, unknown>[]).map((opt) => ({
        entityId: opt.entityId as number,
        displayName: opt.displayName as string,
        isRequired: opt.isRequired as boolean,
        values: this.normalizeEdges((opt.values as { edges?: { node: unknown }[] })?.edges) as { entityId: number; label: string }[],
      })) as BCProductOption[],
      variants: (this.normalizeEdges((r.variants as { edges?: { node: unknown }[] })?.edges) as Record<string, unknown>[]).map((v) => ({
        entityId: v.entityId as number,
        sku: v.sku as string,
        prices: v.prices as BCVariant['prices'],
        inventory: v.inventory as BCVariant['inventory'],
        options: (this.normalizeEdges((v.options as { edges?: { node: unknown }[] })?.edges) as Record<string, unknown>[]).map((opt) => ({
          displayName: opt.displayName as string,
          values: this.normalizeEdges((opt.values as { edges?: { node: unknown }[] })?.edges) as { label: string }[],
        })),
      })) as BCVariant[],
    };
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Get a list of products
   */
  async getProducts(options: {
    first?: number;
    after?: string;
    categoryId?: number;
  } = {}): Promise<{ products: BCProduct[]; hasNextPage: boolean; endCursor: string | null }> {
    const { first = 12, after, categoryId } = options;

    // Simplified query without conditional directives
    const query = categoryId
      ? `${PRODUCT_FRAGMENT}
         query GetCategoryProducts($first: Int!, $after: String, $categoryEntityId: Int!) {
           site {
             category(entityId: $categoryEntityId) {
               products(first: $first, after: $after, hideOutOfStock: false) {
                 pageInfo { hasNextPage endCursor }
                 edges { node { ...ProductFields } }
               }
             }
           }
         }`
      : `${PRODUCT_FRAGMENT}
         query GetProducts($first: Int!, $after: String) {
           site {
             products(first: $first, after: $after, hideOutOfStock: false) {
               pageInfo { hasNextPage endCursor }
               edges { node { ...ProductFields } }
             }
           }
         }`;

    const data = await this.query<Record<string, unknown>>(query, {
      first,
      after,
      ...(categoryId && { categoryEntityId: categoryId }),
    });

    const site = data.site as Record<string, unknown>;
    const productsData = categoryId
      ? (site.category as Record<string, unknown>)?.products
      : site.products;

    const pd = productsData as { pageInfo: { hasNextPage: boolean; endCursor: string }; edges: { node: unknown }[] };

    return {
      products: this.normalizeEdges(pd?.edges).map(p => this.normalizeProduct(p as Record<string, unknown>)),
      hasNextPage: pd?.pageInfo?.hasNextPage || false,
      endCursor: pd?.pageInfo?.endCursor || null,
    };
  }

  /**
   * Get a single product by its URL path (e.g., "/sample-product/")
   */
  async getProductBySlug(path: string): Promise<BCProduct | null> {
    const data = await this.query<Record<string, unknown>>(PRODUCT_BY_SLUG_QUERY, { path });
    const site = data.site as Record<string, unknown>;
    const route = site.route as Record<string, unknown>;
    const node = route?.node as Record<string, unknown>;

    if (!node) return null;
    return this.normalizeProduct(node);
  }

  /**
   * Get a single product by its entity ID
   */
  async getProductById(entityId: number): Promise<BCProduct | null> {
    const data = await this.query<Record<string, unknown>>(PRODUCT_BY_ID_QUERY, { entityId });
    const site = data.site as Record<string, unknown>;
    const product = site.product as Record<string, unknown>;

    if (!product) return null;
    return this.normalizeProduct(product);
  }

  /**
   * Search products by keyword
   */
  async searchProducts(searchTerm: string, first: number = 12): Promise<BCProduct[]> {
    const data = await this.query<Record<string, unknown>>(SEARCH_PRODUCTS_QUERY, { searchTerm, first });
    const site = data.site as Record<string, unknown>;
    const search = site.search as Record<string, unknown>;
    const searchProducts = search.searchProducts as Record<string, unknown>;
    const products = searchProducts.products as { edges: { node: unknown }[] };

    return this.normalizeEdges(products?.edges).map(p => this.normalizeProduct(p as Record<string, unknown>));
  }

  /**
   * Get category tree
   */
  async getCategories(): Promise<BCCategory[]> {
    const data = await this.query<Record<string, unknown>>(CATEGORIES_QUERY, { first: 50 });
    const site = data.site as Record<string, unknown>;
    return site.categoryTree as BCCategory[];
  }

  /**
   * Create a new cart with items
   */
  async createCart(items: { productEntityId: number; variantEntityId?: number; quantity: number }[]): Promise<BCCart | null> {
    const lineItems = items.map(item => ({
      productEntityId: item.productEntityId,
      variantEntityId: item.variantEntityId,
      quantity: item.quantity,
    }));

    const data = await this.query<Record<string, unknown>>(CREATE_CART_MUTATION, { lineItems });
    const cart = data.cart as Record<string, unknown>;
    const createCart = cart.createCart as Record<string, unknown>;

    if ((createCart.errors as unknown[])?.length > 0) {
      const errors = createCart.errors as { message: string }[];
      throw new Error(`Cart error: ${errors.map(e => e.message).join(', ')}`);
    }

    return createCart.cart as BCCart;
  }

  /**
   * Add items to an existing cart
   */
  async addToCart(
    cartEntityId: string,
    items: { productEntityId: number; variantEntityId?: number; quantity: number }[]
  ): Promise<BCCart | null> {
    const lineItems = items.map(item => ({
      productEntityId: item.productEntityId,
      variantEntityId: item.variantEntityId,
      quantity: item.quantity,
    }));

    const data = await this.query<Record<string, unknown>>(ADD_TO_CART_MUTATION, { cartEntityId, lineItems });
    const cart = data.cart as Record<string, unknown>;
    const addCartLineItems = cart.addCartLineItems as Record<string, unknown>;

    if ((addCartLineItems.errors as unknown[])?.length > 0) {
      const errors = addCartLineItems.errors as { message: string }[];
      throw new Error(`Cart error: ${errors.map(e => e.message).join(', ')}`);
    }

    return addCartLineItems.cart as BCCart;
  }

  /**
   * Get cart by ID
   */
  async getCart(cartEntityId: string): Promise<BCCart | null> {
    const data = await this.query<Record<string, unknown>>(GET_CART_QUERY, { cartEntityId });
    const site = data.site as Record<string, unknown>;
    return site.cart as BCCart | null;
  }

  /**
   * Get the checkout URL for a cart (for embedded checkout)
   */
  getCheckoutUrl(cartId: string): string {
    return `https://store-${this.storeHash}.mybigcommerce.com/cart.php?action=loadInCheckout&id=${cartId}`;
  }
}

// =============================================================================
// SINGLETON INSTANCE (optional convenience)
// =============================================================================

let defaultClient: BCStorefront | null = null;

export function initBCStorefront(config: BCStorefrontConfig): BCStorefront {
  defaultClient = new BCStorefront(config);
  return defaultClient;
}

export function getBCStorefront(): BCStorefront {
  if (!defaultClient) {
    throw new Error('BCStorefront not initialized. Call initBCStorefront() first.');
  }
  return defaultClient;
}

// =============================================================================
// REACT HOOKS (for Next.js App Router)
// =============================================================================

/**
 * Example usage in a Next.js Server Component:
 *
 * import { BCStorefront } from '@/lib/bc-storefront';
 *
 * export default async function ProductsPage() {
 *   const bc = new BCStorefront({
 *     storeHash: process.env.BC_STORE_HASH!,
 *     storefrontToken: process.env.BC_STOREFRONT_TOKEN!,
 *   });
 *
 *   const { products } = await bc.getProducts({ first: 12 });
 *
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       {products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 */
