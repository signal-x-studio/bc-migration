// Shared types for the dashboard

// ============================================
// Connection Types
// ============================================

export interface WCCredentials {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface BCCredentials {
  storeHash: string;
  accessToken: string;
}

export interface BCStoreInfo {
  name: string;
  domain: string;
  plan: string;
}

export interface StoreInfo {
  name: string;
  wcVersion: string;
  productCount: number;
  orderCount: number;
  customerCount: number;
}

export interface ConnectionState {
  credentials: WCCredentials | null;
  isConnected: boolean;
  storeInfo: StoreInfo | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Assessment Types
// ============================================

export type AssessmentArea =
  | 'products'
  | 'categories'
  | 'customers'
  | 'orders'
  | 'seo'
  | 'plugins'
  | 'customData';

export type IssueSeverity = 'blocker' | 'warning' | 'info';

export interface Issue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedItems?: number;
  recommendation?: string;
}

export interface BaseAssessment {
  timestamp: Date;
  issues: {
    blockers: Issue[];
    warnings: Issue[];
    info: Issue[];
  };
}

// Products Assessment
export interface ProductSample {
  id: number;
  name: string;
  type: string;
  sku?: string;
  variantCount?: number;
  issue?: string;
}

export interface ProductsAssessment extends BaseAssessment {
  metrics: {
    total: number;
    byType: Record<string, number>;
    withVariants: number;
    totalVariants: number;
    withoutSKU: number;
    withoutImages: number;
    avgPrice: number;
    zeroPriceCount: number;
  };
  samples: {
    highVariantProducts: ProductSample[];
    problematicProducts: ProductSample[];
  };
}

// Categories Assessment
export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  depth: number;
  productCount: number;
  children: CategoryNode[];
}

export interface CategoriesAssessment extends BaseAssessment {
  metrics: {
    total: number;
    maxDepth: number;
    avgProductsPerCategory: number;
    emptyCategories: number;
    orphanProducts: number;
  };
  hierarchy: CategoryNode[];
  deepCategories: { id: number; name: string; depth: number }[];
}

// Customers Assessment
export interface CustomersAssessment extends BaseAssessment {
  metrics: {
    total: number;
    withOrders: number;
    withAddresses: number;
    withoutEmail: number;
    guestOrders: number;
    countries: Record<string, number>;
  };
}

// Orders Assessment
export interface StatusMapping {
  wcStatus: string;
  bcStatus: string;
  count: number;
  notes?: string;
}

export interface OrdersAssessment extends BaseAssessment {
  metrics: {
    total: number;
    byStatus: Record<string, number>;
    withRefunds: number;
    avgItemsPerOrder: number;
    dateRange: { oldest: string; newest: string } | null;
  };
  statusMapping: StatusMapping[];
}

// SEO Assessment
export interface SEOAssessment extends BaseAssessment {
  metrics: {
    permalinkStructure: string;
    isStandard: boolean;
    hasYoast: boolean;
    hasRankMath: boolean;
    redirectEstimate: number;
  };
  urlSamples: string[];
}

// Plugins Assessment
export interface PluginMapping {
  wcPlugin: string;
  bcEquivalent: string | null;
  type: 'native' | 'app' | 'none';
  migrationComplexity: 'low' | 'medium' | 'high';
  notes: string;
}

export interface PluginsAssessment extends BaseAssessment {
  metrics: {
    totalActive: number;
    withBCEquivalent: number;
    withoutEquivalent: number;
    requiresManualReview: number;
  };
  pluginMappings: PluginMapping[];
}

// Custom Data Assessment
export interface MetaFieldInfo {
  key: string;
  occurrences: number;
  sampleValues: string[];
  isSerialized: boolean;
  bcMapping?: string;
}

export interface CustomDataAssessment extends BaseAssessment {
  metrics: {
    totalMetaKeys: number;
    uniqueMetaKeys: number;
    serializedFields: number;
    avgMetaPerProduct: number;
  };
  metaFields: MetaFieldInfo[];
}

// Full Assessment State
export interface AssessmentState {
  products: ProductsAssessment | null;
  categories: CategoriesAssessment | null;
  customers: CustomersAssessment | null;
  orders: OrdersAssessment | null;
  seo: SEOAssessment | null;
  plugins: PluginsAssessment | null;
  customData: CustomDataAssessment | null;
  loading: Record<AssessmentArea, boolean>;
  errors: Record<AssessmentArea, string | null>;
  lastUpdated: Record<AssessmentArea, Date | null>;
}

