<?php
/**
 * Plugin Name: BC Bridge
 * Plugin URI: https://github.com/bigcommerce/bc-bridge
 * Description: Connect your WordPress site to BigCommerce for scalable, reliable commerce without rebuilding your theme.
 * Version: 1.0.0
 * Requires at least: 6.2
 * Requires PHP: 8.1
 * Author: BigCommerce
 * Author URI: https://www.bigcommerce.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: bc-bridge
 * Domain Path: /languages
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants.
define( 'BC_BRIDGE_VERSION', '1.0.0' );
define( 'BC_BRIDGE_PLUGIN_FILE', __FILE__ );
define( 'BC_BRIDGE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BC_BRIDGE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'BC_BRIDGE_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Minimum requirements.
define( 'BC_BRIDGE_MIN_PHP_VERSION', '8.1' );
define( 'BC_BRIDGE_MIN_WP_VERSION', '6.2' );

/**
 * Main BC Bridge plugin class.
 */
final class BC_Bridge {

    /**
     * Plugin instance.
     *
     * @var BC_Bridge|null
     */
    private static ?BC_Bridge $instance = null;

    /**
     * API client instance.
     *
     * @var BC_Bridge_API_Client|null
     */
    public ?BC_Bridge_API_Client $api = null;

    /**
     * Cart manager instance.
     *
     * @var BC_Bridge_Cart|null
     */
    public ?BC_Bridge_Cart $cart = null;

