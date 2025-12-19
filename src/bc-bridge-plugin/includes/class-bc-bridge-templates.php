<?php
/**
 * Template handling for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Templates class.
 *
 * Handles template loading and shortcode rendering.
 */
class BC_Bridge_Templates {

    /**
     * Get template.
     *
     * @param string $template Template name.
     * @param array  $args     Template arguments.
     * @param bool   $return   Whether to return output instead of echoing.
     * @return string|void
     */
    public static function get_template( string $template, array $args = [], bool $return = false ) {
        // Look for theme override.
        $theme_template = locate_template( "bc-bridge/{$template}.php" );

        if ( $theme_template ) {
            $template_path = $theme_template;
        } else {
            $template_path = BC_BRIDGE_PLUGIN_DIR . "templates/{$template}.php";
        }

        if ( ! file_exists( $template_path ) ) {
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                // translators: %s is the template name.
                return sprintf( __( 'Template not found: %s', 'bc-bridge' ), $template );
            }
            return '';
        }

        // Extract args for template.
        extract( $args ); // phpcs:ignore

        if ( $return ) {
            ob_start();
            include $template_path;
            return ob_get_clean();
        }

        include $template_path;
    }

    /**
     * Products shortcode.
     *
     * @param array $atts Shortcode attributes.
     * @return string
     */
    public static function products_shortcode( array $atts = [] ): string {
        $atts = shortcode_atts( [
            'limit'    => 12,
            'columns'  => 4,
            'category' => '',
            'orderby'  => 'date',
            'order'    => 'desc',
        ], $atts, 'bc_products' );

        $api = bc_bridge()->api;

        $query = [
            'limit' => (int) $atts['limit'],
        ];

        // Filter by category if specified.
        if ( ! empty( $atts['category'] ) ) {
            // Try to get category by slug.
            $categories = $api->get_categories( [ 'limit' => 250 ] );
            if ( ! is_wp_error( $categories ) ) {
                foreach ( $categories['data'] ?? [] as $cat ) {
                    if ( sanitize_title( $cat['name'] ) === $atts['category'] ) {
                        $query['categories:in'] = $cat['id'];
                        break;
                    }
                }
            }
        }

        // Sort order.
        switch ( $atts['orderby'] ) {
            case 'price':
                $query['sort'] = 'price';
                break;
            case 'title':
                $query['sort'] = 'name';
                break;
            case 'date':
            default:
                $query['sort'] = 'date_created';
                break;
        }

        $query['direction'] = strtolower( $atts['order'] ) === 'asc' ? 'asc' : 'desc';

        $response = $api->get_products( $query );

        if ( is_wp_error( $response ) ) {
            return self::get_template( 'partials/error', [ 'error' => $response ], true );
        }

        return self::get_template( 'partials/product-grid', [
            'products' => $response['data'] ?? [],
            'columns'  => (int) $atts['columns'],
        ], true );
    }

    /**
     * Single product shortcode.
     *
     * @param array $atts Shortcode attributes.
     * @return string
     */
    public static function product_shortcode( array $atts = [] ): string {
        $atts = shortcode_atts( [
            'id'   => 0,
            'slug' => '',
        ], $atts, 'bc_product' );

        $api = bc_bridge()->api;

        if ( ! empty( $atts['id'] ) ) {
            $response = $api->get_product( (int) $atts['id'] );
        } elseif ( ! empty( $atts['slug'] ) ) {
            $response = $api->get_product_by_slug( $atts['slug'] );
        } else {
            return self::get_template( 'partials/error', [
                'error' => new \WP_Error( 'missing_attr', __( 'Please specify a product ID or slug.', 'bc-bridge' ) ),
            ], true );
        }

        if ( is_wp_error( $response ) ) {
            return self::get_template( 'partials/error', [ 'error' => $response ], true );
        }

        return self::get_template( 'partials/product-single', [
            'product' => $response['data'] ?? [],
        ], true );
    }

    /**
     * Cart shortcode.
     *
     * @param array $atts Shortcode attributes.
     * @return string
     */
    public static function cart_shortcode( array $atts = [] ): string {
        $cart = bc_bridge()->cart->get_cart();

        return self::get_template( 'partials/cart', [
            'cart' => $cart,
        ], true );
    }

    /**
     * Checkout shortcode.
     *
     * @param array $atts Shortcode attributes.
     * @return string
     */
    public static function checkout_shortcode( array $atts = [] ): string {
        $cart         = bc_bridge()->cart;
        $checkout_url = $cart->get_checkout_url();

        if ( is_wp_error( $checkout_url ) ) {
            return self::get_template( 'partials/error', [ 'error' => $checkout_url ], true );
        }

        $checkout_type = BC_Bridge::get_settings( 'checkout_type' );

        return self::get_template( 'partials/checkout', [
            'checkout_url'  => $checkout_url,
            'checkout_type' => $checkout_type,
            'cart'          => $cart->get_cart(),
        ], true );
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    /**
     * Format price.
     *
     * @param float  $price    Price value.
     * @param string $currency Currency code.
     * @return string
     */
    public static function format_price( float $price, string $currency = 'USD' ): string {
        $formatted = number_format( $price, 2, '.', ',' );

        switch ( $currency ) {
            case 'EUR':
                return '€' . $formatted;
            case 'GBP':
                return '£' . $formatted;
            case 'USD':
            default:
                return '$' . $formatted;
        }
    }

    /**
     * Get product URL.
     *
     * @param array $product Product data.
     * @return string
     */
    public static function get_product_url( array $product ): string {
        $slug = sanitize_title( $product['name'] );

        if ( ! empty( $product['custom_url']['url'] ) ) {
            $slug = trim( $product['custom_url']['url'], '/' );
        }

        return BC_Bridge_Routes::get_url( 'product', [ 'slug' => $slug ] );
    }

    /**
     * Get product image.
     *
     * @param array  $product Product data.
     * @param string $size    Image size (thumbnail, standard, full).
     * @return string
     */
    public static function get_product_image( array $product, string $size = 'standard' ): string {
        $images = $product['images'] ?? [];

        if ( empty( $images ) ) {
            return BC_BRIDGE_PLUGIN_URL . 'assets/images/placeholder.png';
        }

        // Find the thumbnail image.
        $image = $images[0];
        foreach ( $images as $img ) {
            if ( ! empty( $img['is_thumbnail'] ) ) {
                $image = $img;
                break;
            }
        }

        switch ( $size ) {
            case 'thumbnail':
                return $image['url_thumbnail'] ?? $image['url_standard'] ?? '';
            case 'full':
                return $image['url_zoom'] ?? $image['url_standard'] ?? '';
            case 'standard':
            default:
                return $image['url_standard'] ?? '';
        }
    }

    /**
     * Get add to cart button.
     *
     * @param array $product Product data.
     * @return string
     */
    public static function get_add_to_cart_button( array $product ): string {
        $button_text = __( 'Add to Cart', 'bc-bridge' );

        if ( $product['inventory_tracking'] !== 'none' && $product['inventory_level'] <= 0 ) {
            return sprintf(
                '<button type="button" class="bc-bridge-button bc-bridge-button--disabled" disabled>%s</button>',
                esc_html__( 'Out of Stock', 'bc-bridge' )
            );
        }

        $has_variants = ! empty( $product['variants'] ) && count( $product['variants'] ) > 1;

        if ( $has_variants ) {
            return sprintf(
                '<a href="%s" class="bc-bridge-button bc-bridge-button--primary">%s</a>',
                esc_url( self::get_product_url( $product ) ),
                esc_html__( 'Select Options', 'bc-bridge' )
            );
        }

        return sprintf(
            '<button type="button" class="bc-bridge-button bc-bridge-button--primary bc-bridge-add-to-cart" data-product-id="%d">%s</button>',
            (int) $product['id'],
            esc_html( $button_text )
        );
    }

    /**
     * Render pagination.
     *
     * @param array  $pagination Pagination data from API.
     * @param string $base_url   Base URL for pagination links.
     * @return string
     */
    public static function render_pagination( array $pagination, string $base_url = '' ): string {
        $total_pages  = $pagination['total_pages'] ?? 1;
        $current_page = $pagination['current_page'] ?? 1;

        if ( $total_pages <= 1 ) {
            return '';
        }

        $output = '<nav class="bc-bridge-pagination">';
        $output .= '<ul class="bc-bridge-pagination__list">';

        // Previous link.
        if ( $current_page > 1 ) {
            $prev_url = add_query_arg( 'paged', $current_page - 1, $base_url );
            $output .= sprintf(
                '<li class="bc-bridge-pagination__item bc-bridge-pagination__item--prev"><a href="%s">%s</a></li>',
                esc_url( $prev_url ),
                esc_html__( 'Previous', 'bc-bridge' )
            );
        }

        // Page numbers.
        for ( $i = 1; $i <= $total_pages; $i++ ) {
            if ( $i === $current_page ) {
                $output .= sprintf(
                    '<li class="bc-bridge-pagination__item bc-bridge-pagination__item--current"><span>%d</span></li>',
                    $i
                );
            } else {
                $page_url = add_query_arg( 'paged', $i, $base_url );
                $output .= sprintf(
                    '<li class="bc-bridge-pagination__item"><a href="%s">%d</a></li>',
                    esc_url( $page_url ),
                    $i
                );
            }
        }

        // Next link.
        if ( $current_page < $total_pages ) {
            $next_url = add_query_arg( 'paged', $current_page + 1, $base_url );
            $output .= sprintf(
                '<li class="bc-bridge-pagination__item bc-bridge-pagination__item--next"><a href="%s">%s</a></li>',
                esc_url( $next_url ),
                esc_html__( 'Next', 'bc-bridge' )
            );
        }

        $output .= '</ul>';
        $output .= '</nav>';

        return $output;
    }
}
