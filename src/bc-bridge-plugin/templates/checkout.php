<?php
/**
 * Checkout page template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $bc_bridge_data;

$checkout_url  = $bc_bridge_data['checkout_url'] ?? '';
$checkout_type = BC_Bridge::get_settings( 'checkout_type' );
$cart          = $bc_bridge_data['cart'] ?? null;

// If redirect checkout, redirect immediately.
if ( 'redirect' === $checkout_type && $checkout_url ) {
    wp_redirect( $checkout_url );
    exit;
}

get_header();
?>

<div class="bc-bridge-checkout">
    <h1 class="bc-bridge-checkout-title"><?php esc_html_e( 'Checkout', 'bc-bridge' ); ?></h1>

    <?php if ( ! $cart || empty( $cart['line_items'] ) ) : ?>
        <div class="bc-bridge-checkout-empty">
            <p><?php esc_html_e( 'Your cart is empty. Please add items before checking out.', 'bc-bridge' ); ?></p>
            <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'shop' ) ); ?>" class="bc-bridge-button bc-bridge-button--primary">
                <?php esc_html_e( 'Continue Shopping', 'bc-bridge' ); ?>
            </a>
        </div>
    <?php elseif ( empty( $checkout_url ) ) : ?>
        <div class="bc-bridge-checkout-error">
            <p><?php esc_html_e( 'Unable to load checkout. Please try again.', 'bc-bridge' ); ?></p>
            <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'cart' ) ); ?>" class="bc-bridge-button bc-bridge-button--secondary">
                <?php esc_html_e( 'Return to Cart', 'bc-bridge' ); ?>
            </a>
        </div>
    <?php else : ?>
        <div class="bc-bridge-checkout-container">
            <div class="bc-bridge-checkout-frame-wrapper">
                <iframe
                    src="<?php echo esc_url( $checkout_url ); ?>"
                    class="bc-bridge-checkout-frame"
                    frameborder="0"
                    allowfullscreen
                    allow="payment"
                ></iframe>
            </div>

            <div class="bc-bridge-checkout-sidebar">
                <div class="bc-bridge-checkout-summary">
                    <h3><?php esc_html_e( 'Order Summary', 'bc-bridge' ); ?></h3>

                    <div class="bc-bridge-checkout-items">
                        <?php
                        $items = array_merge(
                            $cart['line_items']['physical_items'] ?? [],
                            $cart['line_items']['digital_items'] ?? []
                        );
                        foreach ( $items as $item ) :
                            ?>
                            <div class="bc-bridge-checkout-item">
                                <?php if ( ! empty( $item['image_url'] ) ) : ?>
                                    <img
                                        src="<?php echo esc_url( $item['image_url'] ); ?>"
                                        alt="<?php echo esc_attr( $item['name'] ); ?>"
                                        class="bc-bridge-checkout-item-image"
                                    >
                                <?php endif; ?>
                                <div class="bc-bridge-checkout-item-details">
                                    <span class="bc-bridge-checkout-item-name"><?php echo esc_html( $item['name'] ); ?></span>
                                    <span class="bc-bridge-checkout-item-qty">× <?php echo esc_html( $item['quantity'] ); ?></span>
                                </div>
                                <span class="bc-bridge-checkout-item-price">
                                    <?php echo esc_html( BC_Bridge_Templates::format_price( $item['extended_sale_price'] ?? $item['extended_list_price'] ) ); ?>
                                </span>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="bc-bridge-checkout-totals">
                        <div class="bc-bridge-checkout-total-row">
                            <span><?php esc_html_e( 'Subtotal', 'bc-bridge' ); ?></span>
                            <span><?php echo esc_html( BC_Bridge_Templates::format_price( $cart['base_amount'] ?? 0 ) ); ?></span>
                        </div>
                        <div class="bc-bridge-checkout-total-row bc-bridge-checkout-total">
                            <span><?php esc_html_e( 'Total', 'bc-bridge' ); ?></span>
                            <span><?php echo esc_html( BC_Bridge_Templates::format_price( $cart['cart_amount'] ?? 0 ) ); ?></span>
                        </div>
                    </div>
                </div>

                <p class="bc-bridge-checkout-back">
                    <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'cart' ) ); ?>">
                        ← <?php esc_html_e( 'Return to cart', 'bc-bridge' ); ?>
                    </a>
                </p>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php
get_footer();
