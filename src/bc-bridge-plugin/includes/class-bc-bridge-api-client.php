<?php
/**
 * BigCommerce API Client.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge API Client class.
 *
 * Handles all communication with the BigCommerce REST API.
 */
class BC_Bridge_API_Client {

    /**
     * API base URL template.
     */
    private const API_BASE_URL = 'https://api.bigcommerce.com/stores/%s/v3';

    /**
     * Store hash.
     *
     * @var string
     */
    private string $store_hash;

    /**
     * Access token.
     *
     * @var string
     */
    private string $access_token;

    /**
     * Channel ID.
     *
     * @var int
     */
    private int $channel_id;

    /**
     * Rate limit remaining.
     *
     * @var int
     */
    private int $rate_limit_remaining = 150;

    /**
     * Rate limit reset time.
     *
     * @var int
     */
    private int $rate_limit_reset = 0;

    /**
     * Constructor.
     */
    public function __construct() {
        $settings = BC_Bridge::get_settings();

        $this->store_hash   = $settings['store_hash'] ?? '';
        $this->access_token = $settings['access_token'] ?? '';
        $this->channel_id   = (int) ( $settings['channel_id'] ?? 1 );
    }

    /**
     * Check if API is configured.
     *
     * @return bool
     */
    public function is_configured(): bool {
        return ! empty( $this->store_hash ) && ! empty( $this->access_token );
    }

    /**
     * Get API base URL.
     *
     * @return string
     */
    private function get_base_url(): string {
        return sprintf( self::API_BASE_URL, $this->store_hash );
    }

    /**
     * Make API request.
     *
     * @param string $method   HTTP method.
     * @param string $endpoint API endpoint.
     * @param array  $data     Request data.
     * @param array  $query    Query parameters.
     * @return array|WP_Error
     */
    public function request( string $method, string $endpoint, array $data = [], array $query = [] ): array|\WP_Error {
        if ( ! $this->is_configured() ) {
            return new \WP_Error( 'bc_bridge_not_configured', __( 'BC Bridge is not configured.', 'bc-bridge' ) );
        }

        // Check rate limit.
        if ( $this->rate_limit_remaining <= 0 && time() < $this->rate_limit_reset ) {
            $wait_time = $this->rate_limit_reset - time();
            return new \WP_Error(
                'bc_bridge_rate_limited',
                sprintf( __( 'Rate limited. Please wait %d seconds.', 'bc-bridge' ), $wait_time )
            );
        }

        $url = $this->get_base_url() . $endpoint;

        if ( ! empty( $query ) ) {
            $url = add_query_arg( $query, $url );
        }

        $args = [
            'method'  => $method,
            'headers' => [
                'X-Auth-Token' => $this->access_token,
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ],
            'timeout' => 30,
        ];

        if ( ! empty( $data ) && in_array( $method, [ 'POST', 'PUT', 'PATCH' ], true ) ) {
            $args['body'] = wp_json_encode( $data );
        }

        $response = wp_remote_request( $url, $args );

        if ( is_wp_error( $response ) ) {
            $this->log_error( 'API request failed', [
                'endpoint' => $endpoint,
                'error'    => $response->get_error_message(),
            ] );
            return $response;
        }

        // Update rate limit info.
        $this->update_rate_limits( $response );

        $status_code = wp_remote_retrieve_response_code( $response );
        $body        = wp_remote_retrieve_body( $response );
        $decoded     = json_decode( $body, true );

        if ( $status_code >= 400 ) {
            $error_message = $decoded['title'] ?? $decoded['message'] ?? __( 'API request failed', 'bc-bridge' );
            $this->log_error( 'API error response', [
                'endpoint'    => $endpoint,
                'status_code' => $status_code,
                'response'    => $decoded,
            ] );
            return new \WP_Error( 'bc_bridge_api_error', $error_message, [ 'status' => $status_code ] );
        }

        return $decoded ?? [];
    }

    /**
     * Update rate limit tracking from response headers.
     *
     * @param array $response WordPress HTTP response.
     * @return void
     */
    private function update_rate_limits( array $response ): void {
        $headers = wp_remote_retrieve_headers( $response );

        if ( isset( $headers['x-rate-limit-requests-left'] ) ) {
            $this->rate_limit_remaining = (int) $headers['x-rate-limit-requests-left'];
        }

        if ( isset( $headers['x-rate-limit-time-reset-ms'] ) ) {
            $this->rate_limit_reset = time() + (int) ceil( $headers['x-rate-limit-time-reset-ms'] / 1000 );
        }
    }