    /**
     * Get plugin instance.
     *
     * @return BC_Bridge
     */
    public static function instance(): BC_Bridge {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor.
     */
    private function __construct() {
        $this->check_requirements();
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Check minimum requirements.
     *
     * @return void
     */
    private function check_requirements(): void {
        if ( version_compare( PHP_VERSION, BC_BRIDGE_MIN_PHP_VERSION, '<' ) ) {
            add_action( 'admin_notices', [ $this, 'php_version_notice' ] );
            return;
        }

        if ( version_compare( get_bloginfo( 'version' ), BC_BRIDGE_MIN_WP_VERSION, '<' ) ) {
            add_action( 'admin_notices', [ $this, 'wp_version_notice' ] );
            return;
        }
    }

    /**
     * Load plugin dependencies.
     *
     * @return void
     */
    private function load_dependencies(): void {
        // Core classes.
        require_once BC_BRIDGE_PLUGIN_DIR . 'includes/class-bc-bridge-api-client.php';
        require_once BC_BRIDGE_PLUGIN_DIR . 'includes/class-bc-bridge-cache.php';
        require_once BC_BRIDGE_PLUGIN_DIR . 'includes/class-bc-bridge-cart.php';
        require_once BC_BRIDGE_PLUGIN_DIR . 'includes/class-bc-bridge-routes.php';
        require_once BC_BRIDGE_PLUGIN_DIR . 'includes/class-bc-bridge-templates.php';

        // Admin classes.
        if ( is_admin() ) {
            require_once BC_BRIDGE_PLUGIN_DIR . 'admin/class-bc-bridge-admin.php';
            require_once BC_BRIDGE_PLUGIN_DIR . 'admin/class-bc-bridge-settings.php';
            require_once BC_BRIDGE_PLUGIN_DIR . 'admin/class-bc-bridge-wizard.php';
        }

        // Initialize components.
        $this->api  = new BC_Bridge_API_Client();
        $this->cart = new BC_Bridge_Cart( $this->api );
    }

    /**
     * Initialize hooks.
     *
     * @return void
     */
    private function init_hooks(): void {
        // Activation/deactivation hooks.
        register_activation_hook( BC_BRIDGE_PLUGIN_FILE, [ $this, 'activate' ] );
        register_deactivation_hook( BC_BRIDGE_PLUGIN_FILE, [ $this, 'deactivate' ] );

        // Init hook.
        add_action( 'init', [ $this, 'init' ] );

        // Load text domain.
        add_action( 'init', [ $this, 'load_textdomain' ] );

        // Enqueue assets.
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );

        // Initialize routes.
        add_action( 'init', [ BC_Bridge_Routes::class, 'init' ] );

        // Initialize admin.
        if ( is_admin() ) {
            add_action( 'admin_menu', [ BC_Bridge_Admin::class, 'add_menu' ] );
            add_action( 'admin_init', [ BC_Bridge_Settings::class, 'register_settings' ] );
        }

        // AJAX handlers.
        add_action( 'wp_ajax_bc_bridge_add_to_cart', [ $this->cart, 'ajax_add_to_cart' ] );
        add_action( 'wp_ajax_nopriv_bc_bridge_add_to_cart', [ $this->cart, 'ajax_add_to_cart' ] );
        add_action( 'wp_ajax_bc_bridge_update_cart', [ $this->cart, 'ajax_update_cart' ] );
        add_action( 'wp_ajax_nopriv_bc_bridge_update_cart', [ $this->cart, 'ajax_update_cart' ] );
        add_action( 'wp_ajax_bc_bridge_remove_from_cart', [ $this->cart, 'ajax_remove_from_cart' ] );
        add_action( 'wp_ajax_nopriv_bc_bridge_remove_from_cart', [ $this->cart, 'ajax_remove_from_cart' ] );
    }

    /**
     * Plugin activation.
     *
     * @return void
     */
    public function activate(): void {
        // Create necessary database tables or options.
        $this->create_options();

        // Flush rewrite rules.
        flush_rewrite_rules();

        // Set activation flag for welcome screen.
        set_transient( 'bc_bridge_activated', true, 30 );
    }

    /**
     * Plugin deactivation.
     *
     * @return void
     */
    public function deactivate(): void {
        // Clear caches.
        BC_Bridge_Cache::clear_all();

        // Flush rewrite rules.
        flush_rewrite_rules();
    }

    /**
     * Create default options.
     *
     * @return void
     */
    private function create_options(): void {
        $defaults = [
            'store_hash'      => '',
            'client_id'       => '',
            'access_token'    => '',
            'channel_id'      => 1,
            'checkout_type'   => 'embedded',
            'products_per_page' => 12,
            'cache_ttl'       => 300,
            'debug_mode'      => false,
        ];

        if ( ! get_option( 'bc_bridge_settings' ) ) {
            add_option( 'bc_bridge_settings', $defaults );
        }
    }

    /**
     * Initialize plugin.
     *
     * @return void
     */
    public function init(): void {
        // Register shortcodes.
        add_shortcode( 'bc_products', [ BC_Bridge_Templates::class, 'products_shortcode' ] );
        add_shortcode( 'bc_product', [ BC_Bridge_Templates::class, 'product_shortcode' ] );
        add_shortcode( 'bc_cart', [ BC_Bridge_Templates::class, 'cart_shortcode' ] );
        add_shortcode( 'bc_checkout', [ BC_Bridge_Templates::class, 'checkout_shortcode' ] );
    }

    /**
     * Load plugin text domain.
     *
     * @return void
     */
    public function load_textdomain(): void {
        load_plugin_textdomain(
            'bc-bridge',
            false,
            dirname( BC_BRIDGE_PLUGIN_BASENAME ) . '/languages'
        );
    }

    /**
     * Enqueue frontend scripts and styles.
     *
     * @return void
     */
    public function enqueue_scripts(): void {
        // Main stylesheet.
        wp_enqueue_style(
            'bc-bridge',
            BC_BRIDGE_PLUGIN_URL . 'assets/css/bc-bridge.css',
            [],
            BC_BRIDGE_VERSION
        );

        // Main script.
        wp_enqueue_script(
            'bc-bridge',
            BC_BRIDGE_PLUGIN_URL . 'assets/js/bc-bridge.js',
            [ 'jquery' ],
            BC_BRIDGE_VERSION,
            true
        );

        // Localize script.
        wp_localize_script( 'bc-bridge', 'bcBridge', [
            'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
            'nonce'     => wp_create_nonce( 'bc_bridge_nonce' ),
            'cartUrl'   => home_url( '/cart' ),
            'checkoutUrl' => home_url( '/checkout' ),
            'i18n'      => [
                'addingToCart'  => __( 'Adding...', 'bc-bridge' ),
                'addedToCart'   => __( 'Added!', 'bc-bridge' ),
                'error'         => __( 'Error. Please try again.', 'bc-bridge' ),
                'viewCart'      => __( 'View Cart', 'bc-bridge' ),
            ],
        ] );
    }

    /**
     * Enqueue admin scripts and styles.
     *
     * @param string $hook Current admin page.
     * @return void
     */
    public function admin_enqueue_scripts( string $hook ): void {
        // Only load on our settings pages.
        if ( strpos( $hook, 'bc-bridge' ) === false ) {
            return;
        }

        wp_enqueue_style(
            'bc-bridge-admin',
            BC_BRIDGE_PLUGIN_URL . 'assets/css/bc-bridge-admin.css',
            [],
            BC_BRIDGE_VERSION
        );

        wp_enqueue_script(
            'bc-bridge-admin',
            BC_BRIDGE_PLUGIN_URL . 'assets/js/bc-bridge-admin.js',
            [ 'jquery' ],
            BC_BRIDGE_VERSION,
            true
        );

        wp_localize_script( 'bc-bridge-admin', 'bcBridgeAdmin', [
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'bc_bridge_admin_nonce' ),
            'i18n'    => [
                'testing'     => __( 'Testing connection...', 'bc-bridge' ),
                'connected'   => __( 'Connected!', 'bc-bridge' ),
                'failed'      => __( 'Connection failed', 'bc-bridge' ),
                'clearing'    => __( 'Clearing cache...', 'bc-bridge' ),
                'cleared'     => __( 'Cache cleared!', 'bc-bridge' ),
            ],
        ] );
    }

