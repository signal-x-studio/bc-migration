<?php
/**
 * Settings page for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Settings class.
 *
 * Handles plugin settings registration and rendering.
 */
class BC_Bridge_Settings {

    /**
     * Option name.
     */
    private const OPTION_NAME = 'bc_bridge_settings';

    /**
     * Register settings.
     *
     * @return void
     */
    public static function register_settings(): void {
        register_setting(
            'bc_bridge_settings',
            self::OPTION_NAME,
            [
                'type'              => 'array',
                'sanitize_callback' => [ __CLASS__, 'sanitize_settings' ],
                'default'           => self::get_defaults(),
            ]
        );

        // API Settings Section.
        add_settings_section(
            'bc_bridge_api',
            __( 'BigCommerce API Settings', 'bc-bridge' ),
            [ __CLASS__, 'render_api_section' ],
            'bc_bridge_settings'
        );

        add_settings_field(
            'store_hash',
            __( 'Store Hash', 'bc-bridge' ),
            [ __CLASS__, 'render_text_field' ],
            'bc_bridge_settings',
            'bc_bridge_api',
            [
                'id'          => 'store_hash',
                'description' => __( 'Your BigCommerce store hash (found in your store URL)', 'bc-bridge' ),
                'placeholder' => 'abc123',
            ]
        );

        add_settings_field(
            'access_token',
            __( 'Access Token', 'bc-bridge' ),
            [ __CLASS__, 'render_password_field' ],
            'bc_bridge_settings',
            'bc_bridge_api',
            [
                'id'          => 'access_token',
                'description' => __( 'Your BigCommerce API access token', 'bc-bridge' ),
            ]
        );

        add_settings_field(
            'channel_id',
            __( 'Channel ID', 'bc-bridge' ),
            [ __CLASS__, 'render_number_field' ],
            'bc_bridge_settings',
            'bc_bridge_api',
            [
                'id'          => 'channel_id',
                'description' => __( 'The channel ID for your storefront (default: 1)', 'bc-bridge' ),
                'min'         => 1,
                'default'     => 1,
            ]
        );

        // Display Settings Section.
        add_settings_section(
            'bc_bridge_display',
            __( 'Display Settings', 'bc-bridge' ),
            [ __CLASS__, 'render_display_section' ],
            'bc_bridge_settings'
        );

        add_settings_field(
            'products_per_page',
            __( 'Products Per Page', 'bc-bridge' ),
            [ __CLASS__, 'render_number_field' ],
            'bc_bridge_settings',
            'bc_bridge_display',
            [
                'id'          => 'products_per_page',
                'description' => __( 'Number of products to display per page', 'bc-bridge' ),
                'min'         => 1,
                'max'         => 100,
                'default'     => 12,
            ]
        );

        add_settings_field(
            'checkout_type',
            __( 'Checkout Type', 'bc-bridge' ),
            [ __CLASS__, 'render_select_field' ],
            'bc_bridge_settings',
            'bc_bridge_display',
            [
                'id'          => 'checkout_type',
                'description' => __( 'How checkout should be handled', 'bc-bridge' ),
                'options'     => [
                    'embedded' => __( 'Embedded (on your site)', 'bc-bridge' ),
                    'redirect' => __( 'Redirect (to BigCommerce)', 'bc-bridge' ),
                ],
            ]
        );

        // Performance Settings Section.
        add_settings_section(
            'bc_bridge_performance',
            __( 'Performance Settings', 'bc-bridge' ),
            [ __CLASS__, 'render_performance_section' ],
            'bc_bridge_settings'
        );

        add_settings_field(
            'cache_ttl',
            __( 'Cache Duration', 'bc-bridge' ),
            [ __CLASS__, 'render_select_field' ],
            'bc_bridge_settings',
            'bc_bridge_performance',
            [
                'id'          => 'cache_ttl',
                'description' => __( 'How long to cache API responses', 'bc-bridge' ),
                'options'     => [
                    '60'   => __( '1 minute', 'bc-bridge' ),
                    '300'  => __( '5 minutes', 'bc-bridge' ),
                    '600'  => __( '10 minutes', 'bc-bridge' ),
                    '900'  => __( '15 minutes', 'bc-bridge' ),
                    '1800' => __( '30 minutes', 'bc-bridge' ),
                    '3600' => __( '1 hour', 'bc-bridge' ),
                ],
            ]
        );

        add_settings_field(
            'debug_mode',
            __( 'Debug Mode', 'bc-bridge' ),
            [ __CLASS__, 'render_checkbox_field' ],
            'bc_bridge_settings',
            'bc_bridge_performance',
            [
                'id'          => 'debug_mode',
                'label'       => __( 'Enable debug logging', 'bc-bridge' ),
                'description' => __( 'Log API requests and errors for troubleshooting', 'bc-bridge' ),
            ]
        );

        // AJAX handlers.
        add_action( 'wp_ajax_bc_bridge_test_connection', [ __CLASS__, 'ajax_test_connection' ] );
        add_action( 'wp_ajax_bc_bridge_clear_cache', [ __CLASS__, 'ajax_clear_cache' ] );
        add_action( 'wp_ajax_bc_bridge_flush_rules', [ __CLASS__, 'ajax_flush_rules' ] );
    }

