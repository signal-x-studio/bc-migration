<?php
/**
 * Setup wizard for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Wizard class.
 *
 * Handles the setup wizard flow for new installations.
 */
class BC_Bridge_Wizard {

    /**
     * Wizard steps.
     *
     * @var array
     */
    private static array $steps = [
        'welcome'    => [
            'title' => 'Welcome',
            'desc'  => 'Get started with BC Bridge',
        ],
        'api'        => [
            'title' => 'API Credentials',
            'desc'  => 'Connect to BigCommerce',
        ],
        'display'    => [
            'title' => 'Display Settings',
            'desc'  => 'Configure your shop',
        ],
        'complete'   => [
            'title' => 'Complete',
            'desc'  => 'You\'re all set!',
        ],
    ];

    /**
     * Initialize wizard.
     *
     * @return void
     */
    public static function init(): void {
        add_action( 'admin_menu', [ __CLASS__, 'add_wizard_page' ] );
        add_action( 'admin_init', [ __CLASS__, 'maybe_redirect_to_wizard' ] );
    }

    /**
     * Add wizard page (hidden from menu).
     *
     * @return void
     */
    public static function add_wizard_page(): void {
        add_submenu_page(
            null, // Hidden from menu.
            __( 'BC Bridge Setup', 'bc-bridge' ),
            __( 'Setup', 'bc-bridge' ),
            'manage_options',
            'bc-bridge-wizard',
            [ __CLASS__, 'render_wizard' ]
        );
    }

    /**
     * Maybe redirect to wizard on activation.
     *
     * @return void
     */
    public static function maybe_redirect_to_wizard(): void {
        if ( ! get_transient( 'bc_bridge_activated' ) ) {
            return;
        }

        delete_transient( 'bc_bridge_activated' );

        // Don't redirect if already configured.
        if ( BC_Bridge::is_configured() ) {
            return;
        }

        // Don't redirect during AJAX or bulk operations.
        if ( wp_doing_ajax() || isset( $_GET['activate-multi'] ) ) {
            return;
        }

        wp_safe_redirect( admin_url( 'admin.php?page=bc-bridge-wizard' ) );
        exit;
    }