    /**
     * GET request helper.
     *
     * @param string $endpoint API endpoint.
     * @param array  $query    Query parameters.
     * @return array|WP_Error
     */
    public function get( string $endpoint, array $query = [] ): array|\WP_Error {
        return $this->request( 'GET', $endpoint, [], $query );
    }

    /**
     * POST request helper.
     *
     * @param string $endpoint API endpoint.
     * @param array  $data     Request data.
     * @return array|WP_Error
     */
    public function post( string $endpoint, array $data = [] ): array|\WP_Error {
        return $this->request( 'POST', $endpoint, $data );
    }

    /**
     * PUT request helper.
     *
     * @param string $endpoint API endpoint.
     * @param array  $data     Request data.
     * @return array|WP_Error
     */
    public function put( string $endpoint, array $data = [] ): array|\WP_Error {
        return $this->request( 'PUT', $endpoint, $data );
    }

    /**
     * DELETE request helper.
     *
     * @param string $endpoint API endpoint.
     * @return array|WP_Error
     */
    public function delete( string $endpoint ): array|\WP_Error {
        return $this->request( 'DELETE', $endpoint );
    }

    // =========================================================================
    // Product Methods
    // =========================================================================

    /**
     * Get products.
     *
     * @param array $args Query arguments.
     * @return array|WP_Error
     */
    public function get_products( array $args = [] ): array|\WP_Error {
        $defaults = [
            'limit'       => 12,
            'page'        => 1,
            'include'     => 'images,variants',
            'is_visible'  => true,
            'channel_id'  => $this->channel_id,
        ];

        $query = array_merge( $defaults, $args );

        // Check cache first.
        $cache_key = 'bc_products_' . md5( wp_json_encode( $query ) );
        $cached    = BC_Bridge_Cache::get( $cache_key );

        if ( false !== $cached ) {
            return $cached;
        }

        $response = $this->get( '/catalog/products', $query );

        if ( ! is_wp_error( $response ) ) {
            BC_Bridge_Cache::set( $cache_key, $response );
        }

        return $response;
    }

    /**
     * Get single product.
     *
     * @param int $product_id Product ID.
     * @return array|WP_Error
     */
    public function get_product( int $product_id ): array|\WP_Error {
        $cache_key = 'bc_product_' . $product_id;
        $cached    = BC_Bridge_Cache::get( $cache_key );

        if ( false !== $cached ) {
            return $cached;
        }

        $query = [
            'include' => 'images,variants,custom_fields,modifiers',
        ];

        $response = $this->get( "/catalog/products/{$product_id}", $query );

        if ( ! is_wp_error( $response ) ) {
            BC_Bridge_Cache::set( $cache_key, $response );
        }

        return $response;
    }

    /**
     * Get product by slug.
     *
     * @param string $slug Product slug.
     * @return array|WP_Error
     */
    public function get_product_by_slug( string $slug ): array|\WP_Error {
        $cache_key = 'bc_product_slug_' . sanitize_title( $slug );
        $cached    = BC_Bridge_Cache::get( $cache_key );

        if ( false !== $cached ) {
            return $cached;
        }

        $response = $this->get_products( [ 'keyword' => $slug, 'limit' => 1 ] );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( empty( $response['data'] ) ) {
            return new \WP_Error( 'bc_bridge_product_not_found', __( 'Product not found.', 'bc-bridge' ) );
        }

        // Get full product details.
        $product = $this->get_product( $response['data'][0]['id'] );

        if ( ! is_wp_error( $product ) ) {
            BC_Bridge_Cache::set( $cache_key, $product );
        }

        return $product;
    }

    // =========================================================================
    // Category Methods
    // =========================================================================

    /**
     * Get categories.
     *
     * @param array $args Query arguments.
     * @return array|WP_Error
     */
    public function get_categories( array $args = [] ): array|\WP_Error {
        $defaults = [
            'limit'      => 50,
            'page'       => 1,
            'is_visible' => true,
        ];

        $query = array_merge( $defaults, $args );

        $cache_key = 'bc_categories_' . md5( wp_json_encode( $query ) );
        $cached    = BC_Bridge_Cache::get( $cache_key, 'categories' );

        if ( false !== $cached ) {
            return $cached;
        }

        $response = $this->get( '/catalog/categories', $query );

        if ( ! is_wp_error( $response ) ) {
            BC_Bridge_Cache::set( $cache_key, $response, 'categories' );
        }

        return $response;
    }

