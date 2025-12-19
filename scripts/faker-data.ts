/**
 * Faker-based test data generators for WooCommerce
 * Generates realistic e-commerce test data
 */

import { faker } from '@faker-js/faker';

// Reliable placeholder image URL generator
function getPlaceholderImage(width = 640, height = 480): string {
  // Use placehold.co which is fast and reliable
  const colors = ['7f7f7f', 'a0a0a0', '808080', '909090', 'b0b0b0'];
  const color = faker.helpers.arrayElement(colors);
  return `https://placehold.co/${width}x${height}/${color}/ffffff.png`;
}

// Product categories for e-commerce
const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
  'Books', 'Toys & Games', 'Health & Beauty', 'Automotive',
  'Jewelry', 'Food & Beverages'
];

const PRODUCT_ADJECTIVES = [
  'Premium', 'Deluxe', 'Professional', 'Classic', 'Modern',
  'Vintage', 'Compact', 'Ultra', 'Essential', 'Advanced'
];

const PRODUCT_TYPES = [
  'Widget', 'Gadget', 'Tool', 'Set', 'Kit', 'Bundle',
  'Pack', 'Collection', 'System', 'Device'
];

// Color options for variable products
export const COLORS = [
  'Red', 'Blue', 'Green', 'Black', 'White', 'Yellow',
  'Orange', 'Purple', 'Pink', 'Gray', 'Brown', 'Navy'
];

// Size options for variable products
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Material options
export const MATERIALS = [
  'Cotton', 'Polyester', 'Leather', 'Wool', 'Silk',
  'Denim', 'Canvas', 'Nylon', 'Linen', 'Velvet'
];

// Order statuses in WooCommerce
export const ORDER_STATUSES = [
  'pending', 'processing', 'on-hold', 'completed',
  'cancelled', 'refunded', 'failed'
] as const;

// ============================================
// Product Generators
// ============================================

export function generateProductName(includeUnicode = false): string {
  const adjective = faker.helpers.arrayElement(PRODUCT_ADJECTIVES);
  const type = faker.helpers.arrayElement(PRODUCT_TYPES);
  const noun = faker.commerce.product();

  let name = `${adjective} ${noun} ${type}`;

  if (includeUnicode) {
    // Add unicode characters for edge case testing
    const unicodeSuffixes = ['™', '®', '©', '★', '❤️', '✓'];
    name += ` ${faker.helpers.arrayElement(unicodeSuffixes)}`;
  }

  return name;
}

export function generateProductDescription(length: 'short' | 'medium' | 'long' = 'medium'): string {
  const paragraphCount = length === 'short' ? 1 : length === 'medium' ? 3 : 8;

  let description = '';
  for (let i = 0; i < paragraphCount; i++) {
    description += `<p>${faker.lorem.paragraph()}</p>\n`;
  }

  // Add some HTML formatting
  description += `<ul>\n`;
  for (let i = 0; i < 3; i++) {
    description += `  <li>${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}</li>\n`;
  }
  description += `</ul>`;

  return description;
}

export function generateSKU(prefix = 'TEST'): string {
  return `${prefix}-${faker.string.alphanumeric(8).toUpperCase()}`;
}

export function generatePrice(min = 9.99, max = 999.99): string {
  return faker.commerce.price({ min, max });
}

export function generateWeight(): string {
  return faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }).toString();
}

export function generateDimensions(): { length: string; width: string; height: string } {
  return {
    length: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toString(),
    width: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toString(),
    height: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toString(),
  };
}

export interface SimpleProductData {
  name: string;
  type: 'simple';
  regular_price: string;
  description: string;
  short_description: string;
  sku: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  categories: { id: number }[];
  images: { src: string }[];
}

