import { describe, it, expect } from 'vitest';
import {
  transformSimpleProduct,
  transformVariableProduct,
  transformProduct,
  transformProductBatch,
  type CategoryMap,
} from '../../migration/transformers/product.js';
import type { WCProduct, WCVariation } from '../../types/wc.js';

describe('product transformer', () => {
  const categoryMap: CategoryMap = new Map([
    ['Clothing', 1],
    ['Shoes', 2],
    ['Accessories', 3],
  ]);

  describe('transformSimpleProduct', () => {
    it('transforms a basic simple product', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: '29.99',
        description: 'A test product description',
        weight: '1.5',
        status: 'publish',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.name).toBe('Test Product');
      expect(result.product.sku).toBe('TEST-SKU');
      expect(result.product.price).toBe(29.99);
      expect(result.product.weight).toBe(1.5);
      expect(result.product.type).toBe('physical');
      expect(result.product.is_visible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('generates SKU from product ID when missing', () => {
      const wcProduct = createSimpleProduct({
        id: 123,
        name: 'No SKU Product',
        sku: '',
        price: '19.99',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.sku).toBe('wc-123');
    });

    it('sets type to digital for virtual products', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Digital Product',
        sku: 'DIGITAL',
        price: '9.99',
        virtual: true,
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.type).toBe('digital');
      expect(result.product.weight).toBe(0);
    });

    it('sets type to digital for downloadable-only products', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Download Product',
        sku: 'DOWNLOAD',
        price: '4.99',
        downloadable: true,
        shipping_required: false,
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.type).toBe('digital');
    });

    it('maps categories correctly', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Categorized Product',
        sku: 'CAT-PROD',
        price: '49.99',
        categories: [
          { id: 10, name: 'Clothing', slug: 'clothing' },
          { id: 11, name: 'Shoes', slug: 'shoes' },
        ],
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.categories).toEqual([1, 2]);
    });

    it('warns when categories cannot be mapped', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Unknown Category Product',
        sku: 'UNK-CAT',
        price: '19.99',
        categories: [
          { id: 99, name: 'Unknown Category', slug: 'unknown' },
        ],
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.categories).toEqual([]);
      expect(result.warnings.some(w => w.includes('none mapped'))).toBe(true);
    });

    it('sets is_visible to false for hidden products', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Hidden Product',
        sku: 'HIDDEN',
        price: '29.99',
        catalog_visibility: 'hidden',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.is_visible).toBe(false);
    });

    it('sets is_visible to false for draft products', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Draft Product',
        sku: 'DRAFT',
        price: '29.99',
        status: 'draft',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.is_visible).toBe(false);
    });

    it('transforms images correctly', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Product with Images',
        sku: 'IMAGES',
        price: '39.99',
        images: [
          { id: 1, src: 'https://img.com/main.jpg', name: 'Main', alt: 'Main image', position: 0 },
          { id: 2, src: 'https://img.com/alt.jpg', name: 'Alt', alt: 'Alt image', position: 1 },
        ],
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.images).toHaveLength(2);
      expect(result.product.images?.[0].is_thumbnail).toBe(true);
      expect(result.product.images?.[1].is_thumbnail).toBe(false);
    });

    it('handles sale price correctly', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Sale Product',
        sku: 'SALE',
        price: '19.99',
        regular_price: '29.99',
        sale_price: '19.99',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.price).toBe(19.99);
      expect(result.product.sale_price).toBe(19.99);
      expect(result.product.retail_price).toBe(29.99);
    });

    it('warns for physical products without weight', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'No Weight Product',
        sku: 'NO-WEIGHT',
        price: '9.99',
        weight: '',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.weight).toBe(1); // Default weight
      expect(result.warnings.some(w => w.includes('no weight'))).toBe(true);
    });

    it('handles inventory tracking correctly', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Tracked Product',
        sku: 'TRACKED',
        price: '24.99',
        manage_stock: true,
        stock_quantity: 100,
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.inventory_tracking).toBe('product');
      expect(result.product.inventory_level).toBe(100);
    });

    it('sets availability to disabled for out of stock', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Out of Stock Product',
        sku: 'OOS',
        price: '14.99',
        stock_status: 'outofstock',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.product.availability).toBe('disabled');
    });

    it('returns error for product without name', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: '',
        sku: 'NO-NAME',
        price: '9.99',
      });

      const result = transformSimpleProduct(wcProduct, categoryMap);

      expect(result.errors.some(e => e.includes('name is required'))).toBe(true);
    });
  });

  describe('transformVariableProduct', () => {
    it('transforms a variable product with variations', () => {
      const wcProduct = createVariableProduct({
        id: 1,
        name: 'Variable Product',
        sku: 'VAR-PROD',
        price: '29.99',
        attributes: [
          {
            id: 1,
            name: 'Size',
            slug: 'size',
            position: 0,
            visible: true,
            variation: true,
            options: ['S', 'M', 'L'],
          },
        ],
      });

      const variations: WCVariation[] = [
        createVariation(10, 'VAR-S', '29.99', [{ id: 1, name: 'Size', option: 'S' }]),
        createVariation(11, 'VAR-M', '29.99', [{ id: 1, name: 'Size', option: 'M' }]),
        createVariation(12, 'VAR-L', '34.99', [{ id: 1, name: 'Size', option: 'L' }]),
      ];

      const result = transformVariableProduct(wcProduct, variations, categoryMap);

      expect(result.product.options).toHaveLength(1);
      expect(result.product.variants).toHaveLength(3);
      expect(result.product.inventory_tracking).toBe('variant');
      expect(result.product.price).toBe(29.99); // Lowest variant price
      expect(result.errors).toHaveLength(0);
    });

    it('warns when no variation attributes defined', () => {
      const wcProduct = createVariableProduct({
        id: 1,
        name: 'Missing Attrs Product',
        sku: 'NO-ATTRS',
        price: '19.99',
        attributes: [], // No attributes
      });

      const variations: WCVariation[] = [
        createVariation(10, 'VAR-1', '19.99', []),
      ];

      const result = transformVariableProduct(wcProduct, variations, categoryMap);

      expect(result.warnings.some(w => w.includes('no variation attributes'))).toBe(true);
    });

    it('warns when no variations provided', () => {
      const wcProduct = createVariableProduct({
        id: 1,
        name: 'No Variations Product',
        sku: 'NO-VARS',
        price: '19.99',
        attributes: [
          {
            id: 1,
            name: 'Color',
            slug: 'color',
            position: 0,
            visible: true,
            variation: true,
            options: ['Red', 'Blue'],
          },
        ],
      });

      const result = transformVariableProduct(wcProduct, [], categoryMap);

      expect(result.warnings.some(w => w.includes('no variations'))).toBe(true);
    });
  });

  describe('transformProduct', () => {
    it('routes simple products to simple transformer', () => {
      const wcProduct = createSimpleProduct({
        id: 1,
        name: 'Simple Product',
        sku: 'SIMPLE',
        price: '19.99',
        type: 'simple',
      });

      const result = transformProduct(wcProduct, null, categoryMap);

      expect(result.product.variants).toBeUndefined();
      expect(result.product.options).toBeUndefined();
    });

    it('routes variable products to variable transformer', () => {
      const wcProduct = createVariableProduct({
        id: 1,
        name: 'Variable Product',
        sku: 'VARIABLE',
        price: '29.99',
        attributes: [
          {
            id: 1,
            name: 'Size',
            slug: 'size',
            position: 0,
            visible: true,
            variation: true,
            options: ['S', 'M'],
          },
        ],
      });

      const variations: WCVariation[] = [
        createVariation(10, 'VAR-S', '29.99', [{ id: 1, name: 'Size', option: 'S' }]),
        createVariation(11, 'VAR-M', '29.99', [{ id: 1, name: 'Size', option: 'M' }]),
      ];

      const result = transformProduct(wcProduct, variations, categoryMap);

      expect(result.product.variants).toHaveLength(2);
      expect(result.product.options).toHaveLength(1);
    });

    it('treats variable product with no variations as simple', () => {
      const wcProduct = createVariableProduct({
        id: 1,
        name: 'Empty Variable',
        sku: 'EMPTY-VAR',
        price: '19.99',
        attributes: [],
      });

      const result = transformProduct(wcProduct, [], categoryMap);

      // Should be treated as simple since no variations
      expect(result.product.variants).toBeUndefined();
    });
  });

  describe('transformProductBatch', () => {
    it('transforms multiple products', () => {
      const products: WCProduct[] = [
        createSimpleProduct({ id: 1, name: 'Product 1', sku: 'SKU-1', price: '19.99' }),
        createSimpleProduct({ id: 2, name: 'Product 2', sku: 'SKU-2', price: '29.99' }),
        createSimpleProduct({ id: 3, name: 'Product 3', sku: 'SKU-3', price: '39.99' }),
      ];

      const variationsMap = new Map<number, WCVariation[]>();

      const result = transformProductBatch(products, variationsMap, categoryMap);

      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
    });

    it('separates successful and failed products', () => {
      const products: WCProduct[] = [
        createSimpleProduct({ id: 1, name: 'Good Product', sku: 'GOOD', price: '19.99' }),
        createSimpleProduct({ id: 2, name: '', sku: 'BAD', price: '29.99' }), // Invalid - no name
      ];

      const variationsMap = new Map<number, WCVariation[]>();

      const result = transformProductBatch(products, variationsMap, categoryMap);

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].wcProduct.sku).toBe('BAD');
    });

    it('handles variable products with variations map', () => {
      const products: WCProduct[] = [
        createVariableProduct({
          id: 1,
          name: 'Variable',
          sku: 'VAR',
          price: '24.99',
          attributes: [
            { id: 1, name: 'Size', slug: 'size', position: 0, visible: true, variation: true, options: ['S', 'M'] },
          ],
        }),
      ];

      const variationsMap = new Map<number, WCVariation[]>([
        [1, [
          createVariation(10, 'VAR-S', '24.99', [{ id: 1, name: 'Size', option: 'S' }]),
          createVariation(11, 'VAR-M', '24.99', [{ id: 1, name: 'Size', option: 'M' }]),
        ]],
      ]);

      const result = transformProductBatch(products, variationsMap, categoryMap);

      expect(result.successful).toHaveLength(1);
      expect(result.successful[0].product.variants).toHaveLength(2);
    });

    it('collects all warnings', () => {
      const products: WCProduct[] = [
        createSimpleProduct({
          id: 1,
          name: 'No Weight',
          sku: 'NW1',
          price: '9.99',
          weight: '',
        }),
        createSimpleProduct({
          id: 2,
          name: 'No Weight 2',
          sku: 'NW2',
          price: '9.99',
          weight: '',
        }),
      ];

      const variationsMap = new Map<number, WCVariation[]>();

      const result = transformProductBatch(products, variationsMap, categoryMap);

      expect(result.totalWarnings.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// Helper functions to create test data

function createSimpleProduct(overrides: Partial<WCProduct> & { id: number; name: string; sku: string; price: string }): WCProduct {
  return {
    id: overrides.id,
    name: overrides.name,
    slug: overrides.slug ?? overrides.name.toLowerCase().replace(/\s+/g, '-'),
    permalink: `https://store.com/${overrides.slug ?? 'product'}`,
    date_created: '2024-01-01T00:00:00',
    date_modified: '2024-01-01T00:00:00',
    type: overrides.type ?? 'simple',
    status: overrides.status ?? 'publish',
    featured: overrides.featured ?? false,
    catalog_visibility: overrides.catalog_visibility ?? 'visible',
    description: overrides.description ?? '',
    short_description: overrides.short_description ?? '',
    sku: overrides.sku,
    price: overrides.price,
    regular_price: overrides.regular_price ?? overrides.price,
    sale_price: overrides.sale_price ?? '',
    date_on_sale_from: null,
    date_on_sale_to: null,
    on_sale: !!overrides.sale_price,
    purchasable: true,
    total_sales: 0,
    virtual: overrides.virtual ?? false,
    downloadable: overrides.downloadable ?? false,
    downloads: [],
    download_limit: -1,
    download_expiry: -1,
    external_url: '',
    button_text: '',
    tax_status: 'taxable',
    tax_class: '',
    manage_stock: overrides.manage_stock ?? false,
    stock_quantity: overrides.stock_quantity ?? null,
    stock_status: overrides.stock_status ?? 'instock',
    backorders: 'no',
    backorders_allowed: false,
    backordered: false,
    low_stock_amount: null,
    sold_individually: false,
    weight: overrides.weight ?? '1',
    dimensions: overrides.dimensions ?? { length: '', width: '', height: '' },
    shipping_required: overrides.shipping_required ?? true,
    shipping_taxable: true,
    shipping_class: '',
    shipping_class_id: 0,
    reviews_allowed: true,
    average_rating: '0',
    rating_count: 0,
    related_ids: [],
    upsell_ids: [],
    cross_sell_ids: [],
    parent_id: 0,
    purchase_note: '',
    categories: overrides.categories ?? [],
    tags: [],
    images: overrides.images ?? [],
    attributes: overrides.attributes ?? [],
    default_attributes: [],
    variations: [],
    grouped_products: [],
    menu_order: 0,
    meta_data: [],
  };
}

function createVariableProduct(overrides: Partial<WCProduct> & { id: number; name: string; sku: string; price: string }): WCProduct {
  return createSimpleProduct({
    ...overrides,
    type: 'variable',
  });
}

function createVariation(
  id: number,
  sku: string,
  price: string,
  attributes: { id: number; name: string; option: string }[]
): WCVariation {
  return {
    id,
    date_created: '',
    date_modified: '',
    description: '',
    permalink: '',
    sku,
    price,
    regular_price: price,
    sale_price: '',
    date_on_sale_from: null,
    date_on_sale_to: null,
    on_sale: false,
    status: 'publish',
    purchasable: true,
    virtual: false,
    downloadable: false,
    downloads: [],
    download_limit: -1,
    download_expiry: -1,
    tax_status: 'taxable',
    tax_class: '',
    manage_stock: false,
    stock_quantity: null,
    stock_status: 'instock',
    backorders: 'no',
    backorders_allowed: false,
    backordered: false,
    low_stock_amount: null,
    weight: '1',
    dimensions: { length: '', width: '', height: '' },
    shipping_class: '',
    shipping_class_id: 0,
    image: null,
    attributes,
    menu_order: 0,
    meta_data: [],
  };
}