// ============================================
// API Types
// ============================================

export interface ConnectRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface ConnectResponse {
  success: boolean;
  storeInfo?: StoreInfo;
  error?: string;
}

export interface AssessRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface AssessResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// UI Helper Types
// ============================================

export type AssessmentStatus = 'not-assessed' | 'loading' | 'ready' | 'warning' | 'blocker';

export interface AssessmentCardData {
  area: AssessmentArea;
  title: string;
  icon: string;
  count: number | null;
  status: AssessmentStatus;
  blockerCount: number;
  warningCount: number;
}

export function getAssessmentStatus(assessment: BaseAssessment | null, isLoading: boolean): AssessmentStatus {
  if (isLoading) return 'loading';
  if (!assessment) return 'not-assessed';
  if (assessment.issues.blockers.length > 0) return 'blocker';
  if (assessment.issues.warnings.length > 0) return 'warning';
  return 'ready';
}

// ============================================
// Migration Types
// ============================================

export interface MigrationCategoryInfo {
  id: number;
  name: string;
  slug: string;
  parent: number;
  productCount: number;
  depth: number;
  children: MigrationCategoryInfo[];
  isOverLimit: boolean;
}

export interface MigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedCategories: number[];
  migratedProductIds: number[];
  currentMigration?: {
    categoryId: number;
    categoryName: string;
    totalProducts: number;
    completedProducts: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    error?: string;
  };
  lastUpdated: string;
}

export interface MigrationProgress {
  categoryId: number;
  categoryName: string;
  totalProducts: number;
  completedProducts: number;
  currentProduct?: {
    id: number;
    name: string;
  };
  status: 'migrating' | 'completed' | 'failed';
  error?: string;
}

export const MIGRATION_PRODUCT_LIMIT = 50;

// ============================================
// Migration Path Types
// ============================================

export type MigrationPathId = 'bc-bridge' | 'makeswift' | 'stencil' | 'headless';

export type EffortLevel = 'low' | 'medium' | 'high';

export interface MigrationPath {
  id: MigrationPathId;
  name: string;
  tagline: string;
  description: string;
  keeps: string[];
  moves: string[];
  rebuilds: string[];
  effort: EffortLevel;
  timeEstimate: string;
  bestFor: string[];
  considerations: string[];
  learnMoreUrl?: string;
  recommended?: boolean;
  warnings?: string[];
}

