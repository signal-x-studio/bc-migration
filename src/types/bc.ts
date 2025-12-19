/**
 * BigCommerce REST API Types
 * Based on BC API v3: https://developer.bigcommerce.com/docs/rest-catalog
 */

export interface BCImage {
  image_url: string;
  is_thumbnail: boolean;
  sort_order?: number;
  description?: string;
  image_file?: string;
  url_zoom?: string;
  url_standard?: string;
  url_thumbnail?: string;
  url_tiny?: string;
  date_modified?: string;
}

export interface BCCustomUrl {
  url: string;
  is_customized: boolean;
}

export interface BCCategory {
  id?: number;
  parent_id: number;
  name: string;
  description?: string;
  views?: number;
  sort_order?: number;
  page_title?: string;
  meta_keywords?: string[];
  meta_description?: string;
  layout_file?: string;
  image_url?: string;
  is_visible?: boolean;
  search_keywords?: string;
  default_product_sort?: 'use_store_settings' | 'featured' | 'newest' | 'best_selling' | 'alpha_asc' | 'alpha_desc' | 'avg_customer_review' | 'price_asc' | 'price_desc';
  custom_url?: BCCustomUrl;
}

export interface BCOptionValue {
  id?: number;
  label: string;
  sort_order?: number;
  value_data?: {
    colors?: string[];
    image_url?: string;
  } | null;
  is_default?: boolean;
}

export interface BCOption {
  id?: number;
  product_id?: number;
  display_name: string;
  type: 'radio_buttons' | 'rectangles' | 'dropdown' | 'product_list' | 'product_list_with_images' | 'swatch';
  config?: {
    default_value?: string;
    checked_by_default?: boolean;
    checkbox_label?: string;
    date_limited?: boolean;
    date_limit_mode?: 'earliest' | 'range' | 'latest';
    date_earliest_value?: string;
    date_latest_value?: string;
    file_types_mode?: 'specific' | 'all';
    file_types_supported?: string[];
    file_types_other?: string[];
    file_max_size?: number;
    text_characters_limited?: boolean;
    text_min_length?: number;
    text_max_length?: number;
    text_lines_limited?: boolean;
    text_max_lines?: number;
    number_limited?: boolean;
    number_limit_mode?: 'lowest' | 'highest' | 'range';
    number_lowest_value?: number;
    number_highest_value?: number;
    number_integers_only?: boolean;
    product_list_adjusts_inventory?: boolean;
    product_list_adjusts_pricing?: boolean;
    product_list_shipping_calc?: 'none' | 'weight' | 'package';
  };
  sort_order?: number;
  option_values: BCOptionValue[];
}

export interface BCVariant {
  id?: number;
  product_id?: number;
  sku: string;
  sku_id?: number;
  price?: number | null;
  calculated_price?: number;
  sale_price?: number | null;
  retail_price?: number | null;
  map_price?: number | null;
  weight?: number | null;
  calculated_weight?: number;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  is_free_shipping?: boolean;
  fixed_cost_shipping_price?: number | null;
  purchasing_disabled?: boolean;
  purchasing_disabled_message?: string;
  image_url?: string;
  cost_price?: number | null;
  upc?: string;
  mpn?: string;
  gtin?: string;
  inventory_level?: number;
  inventory_warning_level?: number;
  bin_picking_number?: string;
  option_values: {
    id?: number;
    label: string;
    option_id: number;
    option_display_name?: string;
  }[];
}

export interface BCCustomField {
  id?: number;
  name: string;
  value: string;
}

export interface BCBulkPricingRule {
  id?: number;
  quantity_min: number;
  quantity_max: number;
  type: 'price' | 'percent' | 'fixed';
  amount: number;
}

export type BCProductType = 'physical' | 'digital';
export type BCInventoryTracking = 'none' | 'product' | 'variant';
export type BCAvailability = 'available' | 'disabled' | 'preorder';
export type BCCondition = 'New' | 'Used' | 'Refurbished';

