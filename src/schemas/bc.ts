/**
 * BigCommerce API Payload Schemas (Zod)
 * Validates outgoing data to BC REST API v3
 */

import { z } from 'zod';
import { ValidationError } from '../lib/errors.js';

// ============================================
// Common Schemas
// ============================================

export const bcImageSchema = z.object({
  image_url: z.string().url(),
  is_thumbnail: z.boolean(),
  sort_order: z.number().optional(),
  description: z.string().optional(),
});

export const bcCustomUrlSchema = z.object({
  url: z.string(),
  is_customized: z.boolean(),
});

// ============================================
// Category Schema
// ============================================

export const bcCategoryCreateSchema = z.object({
  name: z.string().min(1).max(255),
  parent_id: z.number().int().min(0),
  description: z.string().optional(),
  views: z.number().optional(),
  sort_order: z.number().optional(),
  page_title: z.string().max(255).optional(),
  meta_keywords: z.array(z.string()).optional(),
  meta_description: z.string().max(65535).optional(),
  layout_file: z.string().optional(),
  image_url: z.string().url().optional(),
  is_visible: z.boolean().optional(),
  search_keywords: z.string().optional(),
  default_product_sort: z.enum([
    'use_store_settings',
    'featured',
    'newest',
    'best_selling',
    'alpha_asc',
    'alpha_desc',
    'avg_customer_review',
    'price_asc',
    'price_desc',
  ]).optional(),
  custom_url: bcCustomUrlSchema.optional(),
});

// ============================================
// Option & Variant Schemas
// ============================================

export const bcOptionValueSchema = z.object({
  label: z.string().min(1),
  sort_order: z.number().optional(),
  value_data: z.object({
    colors: z.array(z.string()).optional(),
    image_url: z.string().url().optional(),
  }).nullable().optional(),
  is_default: z.boolean().optional(),
});

export const bcOptionSchema = z.object({
  display_name: z.string().min(1).max(255),
  type: z.enum(['radio_buttons', 'rectangles', 'dropdown', 'product_list', 'product_list_with_images', 'swatch']),
  sort_order: z.number().optional(),
  option_values: z.array(bcOptionValueSchema).min(1),
});

export const bcVariantSchema = z.object({
  sku: z.string().min(1).max(255),
  price: z.number().nullable().optional(),
  sale_price: z.number().nullable().optional(),
  retail_price: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  depth: z.number().nullable().optional(),
  is_free_shipping: z.boolean().optional(),
  purchasing_disabled: z.boolean().optional(),
  purchasing_disabled_message: z.string().max(255).optional(),
  image_url: z.string().url().optional(),
  inventory_level: z.number().int().optional(),
  inventory_warning_level: z.number().int().optional(),
  option_values: z.array(z.object({
    option_display_name: z.string().optional(),
    label: z.string(),
    option_id: z.number().int(),
  })),
});

// ============================================
// Product Schema
// ============================================

export const bcProductTypeSchema = z.enum(['physical', 'digital']);
export const bcInventoryTrackingSchema = z.enum(['none', 'product', 'variant']);
export const bcAvailabilitySchema = z.enum(['available', 'disabled', 'preorder']);
export const bcConditionSchema = z.enum(['New', 'Used', 'Refurbished']);