export const MIGRATION_PATHS: Record<MigrationPathId, Omit<MigrationPath, 'recommended' | 'warnings'>> = {
  'bc-bridge': {
    id: 'bc-bridge',
    name: 'WordPress + BC Bridge',
    tagline: 'Keep your WordPress theme',
    description: 'Install our BC Bridge plugin to connect BigCommerce to WordPress. Your existing theme renders products directly from the BC API with real-time data.',
    keeps: [
      'WordPress theme & design',
      'All WordPress plugins',
      'WordPress admin experience',
      'Blog posts & pages',
      'SEO settings & rankings',
    ],
    moves: [
      'Products → BigCommerce catalog',
      'Customers → BigCommerce',
      'Checkout → BC hosted checkout',
    ],
    rebuilds: [],
    effort: 'low',
    timeEstimate: '1-3 days',
    bestFor: [
      'Stores with any product count',
      'Heavy theme investment',
      'Non-technical teams',
      'Quick migrations',
    ],
    considerations: [
      'Requires BC Bridge plugin installation',
      'Theme may need minor adjustments for product templates',
      'Checkout redirects to BigCommerce hosted checkout',
    ],
    learnMoreUrl: '/paths/bc-bridge',
  },
  makeswift: {
    id: 'makeswift',
    name: 'WordPress + Makeswift',
    tagline: 'Modern visual storefront',
    description: 'Use Makeswift as your visual page builder with WordPress as your content CMS. Get modern performance with drag-and-drop editing.',
    keeps: [
      'WordPress as content CMS',
      'WordPress admin for content',
      'Blog posts & pages (via API)',
      'Content plugins (Yoast, ACF)',
      'SEO data & rankings',
    ],
    moves: [
      'Products → BigCommerce catalog',
      'Customers → BigCommerce',
      'Checkout → BC hosted checkout',
    ],
    rebuilds: [
      'Storefront design in Makeswift',
      'Product page templates',
      'Navigation & layout',
    ],
    effort: 'medium',
    timeEstimate: '1-2 weeks',
    bestFor: [
      'Mid-market stores (500+ products)',
      'Growth-focused businesses',
      'Marketing teams wanting visual control',
      'Stores needing modern performance',
    ],
    considerations: [
      'Requires rebuilding storefront design',
      'Learning curve for Makeswift editor',
      'Best with dedicated launch period',
    ],
    learnMoreUrl: 'https://www.makeswift.com/',
  },
  stencil: {
    id: 'stencil',
    name: 'Full BigCommerce',
    tagline: 'Complete BC platform',
    description: 'Migrate entirely to BigCommerce with a Stencil theme. WordPress becomes optional (blog only) or can be decommissioned.',
    keeps: [
      'WordPress as blog (optional)',
      'Content can be migrated',
    ],
    moves: [
      'Products → BigCommerce catalog',
      'Customers → BigCommerce',
      'Storefront → BC Stencil theme',
      'Checkout → BC native checkout',
      'Hosting → BigCommerce',
    ],
    rebuilds: [
      'Storefront with Stencil theme',
      'Any custom functionality',
      'Email templates',
    ],
    effort: 'medium',
    timeEstimate: '1-2 weeks',
    bestFor: [
      'Stores leaving WordPress entirely',
      'Wanting all-in-one platform',
      'Need BC\'s full feature set',
      'Prefer managed hosting',
    ],
    considerations: [
      'WordPress becomes separate (blog only)',
      'Stencil has learning curve for devs',
      'Theme customization requires Stencil knowledge',
    ],
    learnMoreUrl: 'https://developer.bigcommerce.com/docs/storefront/stencil',
  },
  headless: {
    id: 'headless',
    name: 'Headless / Catalyst',
    tagline: 'Maximum flexibility',
    description: 'Build a custom storefront using BigCommerce APIs. Use Catalyst (Next.js), Nuxt, or any modern framework.',
    keeps: [
      'WordPress as content CMS (optional)',
      'Any headless CMS option',
      'Full architectural control',
    ],
    moves: [
      'Products → BigCommerce catalog',
      'Customers → BigCommerce',
      'Orders → BigCommerce',
    ],
    rebuilds: [
      'Entire storefront (custom build)',
      'All frontend functionality',
      'Integration layer',
    ],
    effort: 'high',
    timeEstimate: '4-8 weeks',
    bestFor: [
      'Development teams',
      'Complex custom requirements',
      'Multi-storefront needs',
      'Maximum performance optimization',
    ],
    considerations: [
      'Requires development expertise',
      'Longer implementation timeline',
      'Ongoing maintenance responsibility',
    ],
    learnMoreUrl: 'https://www.catalyst.dev/',
  },
};

export interface PathRecommendation {
  paths: MigrationPath[];
  primaryRecommendation: MigrationPathId;
  reasoning: string;
}

export function getPathRecommendations(
  productCount: number,
  hasComplexTheme: boolean = false,
  hasDevTeam: boolean = false
): PathRecommendation {
  const paths: MigrationPath[] = Object.values(MIGRATION_PATHS).map(path => ({
    ...path,
    warnings: [],
    recommended: false,
  }));

  let primaryRecommendation: MigrationPathId;
  let reasoning: string;

  // Add warnings based on store characteristics
  const bcBridge = paths.find(p => p.id === 'bc-bridge')!;
  const makeswift = paths.find(p => p.id === 'makeswift')!;
  const stencil = paths.find(p => p.id === 'stencil')!;
  const headless = paths.find(p => p.id === 'headless')!;

  // BC Bridge scales well, but for very large catalogs consider alternatives
  if (productCount > 10000) {
    bcBridge.warnings = bcBridge.warnings || [];
    bcBridge.warnings.push(
      `Your catalog (${productCount.toLocaleString()} products) is very large. BC Bridge handles this, but consider Stencil or Headless for maximum performance.`
    );
  }

  // Determine primary recommendation
  if (productCount <= 2000 && !hasDevTeam) {
    primaryRecommendation = 'bc-bridge';
    reasoning = 'BC Bridge preserves your WordPress theme and handles your catalog size with real-time API calls—no sync issues.';
    bcBridge.recommended = true;
  } else if (productCount <= 2000 && hasComplexTheme) {
    primaryRecommendation = 'bc-bridge';
    reasoning = 'BC Bridge preserves your theme investment with direct API integration—no sync delays or data staleness.';
    bcBridge.recommended = true;
  } else if (productCount > 2000 && productCount <= 5000) {
    primaryRecommendation = 'makeswift';
    reasoning = 'Makeswift handles your catalog size without sync issues, while keeping WordPress for content management.';
    makeswift.recommended = true;
  } else if (productCount > 5000 && hasDevTeam) {
    primaryRecommendation = 'headless';
    reasoning = 'At this scale, a custom headless build gives you maximum performance and flexibility.';
    headless.recommended = true;
  } else if (productCount > 5000) {
    primaryRecommendation = 'stencil';
    reasoning = 'Full BigCommerce migration handles large catalogs natively with professional support.';
    stencil.recommended = true;
  } else {
    primaryRecommendation = 'makeswift';
    reasoning = 'Makeswift offers the best balance of modern performance and ease of use for your store.';
    makeswift.recommended = true;
  }

  return {
    paths,
    primaryRecommendation,
    reasoning,
  };
}