export interface BCProduct {
  id?: number;
  name: string;
  type: BCProductType;
  sku: string;
  description?: string;
  weight: number;
  width?: number;
  depth?: number;
  height?: number;
  price: number;
  cost_price?: number;
  retail_price?: number;
  sale_price?: number;
  map_price?: number;
  tax_class_id?: number;
  product_tax_code?: string;
  calculated_price?: number;
  categories: number[];
  brand_id?: number;
  option_set_id?: number | null;
  option_set_display?: string;
  inventory_level?: number;
  inventory_warning_level?: number;
  inventory_tracking: BCInventoryTracking;
  reviews_rating_sum?: number;
  reviews_count?: number;
  total_sold?: number;
  fixed_cost_shipping_price?: number;
  is_free_shipping?: boolean;
  is_visible: boolean;
  is_featured?: boolean;
  related_products?: number[];
  warranty?: string;
  bin_picking_number?: string;
  layout_file?: string;
  upc?: string;
  mpn?: string;
  gtin?: string;
  search_keywords?: string;
  availability?: BCAvailability;
  availability_description?: string;
  gift_wrapping_options_type?: 'any' | 'none' | 'list';
  gift_wrapping_options_list?: number[];
  sort_order?: number;
  condition?: BCCondition;
  is_condition_shown?: boolean;
  order_quantity_minimum?: number;
  order_quantity_maximum?: number;
  page_title?: string;
  meta_keywords?: string[];
  meta_description?: string;
  date_created?: string;
  date_modified?: string;
  view_count?: number;
  preorder_release_date?: string | null;
  preorder_message?: string;
  is_preorder_only?: boolean;
  is_price_hidden?: boolean;
  price_hidden_label?: string;
  custom_url?: BCCustomUrl;
  base_variant_id?: number;
  open_graph_type?: 'product' | 'album' | 'book' | 'drink' | 'food' | 'game' | 'movie' | 'song' | 'tv_show';
  open_graph_title?: string;
  open_graph_description?: string;
  open_graph_use_meta_description?: boolean;
  open_graph_use_product_name?: boolean;
  open_graph_use_image?: boolean;
  images?: BCImage[];
  videos?: { title: string; description: string; sort_order: number; type: 'youtube'; video_id: string }[];
  custom_fields?: BCCustomField[];
  bulk_pricing_rules?: BCBulkPricingRule[];
  variants?: BCVariant[];
  options?: BCOption[];
}

export interface BCAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  address_type?: 'residential' | 'commercial';
}

export interface BCCustomer {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  notes?: string;
  tax_exempt_category?: string;
  customer_group_id?: number;
  addresses?: BCAddress[];
  attributes?: { attribute_id: number; attribute_value: string; date_created?: string; date_modified?: string }[];
  authentication?: {
    force_password_reset: boolean;
    new_password?: string;
  };
  accepts_product_review_abandoned_cart_emails?: boolean;
  store_credit_amounts?: { amount: number }[];
  origin_channel_id?: number;
  channel_ids?: number[];
  form_fields?: { name: string; value: string | number | string[] }[];
}

/**
 * BigCommerce V2 Order Types (Orders API is still V2)
 */
export type BCOrderStatusId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface BCOrderProduct {
  product_id: number;
  quantity: number;
  price_inc_tax?: number;
  price_ex_tax?: number;
  name?: string;
  sku?: string;
  product_options?: { id: number; value: string }[];
}

export interface BCOrderCustomProduct {
  name: string;
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
  sku?: string;
}

export interface BCOrder {
  id?: number;
  customer_id: number;
  status_id: BCOrderStatusId;
  billing_address: BCAddress & { email?: string };
  shipping_addresses?: (BCAddress & { shipping_method?: string })[];
  products: (BCOrderProduct | BCOrderCustomProduct)[];
  subtotal_ex_tax?: string;
  subtotal_inc_tax?: string;
  base_shipping_cost?: string;
  shipping_cost_ex_tax?: string;
  shipping_cost_inc_tax?: string;
  base_handling_cost?: string;
  handling_cost_ex_tax?: string;
  handling_cost_inc_tax?: string;
  base_wrapping_cost?: string;
  wrapping_cost_ex_tax?: string;
  wrapping_cost_inc_tax?: string;
  total_ex_tax?: string;
  total_inc_tax?: string;
  items_total?: number;
  items_shipped?: number;
  payment_method?: string;
  payment_provider_id?: string;
  payment_status?: string;
  refunded_amount?: string;
  order_is_digital?: boolean;
  staff_notes?: string;
  customer_message?: string;
  discount_amount?: string;
  coupon_discount?: string;
  credit_card_type?: string;
  ip_address?: string;
  geoip_country?: string;
  geoip_country_iso2?: string;
  date_created?: string;
  date_modified?: string;
  date_shipped?: string;
  external_source?: string;
  external_id?: string;
  external_merchant_id?: string;
  channel_id?: number;
  tax_provider_id?: string;
  is_email_opt_in?: boolean;
}

/**
 * API Response wrappers
 */
export interface BCDataResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export interface BCBatchResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

/**
 * Rate limit headers from BC API
 */
export interface BCRateLimitHeaders {
  'x-rate-limit-requests-left': string;
  'x-rate-limit-requests-quota': string;
  'x-rate-limit-time-reset-ms': string;
  'x-rate-limit-time-window-ms': string;
}