    /**
     * Get single category.
     *
     * @param int $category_id Category ID.
     * @return array|WP_Error
     */
    public function get_category( int $category_id ): array|\WP_Error {
        $cache_key = 'bc_category_' . $category_id;
        $cached    = BC_Bridge_Cache::get( $cache_key, 'categories' );

        if ( false !== $cached ) {
            return $cached;
        }

        $response = $this->get( "/catalog/categories/{$category_id}" );

        if ( ! is_wp_error( $response ) ) {
            BC_Bridge_Cache::set( $cache_key, $response, 'categories' );
        }

        return $response;
    }

    /**
     * Get products in category.
     *
     * @param int   $category_id Category ID.
     * @param array $args        Query arguments.
     * @return array|WP_Error
     */
    public function get_products_by_category( int $category_id, array $args = [] ): array|\WP_Error {
        $args['categories:in'] = $category_id;
        return $this->get_products( $args );
    }

    // =========================================================================
    // Cart Methods
    // =========================================================================

    /**
     * Create cart.
     *
     * @param array $line_items Initial line items.
     * @return array|WP_Error
     */
    public function create_cart( array $line_items = [] ): array|\WP_Error {
        $data = [
            'channel_id' => $this->channel_id,
            'line_items' => $line_items,
        ];

        return $this->post( '/carts', $data );
    }

    /**
     * Get cart.
     *
     * @param string $cart_id Cart ID.
     * @return array|WP_Error
     */
    public function get_cart( string $cart_id ): array|\WP_Error {
        $query = [ 'include' => 'line_items.physical_items.options,line_items.digital_items.options' ];
        return $this->get( "/carts/{$cart_id}", $query );
    }

    /**
     * Add item to cart.
     *
     * @param string $cart_id    Cart ID.
     * @param array  $line_items Line items to add.
     * @return array|WP_Error
     */
    public function add_to_cart( string $cart_id, array $line_items ): array|\WP_Error {
        return $this->post( "/carts/{$cart_id}/items", [ 'line_items' => $line_items ] );
    }

    /**
     * Update cart item.
     *
     * @param string $cart_id  Cart ID.
     * @param string $item_id  Item ID.
     * @param int    $quantity New quantity.
     * @return array|WP_Error
     */
    public function update_cart_item( string $cart_id, string $item_id, int $quantity ): array|\WP_Error {
        return $this->put( "/carts/{$cart_id}/items/{$item_id}", [
            'line_item' => [ 'quantity' => $quantity ],
        ] );
    }

    /**
     * Remove cart item.
     *
     * @param string $cart_id Cart ID.
     * @param string $item_id Item ID.
     * @return array|WP_Error
     */
    public function remove_cart_item( string $cart_id, string $item_id ): array|\WP_Error {
        return $this->delete( "/carts/{$cart_id}/items/{$item_id}" );
    }

    /**
     * Get checkout URL for cart.
     *
     * @param string $cart_id Cart ID.
     * @return array|WP_Error
     */
    public function get_checkout_url( string $cart_id ): array|\WP_Error {
        return $this->post( "/carts/{$cart_id}/redirect_urls" );
    }

    // =========================================================================
    // Store Methods
    // =========================================================================

    /**
     * Get store information.
     *
     * @return array|WP_Error
     */
    public function get_store_info(): array|\WP_Error {
        // Store info uses V2 API.
        $url = sprintf( 'https://api.bigcommerce.com/stores/%s/v2/store', $this->store_hash );

        $response = wp_remote_get( $url, [
            'headers' => [
                'X-Auth-Token' => $this->access_token,
                'Accept'       => 'application/json',
            ],
            'timeout' => 15,
        ] );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body = wp_remote_retrieve_body( $response );
        return json_decode( $body, true ) ?? [];
    }

    /**
     * Test API connection.
     *
     * @return array|WP_Error
     */
    public function test_connection(): array|\WP_Error {
        return $this->get_store_info();
    }

    // =========================================================================
    // Utility Methods
    // =========================================================================

    /**
     * Log error.
     *
     * @param string $message Error message.
     * @param array  $context Additional context.
     * @return void
     */
    private function log_error( string $message, array $context = [] ): void {
        if ( ! BC_Bridge::get_settings( 'debug_mode' ) ) {
            return;
        }

        error_log( sprintf(
            '[BC Bridge] %s: %s',
            $message,
            wp_json_encode( $context )
        ) );
    }
}
