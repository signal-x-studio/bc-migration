import { NextRequest, NextResponse } from 'next/server';

/**
 * Live storefront preview using BigCommerce Storefront GraphQL API
 * Returns actual product data as it would appear on the storefront
 */

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    entityId
    name
    sku
    path
    description
    prices {
      price {
        value
        currencyCode
      }
      salePrice {
        value
        currencyCode
      }
      retailPrice {
        value
        currencyCode
      }
    }
    defaultImage {
      url(width: 400)
      altText
    }
    images {
      edges {
        node {
          url(width: 400)
          altText
        }
      }
    }
    brand {
      name
    }
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
      aggregated {
        availableToSell
      }
    }
    reviewSummary {
      numberOfReviews
      summaryScore
    }
    seo {
      pageTitle
      metaDescription
    }
  }
`;

const PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String) {
    site {
      products(first: $first, after: $after) {
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
`;

const PRODUCT_BY_PATH_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByPath($path: String!) {
    site {
      route(path: $path) {
        node {
          ... on Product {
            ...ProductFields
            variants(first: 50) {
              edges {
                node {
                  entityId
                  sku
                  isPurchasable
                  prices {
                    price {
                      value
                      currencyCode
                    }
                  }
                  inventory {
                    isInStock
                  }
                  options {
                    edges {
                      node {
                        displayName
                        values {
                          edges {
                            node {
                              label
                            }
                          }
                        }
                      }
                    }
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

interface LivePreviewRequest {
  storeHash: string;
  storefrontToken: string;
  action: 'list' | 'single';
  productPath?: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: LivePreviewRequest = await request.json();
    const { storeHash, storefrontToken, action, productPath, limit = 12 } = body;

    if (!storeHash || !storefrontToken) {
      return NextResponse.json(
        { success: false, error: 'Missing storeHash or storefrontToken' },
        { status: 400 }
      );
    }

    const endpoint = `https://store-${storeHash}.mybigcommerce.com/graphql`;

    if (action === 'single' && productPath) {
      // Fetch single product by path
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storefrontToken}`,
        },
        body: JSON.stringify({
          query: PRODUCT_BY_PATH_QUERY,
          variables: { path: productPath },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json(
          { success: false, error: `GraphQL request failed: ${text}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      if (data.errors) {
        return NextResponse.json(
          { success: false, error: data.errors[0]?.message || 'GraphQL error' },
          { status: 400 }
        );
      }

      const product = data.data?.site?.route?.node;

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        product: transformProduct(product),
      });
    } else {
      // Fetch product list
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storefrontToken}`,
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { first: limit },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return NextResponse.json(
          { success: false, error: `GraphQL request failed: ${text}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      if (data.errors) {
        return NextResponse.json(
          { success: false, error: data.errors[0]?.message || 'GraphQL error' },
          { status: 400 }
        );
      }

      const products = data.data?.site?.products?.edges?.map(
        (edge: { node: Record<string, unknown> }) => transformProduct(edge.node)
      ) || [];

      return NextResponse.json({
        success: true,
        products,
        pageInfo: data.data?.site?.products?.pageInfo,
      });
    }
  } catch (error) {
    console.error('Live preview error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Preview failed' },
      { status: 500 }
    );
  }
}

function transformProduct(node: Record<string, unknown>): Record<string, unknown> {
  const prices = node.prices as Record<string, { value: number; currencyCode: string } | null> | undefined;
  const defaultImage = node.defaultImage as { url: string; altText: string } | null | undefined;
  const images = node.images as { edges: Array<{ node: { url: string; altText: string } }> } | undefined;
  const brand = node.brand as { name: string } | null | undefined;
  const categories = node.categories as { edges: Array<{ node: { name: string; path: string } }> } | undefined;
  const inventory = node.inventory as { isInStock: boolean; aggregated?: { availableToSell: number } } | undefined;
  const reviewSummary = node.reviewSummary as { numberOfReviews: number; summaryScore: number } | undefined;
  const seo = node.seo as { pageTitle: string; metaDescription: string } | undefined;
  const variants = node.variants as { edges: Array<{ node: Record<string, unknown> }> } | undefined;

  return {
    id: node.entityId,
    name: node.name,
    sku: node.sku,
    path: node.path,
    description: node.description,
    price: prices?.price?.value || 0,
    salePrice: prices?.salePrice?.value || null,
    retailPrice: prices?.retailPrice?.value || null,
    currency: prices?.price?.currencyCode || 'USD',
    image: defaultImage?.url || null,
    imageAlt: defaultImage?.altText || node.name,
    images: images?.edges?.map(e => ({
      url: e.node.url,
      alt: e.node.altText,
    })) || [],
    brand: brand?.name || null,
    categories: categories?.edges?.map(e => ({
      name: e.node.name,
      path: e.node.path,
    })) || [],
    inStock: inventory?.isInStock ?? true,
    stockLevel: inventory?.aggregated?.availableToSell ?? null,
    reviewCount: reviewSummary?.numberOfReviews || 0,
    rating: reviewSummary?.summaryScore || 0,
    seo: {
      title: seo?.pageTitle || node.name,
      description: seo?.metaDescription || '',
    },
    variants: variants?.edges?.map(e => transformVariant(e.node)) || [],
  };
}

function transformVariant(node: Record<string, unknown>): Record<string, unknown> {
  const prices = node.prices as { price: { value: number; currencyCode: string } } | undefined;
  const inventory = node.inventory as { isInStock: boolean } | undefined;
  const options = node.options as { edges: Array<{ node: { displayName: string; values: { edges: Array<{ node: { label: string } }> } } }> } | undefined;

  return {
    id: node.entityId,
    sku: node.sku,
    isPurchasable: node.isPurchasable,
    price: prices?.price?.value || 0,
    inStock: inventory?.isInStock ?? true,
    options: options?.edges?.map(e => ({
      name: e.node.displayName,
      values: e.node.values?.edges?.map(v => v.node.label) || [],
    })) || [],
  };
}