export function generateSimpleProduct(
  categoryIds: number[],
  options: {
    withSKU?: boolean;
    withImages?: boolean;
    withUnicode?: boolean;
    longDescription?: boolean;
  } = {}
): SimpleProductData {
  const {
    withSKU = true,
    withImages = true,
    withUnicode = false,
    longDescription = false,
  } = options;

  return {
    name: generateProductName(withUnicode),
    type: 'simple',
    regular_price: generatePrice(),
    description: generateProductDescription(longDescription ? 'long' : 'medium'),
    short_description: faker.commerce.productDescription(),
    sku: withSKU ? generateSKU() : '',
    manage_stock: true,
    stock_quantity: faker.number.int({ min: 0, max: 500 }),
    weight: generateWeight(),
    dimensions: generateDimensions(),
    categories: categoryIds.length > 0
      ? [{ id: faker.helpers.arrayElement(categoryIds) }]
      : [],
    images: withImages
      ? [{ src: getPlaceholderImage(640, 480) }]
      : [],
  };
}

export interface VariableProductData {
  name: string;
  type: 'variable';
  description: string;
  short_description: string;
  sku: string;
  categories: { id: number }[];
  images: { src: string }[];
  attributes: {
    name: string;
    visible: boolean;
    variation: boolean;
    options: string[];
  }[];
}

export function generateVariableProduct(
  categoryIds: number[],
  attributeCount: 1 | 2 | 3 = 2
): VariableProductData {
  const attributes: VariableProductData['attributes'] = [];

  if (attributeCount >= 1) {
    attributes.push({
      name: 'Color',
      visible: true,
      variation: true,
      options: faker.helpers.arrayElements(COLORS, { min: 3, max: 6 }),
    });
  }

  if (attributeCount >= 2) {
    attributes.push({
      name: 'Size',
      visible: true,
      variation: true,
      options: faker.helpers.arrayElements(SIZES, { min: 3, max: 6 }),
    });
  }

  if (attributeCount >= 3) {
    attributes.push({
      name: 'Material',
      visible: true,
      variation: true,
      options: faker.helpers.arrayElements(MATERIALS, { min: 2, max: 4 }),
    });
  }

  return {
    name: generateProductName(),
    type: 'variable',
    description: generateProductDescription('medium'),
    short_description: faker.commerce.productDescription(),
    sku: generateSKU('VAR'),
    categories: categoryIds.length > 0
      ? [{ id: faker.helpers.arrayElement(categoryIds) }]
      : [],
    images: [{ src: getPlaceholderImage(640, 480) }],
    attributes,
  };
}

export interface VariationData {
  regular_price: string;
  sku: string;
  manage_stock: boolean;
  stock_quantity: number;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  attributes: { name: string; option: string }[];
}

export function generateVariation(attributes: { name: string; option: string }[]): VariationData {
  return {
    regular_price: generatePrice(),
    sku: generateSKU('V'),
    manage_stock: true,
    stock_quantity: faker.number.int({ min: 0, max: 100 }),
    weight: generateWeight(),
    dimensions: generateDimensions(),
    attributes,
  };
}

export interface VirtualProductData {
  name: string;
  type: 'simple';
  virtual: boolean;
  regular_price: string;
  description: string;
  short_description: string;
  sku: string;
  categories: { id: number }[];
}

export function generateVirtualProduct(categoryIds: number[]): VirtualProductData {
  return {
    name: `${faker.helpers.arrayElement(['Online', 'Digital', 'Virtual'])} ${faker.commerce.productName()}`,
    type: 'simple',
    virtual: true,
    regular_price: generatePrice(4.99, 199.99),
    description: generateProductDescription('short'),
    short_description: faker.commerce.productDescription(),
    sku: generateSKU('VIRT'),
    categories: categoryIds.length > 0
      ? [{ id: faker.helpers.arrayElement(categoryIds) }]
      : [],
  };
}

export interface DownloadableProductData {
  name: string;
  type: 'simple';
  virtual: boolean;
  downloadable: boolean;
  regular_price: string;
  description: string;
  short_description: string;
  sku: string;
  categories: { id: number }[];
  downloads: { name: string; file: string }[];
  download_limit: number;
  download_expiry: number;
}

