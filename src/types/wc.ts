/**
 * WooCommerce REST API Types
 * Based on WC REST API v3: https://woocommerce.github.io/woocommerce-rest-api-docs/
 */

export interface WCImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  position: number;
}

export interface WCDimensions {
  length: string;
  width: string;
  height: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WCImage | null;
  menu_order: number;
  count: number;
}

export interface WCAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WCMetaData {
  id: number;
  key: string;
  value: unknown;
}

export interface WCDownload {
  id: string;
  name: string;
  file: string;
}

export type WCProductType = 'simple' | 'variable' | 'grouped' | 'external';
export type WCProductStatus = 'draft' | 'pending' | 'private' | 'publish';
export type WCStockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type WCTaxStatus = 'taxable' | 'shipping' | 'none';
export type WCBackorders = 'no' | 'notify' | 'yes';

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: WCProductType;
  status: WCProductStatus;
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: WCDownload[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: WCTaxStatus;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: WCStockStatus;
  backorders: WCBackorders;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: WCDimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Pick<WCCategory, 'id' | 'name' | 'slug'>[];
  tags: { id: number; name: string; slug: string }[];
  images: WCImage[];
  attributes: WCAttribute[];
  default_attributes: { id: number; name: string; option: string }[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: WCMetaData[];
}

export interface WCVariation {
  id: number;
  date_created: string;
  date_modified: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  on_sale: boolean;
  status: WCProductStatus;
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  downloads: WCDownload[];
  download_limit: number;
  download_expiry: number;
  tax_status: WCTaxStatus;
  tax_class: string;
  manage_stock: boolean | 'parent';
  stock_quantity: number | null;
  stock_status: WCStockStatus;
  backorders: WCBackorders;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  weight: string;
  dimensions: WCDimensions;
  shipping_class: string;
  shipping_class_id: number;
  image: WCImage | null;
  attributes: { id: number; name: string; option: string }[];
  menu_order: number;
  meta_data: WCMetaData[];
}

export interface WCAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WCCustomer {
  id: number;
  date_created: string;
  date_modified: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: WCAddress;
  shipping: Omit<WCAddress, 'email' | 'phone'>;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: WCMetaData[];
}

export type WCOrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

export interface WCOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: { id: number; total: string; subtotal: string }[];
  meta_data: WCMetaData[];
  sku: string;
  price: number;
  parent_name: string | null;
}

export interface WCOrderShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  instance_id: string;
  total: string;
  total_tax: string;
  taxes: { id: number; total: string }[];
  meta_data: WCMetaData[];
}

export interface WCOrderFeeLine {
  id: number;
  name: string;
  tax_class: string;
  tax_status: WCTaxStatus;
  amount: string;
  total: string;
  total_tax: string;
  taxes: { id: number; total: string; subtotal: string }[];
  meta_data: WCMetaData[];
}

export interface WCOrderCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: WCMetaData[];
}

export interface WCOrder {
  id: number;
  parent_id: number;
  status: WCOrderStatus;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: WCAddress;
  shipping: Omit<WCAddress, 'email' | 'phone'>;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string;
  number: string;
  meta_data: WCMetaData[];
  line_items: WCOrderLineItem[];
  tax_lines: { id: number; rate_code: string; rate_id: number; label: string; compound: boolean; tax_total: string; shipping_tax_total: string; rate_percent: number; meta_data: WCMetaData[] }[];
  shipping_lines: WCOrderShippingLine[];
  fee_lines: WCOrderFeeLine[];
  coupon_lines: WCOrderCouponLine[];
  refunds: { id: number; reason: string; total: string }[];
  payment_url: string;
  currency_symbol: string;
}

/**
 * API Response wrapper
 */
export interface WCPaginatedResponse<T> {
  data: T[];
  headers: {
    'x-wp-total': string;
    'x-wp-totalpages': string;
  };
}