    /**
     * Display PHP version notice.
     *
     * @return void
     */
    public function php_version_notice(): void {
        $message = sprintf(
            /* translators: 1: Required PHP version, 2: Current PHP version */
            __( 'BC Bridge requires PHP %1$s or higher. You are running PHP %2$s.', 'bc-bridge' ),
            BC_BRIDGE_MIN_PHP_VERSION,
            PHP_VERSION
        );
        printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $message ) );
    }

    /**
     * Display WordPress version notice.
     *
     * @return void
     */
    public function wp_version_notice(): void {
        $message = sprintf(
            /* translators: 1: Required WP version, 2: Current WP version */
            __( 'BC Bridge requires WordPress %1$s or higher. You are running WordPress %2$s.', 'bc-bridge' ),
            BC_BRIDGE_MIN_WP_VERSION,
            get_bloginfo( 'version' )
        );
        printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $message ) );
    }

    /**
     * Get plugin settings.
     *
     * @param string|null $key Specific setting key.
     * @return mixed
     */
    public static function get_settings( ?string $key = null ): mixed {
        $settings = get_option( 'bc_bridge_settings', [] );

        if ( null !== $key ) {
            return $settings[ $key ] ?? null;
        }

        return $settings;
    }

    /**
     * Check if plugin is configured.
     *
     * @return bool
     */
    public static function is_configured(): bool {
        $settings = self::get_settings();
        return ! empty( $settings['store_hash'] ) && ! empty( $settings['access_token'] );
    }

    /**
     * Prevent cloning.
     *
     * @return void
     */
    private function __clone() {}

    /**
     * Prevent unserialization.
     *
     * @return void
     */
    public function __wakeup() {
        throw new \Exception( 'Cannot unserialize singleton' );
    }
}

/**
 * Get plugin instance.
 *
 * @return BC_Bridge
 */
function bc_bridge(): BC_Bridge {
    return BC_Bridge::instance();
}

// Initialize plugin.
bc_bridge();
