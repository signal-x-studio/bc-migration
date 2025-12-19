<?php
/**
 * Cart management for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Cart class.
 *
 * Handles shopping cart operations.
 */
class BC_Bridge_Cart {

    /**
     * Cookie name for cart ID.
     */
    private const CART_COOKIE = 'bc_bridge_cart_id';

    /**
     * Cookie expiration in days.
     */
    private const CART_COOKIE_DAYS = 30;

    /**
     * API client instance.
     *
     * @var BC_Bridge_API_Client
     */
    private BC_Bridge_API_Client $api;

    /**
     * Current cart ID.
     *
     * @var string|null
     */
    private ?string $cart_id = null;

    /**
     * Constructor.
     *
     * @param BC_Bridge_API_Client $api API client instance.
     */
    public function __construct( BC_Bridge_API_Client $api ) {
        $this->api = $api;
        $this->cart_id = $this->get_cart_id_from_cookie();
    }

    /**
     * Get cart ID from cookie.
     *
     * @return string|null
     */
    private function get_cart_id_from_cookie(): ?string {
        return $_COOKIE[ self::CART_COOKIE ] ?? null;
    }

    /**
     * Set cart ID cookie.
     *
     * @param string $cart_id Cart ID.
     * @return void
     */
    private function set_cart_cookie( string $cart_id ): void {
        $expiry = time() + ( self::CART_COOKIE_DAYS * DAY_IN_SECONDS );

        setcookie(
            self::CART_COOKIE,
            $cart_id,
            [
                'expires'  => $expiry,
                'path'     => COOKIEPATH,
                'domain'   => COOKIE_DOMAIN,
                'secure'   => is_ssl(),
                'httponly' => true,
                'samesite' => 'Lax',
            ]
        );

        $this->cart_id = $cart_id;
    }

    /**
     * Clear cart cookie.
     *
     * @return void
     */
    private function clear_cart_cookie(): void {
        setcookie(
            self::CART_COOKIE,
            '',
            [
                'expires'  => time() - 3600,
                'path'     => COOKIEPATH,
                'domain'   => COOKIE_DOMAIN,
                'secure'   => is_ssl(),
                'httponly' => true,
                'samesite' => 'Lax',
            ]
        );

        $this->cart_id = null;
    }

    /**
     * Get current cart.
     *
     * @return array|null Cart data or null if no cart.
     */
    public function get_cart(): ?array {
        if ( ! $this->cart_id ) {
            return null;
        }

        $response = $this->api->get_cart( $this->cart_id );

        if ( is_wp_error( $response ) ) {
            // Cart may have expired, clear cookie.
            $this->clear_cart_cookie();
            return null;
        }

        return $response['data'] ?? null;
    }

    /**
     * Get or create cart.
     *
     * @param array $line_items Initial line items if creating new cart.
     * @return array|WP_Error
     */
    public function get_or_create_cart( array $line_items = [] ): array|\WP_Error {
        if ( $this->cart_id ) {
            $cart = $this->get_cart();
            if ( $cart ) {
                return $cart;
            }
        }

        // Create new cart.
        $response = $this->api->create_cart( $line_items );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $cart_id = $response['data']['id'] ?? null;

        if ( $cart_id ) {
            $this->set_cart_cookie( $cart_id );
        }

        return $response['data'] ?? [];
    }

    /**
     * Add item to cart.
     *
     * @param int   $product_id Product ID.
     * @param int   $quantity   Quantity.
     * @param int   $variant_id Variant ID (optional).
     * @param array $options    Product options (optional).
     * @return array|WP_Error
     */
    public function add_item( int $product_id, int $quantity = 1, int $variant_id = 0, array $options = [] ): array|\WP_Error {
        $line_item = [
            'product_id' => $product_id,
            'quantity'   => $quantity,
        ];

        if ( $variant_id > 0 ) {
            $line_item['variant_id'] = $variant_id;
        }

        if ( ! empty( $options ) ) {
            $line_item['option_selections'] = $options;
        }

        // If no cart exists, create one with this item.
        if ( ! $this->cart_id ) {
            return $this->get_or_create_cart( [ $line_item ] );
        }

        // Add to existing cart.
        $response = $this->api->add_to_cart( $this->cart_id, [ $line_item ] );

        if ( is_wp_error( $response ) ) {
            // If cart is invalid, create new one.
            if ( strpos( $response->get_error_message(), 'not found' ) !== false ) {
                $this->clear_cart_cookie();
                return $this->get_or_create_cart( [ $line_item ] );
            }
            return $response;
        }

        return $response['data'] ?? [];
    }

