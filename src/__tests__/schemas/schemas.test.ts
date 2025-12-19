import { describe, it, expect } from 'vitest';
import {
  wcProductSchema,
  wcCategorySchema,
  wcCustomerSchema,
  wcVariationSchema,
  validateWCResponse,
  validateWCResponseSoft,
  bcProductCreateSchema,
  bcCategoryCreateSchema,
  bcCustomerCreateSchema,
  validateBCPayload,
  validateBCPayloadSoft,
  getBCValidationErrors,
} from '../../schemas/index.js';
import { ValidationError } from '../../lib/errors.js';

describe('WooCommerce Schemas', () => {
  describe('wcCategorySchema', () => {
    it('validates a valid category', () => {
      const category = {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
        parent: 0,
        description: 'Electronic devices',
        display: 'default',
        image: null,
        menu_order: 0,
        count: 10,
      };

      const result = wcCategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it('rejects category with missing required fields', () => {
      const category = {
        id: 1,
        name: 'Electronics',
      };

      const result = wcCategorySchema.safeParse(category);
      expect(result.success).toBe(false);
    });
  });

  describe('wcProductSchema', () => {
    const validProduct = {
      id: 1,
      name: 'Test Product',
      slug: 'test-product',
      permalink: 'https://store.com/test-product',
      date_created: '2024-01-01T00:00:00',
      date_modified: '2024-01-01T00:00:00',
      type: 'simple',
      status: 'publish',
      featured: false,
      catalog_visibility: 'visible',
      description: 'A test product',
      short_description: 'Test',
      sku: 'TEST-SKU',
      price: '29.99',
      regular_price: '29.99',
      sale_price: '',
      date_on_sale_from: null,
      date_on_sale_to: null,
      on_sale: false,
      purchasable: true,
      total_sales: 0,
      virtual: false,
      downloadable: false,
      downloads: [],
      download_limit: -1,
      download_expiry: -1,
      external_url: '',
      button_text: '',
      tax_status: 'taxable',
      tax_class: '',
      manage_stock: false,
      stock_quantity: null,
      stock_status: 'instock',
      backorders: 'no',
      backorders_allowed: false,
      backordered: false,
      low_stock_amount: null,
      sold_individually: false,
      weight: '1',
      dimensions: { length: '', width: '', height: '' },
      shipping_required: true,
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
      categories: [],
      tags: [],
      images: [],
      attributes: [],
      default_attributes: [],
      variations: [],
      grouped_products: [],
      menu_order: 0,
      meta_data: [],
    };

    it('validates a valid simple product', () => {
      const result = wcProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('validates a variable product type', () => {
      const variableProduct = { ...validProduct, type: 'variable' };
      const result = wcProductSchema.safeParse(variableProduct);
      expect(result.success).toBe(true);
    });

    it('rejects invalid product type', () => {
      const invalidProduct = { ...validProduct, type: 'invalid' };
      const result = wcProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('rejects invalid stock status', () => {
      const invalidProduct = { ...validProduct, stock_status: 'invalid' };
      const result = wcProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });
  });

  describe('validateWCResponse', () => {
    it('returns data on valid input', () => {
      const category = {
        id: 1,
        name: 'Test',
        slug: 'test',
        parent: 0,
        description: '',
        display: 'default',
        image: null,
        menu_order: 0,
        count: 0,
      };

      const result = validateWCResponse(wcCategorySchema, category, 'test category');
      expect(result.name).toBe('Test');
    });

    it('throws ValidationError on invalid input', () => {
      const invalid = { id: 1 };

      expect(() => {
        validateWCResponse(wcCategorySchema, invalid, 'test');
      }).toThrow(ValidationError);
    });
  });

  describe('validateWCResponseSoft', () => {
    it('returns data on valid input', () => {
      const category = {
        id: 1,
        name: 'Test',
        slug: 'test',
        parent: 0,
        description: '',
        display: 'default',
        image: null,
        menu_order: 0,
        count: 0,
      };

      const result = validateWCResponseSoft(wcCategorySchema, category);
      expect(result?.name).toBe('Test');
    });

    it('returns null on invalid input', () => {
      const invalid = { id: 1 };
      const result = validateWCResponseSoft(wcCategorySchema, invalid);
      expect(result).toBeNull();
    });
  });
});

describe('BigCommerce Schemas', () => {
  describe('bcCategoryCreateSchema', () => {
    it('validates a valid category', () => {
      const category = {
        name: 'Electronics',
        parent_id: 0,
        description: 'Electronic devices',
        is_visible: true,
      };

      const result = bcCategoryCreateSchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const category = {
        name: '',
        parent_id: 0,
      };

      const result = bcCategoryCreateSchema.safeParse(category);
      expect(result.success).toBe(false);
    });

    it('rejects negative parent_id', () => {
      const category = {
        name: 'Test',
        parent_id: -1,
      };

      const result = bcCategoryCreateSchema.safeParse(category);
      expect(result.success).toBe(false);
    });
  });

  describe('bcProductCreateSchema', () => {
    const validProduct = {
      name: 'Test Product',
      type: 'physical',
      sku: 'TEST-SKU',
      description: 'A test product',
      weight: 1,
      price: 29.99,
      categories: [1, 2],
      inventory_tracking: 'none',
      is_visible: true,
    };

    it('validates a valid product', () => {
      const result = bcProductCreateSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('validates product with variants', () => {
      const productWithVariants = {
        ...validProduct,
        inventory_tracking: 'variant',
        options: [{
          display_name: 'Size',
          type: 'dropdown',
          option_values: [
            { label: 'Small' },
            { label: 'Medium' },
            { label: 'Large' },
          ],
        }],
        variants: [{
          sku: 'TEST-S',
          price: 29.99,
          option_values: [{ label: 'Small', option_id: 0 }],
        }],
      };

      const result = bcProductCreateSchema.safeParse(productWithVariants);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalid = { ...validProduct, name: '' };
      const result = bcProductCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects negative weight', () => {
      const invalid = { ...validProduct, weight: -1 };
      const result = bcProductCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects negative price', () => {
      const invalid = { ...validProduct, price: -10 };
      const result = bcProductCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid product type', () => {
      const invalid = { ...validProduct, type: 'virtual' };
      const result = bcProductCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects more than 600 variants', () => {
      const tooManyVariants = Array.from({ length: 601 }, (_, i) => ({
        sku: `SKU-${i}`,
        option_values: [{ label: 'Test', option_id: 0 }],
      }));

      const invalid = { ...validProduct, variants: tooManyVariants };
      const result = bcProductCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('bcCustomerCreateSchema', () => {
    it('validates a valid customer', () => {
      const customer = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-1234',
        authentication: {
          force_password_reset: true,
        },
      };

      const result = bcCustomerCreateSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('validates customer with addresses', () => {
      const customer = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        addresses: [{
          first_name: 'John',
          last_name: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state_or_province: 'NY',
          postal_code: '10001',
          country_code: 'US',
        }],
      };

      const result = bcCustomerCreateSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const customer = {
        email: 'invalid-email',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = bcCustomerCreateSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('rejects invalid country code', () => {
      const customer = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        addresses: [{
          first_name: 'John',
          last_name: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state_or_province: 'NY',
          postal_code: '10001',
          country_code: 'USA', // Should be 2 characters
        }],
      };

      const result = bcCustomerCreateSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });
  });

  describe('validateBCPayload', () => {
    it('returns data on valid input', () => {
      const category = { name: 'Test', parent_id: 0 };
      const result = validateBCPayload(bcCategoryCreateSchema, category, 'category');
      expect(result.name).toBe('Test');
    });

    it('throws ValidationError on invalid input', () => {
      const invalid = { name: '', parent_id: 0 };
      expect(() => {
        validateBCPayload(bcCategoryCreateSchema, invalid, 'category');
      }).toThrow(ValidationError);
    });
  });

  describe('getBCValidationErrors', () => {
    it('returns empty array for valid data', () => {
      const category = { name: 'Test', parent_id: 0 };
      const errors = getBCValidationErrors(bcCategoryCreateSchema, category);
      expect(errors).toHaveLength(0);
    });

    it('returns error messages for invalid data', () => {
      const invalid = { name: '', parent_id: -1 };
      const errors = getBCValidationErrors(bcCategoryCreateSchema, invalid);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('name'))).toBe(true);
    });
  });
});