// ============================================
// Customer Migration Types
// ============================================

export interface CustomerMigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedEmails: string[];
  stats?: CustomerMigrationStats;
  lastUpdated: string;
}

export interface CustomerMigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

export interface CustomerMigrationProgress {
  totalCustomers: number;
  completedCustomers: number;
  currentCustomer?: { email: string; name: string };
  status: 'migrating' | 'completed' | 'failed';
  error?: string;
}

// ============================================
// Validation Types
// ============================================

export type ComparisonStatus = 'matched' | 'under' | 'over';

export interface CountComparison {
  wcCount: number;
  bcCount: number;
  difference: number;
  status: ComparisonStatus;
  notes?: string;
}

export interface ValidationResult {
  timestamp: string;
  products: CountComparison;
  categories: CountComparison;
  customers: CountComparison;
  overallStatus: 'matched' | 'partial' | 'mismatch';
  recommendations: string[];
}

// ============================================
// Setup Wizard Types
// ============================================

export type SetupWizardStep = 'welcome' | 'create-account' | 'store-hash' | 'api-token' | 'verify' | 'complete';

export interface SetupWizardState {
  currentStep: SetupWizardStep;
  hasExistingAccount: boolean;
  storeHash?: string;
  accessToken?: string;
  verificationStatus: 'pending' | 'success' | 'failed';
  error?: string;
  lastUpdated: string;
}

// ============================================
// Go-Live Checklist Types
// ============================================

export type ChecklistItemStatus = 'pending' | 'in_progress' | 'verified' | 'failed' | 'skipped';
export type ChecklistCategory = 'required' | 'recommended';

export interface ChecklistItemConfig {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  autoVerifiable: boolean;
  helpUrl?: string;
}

export interface ChecklistItem extends ChecklistItemConfig {
  status: ChecklistItemStatus;
  verifiedAt?: string;
  notes?: string;
}

export interface GoLiveChecklistState {
  wcStoreUrl: string;
  bcStoreHash: string;
  items: ChecklistItem[];
  overallProgress: number; // 0-100
  readyForLaunch: boolean;
  lastUpdated: string;
}

export const GO_LIVE_CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  {
    id: 'payment',
    title: 'Payment Gateway Configured',
    description: 'At least one payment method is active in BigCommerce',
    category: 'required',
    autoVerifiable: true,
    helpUrl: 'https://support.bigcommerce.com/s/article/Online-Payment-Methods',
  },
  {
    id: 'shipping',
    title: 'Shipping Zones Configured',
    description: 'Shipping rates set for your target markets',
    category: 'required',
    autoVerifiable: true,
    helpUrl: 'https://support.bigcommerce.com/s/article/Shipping-Setup',
  },
  {
    id: 'tax',
    title: 'Tax Settings Configured',
    description: 'Tax rules or tax service integration enabled',
    category: 'required',
    autoVerifiable: true,
    helpUrl: 'https://support.bigcommerce.com/s/article/Tax-Overview',
  },
  {
    id: 'test-order',
    title: 'Test Order Completed',
    description: 'Successfully placed a test order through checkout',
    category: 'required',
    autoVerifiable: false,
  },
  {
    id: 'redirects',
    title: '301 Redirects Installed',
    description: 'Old WooCommerce URLs redirect to new BigCommerce URLs',
    category: 'required',
    autoVerifiable: false,
  },
  {
    id: 'password-reset',
    title: 'Password Reset Emails Sent',
    description: 'Migrated customers notified to reset passwords',
    category: 'required',
    autoVerifiable: false,
  },
  {
    id: 'ssl',
    title: 'SSL Certificate Active',
    description: 'HTTPS working on your BigCommerce store',
    category: 'required',
    autoVerifiable: true,
  },
  {
    id: 'domain',
    title: 'Domain Configured',
    description: 'Domain pointed to BigCommerce or BC Bridge configured',
    category: 'required',
    autoVerifiable: false,
  },
  {
    id: 'wc-deactivate',
    title: 'WooCommerce Deactivated',
    description: 'WC plugin deactivated (not deleted) in WordPress',
    category: 'recommended',
    autoVerifiable: false,
  },
  {
    id: 'search-console',
    title: 'Search Console Updated',
    description: 'Sitemap submitted, monitoring for crawl errors',
    category: 'recommended',
    autoVerifiable: false,
    helpUrl: 'https://search.google.com/search-console',
  },
];

