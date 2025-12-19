import { NextRequest, NextResponse } from 'next/server';
import { createWCClient } from '@/lib/wc-client';

/**
 * Generate a WordPress plugin ZIP file with 301 redirects
 */

interface RedirectRule {
  from: string;
  to: string;
  type: 'product' | 'category' | 'page';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wcCredentials, bcDomain, format = 'plugin' } = body;

    if (!wcCredentials || !bcDomain) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize WC client
    const wcClient = await createWCClient(
      wcCredentials.url,
      wcCredentials.consumerKey,
      wcCredentials.consumerSecret
    );

    // Fetch all products and categories to generate redirects
    const redirects: RedirectRule[] = [];

    // Fetch products
    let page = 1;
    let hasMore = true;
    while (hasMore && page <= 20) {
      const response = await wcClient.get('products', { per_page: 100, page });
      if (response.data.length === 0) {
        hasMore = false;
      } else {
        for (const product of response.data) {
          if (product.slug) {
            redirects.push({
              from: `/product/${product.slug}/`,
              to: `${bcDomain}/${product.slug}/`,
              type: 'product',
            });
          }
        }
        page++;
      }
    }

    // Fetch categories
    page = 1;
    hasMore = true;
    while (hasMore && page <= 10) {
      const response = await wcClient.get('products/categories', { per_page: 100, page });
      if (response.data.length === 0) {
        hasMore = false;
      } else {
        for (const category of response.data) {
          if (category.slug) {
            redirects.push({
              from: `/product-category/${category.slug}/`,
              to: `${bcDomain}/${category.slug}/`,
              type: 'category',
            });
          }
        }
        page++;
      }
    }

    // Generate output based on format
    if (format === 'plugin') {
      const pluginCode = generateWordPressPlugin(redirects);

      return new NextResponse(pluginCode, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="wc-bc-redirects.php"',
        },
      });
    } else if (format === 'htaccess') {
      const htaccessCode = generateHtaccess(redirects, bcDomain);

      return new NextResponse(htaccessCode, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename=".htaccess-redirects"',
        },
      });
    } else if (format === 'nginx') {
      const nginxCode = generateNginx(redirects, bcDomain);

      return new NextResponse(nginxCode, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nginx-redirects.conf"',
        },
      });
    } else if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: {
          totalRedirects: redirects.length,
          byType: {
            product: redirects.filter(r => r.type === 'product').length,
            category: redirects.filter(r => r.type === 'category').length,
          },
          redirects,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });

  } catch (error) {
    console.error('Redirect generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate redirects',
      },
      { status: 500 }
    );
  }
}

function generateWordPressPlugin(redirects: RedirectRule[]): string {
  const redirectArray = redirects
    .map(r => `    '${r.from}' => '${r.to}',`)
    .join('\n');

  return `<?php
/**
 * Plugin Name: WC to BC Redirects
 * Plugin URI: https://github.com/your-repo
 * Description: Auto-generated 301 redirects for WooCommerce to BigCommerce migration
 * Version: 1.0.0
 * Author: Migration Tool
 * License: GPL v2 or later
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handle 301 redirects for migrated content
 */
add_action('template_redirect', function() {
    $redirects = [
${redirectArray}
    ];

    // Get current path
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Check for exact match
    if (isset($redirects[$path])) {
        wp_redirect($redirects[$path], 301);
        exit;
    }

    // Check without trailing slash
    $path_no_slash = rtrim($path, '/') . '/';
    if (isset($redirects[$path_no_slash])) {
        wp_redirect($redirects[$path_no_slash], 301);
        exit;
    }
});

/**
 * Add menu item to show redirect stats
 */
add_action('admin_menu', function() {
    add_management_page(
        'WC-BC Redirects',
        'WC-BC Redirects',
        'manage_options',
        'wc-bc-redirects',
        function() {
            $redirects = [
${redirectArray}
            ];

            echo '<div class="wrap">';
            echo '<h1>WooCommerce to BigCommerce Redirects</h1>';
            echo '<p>Total redirects: <strong>' . count($redirects) . '</strong></p>';
            echo '<table class="wp-list-table widefat fixed striped">';
            echo '<thead><tr><th>From (WC)</th><th>To (BC)</th></tr></thead>';
            echo '<tbody>';
            foreach (array_slice($redirects, 0, 100) as $from => $to) {
                echo '<tr><td>' . esc_html($from) . '</td><td>' . esc_html($to) . '</td></tr>';
            }
            echo '</tbody></table>';
            if (count($redirects) > 100) {
                echo '<p><em>Showing first 100 of ' . count($redirects) . ' redirects</em></p>';
            }
            echo '</div>';
        }
    );
});
`;
}

function generateHtaccess(redirects: RedirectRule[], bcDomain: string): string {
  const rules = redirects
    .map(r => `Redirect 301 ${r.from} ${r.to}`)
    .join('\n');

  return `# WooCommerce to BigCommerce Redirects
# Generated on ${new Date().toISOString()}
# Total redirects: ${redirects.length}

# Enable rewrite engine
RewriteEngine On

# Individual redirects
${rules}

# Catch-all for remaining product pages (optional)
# RewriteRule ^product/(.*)$ ${bcDomain}/$1 [R=301,L]

# Catch-all for category pages (optional)
# RewriteRule ^product-category/(.*)$ ${bcDomain}/$1 [R=301,L]
`;
}

function generateNginx(redirects: RedirectRule[], bcDomain: string): string {
  const rules = redirects
    .map(r => `    location = ${r.from} { return 301 ${r.to}; }`)
    .join('\n');

  return `# WooCommerce to BigCommerce Redirects
# Generated on ${new Date().toISOString()}
# Total redirects: ${redirects.length}
# Add this to your nginx server block

${rules}

# Catch-all patterns (uncomment if needed)
# location ~* ^/product/(.*)$ {
#     return 301 ${bcDomain}/$1;
# }
# location ~* ^/product-category/(.*)$ {
#     return 301 ${bcDomain}/$1;
# }
`;
}
