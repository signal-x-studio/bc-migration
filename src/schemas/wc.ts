/**
 * WooCommerce API Response Schemas (Zod)
 * Validates incoming data from WC REST API v3
 */

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const wcImageSchema = z.object({
  id: z.number(),
  src: z.string().url(),
  name: z.string(),
  alt: z.string(),
  position: z.number(),
});

export const wcDimensionsSchema = z.object({
  length: z.string(),
  width: z.string(),
  height: z.string(),
});

export const wcMetaDataSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.unknown(),
});

export const wcDownloadSchema = z.object({
  id: z.string(),
  name: z.string(),
  file: z.string(),
});

// ============================================
// Category Schema
// ============================================

export const wcCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  parent: z.number(),
  description: z.string(),
  display: z.string(),
  image: wcImageSchema.nullable(),
  menu_order: z.number(),
  count: z.number(),
});

export const wcCategoryListSchema = z.array(wcCategorySchema);

// ============================================
// Attribute Schema
// ============================================

export const wcAttributeSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  position: z.number(),
  visible: z.boolean(),
  variation: z.boolean(),
  options: z.array(z.string()),
});

// ============================================
// Product Schema
// ============================================

export const wcProductTypeSchema = z.enum(['simple', 'variable', 'grouped', 'external']);
export const wcProductStatusSchema = z.enum(['draft', 'pending', 'private', 'publish']);
export const wcStockStatusSchema = z.enum(['instock', 'outofstock', 'onbackorder']);
export const wcTaxStatusSchema = z.enum(['taxable', 'shipping', 'none']);
export const wcBackordersSchema = z.enum(['no', 'notify', 'yes']);
export const wcCatalogVisibilitySchema = z.enum(['visible', 'catalog', 'search', 'hidden']);

export const wcProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  permalink: z.string(),
  date_created: z.string(),
  date_modified: z.string(),
  type: wcProductTypeSchema,
  status: wcProductStatusSchema,
  featured: z.boolean(),
  catalog_visibility: wcCatalogVisibilitySchema,
  description: z.string(),
  short_description: z.string(),
  sku: z.string(),
  price: z.string(),
  regular_price: z.string(),
  sale_price: z.string(),
  date_on_sale_from: z.string().nullable(),
  date_on_sale_to: z.string().nullable(),
  on_sale: z.boolean(),
  purchasable: z.boolean(),
  total_sales: z.number(),
  virtual: z.boolean(),
  downloadable: z.boolean(),
  downloads: z.array(wcDownloadSchema),
  download_limit: z.number(),
  download_expiry: z.number(),
  external_url: z.string(),
  button_text: z.string(),
  tax_status: wcTaxStatusSchema,
  tax_class: z.string(),
  manage_stock: z.boolean(),
  stock_quantity: z.number().nullable(),
  stock_status: wcStockStatusSchema,
  backorders: wcBackordersSchema,
  backorders_allowed: z.boolean(),
  backordered: z.boolean(),
  low_stock_amount: z.number().nullable(),
  sold_individually: z.boolean(),
  weight: z.string(),
  dimensions: wcDimensionsSchema,
  shipping_required: z.boolean(),
  shipping_taxable: z.boolean(),
  shipping_class: z.string(),
  shipping_class_id: z.number(),
  reviews_allowed: z.boolean(),
  average_rating: z.string(),
  rating_count: z.number(),
  related_ids: z.array(z.number()),
  upsell_ids: z.array(z.number()),
  cross_sell_ids: z.array(z.number()),
  parent_id: z.number(),
  purchase_note: z.string(),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })),
  tags: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })),
  images: z.array(wcImageSchema),
  attributes: z.array(wcAttributeSchema),
  default_attributes: z.array(z.object({
    id: z.number(),
    name: z.string(),
    option: z.string(),
  })),
  variations: z.array(z.number()),
  grouped_products: z.array(z.number()),
  menu_order: z.number(),
  meta_data: z.array(wcMetaDataSchema),
});

export const wcProductListSchema = z.array(wcProductSchema);

// ============================================
// Variation Schema
// ============================================