// ============================================
// Migration Mode Types
// ============================================

export type MigrationMode = 'assessment' | 'fresh-start';

// ============================================
// Order Migration Types
// ============================================

// WC Order status to BC status ID mapping
export const ORDER_STATUS_MAPPING: Record<string, { bcStatusId: number; bcStatusName: string }> = {
  'pending': { bcStatusId: 1, bcStatusName: 'Pending' },
  'processing': { bcStatusId: 11, bcStatusName: 'Awaiting Fulfillment' },
  'on-hold': { bcStatusId: 13, bcStatusName: 'Manual Verification Required' },
  'completed': { bcStatusId: 10, bcStatusName: 'Completed' },
  'cancelled': { bcStatusId: 5, bcStatusName: 'Cancelled' },
  'refunded': { bcStatusId: 4, bcStatusName: 'Refunded' },
  'failed': { bcStatusId: 6, bcStatusName: 'Declined' },
};

export interface WCOrderAddress {
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
  phone: string;
}

export interface WCOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  sku: string;
  price: number;
}

export interface WCOrderShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  total: string;
  total_tax: string;
}

export interface WCOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
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
  billing: WCOrderAddress;
  shipping: WCOrderAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_note: string;
  line_items: WCOrderLineItem[];
  shipping_lines: WCOrderShippingLine[];
  refunds: { id: number; reason: string; total: string }[];
}

export interface BCOrderProduct {
  product_id: number;
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
  name?: string;
  sku?: string;
}

export interface BCOrderAddress {
  first_name: string;
  last_name: string;
  company: string;
  street_1: string;
  street_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  country_iso2: string;
  phone: string;
  email?: string;
}

export interface BCOrderCreate {
  customer_id: number;
  status_id: number;
  billing_address: BCOrderAddress;
  shipping_addresses?: BCOrderAddress[];
  products: BCOrderProduct[];
  subtotal_ex_tax?: number;
  subtotal_inc_tax?: number;
  total_ex_tax?: number;
  total_inc_tax?: number;
  shipping_cost_ex_tax?: number;
  shipping_cost_inc_tax?: number;
  discount_amount?: number;
  customer_message?: string;
  staff_notes?: string;
  payment_method?: string;
  external_source?: string;
  external_id?: string;
}

export interface OrderMigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedOrderIds: number[];
  // Maps WC order ID to BC order ID
  orderIdMapping: Record<number, number>;
  // Maps WC product ID to BC product ID (needed for line items)
  productIdMapping: Record<number, number>;
  // Maps WC customer ID to BC customer ID
  customerIdMapping: Record<number, number>;
  stats?: OrderMigrationStats;
  lastUpdated: string;
}

export interface OrderMigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

export interface OrderMigrationProgress {
  totalOrders: number;
  completedOrders: number;
  currentOrder?: { id: number; wcNumber: string };
  status: 'migrating' | 'completed' | 'failed';
  error?: string;
  stats: OrderMigrationStats;
}

// ============================================
// Coupon Migration Types
// ============================================

export const COUPON_TYPE_MAPPING: Record<string, string> = {
  'percent': 'percentage_discount',
  'fixed_cart': 'per_total_discount',
  'fixed_product': 'per_item_discount',
};

export interface WCCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  description: string;
  date_expires: string | null;
  usage_count: number;
  individual_use: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  minimum_amount: string;
  maximum_amount: string;
}

export interface BCCouponCreate {
  name: string;
  type: 'per_item_discount' | 'per_total_discount' | 'shipping_discount' | 'free_shipping' | 'percentage_discount';
  amount: string;
  min_purchase?: string;
  expires?: string;
  enabled: boolean;
  code: string;
  applies_to: { entity: 'categories' | 'products'; ids: number[] };
  max_uses?: number;
  max_uses_per_customer?: number;
  shipping_free_shipping?: boolean;
}

