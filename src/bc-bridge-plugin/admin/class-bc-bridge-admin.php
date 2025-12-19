<?php
/**
 * Admin functionality for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Admin class.
 *
 * Handles admin menu and dashboard widgets.
 */
class BC_Bridge_Admin {

    /**
     * Add admin menu.
     *
     * @return void
     */
    public static function add_menu(): void {
        // Main menu.
        add_menu_page(
            __( 'BC Bridge', 'bc-bridge' ),
            __( 'BC Bridge', 'bc-bridge' ),
            'manage_options',
            'bc-bridge',
            [ __CLASS__, 'render_dashboard' ],
            'dashicons-cart',
            56
        );

        // Dashboard submenu.
        add_submenu_page(
            'bc-bridge',
            __( 'Dashboard', 'bc-bridge' ),
            __( 'Dashboard', 'bc-bridge' ),
            'manage_options',
            'bc-bridge',
            [ __CLASS__, 'render_dashboard' ]
        );

        // Settings submenu.
        add_submenu_page(
            'bc-bridge',
            __( 'Settings', 'bc-bridge' ),
            __( 'Settings', 'bc-bridge' ),
            'manage_options',
            'bc-bridge-settings',
            [ BC_Bridge_Settings::class, 'render_settings_page' ]
        );

        // Tools submenu.
        add_submenu_page(
            'bc-bridge',
            __( 'Tools', 'bc-bridge' ),
            __( 'Tools', 'bc-bridge' ),
            'manage_options',
            'bc-bridge-tools',
            [ __CLASS__, 'render_tools' ]
        );
    }

