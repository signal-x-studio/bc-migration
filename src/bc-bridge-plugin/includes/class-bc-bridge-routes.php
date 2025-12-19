<?php
/**
 * Route handling for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Routes class.
 *
 * Handles URL routing and WooCommerce route interception.
 */
class BC_Bridge_Routes {

    /**
     * Initialize routes.
     *
     * @return void
     */
    public static function init(): void {
        // Only intercept routes if configured.
        if ( ! BC_Bridge::is_configured() ) {
            return;
        }

        // Add rewrite rules.
        add_action( 'init', [ __CLASS__, 'add_rewrite_rules' ], 10 );
        add_filter( 'query_vars', [ __CLASS__, 'add_query_vars' ] );

        // Template redirect.
        add_action( 'template_redirect', [ __CLASS__, 'handle_routes' ] );

        // Filter page templates.
        add_filter( 'template_include', [ __CLASS__, 'template_include' ] );
    }

    /**
     * Add rewrite rules.
     *
     * @return void
     */
    public static function add_rewrite_rules(): void {
        // Product routes.
        add_rewrite_rule(
            '^shop/?$',
            'index.php?bc_bridge_route=shop',
            'top'
        );

        add_rewrite_rule(
            '^shop/page/([0-9]+)/?$',
            'index.php?bc_bridge_route=shop&paged=$matches[1]',
            'top'
        );

        add_rewrite_rule(
            '^product/([^/]+)/?$',
            'index.php?bc_bridge_route=product&bc_product_slug=$matches[1]',
            'top'
        );

        // Category routes.
        add_rewrite_rule(
            '^product-category/([^/]+)/?$',
            'index.php?bc_bridge_route=category&bc_category_slug=$matches[1]',
            'top'
        );

        add_rewrite_rule(
            '^product-category/([^/]+)/page/([0-9]+)/?$',
            'index.php?bc_bridge_route=category&bc_category_slug=$matches[1]&paged=$matches[2]',
            'top'
        );

        // Cart route.
        add_rewrite_rule(
            '^cart/?$',
            'index.php?bc_bridge_route=cart',
            'top'
        );

        // Checkout route.
        add_rewrite_rule(
            '^checkout/?$',
            'index.php?bc_bridge_route=checkout',
            'top'
        );

        // Order confirmation route.
        add_rewrite_rule(
            '^order-received/([^/]+)/?$',
            'index.php?bc_bridge_route=order-received&bc_order_id=$matches[1]',
            'top'
        );
    }

    /**
     * Add query vars.
     *
     * @param array $vars Existing query vars.
     * @return array
     */
    public static function add_query_vars( array $vars ): array {
        $vars[] = 'bc_bridge_route';
        $vars[] = 'bc_product_slug';
        $vars[] = 'bc_category_slug';
        $vars[] = 'bc_order_id';
        return $vars;
    }

    /**
     * Handle routes.
     *
     * @return void
     */
    public static function handle_routes(): void {
        $route = get_query_var( 'bc_bridge_route' );

        if ( ! $route ) {
            return;
        }

        // Set global data based on route.
        global $bc_bridge_data;

        switch ( $route ) {
            case 'shop':
                $bc_bridge_data = self::get_shop_data();
                break;

            case 'product':
                $bc_bridge_data = self::get_product_data();
                if ( is_wp_error( $bc_bridge_data ) ) {
                    global $wp_query;
                    $wp_query->set_404();
                    status_header( 404 );
                }
                break;

            case 'category':
                $bc_bridge_data = self::get_category_data();
                if ( is_wp_error( $bc_bridge_data ) ) {
                    global $wp_query;
                    $wp_query->set_404();
                    status_header( 404 );
                }
                break;

            case 'cart':
                $bc_bridge_data = self::get_cart_data();
                break;

            case 'checkout':
                $bc_bridge_data = self::get_checkout_data();
                break;

            case 'order-received':
                $bc_bridge_data = self::get_order_data();
                break;
        }
    }

    /**
     * Get shop page data.
     *
     * @return array
     */
    private static function get_shop_data(): array {
        $api  = bc_bridge()->api;
        $page = max( 1, get_query_var( 'paged', 1 ) );

        $settings = BC_Bridge::get_settings();
        $per_page = $settings['products_per_page'] ?? 12;

        $response = $api->get_products( [
            'page'  => $page,
            'limit' => $per_page,
        ] );

        return [
            'route'      => 'shop',
            'products'   => is_wp_error( $response ) ? [] : ( $response['data'] ?? [] ),
            'pagination' => is_wp_error( $response ) ? [] : ( $response['meta']['pagination'] ?? [] ),
            'page'       => $page,
            'per_page'   => $per_page,
        ];
    }