export function generateDownloadableProduct(categoryIds: number[]): DownloadableProductData {
  const fileTypes = ['PDF', 'ZIP', 'MP3', 'MP4', 'EPUB'];
  const fileType = faker.helpers.arrayElement(fileTypes);

  return {
    name: `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(['eBook', 'Course', 'Template', 'Guide', 'Software'])}`,
    type: 'simple',
    virtual: true,
    downloadable: true,
    regular_price: generatePrice(9.99, 299.99),
    description: generateProductDescription('medium'),
    short_description: faker.commerce.productDescription(),
    sku: generateSKU('DL'),
    categories: categoryIds.length > 0
      ? [{ id: faker.helpers.arrayElement(categoryIds) }]
      : [],
    downloads: [{
      name: `${faker.system.fileName()}.${fileType.toLowerCase()}`,
      file: `https://example.com/downloads/${faker.string.uuid()}.${fileType.toLowerCase()}`,
    }],
    download_limit: faker.helpers.arrayElement([-1, 3, 5, 10]),
    download_expiry: faker.helpers.arrayElement([-1, 30, 90, 365]),
  };
}

// ============================================
// Category Generators
// ============================================

export interface CategoryData {
  name: string;
  description: string;
  parent?: number;
}

export function generateCategory(parentId?: number): CategoryData {
  const category = faker.helpers.arrayElement(PRODUCT_CATEGORIES);
  const suffix = faker.string.alphanumeric(4);

  return {
    name: `${category} ${suffix}`,
    description: faker.commerce.productDescription(),
    ...(parentId !== undefined && { parent: parentId }),
  };
}