    /**
     * Render dashboard page.
     *
     * @return void
     */
    public static function render_dashboard(): void {
        // Check for activation redirect.
        if ( get_transient( 'bc_bridge_activated' ) ) {
            delete_transient( 'bc_bridge_activated' );

            // If not configured, redirect to settings.
            if ( ! BC_Bridge::is_configured() ) {
                wp_safe_redirect( admin_url( 'admin.php?page=bc-bridge-settings&wizard=1' ) );
                exit;
            }
        }

        $is_configured = BC_Bridge::is_configured();
        $store_info    = null;
        $cache_stats   = BC_Bridge_Cache::get_stats();

        if ( $is_configured ) {
            $store_info = bc_bridge()->api->get_store_info();
        }
        ?>
        <div class="wrap bc-bridge-admin">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

            <?php if ( ! $is_configured ) : ?>
                <div class="notice notice-warning">
                    <p>
                        <?php esc_html_e( 'BC Bridge is not configured. Please add your BigCommerce API credentials.', 'bc-bridge' ); ?>
                        <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge-settings' ) ); ?>" class="button button-primary" style="margin-left: 10px;">
                            <?php esc_html_e( 'Configure Now', 'bc-bridge' ); ?>
                        </a>
                    </p>
                </div>
            <?php endif; ?>

            <div class="bc-bridge-dashboard">
                <!-- Connection Status -->
                <div class="bc-bridge-card">
                    <h2><?php esc_html_e( 'Connection Status', 'bc-bridge' ); ?></h2>
                    <?php if ( $is_configured && ! is_wp_error( $store_info ) ) : ?>
                        <div class="bc-bridge-status bc-bridge-status--connected">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <?php esc_html_e( 'Connected', 'bc-bridge' ); ?>
                        </div>
                        <table class="widefat">
                            <tr>
                                <th><?php esc_html_e( 'Store Name', 'bc-bridge' ); ?></th>
                                <td><?php echo esc_html( $store_info['name'] ?? 'N/A' ); ?></td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e( 'Domain', 'bc-bridge' ); ?></th>
                                <td><?php echo esc_html( $store_info['domain'] ?? 'N/A' ); ?></td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e( 'Currency', 'bc-bridge' ); ?></th>
                                <td><?php echo esc_html( $store_info['currency'] ?? 'USD' ); ?></td>
                            </tr>
                        </table>
                    <?php elseif ( $is_configured ) : ?>
                        <div class="bc-bridge-status bc-bridge-status--error">
                            <span class="dashicons dashicons-warning"></span>
                            <?php esc_html_e( 'Connection Error', 'bc-bridge' ); ?>
                        </div>
                        <p class="description">
                            <?php echo esc_html( is_wp_error( $store_info ) ? $store_info->get_error_message() : __( 'Unable to connect to BigCommerce.', 'bc-bridge' ) ); ?>
                        </p>
                    <?php else : ?>
                        <div class="bc-bridge-status bc-bridge-status--disconnected">
                            <span class="dashicons dashicons-minus"></span>
                            <?php esc_html_e( 'Not Configured', 'bc-bridge' ); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Cache Status -->
                <div class="bc-bridge-card">
                    <h2><?php esc_html_e( 'Cache Status', 'bc-bridge' ); ?></h2>
                    <table class="widefat">
                        <tr>
                            <th><?php esc_html_e( 'Cached Items', 'bc-bridge' ); ?></th>
                            <td><?php echo esc_html( $cache_stats['transient_count'] ); ?></td>
                        </tr>
                        <tr>
                            <th><?php esc_html_e( 'Object Cache', 'bc-bridge' ); ?></th>
                            <td>
                                <?php if ( $cache_stats['object_cache'] ) : ?>
                                    <span class="dashicons dashicons-yes"></span> <?php esc_html_e( 'Active', 'bc-bridge' ); ?>
                                <?php else : ?>
                                    <span class="dashicons dashicons-minus"></span> <?php esc_html_e( 'Not Active', 'bc-bridge' ); ?>
                                <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                    <p>
                        <button type="button" class="button bc-bridge-clear-cache">
                            <?php esc_html_e( 'Clear All Cache', 'bc-bridge' ); ?>
                        </button>
                    </p>
                </div>

                <!-- Quick Links -->
                <div class="bc-bridge-card">
                    <h2><?php esc_html_e( 'Quick Links', 'bc-bridge' ); ?></h2>
                    <ul class="bc-bridge-links">
                        <li>
                            <a href="<?php echo esc_url( home_url( '/shop/' ) ); ?>" target="_blank">
                                <span class="dashicons dashicons-store"></span>
                                <?php esc_html_e( 'View Shop', 'bc-bridge' ); ?>
                            </a>
                        </li>
                        <li>
                            <a href="<?php echo esc_url( home_url( '/cart/' ) ); ?>" target="_blank">
                                <span class="dashicons dashicons-cart"></span>
                                <?php esc_html_e( 'View Cart', 'bc-bridge' ); ?>
                            </a>
                        </li>
                        <li>
                            <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge-settings' ) ); ?>">
                                <span class="dashicons dashicons-admin-generic"></span>
                                <?php esc_html_e( 'Settings', 'bc-bridge' ); ?>
                            </a>
                        </li>
                        <li>
                            <a href="https://developer.bigcommerce.com/docs" target="_blank">
                                <span class="dashicons dashicons-external"></span>
                                <?php esc_html_e( 'API Documentation', 'bc-bridge' ); ?>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Shortcodes Reference -->
                <div class="bc-bridge-card bc-bridge-card--wide">
                    <h2><?php esc_html_e( 'Shortcodes', 'bc-bridge' ); ?></h2>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e( 'Shortcode', 'bc-bridge' ); ?></th>
                                <th><?php esc_html_e( 'Description', 'bc-bridge' ); ?></th>
                                <th><?php esc_html_e( 'Parameters', 'bc-bridge' ); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>[bc_products]</code></td>
                                <td><?php esc_html_e( 'Display product grid', 'bc-bridge' ); ?></td>
                                <td><code>limit, columns, category, orderby, order</code></td>
                            </tr>
                            <tr>
                                <td><code>[bc_product]</code></td>
                                <td><?php esc_html_e( 'Display single product', 'bc-bridge' ); ?></td>
                                <td><code>id, slug</code></td>
                            </tr>
                            <tr>
                                <td><code>[bc_cart]</code></td>
                                <td><?php esc_html_e( 'Display shopping cart', 'bc-bridge' ); ?></td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td><code>[bc_checkout]</code></td>
                                <td><?php esc_html_e( 'Display checkout', 'bc-bridge' ); ?></td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render tools page.
     *
     * @return void
     */
    public static function render_tools(): void {
        ?>
        <div class="wrap bc-bridge-admin">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

            <div class="bc-bridge-tools">
                <!-- Cache Management -->
                <div class="bc-bridge-card">
                    <h2><?php esc_html_e( 'Cache Management', 'bc-bridge' ); ?></h2>
                    <p><?php esc_html_e( 'Clear cached data from BigCommerce API responses.', 'bc-bridge' ); ?></p>
                    <p>
                        <button type="button" class="button button-secondary bc-bridge-clear-cache" data-group="products">
                            <?php esc_html_e( 'Clear Product Cache', 'bc-bridge' ); ?>
                        </button>
                        <button type="button" class="button button-secondary bc-bridge-clear-cache" data-group="categories">
                            <?php esc_html_e( 'Clear Category Cache', 'bc-bridge' ); ?>
                        </button>
                        <button type="button" class="button button-primary bc-bridge-clear-cache" data-group="all">
                            <?php esc_html_e( 'Clear All Cache', 'bc-bridge' ); ?>
                        </button>
                    </p>
                </div>

                <!-- Rewrite Rules -->
                <div class="bc-bridge-card">
                    <h2><?php esc_html_e( 'Rewrite Rules', 'bc-bridge' ); ?></h2>
                    <p><?php esc_html_e( 'Flush WordPress rewrite rules if BC Bridge URLs are not working.', 'bc-bridge' ); ?></p>
                    <p>
                        <button type="button" class="button button-secondary bc-bridge-flush-rules">
                            <?php esc_html_e( 'Flush Rewrite Rules', 'bc-bridge' ); ?>
                        </button>
                    </p>
                </div>

                <!-- Debug Info -->
                <div class="bc-bridge-card bc-bridge-card--wide">
                    <h2><?php esc_html_e( 'Debug Information', 'bc-bridge' ); ?></h2>
                    <textarea readonly class="large-text code" rows="15"><?php
                        echo esc_textarea( self::get_debug_info() );
                    ?></textarea>
                    <p>
                        <button type="button" class="button button-secondary bc-bridge-copy-debug">
                            <?php esc_html_e( 'Copy to Clipboard', 'bc-bridge' ); ?>
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Get debug information.
     *
     * @return string
     */
    private static function get_debug_info(): string {
        global $wp_version;

        $settings    = BC_Bridge::get_settings();
        $cache_stats = BC_Bridge_Cache::get_stats();

        $info = [];

        $info[] = '=== BC Bridge Debug Info ===';
        $info[] = '';
        $info[] = 'WordPress Version: ' . $wp_version;
        $info[] = 'PHP Version: ' . PHP_VERSION;
        $info[] = 'BC Bridge Version: ' . BC_BRIDGE_VERSION;
        $info[] = '';
        $info[] = '=== Configuration ===';
        $info[] = 'Configured: ' . ( BC_Bridge::is_configured() ? 'Yes' : 'No' );
        $info[] = 'Store Hash: ' . ( ! empty( $settings['store_hash'] ) ? substr( $settings['store_hash'], 0, 4 ) . '***' : 'Not set' );
        $info[] = 'Channel ID: ' . ( $settings['channel_id'] ?? 'Not set' );
        $info[] = 'Checkout Type: ' . ( $settings['checkout_type'] ?? 'embedded' );
        $info[] = 'Products Per Page: ' . ( $settings['products_per_page'] ?? 12 );
        $info[] = 'Cache TTL: ' . ( $settings['cache_ttl'] ?? 300 ) . 's';
        $info[] = 'Debug Mode: ' . ( $settings['debug_mode'] ? 'Enabled' : 'Disabled' );
        $info[] = '';
        $info[] = '=== Cache ===';
        $info[] = 'Transient Count: ' . $cache_stats['transient_count'];
        $info[] = 'Object Cache: ' . ( $cache_stats['object_cache'] ? 'Active' : 'Not Active' );
        $info[] = '';
        $info[] = '=== Active Plugins ===';

        $plugins = get_option( 'active_plugins', [] );
        foreach ( $plugins as $plugin ) {
            $info[] = '- ' . $plugin;
        }

        return implode( "\n", $info );
    }
}