    /**
     * Render wizard page.
     *
     * @return void
     */
    public static function render_wizard(): void {
        $current_step = sanitize_key( $_GET['step'] ?? 'welcome' );

        if ( ! isset( self::$steps[ $current_step ] ) ) {
            $current_step = 'welcome';
        }
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><?php echo esc_html( self::$steps[ $current_step ]['title'] ); ?> - BC Bridge Setup</title>
            <?php wp_head(); ?>
            <style>
                body {
                    background: #f0f0f1;
                    margin: 0;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
                }
                .bc-wizard {
                    max-width: 800px;
                    margin: 40px auto;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .bc-wizard-header {
                    padding: 30px;
                    border-bottom: 1px solid #ddd;
                    text-align: center;
                }
                .bc-wizard-logo {
                    width: 200px;
                    margin-bottom: 20px;
                }
                .bc-wizard-steps {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 20px;
                }
                .bc-wizard-step {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #999;
                }
                .bc-wizard-step.active {
                    color: #2271b1;
                    font-weight: 600;
                }
                .bc-wizard-step.completed {
                    color: #00a32a;
                }
                .bc-wizard-step-number {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #ddd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }
                .bc-wizard-step.active .bc-wizard-step-number {
                    background: #2271b1;
                    color: #fff;
                }
                .bc-wizard-step.completed .bc-wizard-step-number {
                    background: #00a32a;
                    color: #fff;
                }
                .bc-wizard-content {
                    padding: 40px;
                }
                .bc-wizard-footer {
                    padding: 20px 40px;
                    border-top: 1px solid #ddd;
                    display: flex;
                    justify-content: space-between;
                }
                .bc-wizard h2 {
                    margin: 0 0 10px;
                    font-size: 28px;
                }
                .bc-wizard p.lead {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 30px;
                }
                .bc-wizard-field {
                    margin-bottom: 20px;
                }
                .bc-wizard-field label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                }
                .bc-wizard-field input[type="text"],
                .bc-wizard-field input[type="password"],
                .bc-wizard-field input[type="number"],
                .bc-wizard-field select {
                    width: 100%;
                    padding: 10px;
                    font-size: 14px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .bc-wizard-field .description {
                    margin-top: 5px;
                    color: #666;
                    font-size: 13px;
                }
                .button-primary {
                    background: #2271b1;
                    border-color: #2271b1;
                    color: #fff;
                    padding: 10px 24px;
                    font-size: 14px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .button-primary:hover {
                    background: #135e96;
                }
                .button-secondary {
                    background: #f6f7f7;
                    border: 1px solid #ddd;
                    color: #2271b1;
                    padding: 10px 24px;
                    font-size: 14px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .bc-wizard-success {
                    text-align: center;
                    padding: 40px;
                }
                .bc-wizard-success .dashicons {
                    font-size: 64px;
                    width: 64px;
                    height: 64px;
                    color: #00a32a;
                }
            </style>
        </head>
        <body>
            <div class="bc-wizard">
                <div class="bc-wizard-header">
                    <h1 style="margin: 0;">BC Bridge</h1>
                    <p style="color: #666; margin: 10px 0 0;">Connect WordPress to BigCommerce</p>

                    <div class="bc-wizard-steps">
                        <?php
                        $step_index  = 0;
                        $current_idx = array_search( $current_step, array_keys( self::$steps ), true );
                        foreach ( self::$steps as $step_key => $step ) :
                            $class = '';
                            if ( $step_key === $current_step ) {
                                $class = 'active';
                            } elseif ( $step_index < $current_idx ) {
                                $class = 'completed';
                            }
                            ?>
                            <div class="bc-wizard-step <?php echo esc_attr( $class ); ?>">
                                <span class="bc-wizard-step-number">
                                    <?php if ( $step_index < $current_idx ) : ?>
                                        <span class="dashicons dashicons-yes"></span>
                                    <?php else : ?>
                                        <?php echo esc_html( $step_index + 1 ); ?>
                                    <?php endif; ?>
                                </span>
                                <span><?php echo esc_html( $step['title'] ); ?></span>
                            </div>
                            <?php $step_index++; ?>
                        <?php endforeach; ?>
                    </div>
                </div>

                <?php
                switch ( $current_step ) {
                    case 'welcome':
                        self::render_welcome_step();
                        break;
                    case 'api':
                        self::render_api_step();
                        break;
                    case 'display':
                        self::render_display_step();
                        break;
                    case 'complete':
                        self::render_complete_step();
                        break;
                }
                ?>
            </div>
            <?php wp_footer(); ?>
        </body>
        </html>
        <?php
        exit;
    }

    /**
     * Render welcome step.
     *
     * @return void
     */
    private static function render_welcome_step(): void {
        ?>
        <div class="bc-wizard-content" style="text-align: center;">
            <h2><?php esc_html_e( 'Welcome to BC Bridge!', 'bc-bridge' ); ?></h2>
            <p class="lead">
                <?php esc_html_e( 'BC Bridge connects your WordPress site to BigCommerce, allowing you to display and sell products without leaving WordPress.', 'bc-bridge' ); ?>
            </p>

            <ul style="text-align: left; max-width: 500px; margin: 30px auto; line-height: 2;">
                <li>✓ <?php esc_html_e( 'Display products from BigCommerce on your WordPress site', 'bc-bridge' ); ?></li>
                <li>✓ <?php esc_html_e( 'Real-time inventory and pricing (no sync delays)', 'bc-bridge' ); ?></li>
                <li>✓ <?php esc_html_e( 'Works with any WordPress theme', 'bc-bridge' ); ?></li>
                <li>✓ <?php esc_html_e( 'Secure checkout powered by BigCommerce', 'bc-bridge' ); ?></li>
            </ul>
        </div>
        <div class="bc-wizard-footer">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge' ) ); ?>" class="button-secondary">
                <?php esc_html_e( 'Skip Setup', 'bc-bridge' ); ?>
            </a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge-wizard&step=api' ) ); ?>" class="button-primary">
                <?php esc_html_e( 'Get Started', 'bc-bridge' ); ?>
            </a>
        </div>
        <?php
    }

    /**
     * Render API step.
     *
     * @return void
     */
    private static function render_api_step(): void {
        $settings = BC_Bridge::get_settings();

        // Handle form submission.
        if ( isset( $_POST['bc_bridge_wizard_api'] ) && wp_verify_nonce( $_POST['_wpnonce'], 'bc_bridge_wizard_api' ) ) {
            $settings['store_hash']   = sanitize_text_field( $_POST['store_hash'] ?? '' );
            $settings['access_token'] = sanitize_text_field( $_POST['access_token'] ?? '' );
            $settings['channel_id']   = absint( $_POST['channel_id'] ?? 1 );

            update_option( 'bc_bridge_settings', $settings );

            wp_safe_redirect( admin_url( 'admin.php?page=bc-bridge-wizard&step=display' ) );
            exit;
        }
        ?>
        <form method="post" action="">
            <?php wp_nonce_field( 'bc_bridge_wizard_api' ); ?>
            <input type="hidden" name="bc_bridge_wizard_api" value="1">

            <div class="bc-wizard-content">
                <h2><?php esc_html_e( 'Connect to BigCommerce', 'bc-bridge' ); ?></h2>
                <p class="lead">
                    <?php
                    printf(
                        esc_html__( 'Enter your BigCommerce API credentials. You can create them in %s.', 'bc-bridge' ),
                        '<a href="https://login.bigcommerce.com/" target="_blank">' . esc_html__( 'your BigCommerce admin', 'bc-bridge' ) . '</a>'
                    );
                    ?>
                </p>

                <div class="bc-wizard-field">
                    <label for="store_hash"><?php esc_html_e( 'Store Hash', 'bc-bridge' ); ?></label>
                    <input type="text" id="store_hash" name="store_hash" value="<?php echo esc_attr( $settings['store_hash'] ?? '' ); ?>" required>
                    <p class="description"><?php esc_html_e( 'Found in your store URL: https://store-{HASH}.mybigcommerce.com', 'bc-bridge' ); ?></p>
                </div>

                <div class="bc-wizard-field">
                    <label for="access_token"><?php esc_html_e( 'Access Token', 'bc-bridge' ); ?></label>
                    <input type="password" id="access_token" name="access_token" value="<?php echo esc_attr( $settings['access_token'] ?? '' ); ?>" required>
                    <p class="description"><?php esc_html_e( 'Create an API account with scopes: Products (read), Carts (modify), Checkouts (modify)', 'bc-bridge' ); ?></p>
                </div>

                <div class="bc-wizard-field">
                    <label for="channel_id"><?php esc_html_e( 'Channel ID', 'bc-bridge' ); ?></label>
                    <input type="number" id="channel_id" name="channel_id" value="<?php echo esc_attr( $settings['channel_id'] ?? 1 ); ?>" min="1">
                    <p class="description"><?php esc_html_e( 'Usually 1 for the default storefront', 'bc-bridge' ); ?></p>
                </div>
            </div>
            <div class="bc-wizard-footer">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge-wizard&step=welcome' ) ); ?>" class="button-secondary">
                    <?php esc_html_e( 'Back', 'bc-bridge' ); ?>
                </a>
                <button type="submit" class="button-primary">
                    <?php esc_html_e( 'Continue', 'bc-bridge' ); ?>
                </button>
            </div>
        </form>
        <?php
    }

    /**
     * Render display step.
     *
     * @return void
     */
    private static function render_display_step(): void {
        $settings = BC_Bridge::get_settings();

        // Handle form submission.
        if ( isset( $_POST['bc_bridge_wizard_display'] ) && wp_verify_nonce( $_POST['_wpnonce'], 'bc_bridge_wizard_display' ) ) {
            $settings['products_per_page'] = absint( $_POST['products_per_page'] ?? 12 );
            $settings['checkout_type']     = in_array( $_POST['checkout_type'] ?? '', [ 'embedded', 'redirect' ], true )
                ? $_POST['checkout_type']
                : 'embedded';

            update_option( 'bc_bridge_settings', $settings );

            // Flush rewrite rules.
            BC_Bridge_Routes::flush_rules();

            wp_safe_redirect( admin_url( 'admin.php?page=bc-bridge-wizard&step=complete' ) );
            exit;
        }
        ?>
        <form method="post" action="">
            <?php wp_nonce_field( 'bc_bridge_wizard_display' ); ?>
            <input type="hidden" name="bc_bridge_wizard_display" value="1">

            <div class="bc-wizard-content">
                <h2><?php esc_html_e( 'Configure Your Shop', 'bc-bridge' ); ?></h2>
                <p class="lead"><?php esc_html_e( 'Choose how products and checkout will be displayed.', 'bc-bridge' ); ?></p>

                <div class="bc-wizard-field">
                    <label for="products_per_page"><?php esc_html_e( 'Products Per Page', 'bc-bridge' ); ?></label>
                    <input type="number" id="products_per_page" name="products_per_page" value="<?php echo esc_attr( $settings['products_per_page'] ?? 12 ); ?>" min="1" max="100">
                </div>

                <div class="bc-wizard-field">
                    <label for="checkout_type"><?php esc_html_e( 'Checkout Type', 'bc-bridge' ); ?></label>
                    <select id="checkout_type" name="checkout_type">
                        <option value="embedded" <?php selected( $settings['checkout_type'] ?? '', 'embedded' ); ?>>
                            <?php esc_html_e( 'Embedded (on your site)', 'bc-bridge' ); ?>
                        </option>
                        <option value="redirect" <?php selected( $settings['checkout_type'] ?? '', 'redirect' ); ?>>
                            <?php esc_html_e( 'Redirect (to BigCommerce)', 'bc-bridge' ); ?>
                        </option>
                    </select>
                    <p class="description"><?php esc_html_e( 'Embedded keeps customers on your site. Redirect sends them to BigCommerce for checkout.', 'bc-bridge' ); ?></p>
                </div>
            </div>
            <div class="bc-wizard-footer">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge-wizard&step=api' ) ); ?>" class="button-secondary">
                    <?php esc_html_e( 'Back', 'bc-bridge' ); ?>
                </a>
                <button type="submit" class="button-primary">
                    <?php esc_html_e( 'Finish Setup', 'bc-bridge' ); ?>
                </button>
            </div>
        </form>
        <?php
    }

    /**
     * Render complete step.
     *
     * @return void
     */
    private static function render_complete_step(): void {
        ?>
        <div class="bc-wizard-content bc-wizard-success">
            <span class="dashicons dashicons-yes-alt"></span>
            <h2><?php esc_html_e( 'Setup Complete!', 'bc-bridge' ); ?></h2>
            <p class="lead"><?php esc_html_e( 'Your WordPress site is now connected to BigCommerce.', 'bc-bridge' ); ?></p>

            <div style="margin: 30px 0;">
                <h3><?php esc_html_e( 'What\'s Next?', 'bc-bridge' ); ?></h3>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto; line-height: 2;">
                    <li>→ <a href="<?php echo esc_url( home_url( '/shop/' ) ); ?>" target="_blank"><?php esc_html_e( 'View your shop', 'bc-bridge' ); ?></a></li>
                    <li>→ <?php esc_html_e( 'Add products using shortcode: [bc_products]', 'bc-bridge' ); ?></li>
                    <li>→ <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge-settings' ) ); ?>"><?php esc_html_e( 'Customize settings', 'bc-bridge' ); ?></a></li>
                </ul>
            </div>
        </div>
        <div class="bc-wizard-footer" style="justify-content: center;">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=bc-bridge' ) ); ?>" class="button-primary">
                <?php esc_html_e( 'Go to Dashboard', 'bc-bridge' ); ?>
            </a>
        </div>
        <?php
    }
}
