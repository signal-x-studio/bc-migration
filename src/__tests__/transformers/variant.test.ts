import { describe, it, expect } from 'vitest';
import {
  transformAttributesToOptions,
  transformVariation,
  transformVariations,
  isVariableProduct,
} from '../../migration/transformers/variant.js';
import type { WCAttribute, WCVariation } from '../../types/wc.js';

describe('variant transformer', () => {
  describe('isVariableProduct', () => {
    it('returns true for variable product type', () => {
      expect(isVariableProduct('variable')).toBe(true);
    });

    it('returns false for simple product type', () => {
      expect(isVariableProduct('simple')).toBe(false);
    });

    it('returns false for grouped product type', () => {
      expect(isVariableProduct('grouped')).toBe(false);
    });
  });

  describe('transformAttributesToOptions', () => {
    it('transforms variation attributes to BC options', () => {
      const wcAttributes: WCAttribute[] = [
        {
          id: 1,
          name: 'Color',
          slug: 'color',
          position: 0,
          visible: true,
          variation: true,
          options: ['Red', 'Blue', 'Green'],
        },
        {
          id: 2,
          name: 'Size',
          slug: 'size',
          position: 1,
          visible: true,
          variation: true,
          options: ['Small', 'Medium', 'Large'],
        },
      ];

      const { options, valueMap } = transformAttributesToOptions(wcAttributes);

      expect(options).toHaveLength(2);

      // Color option
      expect(options[0].display_name).toBe('Color');
      expect(options[0].type).toBe('swatch'); // Color -> swatch
      expect(options[0].option_values).toHaveLength(3);
      expect(options[0].option_values[0].label).toBe('Red');

      // Size option
      expect(options[1].display_name).toBe('Size');
      expect(options[1].type).toBe('rectangles'); // Size -> rectangles
      expect(options[1].option_values).toHaveLength(3);

      // Value map should be populated
      expect(valueMap['color']).toBeDefined();
      expect(valueMap['color'].values['red']).toBe(0);
      expect(valueMap['color'].values['blue']).toBe(1);
      expect(valueMap['size']).toBeDefined();
    });

    it('filters out non-variation attributes', () => {
      const wcAttributes: WCAttribute[] = [
        {
          id: 1,
          name: 'Material',
          slug: 'material',
          position: 0,
          visible: true,
          variation: false, // Not a variation attribute
          options: ['Cotton', 'Polyester'],
        },
        {
          id: 2,
          name: 'Size',
          slug: 'size',
          position: 1,
          visible: true,
          variation: true,
          options: ['S', 'M', 'L'],
        },
      ];

      const { options } = transformAttributesToOptions(wcAttributes);

      expect(options).toHaveLength(1);
      expect(options[0].display_name).toBe('Size');
    });

    it('uses dropdown for generic attributes', () => {
      const wcAttributes: WCAttribute[] = [
        {
          id: 1,
          name: 'Style',
          slug: 'style',
          position: 0,
          visible: true,
          variation: true,
          options: ['Modern', 'Classic', 'Vintage'],
        },
      ];

      const { options } = transformAttributesToOptions(wcAttributes);

      expect(options[0].type).toBe('dropdown');
    });
  });

  describe('transformVariation', () => {
    const valueMap = {
      color: { optionIndex: 0, values: { red: 0, blue: 1, green: 2 } },
      size: { optionIndex: 1, values: { small: 0, medium: 1, large: 2 } },
    };

    it('transforms a WC variation to BC variant', () => {
      const wcVariation: WCVariation = {
        id: 100,
        date_created: '2024-01-01',
        date_modified: '2024-01-02',
        description: 'Red small variant',
        permalink: 'https://store.com/product-100',
        sku: 'PROD-RED-S',
        price: '29.99',
        regular_price: '39.99',
        sale_price: '29.99',
        date_on_sale_from: null,
        date_on_sale_to: null,
        on_sale: true,
        status: 'publish',
        purchasable: true,
        virtual: false,
        downloadable: false,
        downloads: [],
        download_limit: -1,
        download_expiry: -1,
        tax_status: 'taxable',
        tax_class: '',
        manage_stock: true,
        stock_quantity: 50,
        stock_status: 'instock',
        backorders: 'no',
        backorders_allowed: false,
        backordered: false,
        low_stock_amount: null,
        weight: '0.5',
        dimensions: { length: '10', width: '5', height: '2' },
        shipping_class: '',
        shipping_class_id: 0,
        image: { id: 1, src: 'https://img.com/red-small.jpg', name: 'Red Small', alt: '', position: 0 },
        attributes: [
          { id: 1, name: 'Color', option: 'Red' },
          { id: 2, name: 'Size', option: 'Small' },
        ],
        menu_order: 0,
        meta_data: [],
      };

      const { variant, warnings } = transformVariation(wcVariation, valueMap, 'PARENT-SKU');

      expect(variant.sku).toBe('PROD-RED-S');
      expect(variant.price).toBe(29.99);
      expect(variant.sale_price).toBe(29.99);
      expect(variant.weight).toBe(0.5);
      expect(variant.inventory_level).toBe(50);
      expect(variant.purchasing_disabled).toBe(false);
      expect(variant.image_url).toBe('https://img.com/red-small.jpg');
      expect(variant.option_values).toHaveLength(2);
      expect(warnings).toHaveLength(0);
    });

    it('generates SKU from parent if variation has no SKU', () => {
      const wcVariation: WCVariation = {
        id: 101,
        date_created: '',
        date_modified: '',
        description: '',
        permalink: '',
        sku: '', // Empty SKU
        price: '19.99',
        regular_price: '19.99',
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
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        shipping_class: '',
        shipping_class_id: 0,
        image: null,
        attributes: [{ id: 1, name: 'Color', option: 'Blue' }],
        menu_order: 0,
        meta_data: [],
      };

      const { variant } = transformVariation(wcVariation, valueMap, 'PARENT-SKU');

      expect(variant.sku).toBe('PARENT-SKU-var-101');
    });

    it('sets purchasing_disabled for out of stock variants', () => {
      const wcVariation: WCVariation = {
        id: 102,
        date_created: '',
        date_modified: '',
        description: '',
        permalink: '',
        sku: 'OUT-OF-STOCK',
        price: '19.99',
        regular_price: '19.99',
        sale_price: '',
        date_on_sale_from: null,
        date_on_sale_to: null,
        on_sale: false,
        status: 'publish',
        purchasable: false,
        virtual: false,
        downloadable: false,
        downloads: [],
        download_limit: -1,
        download_expiry: -1,
        tax_status: 'taxable',
        tax_class: '',
        manage_stock: true,
        stock_quantity: 0,
        stock_status: 'outofstock',
        backorders: 'no',
        backorders_allowed: false,
        backordered: false,
        low_stock_amount: null,
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        shipping_class: '',
        shipping_class_id: 0,
        image: null,
        attributes: [],
        menu_order: 0,
        meta_data: [],
      };

      const { variant } = transformVariation(wcVariation, valueMap, 'PARENT');

      expect(variant.purchasing_disabled).toBe(true);
      expect(variant.purchasing_disabled_message).toContain('out of stock');
    });

    it('warns when attribute not found in value map', () => {
      const wcVariation: WCVariation = {
        id: 103,
        date_created: '',
        date_modified: '',
        description: '',
        permalink: '',
        sku: 'UNKNOWN-ATTR',
        price: '19.99',
        regular_price: '19.99',
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
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        shipping_class: '',
        shipping_class_id: 0,
        image: null,
        attributes: [{ id: 99, name: 'Unknown Attribute', option: 'Value' }],
        menu_order: 0,
        meta_data: [],
      };

      const { warnings } = transformVariation(wcVariation, valueMap, 'PARENT');

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('not found');
    });
  });

  describe('transformVariations', () => {
    it('transforms multiple variations with attributes', () => {
      const wcAttributes: WCAttribute[] = [
        {
          id: 1,
          name: 'Size',
          slug: 'size',
          position: 0,
          visible: true,
          variation: true,
          options: ['S', 'M', 'L'],
        },
      ];

      const wcVariations: WCVariation[] = [
        createVariation(1, 'SKU-S', '19.99', [{ id: 1, name: 'Size', option: 'S' }]),
        createVariation(2, 'SKU-M', '19.99', [{ id: 1, name: 'Size', option: 'M' }]),
        createVariation(3, 'SKU-L', '21.99', [{ id: 1, name: 'Size', option: 'L' }]),
      ];

      const result = transformVariations(wcVariations, wcAttributes, 'PARENT');

      expect(result.options).toHaveLength(1);
      expect(result.variants).toHaveLength(3);
      expect(result.variants[0].sku).toBe('SKU-S');
      expect(result.variants[2].price).toBe(21.99);
    });

    it('warns when exceeding BC variant limit', () => {
      const wcAttributes: WCAttribute[] = [
        {
          id: 1,
          name: 'Option',
          slug: 'option',
          position: 0,
          visible: true,
          variation: true,
          options: Array.from({ length: 700 }, (_, i) => `Value${i}`),
        },
      ];

      // Create 700 variations (exceeds 600 limit)
      const wcVariations: WCVariation[] = Array.from({ length: 700 }, (_, i) =>
        createVariation(i + 1, `SKU-${i}`, '9.99', [{ id: 1, name: 'Option', option: `Value${i}` }])
      );

      const result = transformVariations(wcVariations, wcAttributes, 'PARENT');

      // Should only include 600 variants
      expect(result.variants).toHaveLength(600);
      // Should have a warning about the limit
      expect(result.warnings.some(w => w.includes('600'))).toBe(true);
    });

    it('warns when no variation attributes found', () => {
      const wcAttributes: WCAttribute[] = [
        {
          id: 1,
          name: 'Material',
          slug: 'material',
          position: 0,
          visible: true,
          variation: false, // Not a variation attribute
          options: ['Cotton'],
        },
      ];

      const wcVariations: WCVariation[] = [
        createVariation(1, 'SKU-1', '19.99', []),
      ];

      const result = transformVariations(wcVariations, wcAttributes, 'PARENT');

      expect(result.options).toHaveLength(0);
      expect(result.warnings.some(w => w.includes('No variation attributes'))).toBe(true);
    });
  });
});

// Helper to create a minimal WCVariation for testing
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
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    shipping_class: '',
    shipping_class_id: 0,
    image: null,
    attributes,
    menu_order: 0,
    meta_data: [],
  };
}