    /**
     * Get product page data.
     *
     * @return array|WP_Error
     */
    private static function get_product_data(): array|\WP_Error {
        $api  = bc_bridge()->api;
        $slug = get_query_var( 'bc_product_slug' );

        $response = $api->get_product_by_slug( $slug );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return [
            'route'   => 'product',
            'product' => $response['data'] ?? [],
        ];
    }

    /**
     * Get category page data.
     *
     * @return array|WP_Error
     */
    private static function get_category_data(): array|\WP_Error {
        $api  = bc_bridge()->api;
        $slug = get_query_var( 'bc_category_slug' );
        $page = max( 1, get_query_var( 'paged', 1 ) );

        // First, find category by slug (need to fetch all and filter).
        $categories = $api->get_categories( [ 'limit' => 250 ] );

        if ( is_wp_error( $categories ) ) {
            return $categories;
        }

        $category = null;
        foreach ( $categories['data'] ?? [] as $cat ) {
            if ( sanitize_title( $cat['name'] ) === $slug || $cat['custom_url']['url'] === "/{$slug}/" ) {
                $category = $cat;
                break;
            }
        }

        if ( ! $category ) {
            return new \WP_Error( 'category_not_found', __( 'Category not found.', 'bc-bridge' ) );
        }

        $settings = BC_Bridge::get_settings();
        $per_page = $settings['products_per_page'] ?? 12;

        $products = $api->get_products_by_category( $category['id'], [
            'page'  => $page,
            'limit' => $per_page,
        ] );

        return [
            'route'      => 'category',
            'category'   => $category,
            'products'   => is_wp_error( $products ) ? [] : ( $products['data'] ?? [] ),
            'pagination' => is_wp_error( $products ) ? [] : ( $products['meta']['pagination'] ?? [] ),
            'page'       => $page,
            'per_page'   => $per_page,
        ];
    }

    /**
     * Get cart page data.
     *
     * @return array
     */
    private static function get_cart_data(): array {
        $cart = bc_bridge()->cart->get_cart();

        return [
            'route' => 'cart',
            'cart'  => $cart,
        ];
    }

    /**
     * Get checkout page data.
     *
     * @return array
     */
    private static function get_checkout_data(): array {
        $cart         = bc_bridge()->cart;
        $checkout_url = $cart->get_checkout_url();

        return [
            'route'        => 'checkout',
            'checkout_url' => is_wp_error( $checkout_url ) ? '' : $checkout_url,
            'cart'         => $cart->get_cart(),
        ];
    }

    /**
     * Get order confirmation data.
     *
     * @return array
     */
    private static function get_order_data(): array {
        $order_id = get_query_var( 'bc_order_id' );

        return [
            'route'    => 'order-received',
            'order_id' => $order_id,
        ];
    }

    /**
     * Include template.
     *
     * @param string $template Current template.
     * @return string
     */
    public static function template_include( string $template ): string {
        $route = get_query_var( 'bc_bridge_route' );

        if ( ! $route ) {
            return $template;
        }

        // Check for theme override.
        $theme_template = locate_template( "bc-bridge/{$route}.php" );

        if ( $theme_template ) {
            return $theme_template;
        }

        // Use plugin template.
        $plugin_template = BC_BRIDGE_PLUGIN_DIR . "templates/{$route}.php";

        if ( file_exists( $plugin_template ) ) {
            return $plugin_template;
        }

        return $template;
    }

    /**
     * Flush rewrite rules.
     *
     * @return void
     */
    public static function flush_rules(): void {
        self::add_rewrite_rules();
        flush_rewrite_rules();
    }

    /**
     * Get URL for BC Bridge route.
     *
     * @param string $route Route name.
     * @param array  $args  Additional arguments.
     * @return string
     */
    public static function get_url( string $route, array $args = [] ): string {
        switch ( $route ) {
            case 'shop':
                $url = home_url( '/shop/' );
                break;

            case 'product':
                $slug = $args['slug'] ?? '';
                $url  = home_url( "/product/{$slug}/" );
                break;

            case 'category':
                $slug = $args['slug'] ?? '';
                $url  = home_url( "/product-category/{$slug}/" );
                break;

            case 'cart':
                $url = home_url( '/cart/' );
                break;

            case 'checkout':
                $url = home_url( '/checkout/' );
                break;

            default:
                $url = home_url();
        }

        if ( ! empty( $args['page'] ) && $args['page'] > 1 ) {
            $url .= "page/{$args['page']}/";
        }

        return $url;
    }
}