export const bcProductCreateSchema = z.object({
  name: z.string().min(1).max(255),
  type: bcProductTypeSchema,
  sku: z.string().min(1).max(255),
  description: z.string().optional(),
  weight: z.number().min(0),
  width: z.number().optional(),
  depth: z.number().optional(),
  height: z.number().optional(),
  price: z.number().min(0),
  cost_price: z.number().optional(),
  retail_price: z.number().optional(),
  sale_price: z.number().optional(),
  categories: z.array(z.number().int()),
  brand_id: z.number().int().optional(),
  inventory_level: z.number().int().optional(),
  inventory_warning_level: z.number().int().optional(),
  inventory_tracking: bcInventoryTrackingSchema,
  is_visible: z.boolean(),
  is_featured: z.boolean().optional(),
  warranty: z.string().optional(),
  bin_picking_number: z.string().optional(),
  upc: z.string().optional(),
  mpn: z.string().optional(),
  gtin: z.string().optional(),
  search_keywords: z.string().optional(),
  availability: bcAvailabilitySchema.optional(),
  availability_description: z.string().optional(),
  sort_order: z.number().int().optional(),
  condition: bcConditionSchema.optional(),
  is_condition_shown: z.boolean().optional(),
  page_title: z.string().max(255).optional(),
  meta_keywords: z.array(z.string()).optional(),
  meta_description: z.string().max(65535).optional(),
  custom_url: bcCustomUrlSchema.optional(),
  images: z.array(bcImageSchema).optional(),
  variants: z.array(bcVariantSchema).max(600).optional(),
  options: z.array(bcOptionSchema).optional(),
});

// ============================================
// Address Schema
// ============================================

export const bcAddressSchema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  company: z.string().max(255).optional(),
  address1: z.string().min(1).max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1).max(255),
  state_or_province: z.string().max(255),
  postal_code: z.string().max(30),
  country_code: z.string().length(2),
  phone: z.string().max(50).optional(),
  address_type: z.enum(['residential', 'commercial']).optional(),
});

// ============================================
// Customer Schema
// ============================================

export const bcCustomerCreateSchema = z.object({
  email: z.string().email().max(255),
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  notes: z.string().optional(),
  tax_exempt_category: z.string().optional(),
  customer_group_id: z.number().int().optional(),
  addresses: z.array(bcAddressSchema).optional(),
  authentication: z.object({
    force_password_reset: z.boolean(),
    new_password: z.string().min(8).optional(),
  }).optional(),
  accepts_product_review_abandoned_cart_emails: z.boolean().optional(),
});

// ============================================
// Order Schema
// ============================================

export const bcOrderStatusIdSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
  z.literal(13),
  z.literal(14),
]);

export const bcOrderProductSchema = z.object({
  product_id: z.number().int(),
  quantity: z.number().int().min(1),
  price_inc_tax: z.number().optional(),
  price_ex_tax: z.number().optional(),
});

export const bcOrderCustomProductSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  price_inc_tax: z.number(),
  price_ex_tax: z.number(),
  sku: z.string().optional(),
});

export const bcOrderCreateSchema = z.object({
  customer_id: z.number().int().min(0),
  status_id: bcOrderStatusIdSchema,
  billing_address: bcAddressSchema.extend({
    email: z.string().email().optional(),
  }),
  shipping_addresses: z.array(bcAddressSchema.extend({
    shipping_method: z.string().optional(),
  })).optional(),
  products: z.array(z.union([bcOrderProductSchema, bcOrderCustomProductSchema])),
  staff_notes: z.string().optional(),
  customer_message: z.string().optional(),
  discount_amount: z.string().optional(),
  external_source: z.string().optional(),
  external_id: z.string().optional(),
});

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate payload against a schema and throw ValidationError on failure
 */
export function validateBCPayload<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new ValidationError(
      `Invalid BC payload for ${context}: ${errors.join(', ')}`,
      context,
      data,
      { errors }
    );
  }
  return result.data;
}

/**
 * Validate payload against a schema, returning null on failure (soft validation)
 */
export function validateBCPayloadSoft<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Get validation errors without throwing
 */
export function getBCValidationErrors(
  schema: z.ZodSchema<unknown>,
  data: unknown
): string[] {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
}

// Export types inferred from schemas
export type BCProductCreate = z.infer<typeof bcProductCreateSchema>;
export type BCCategoryCreate = z.infer<typeof bcCategoryCreateSchema>;
export type BCCustomerCreate = z.infer<typeof bcCustomerCreateSchema>;
export type BCOrderCreate = z.infer<typeof bcOrderCreateSchema>;
export type BCVariantCreate = z.infer<typeof bcVariantSchema>;
export type BCOptionCreate = z.infer<typeof bcOptionSchema>;