export function generateCategoryHierarchy(count: number): { name: string; description: string; level: number }[] {
  const categories: { name: string; description: string; level: number }[] = [];

  // Level 0 - root categories
  const rootCount = Math.ceil(count / 4);
  for (let i = 0; i < rootCount; i++) {
    categories.push({
      name: `${faker.helpers.arrayElement(PRODUCT_CATEGORIES)} ${i + 1}`,
      description: faker.commerce.productDescription(),
      level: 0,
    });
  }

  // Level 1 - subcategories
  const subCount = Math.ceil(count / 3);
  for (let i = 0; i < subCount; i++) {
    categories.push({
      name: `${faker.commerce.department()} ${faker.helpers.arrayElement(['Collection', 'Series', 'Line'])}`,
      description: faker.commerce.productDescription(),
      level: 1,
    });
  }

  // Level 2 - sub-subcategories
  const remaining = count - categories.length;
  for (let i = 0; i < remaining; i++) {
    categories.push({
      name: `${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
      description: faker.commerce.productDescription(),
      level: 2,
    });
  }

  return categories;
}

// ============================================
// Customer Generators
// ============================================

export interface CustomerData {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: AddressData;
  shipping: AddressData;
}

export interface AddressData {
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

export function generateAddress(firstName: string, lastName: string): AddressData {
  // Mix of US, CA, and UK addresses
  const country = faker.helpers.weightedArrayElement([
    { value: 'US', weight: 60 },
    { value: 'CA', weight: 25 },
    { value: 'GB', weight: 15 },
  ]);

  let state: string;
  let postcode: string;

  if (country === 'US') {
    state = faker.location.state({ abbreviated: true });
    postcode = faker.location.zipCode();
  } else if (country === 'CA') {
    state = faker.helpers.arrayElement(['ON', 'BC', 'AB', 'QC', 'MB', 'SK']);
    postcode = faker.location.zipCode('?#? #?#');
  } else {
    state = faker.location.county();
    postcode = faker.location.zipCode('??# #??');
  }

  return {
    first_name: firstName,
    last_name: lastName,
    company: faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 }) ?? '',
    address_1: faker.location.streetAddress(),
    address_2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.2 }) ?? '',
    city: faker.location.city(),
    state,
    postcode,
    country,
    email: faker.internet.email({ firstName, lastName }),
    phone: faker.phone.number(),
  };
}

export function generateCustomer(options: { withAddresses?: boolean } = {}): CustomerData {
  const { withAddresses = true } = options;

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    email: faker.internet.email({ firstName, lastName }),
    first_name: firstName,
    last_name: lastName,
    username: faker.internet.username({ firstName, lastName }),
    billing: withAddresses ? generateAddress(firstName, lastName) : {
      first_name: '', last_name: '', company: '', address_1: '',
      address_2: '', city: '', state: '', postcode: '', country: '',
    },
    shipping: withAddresses ? generateAddress(firstName, lastName) : {
      first_name: '', last_name: '', company: '', address_1: '',
      address_2: '', city: '', state: '', postcode: '', country: '',
    },
  };
}

// ============================================
// Order Generators
// ============================================

export interface OrderData {
  customer_id: number;
  status: typeof ORDER_STATUSES[number];
  billing: AddressData;
  shipping: Omit<AddressData, 'email' | 'phone'>;
  line_items: { product_id: number; quantity: number }[];
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
}

export function generateOrder(
  customerId: number,
  productIds: number[],
  customerBilling: AddressData
): OrderData {
  const status = faker.helpers.arrayElement(ORDER_STATUSES);
  const itemCount = faker.number.int({ min: 1, max: 5 });

  const paymentMethods = [
    { method: 'bacs', title: 'Direct Bank Transfer' },
    { method: 'cheque', title: 'Check Payments' },
    { method: 'cod', title: 'Cash on Delivery' },
    { method: 'paypal', title: 'PayPal' },
    { method: 'stripe', title: 'Credit Card (Stripe)' },
  ];
  const payment = faker.helpers.arrayElement(paymentMethods);

  // Select random products for line items
  const selectedProducts = faker.helpers.arrayElements(productIds, itemCount);

  return {
    customer_id: customerId,
    status,
    billing: customerBilling,
    shipping: {
      first_name: customerBilling.first_name,
      last_name: customerBilling.last_name,
      company: customerBilling.company,
      address_1: customerBilling.address_1,
      address_2: customerBilling.address_2,
      city: customerBilling.city,
      state: customerBilling.state,
      postcode: customerBilling.postcode,
      country: customerBilling.country,
    },
    line_items: selectedProducts.map(productId => ({
      product_id: productId,
      quantity: faker.number.int({ min: 1, max: 3 }),
    })),
    payment_method: payment.method,
    payment_method_title: payment.title,
    set_paid: ['completed', 'processing'].includes(status),
  };
}

// ============================================
// Edge Case Generators
// ============================================

/**
 * Generate a product with 600+ variations (BC limit edge case)
 */
export function generateHighVariantProduct(categoryIds: number[]): VariableProductData {
  // 10 colors x 10 sizes x 7 materials = 700 combinations
  return {
    name: `High Variant Test Product ${faker.string.alphanumeric(4)}`,
    type: 'variable',
    description: generateProductDescription('medium'),
    short_description: 'Product with 600+ variant combinations for testing BC limit',
    sku: generateSKU('HV'),
    categories: categoryIds.length > 0
      ? [{ id: faker.helpers.arrayElement(categoryIds) }]
      : [],
    images: [{ src: getPlaceholderImage(640, 480) }],
    attributes: [
      {
        name: 'Color',
        visible: true,
        variation: true,
        options: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Orange', 'Purple', 'Pink', 'Gray'],
      },
      {
        name: 'Size',
        visible: true,
        variation: true,
        options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
      },
      {
        name: 'Material',
        visible: true,
        variation: true,
        options: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Velvet'],
      },
    ],
  };
}

/**
 * Generate a product with unicode characters in name/description
 */
export function generateUnicodeProduct(categoryIds: number[]): SimpleProductData {
  const unicodeNames = [
    'Café Deluxe Espresso Maker ™',
    'Über Premium Widget Set ®',
    '日本製 Quality Tool Kit',
    'Résumé Builder Pro ©',
    'Naïve Art Collection ★',
  ];

  const product = generateSimpleProduct(categoryIds);
  product.name = faker.helpers.arrayElement(unicodeNames);
  product.description = `<p>Special characters: é, ñ, ü, ø, å, ß, 中文, 日本語, 한국어</p>\n${product.description}`;

  return product;
}