export const wcVariationSchema = z.object({
  id: z.number(),
  date_created: z.string(),
  date_modified: z.string(),
  description: z.string(),
  permalink: z.string(),
  sku: z.string(),
  price: z.string(),
  regular_price: z.string(),
  sale_price: z.string(),
  date_on_sale_from: z.string().nullable(),
  date_on_sale_to: z.string().nullable(),
  on_sale: z.boolean(),
  status: wcProductStatusSchema,
  purchasable: z.boolean(),
  virtual: z.boolean(),
  downloadable: z.boolean(),
  downloads: z.array(wcDownloadSchema),
  download_limit: z.number(),
  download_expiry: z.number(),
  tax_status: wcTaxStatusSchema,
  tax_class: z.string(),
  manage_stock: z.union([z.boolean(), z.literal('parent')]),
  stock_quantity: z.number().nullable(),
  stock_status: wcStockStatusSchema,
  backorders: wcBackordersSchema,
  backorders_allowed: z.boolean(),
  backordered: z.boolean(),
  low_stock_amount: z.number().nullable(),
  weight: z.string(),
  dimensions: wcDimensionsSchema,
  shipping_class: z.string(),
  shipping_class_id: z.number(),
  image: wcImageSchema.nullable(),
  attributes: z.array(z.object({
    id: z.number(),
    name: z.string(),
    option: z.string(),
  })),
  menu_order: z.number(),
  meta_data: z.array(wcMetaDataSchema),
});

export const wcVariationListSchema = z.array(wcVariationSchema);

// ============================================
// Address Schema
// ============================================

export const wcAddressSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  company: z.string(),
  address_1: z.string(),
  address_2: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
  country: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

// ============================================
// Customer Schema
// ============================================

export const wcCustomerSchema = z.object({
  id: z.number(),
  date_created: z.string(),
  date_modified: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string(),
  username: z.string(),
  billing: wcAddressSchema,
  shipping: wcAddressSchema.omit({ email: true, phone: true }),
  is_paying_customer: z.boolean(),
  avatar_url: z.string(),
  meta_data: z.array(wcMetaDataSchema),
});

export const wcCustomerListSchema = z.array(wcCustomerSchema);

// ============================================
// Order Schema
// ============================================

export const wcOrderStatusSchema = z.enum([
  'pending',
  'processing',
  'on-hold',
  'completed',
  'cancelled',
  'refunded',
  'failed',
  'trash',
]);

export const wcOrderLineItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  product_id: z.number(),
  variation_id: z.number(),
  quantity: z.number(),
  tax_class: z.string(),
  subtotal: z.string(),
  subtotal_tax: z.string(),
  total: z.string(),
  total_tax: z.string(),
  taxes: z.array(z.object({
    id: z.number(),
    total: z.string(),
    subtotal: z.string(),
  })),
  meta_data: z.array(wcMetaDataSchema),
  sku: z.string(),
  price: z.number(),
  parent_name: z.string().nullable(),
});

export const wcOrderSchema = z.object({
  id: z.number(),
  parent_id: z.number(),
  status: wcOrderStatusSchema,
  currency: z.string(),
  version: z.string(),
  prices_include_tax: z.boolean(),
  date_created: z.string(),
  date_modified: z.string(),
  discount_total: z.string(),
  discount_tax: z.string(),
  shipping_total: z.string(),
  shipping_tax: z.string(),
  cart_tax: z.string(),
  total: z.string(),
  total_tax: z.string(),
  customer_id: z.number(),
  order_key: z.string(),
  billing: wcAddressSchema,
  shipping: wcAddressSchema.omit({ email: true, phone: true }),
  payment_method: z.string(),
  payment_method_title: z.string(),
  transaction_id: z.string(),
  customer_ip_address: z.string(),
  customer_user_agent: z.string(),
  created_via: z.string(),
  customer_note: z.string(),
  date_completed: z.string().nullable(),
  date_paid: z.string().nullable(),
  cart_hash: z.string(),
  number: z.string(),
  meta_data: z.array(wcMetaDataSchema),
  line_items: z.array(wcOrderLineItemSchema),
});

export const wcOrderListSchema = z.array(wcOrderSchema);

// ============================================
// Validation Helper
// ============================================

import { ValidationError } from '../lib/errors.js';

/**
 * Validate data against a schema and throw ValidationError on failure
 */
export function validateWCResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new ValidationError(
      `Invalid WC response for ${context}: ${errors.join(', ')}`,
      context,
      data,
      { errors }
    );
  }
  return result.data;
}

/**
 * Validate data against a schema, returning null on failure (soft validation)
 */
export function validateWCResponseSoft<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

// Export types inferred from schemas
export type WCProductParsed = z.infer<typeof wcProductSchema>;
export type WCVariationParsed = z.infer<typeof wcVariationSchema>;
export type WCCategoryParsed = z.infer<typeof wcCategorySchema>;
export type WCCustomerParsed = z.infer<typeof wcCustomerSchema>;
export type WCOrderParsed = z.infer<typeof wcOrderSchema>;