export interface CouponMigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedCouponIds: number[];
  couponIdMapping: Record<number, number>;
  stats?: CouponMigrationStats;
  lastUpdated: string;
}

export interface CouponMigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

// ============================================
// Review Migration Types
// ============================================

export interface WCProductReview {
  id: number;
  date_created: string;
  product_id: number;
  status: 'approved' | 'hold' | 'spam' | 'trash';
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
}

export interface BCReviewCreate {
  title: string;
  text: string;
  status: 'approved' | 'pending';
  rating: number;
  name: string;
  email: string;
  date_reviewed?: string;
}

export interface ReviewMigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedReviewIds: number[];
  reviewIdMapping: Record<number, number>;
  productIdMapping: Record<number, number>;
  stats?: ReviewMigrationStats;
  lastUpdated: string;
}

export interface ReviewMigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

// ============================================
// CMS Pages Migration Types
// ============================================

export interface WPPage {
  id: number;
  date: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  parent: number;
}

export interface BCPageCreate {
  name: string;
  type: 'raw' | 'link' | 'contact_form';
  body: string;
  url: string;
  is_visible: boolean;
  meta_description?: string;
  meta_keywords?: string;
  is_homepage?: boolean;
  is_customers_only?: boolean;
}

export interface PageMigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedPageIds: number[];
  pageIdMapping: Record<number, number>;
  stats?: PageMigrationStats;
  lastUpdated: string;
}

export interface PageMigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

// ============================================
// Blog Migration Types
// ============================================

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  tags: number[];
  categories: number[];
}

export interface BCBlogPostCreate {
  title: string;
  body: string;
  url?: string;
  is_published: boolean;
  published_date?: string;
  author?: string;
  meta_description?: string;
  meta_keywords?: string;
  thumbnail_path?: string;
  tags?: string[];
}

export interface BlogMigrationState {
  wcStoreUrl: string;
  bcStoreHash: string;
  migratedPostIds: number[];
  postIdMapping: Record<number, number>;
  stats?: BlogMigrationStats;
  lastUpdated: string;
}

export interface BlogMigrationStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  warnings: string[];
}

// ============================================
// Migration Options Types
// ============================================

export interface MigrationOptions {
  stripHtml?: boolean;
  skipExisting?: boolean; // default true (idempotency)
}

// ============================================
// Preview Types
// ============================================

export type PreviewPathId = 'catalyst' | 'stencil' | 'makeswift';
export type PreviewView = 'plp' | 'pdp';

export interface BCImage {
  id: number;
  url_standard: string;
  url_thumbnail: string;
  url_tiny: string;
  is_thumbnail: boolean;
  sort_order: number;
  description: string;
}

export interface BCVariant {
  id: number;
  product_id: number;
  sku: string;
  price: number;
  sale_price?: number;
  option_values: { option_display_name: string; label: string }[];
  inventory_level: number;
  image_url?: string;
}

export interface BCProductPreview {
  id: number;
  name: string;
  sku: string;
  price: number;
  sale_price?: number;
  description: string;
  images: BCImage[];
  variants: BCVariant[];
  categories: number[];
  inventory_level: number;
  is_visible: boolean;
  custom_url: { url: string };
  type: 'physical' | 'digital';
  weight: number;
  _validation: PreviewValidation;
}

export interface PreviewValidation {
  hasMainImage: boolean;
  nameTruncated: boolean;
  originalNameLength: number;
  descriptionTruncated: boolean;
  originalDescriptionLength: number;
  variantCount: number;
  hasPrice: boolean;
  hasSku: boolean;
  issues: PreviewValidationIssue[];
}

export type PreviewIssueType =
  | 'missing_image'
  | 'truncated_name'
  | 'truncated_description'
  | 'missing_price'
  | 'variant_limit'
  | 'missing_sku'
  | 'low_inventory';

export type PreviewIssueSeverity = 'error' | 'warning' | 'info';

export interface PreviewValidationIssue {
  type: PreviewIssueType;
  severity: PreviewIssueSeverity;
  message: string;
  field?: string;
  originalValue?: string;
  displayedValue?: string;
}

export interface PreviewState {
  selectedPath: PreviewPathId;
  selectedView: PreviewView;
  selectedProductId: number | null;
  bcProducts: BCProductPreview[];
  isLoading: boolean;
  error: string | null;
}