    /**
     * Get default settings.
     *
     * @return array
     */
    public static function get_defaults(): array {
        return [
            'store_hash'        => '',
            'client_id'         => '',
            'access_token'      => '',
            'channel_id'        => 1,
            'checkout_type'     => 'embedded',
            'products_per_page' => 12,
            'cache_ttl'         => 300,
            'debug_mode'        => false,
        ];
    }

    /**
     * Sanitize settings.
     *
     * @param array $input Input settings.
     * @return array
     */
    public static function sanitize_settings( array $input ): array {
        $sanitized = [];

        $sanitized['store_hash']        = sanitize_text_field( $input['store_hash'] ?? '' );
        $sanitized['client_id']         = sanitize_text_field( $input['client_id'] ?? '' );
        $sanitized['access_token']      = sanitize_text_field( $input['access_token'] ?? '' );
        $sanitized['channel_id']        = absint( $input['channel_id'] ?? 1 );
        $sanitized['checkout_type']     = in_array( $input['checkout_type'] ?? '', [ 'embedded', 'redirect' ], true )
            ? $input['checkout_type']
            : 'embedded';
        $sanitized['products_per_page'] = min( 100, max( 1, absint( $input['products_per_page'] ?? 12 ) ) );
        $sanitized['cache_ttl']         = absint( $input['cache_ttl'] ?? 300 );
        $sanitized['debug_mode']        = ! empty( $input['debug_mode'] );

        // Clear cache when settings change.
        BC_Bridge_Cache::clear_all();

        return $sanitized;
    }

