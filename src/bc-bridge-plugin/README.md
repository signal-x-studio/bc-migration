# BC Bridge - WordPress to BigCommerce Integration

BC Bridge connects your WordPress site to BigCommerce, enabling you to display and sell products without rebuilding your theme. Unlike sync-based solutions, BC Bridge uses direct API calls for real-time data with intelligent caching.

## Features

- **Real-Time Data**: Direct API calls ensure prices, inventory, and product info are always current
- **Intelligent Caching**: Smart caching reduces API calls while maintaining freshness
- **Theme-Agnostic**: Works with any WordPress theme using shortcodes or custom routes
- **No Product Limits**: Handles catalogs of any size (unlike sync-based plugins)
- **Embedded Checkout**: Keep customers on your site with BigCommerce's secure checkout
- **No Database Bloat**: Minimal local storage - data lives in BigCommerce

## Requirements

- WordPress 6.2 or higher
- PHP 8.1 or higher
- BigCommerce store with API credentials
- SSL certificate (required for checkout)

## Quick Start

### 1. Install the Plugin

**From ZIP:**
1. Download `bc-bridge-x.x.x.zip` from the releases
2. Go to Plugins > Add New > Upload Plugin
3. Upload the ZIP file and activate

**For Development:**
```bash
cd wp-content/plugins
git clone https://github.com/bigcommerce/bc-bridge.git
cd bc-bridge
make install
```

### 2. Configure BigCommerce API

1. Log into your BigCommerce admin
2. Go to Settings > API Accounts > Create API Account
3. Name it "BC Bridge" and select these scopes:
   - **Products**: Read-only
   - **Carts**: Modify
   - **Checkouts**: Modify
   - **Store Information**: Read-only
4. Copy the **Store Hash** and **Access Token**

### 3. Connect to BigCommerce

1. Go to BC Bridge > Settings in WordPress admin
2. Enter your Store Hash and Access Token
3. Click "Test Connection" to verify
4. Save settings

### 4. Display Products

**Using Routes (automatic):**
- Shop: `yoursite.com/shop/`
- Product: `yoursite.com/product/product-name/`
- Category: `yoursite.com/product-category/category-name/`
- Cart: `yoursite.com/cart/`
- Checkout: `yoursite.com/checkout/`

**Using Shortcodes (flexible):**
```php
// Product grid (12 products, 4 columns)
[bc_products limit="12" columns="4"]

// Products from specific category
[bc_products category="clothing" limit="8"]

// Single product by ID
[bc_product id="123"]

// Single product by slug
[bc_product slug="awesome-product"]

// Shopping cart
[bc_cart]

// Checkout
[bc_checkout]
```

## Shortcode Reference

### [bc_products]

Display a grid of products.

| Attribute | Default | Description |
|-----------|---------|-------------|
| `limit` | 12 | Number of products to display |
| `columns` | 4 | Grid columns (2, 3, or 4) |
| `category` | - | Filter by category slug |
| `orderby` | date | Sort by: date, price, title |
| `order` | desc | Sort order: asc, desc |

### [bc_product]

Display a single product.

| Attribute | Default | Description |
|-----------|---------|-------------|
| `id` | - | BigCommerce product ID |
| `slug` | - | Product URL slug |

### [bc_cart]

Display the shopping cart. No attributes.

### [bc_checkout]

Display checkout. Renders embedded checkout or redirects based on settings.

## Theme Customization

### Template Overrides

Copy templates from `bc-bridge/templates/` to your theme's `bc-bridge/` folder:

```
your-theme/
└── bc-bridge/
    ├── shop.php           # Shop page
    ├── product.php        # Single product
    ├── category.php       # Category archive
    ├── cart.php           # Cart page
    ├── checkout.php       # Checkout page
    └── partials/
        └── product-card.php  # Product card component
```

### CSS Customization

Override CSS variables in your theme:

```css
:root {
    --bc-primary: #2563eb;
    --bc-primary-hover: #1d4ed8;
    --bc-text: #1f2937;
    --bc-border: #e5e7eb;
    --bc-radius: 8px;
}
```

### JavaScript Hooks

```javascript
// After add to cart
$(document).on('bc_bridge_added_to_cart', function(e, data) {
    console.log('Added to cart:', data);
});

// After cart update
$(document).on('bc_bridge_cart_updated', function(e, data) {
    console.log('Cart updated:', data);
});
```

## API Reference

### PHP Functions

```php
// Get API client instance
$api = bc_bridge()->api;

// Get products
$products = $api->get_products([
    'limit' => 12,
    'page' => 1,
    'categories:in' => 123,
]);

// Get single product
$product = $api->get_product(123);

// Get cart
$cart = bc_bridge()->cart->get_cart();

// Add to cart
$result = bc_bridge()->cart->add_item($product_id, $quantity, $variant_id);

// Get checkout URL
$checkout_url = bc_bridge()->cart->get_checkout_url();

// Clear cache
BC_Bridge_Cache::clear_all();
BC_Bridge_Cache::clear_group('products');
```

## Build Commands

```bash
# Install dependencies
make install

# Build for production
make build

# Create distribution ZIP
make zip

# Deploy to test site
WP_PLUGINS_DIR=/path/to/plugins make deploy

# Create symlink for development
WP_PLUGINS_DIR=/path/to/plugins make deploy-link

# Watch for changes
make watch

# Run linters
make lint

# Bump version
make version NEW_VERSION=1.1.0
```

## Troubleshooting

### Products Not Loading

1. Verify API credentials in Settings
2. Check that products are visible in BigCommerce
3. Clear the cache via BC Bridge > Tools

### 404 on Shop/Product Pages

1. Go to Settings > Permalinks
2. Click "Save Changes" to flush rewrite rules
3. Or run: BC Bridge > Tools > Flush Rewrite Rules

### Checkout Not Working

1. Ensure SSL is active on your site
2. Check checkout type setting (embedded vs redirect)
3. Verify Checkout API scope is enabled

### Rate Limiting

If you see rate limit errors:
1. Increase cache duration in Settings
2. BC Bridge handles rate limits automatically with retry logic

## Support

- **Documentation**: [developer.bigcommerce.com](https://developer.bigcommerce.com)
- **Issues**: [GitHub Issues](https://github.com/bigcommerce/bc-bridge/issues)
- **Support**: support@bigcommerce.com

## License

GPL v2 or later. See [LICENSE](LICENSE) for details.

## Changelog

### 1.0.0
- Initial release
- Direct API integration
- Product display (grid, single)
- Cart management
- Embedded checkout
- Theme template overrides
- Shortcode support