    /**
     * Update item quantity.
     *
     * @param string $item_id  Line item ID.
     * @param int    $quantity New quantity.
     * @return array|WP_Error
     */
    public function update_item( string $item_id, int $quantity ): array|\WP_Error {
        if ( ! $this->cart_id ) {
            return new \WP_Error( 'no_cart', __( 'No cart exists.', 'bc-bridge' ) );
        }

        if ( $quantity <= 0 ) {
            return $this->remove_item( $item_id );
        }

        return $this->api->update_cart_item( $this->cart_id, $item_id, $quantity );
    }

    /**
     * Remove item from cart.
     *
     * @param string $item_id Line item ID.
     * @return array|WP_Error
     */
    public function remove_item( string $item_id ): array|\WP_Error {
        if ( ! $this->cart_id ) {
            return new \WP_Error( 'no_cart', __( 'No cart exists.', 'bc-bridge' ) );
        }

        return $this->api->remove_cart_item( $this->cart_id, $item_id );
    }

    /**
     * Get cart item count.
     *
     * @return int
     */
    public function get_item_count(): int {
        $cart = $this->get_cart();

        if ( ! $cart ) {
            return 0;
        }

        $count = 0;

        foreach ( $cart['line_items']['physical_items'] ?? [] as $item ) {
            $count += $item['quantity'];
        }

        foreach ( $cart['line_items']['digital_items'] ?? [] as $item ) {
            $count += $item['quantity'];
        }

        return $count;
    }

    /**
     * Get cart subtotal.
     *
     * @return float
     */
    public function get_subtotal(): float {
        $cart = $this->get_cart();

        if ( ! $cart ) {
            return 0.0;
        }

        return (float) ( $cart['cart_amount'] ?? 0 );
    }

    /**
     * Get checkout URL.
     *
     * @return string|WP_Error
     */
    public function get_checkout_url(): string|\WP_Error {
        if ( ! $this->cart_id ) {
            return new \WP_Error( 'no_cart', __( 'No cart exists.', 'bc-bridge' ) );
        }

        $response = $this->api->get_checkout_url( $this->cart_id );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $checkout_type = BC_Bridge::get_settings( 'checkout_type' );

        if ( 'embedded' === $checkout_type ) {
            return $response['data']['embedded_checkout_url'] ?? '';
        }

        return $response['data']['checkout_url'] ?? '';
    }

    /**
     * Clear cart.
     *
     * @return void
     */
    public function clear(): void {
        $this->clear_cart_cookie();
    }

    // =========================================================================
    // AJAX Handlers
    // =========================================================================

    /**
     * AJAX: Add to cart.
     *
     * @return void
     */
    public function ajax_add_to_cart(): void {
        check_ajax_referer( 'bc_bridge_nonce', 'nonce' );

        $product_id = (int) ( $_POST['product_id'] ?? 0 );
        $quantity   = (int) ( $_POST['quantity'] ?? 1 );
        $variant_id = (int) ( $_POST['variant_id'] ?? 0 );

        if ( ! $product_id ) {
            wp_send_json_error( [ 'message' => __( 'Invalid product.', 'bc-bridge' ) ] );
        }

        $result = $this->add_item( $product_id, $quantity, $variant_id );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => $result->get_error_message() ] );
        }

        wp_send_json_success( [
            'cart'       => $result,
            'item_count' => $this->get_item_count(),
            'subtotal'   => $this->get_subtotal(),
        ] );
    }

    /**
     * AJAX: Update cart.
     *
     * @return void
     */
    public function ajax_update_cart(): void {
        check_ajax_referer( 'bc_bridge_nonce', 'nonce' );

        $item_id  = sanitize_text_field( $_POST['item_id'] ?? '' );
        $quantity = (int) ( $_POST['quantity'] ?? 1 );

        if ( ! $item_id ) {
            wp_send_json_error( [ 'message' => __( 'Invalid item.', 'bc-bridge' ) ] );
        }

        $result = $this->update_item( $item_id, $quantity );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => $result->get_error_message() ] );
        }

        wp_send_json_success( [
            'cart'       => $result['data'] ?? $result,
            'item_count' => $this->get_item_count(),
            'subtotal'   => $this->get_subtotal(),
        ] );
    }

    /**
     * AJAX: Remove from cart.
     *
     * @return void
     */
    public function ajax_remove_from_cart(): void {
        check_ajax_referer( 'bc_bridge_nonce', 'nonce' );

        $item_id = sanitize_text_field( $_POST['item_id'] ?? '' );

        if ( ! $item_id ) {
            wp_send_json_error( [ 'message' => __( 'Invalid item.', 'bc-bridge' ) ] );
        }

        $result = $this->remove_item( $item_id );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => $result->get_error_message() ] );
        }

        wp_send_json_success( [
            'cart'       => $result['data'] ?? $result,
            'item_count' => $this->get_item_count(),
            'subtotal'   => $this->get_subtotal(),
        ] );
    }
}