    /**
     * Render settings page.
     *
     * @return void
     */
    public static function render_settings_page(): void {
        // Check for wizard mode.
        $wizard_mode = isset( $_GET['wizard'] ) && '1' === $_GET['wizard'];
        ?>
        <div class="wrap bc-bridge-admin">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

            <?php if ( $wizard_mode ) : ?>
                <div class="notice notice-info">
                    <p><?php esc_html_e( 'Welcome to BC Bridge! Let\'s get you connected to BigCommerce.', 'bc-bridge' ); ?></p>
                </div>
            <?php endif; ?>

            <form method="post" action="options.php">
                <?php
                settings_fields( 'bc_bridge_settings' );
                do_settings_sections( 'bc_bridge_settings' );
                ?>

                <p class="bc-bridge-test-connection">
                    <button type="button" class="button button-secondary" id="bc-bridge-test-connection">
                        <?php esc_html_e( 'Test Connection', 'bc-bridge' ); ?>
                    </button>
                    <span class="bc-bridge-test-result"></span>
                </p>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    // =========================================================================
    // Section Renderers
    // =========================================================================

    /**
     * Render API section description.
     *
     * @return void
     */
    public static function render_api_section(): void {
        ?>
        <p>
            <?php
            printf(
                /* translators: %s is the link to BigCommerce API documentation */
                esc_html__( 'Enter your BigCommerce API credentials. You can create API credentials in your %s.', 'bc-bridge' ),
                '<a href="https://login.bigcommerce.com/" target="_blank">' . esc_html__( 'BigCommerce admin', 'bc-bridge' ) . '</a>'
            );
            ?>
        </p>
        <p class="description">
            <?php esc_html_e( 'Required scopes: Products (read), Carts (modify), Checkouts (modify), Store Information (read)', 'bc-bridge' ); ?>
        </p>
        <?php
    }

    /**
     * Render display section description.
     *
     * @return void
     */
    public static function render_display_section(): void {
        ?>
        <p><?php esc_html_e( 'Configure how products and checkout are displayed on your site.', 'bc-bridge' ); ?></p>
        <?php
    }

    /**
     * Render performance section description.
     *
     * @return void
     */
    public static function render_performance_section(): void {
        ?>
        <p><?php esc_html_e( 'Configure caching and performance settings.', 'bc-bridge' ); ?></p>
        <?php
    }

    // =========================================================================
    // Field Renderers
    // =========================================================================

    /**
     * Render text field.
     *
     * @param array $args Field arguments.
     * @return void
     */
    public static function render_text_field( array $args ): void {
        $settings = get_option( self::OPTION_NAME, [] );
        $value    = $settings[ $args['id'] ] ?? '';
        ?>
        <input
            type="text"
            id="<?php echo esc_attr( $args['id'] ); ?>"
            name="<?php echo esc_attr( self::OPTION_NAME . '[' . $args['id'] . ']' ); ?>"
            value="<?php echo esc_attr( $value ); ?>"
            class="regular-text"
            <?php echo ! empty( $args['placeholder'] ) ? 'placeholder="' . esc_attr( $args['placeholder'] ) . '"' : ''; ?>
        />
        <?php if ( ! empty( $args['description'] ) ) : ?>
            <p class="description"><?php echo esc_html( $args['description'] ); ?></p>
        <?php endif; ?>
        <?php
    }

    /**
     * Render password field.
     *
     * @param array $args Field arguments.
     * @return void
     */
    public static function render_password_field( array $args ): void {
        $settings = get_option( self::OPTION_NAME, [] );
        $value    = $settings[ $args['id'] ] ?? '';
        ?>
        <input
            type="password"
            id="<?php echo esc_attr( $args['id'] ); ?>"
            name="<?php echo esc_attr( self::OPTION_NAME . '[' . $args['id'] . ']' ); ?>"
            value="<?php echo esc_attr( $value ); ?>"
            class="regular-text"
        />
        <?php if ( ! empty( $args['description'] ) ) : ?>
            <p class="description"><?php echo esc_html( $args['description'] ); ?></p>
        <?php endif; ?>
        <?php
    }

    /**
     * Render number field.
     *
     * @param array $args Field arguments.
     * @return void
     */
    public static function render_number_field( array $args ): void {
        $settings = get_option( self::OPTION_NAME, [] );
        $value    = $settings[ $args['id'] ] ?? ( $args['default'] ?? '' );
        ?>
        <input
            type="number"
            id="<?php echo esc_attr( $args['id'] ); ?>"
            name="<?php echo esc_attr( self::OPTION_NAME . '[' . $args['id'] . ']' ); ?>"
            value="<?php echo esc_attr( $value ); ?>"
            class="small-text"
            <?php echo isset( $args['min'] ) ? 'min="' . esc_attr( $args['min'] ) . '"' : ''; ?>
            <?php echo isset( $args['max'] ) ? 'max="' . esc_attr( $args['max'] ) . '"' : ''; ?>
        />
        <?php if ( ! empty( $args['description'] ) ) : ?>
            <p class="description"><?php echo esc_html( $args['description'] ); ?></p>
        <?php endif; ?>
        <?php
    }

    /**
     * Render select field.
     *
     * @param array $args Field arguments.
     * @return void
     */
    public static function render_select_field( array $args ): void {
        $settings = get_option( self::OPTION_NAME, [] );
        $value    = $settings[ $args['id'] ] ?? '';
        ?>
        <select
            id="<?php echo esc_attr( $args['id'] ); ?>"
            name="<?php echo esc_attr( self::OPTION_NAME . '[' . $args['id'] . ']' ); ?>"
        >
            <?php foreach ( $args['options'] as $option_value => $option_label ) : ?>
                <option value="<?php echo esc_attr( $option_value ); ?>" <?php selected( $value, $option_value ); ?>>
                    <?php echo esc_html( $option_label ); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php if ( ! empty( $args['description'] ) ) : ?>
            <p class="description"><?php echo esc_html( $args['description'] ); ?></p>
        <?php endif; ?>
        <?php
    }

    /**
     * Render checkbox field.
     *
     * @param array $args Field arguments.
     * @return void
     */
    public static function render_checkbox_field( array $args ): void {
        $settings = get_option( self::OPTION_NAME, [] );
        $value    = ! empty( $settings[ $args['id'] ] );
        ?>
        <label for="<?php echo esc_attr( $args['id'] ); ?>">
            <input
                type="checkbox"
                id="<?php echo esc_attr( $args['id'] ); ?>"
                name="<?php echo esc_attr( self::OPTION_NAME . '[' . $args['id'] . ']' ); ?>"
                value="1"
                <?php checked( $value ); ?>
            />
            <?php echo esc_html( $args['label'] ?? '' ); ?>
        </label>
        <?php if ( ! empty( $args['description'] ) ) : ?>
            <p class="description"><?php echo esc_html( $args['description'] ); ?></p>
        <?php endif; ?>
        <?php
    }

    // =========================================================================
    // AJAX Handlers
    // =========================================================================

    /**
     * AJAX: Test connection.
     *
     * @return void
     */
    public static function ajax_test_connection(): void {
        check_ajax_referer( 'bc_bridge_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( [ 'message' => __( 'Permission denied.', 'bc-bridge' ) ] );
        }

        $api    = bc_bridge()->api;
        $result = $api->test_connection();

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => $result->get_error_message() ] );
        }

        wp_send_json_success( [
            'message'    => __( 'Connected successfully!', 'bc-bridge' ),
            'store_name' => $result['name'] ?? '',
        ] );
    }

    /**
     * AJAX: Clear cache.
     *
     * @return void
     */
    public static function ajax_clear_cache(): void {
        check_ajax_referer( 'bc_bridge_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( [ 'message' => __( 'Permission denied.', 'bc-bridge' ) ] );
        }

        $group = sanitize_text_field( $_POST['group'] ?? 'all' );

        if ( 'all' === $group ) {
            BC_Bridge_Cache::clear_all();
        } else {
            BC_Bridge_Cache::clear_group( $group );
        }

        wp_send_json_success( [ 'message' => __( 'Cache cleared successfully!', 'bc-bridge' ) ] );
    }

    /**
     * AJAX: Flush rewrite rules.
     *
     * @return void
     */
    public static function ajax_flush_rules(): void {
        check_ajax_referer( 'bc_bridge_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( [ 'message' => __( 'Permission denied.', 'bc-bridge' ) ] );
        }

        BC_Bridge_Routes::flush_rules();

        wp_send_json_success( [ 'message' => __( 'Rewrite rules flushed!', 'bc-bridge' ) ] );
    }
}
