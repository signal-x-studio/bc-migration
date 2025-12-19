<?php
/**
 * Cart page template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $bc_bridge_data;

$cart = $bc_bridge_data['cart'] ?? null;

get_header();
?>

<div class="bc-bridge-cart">
    <h1 class="bc-bridge-cart-title"><?php esc_html_e( 'Shopping Cart', 'bc-bridge' ); ?></h1>

    <?php if ( ! $cart || empty( $cart['line_items'] ) ) : ?>
        <div class="bc-bridge-cart-empty">
            <p><?php esc_html_e( 'Your cart is empty.', 'bc-bridge' ); ?></p>
            <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'shop' ) ); ?>" class="bc-bridge-button bc-bridge-button--primary">
                <?php esc_html_e( 'Continue Shopping', 'bc-bridge' ); ?>
            </a>
        </div>
    <?php else : ?>
        <div class="bc-bridge-cart-content">
            <div class="bc-bridge-cart-items">
                <table class="bc-bridge-cart-table">
                    <thead>
                        <tr>
                            <th class="bc-bridge-cart-col--product"><?php esc_html_e( 'Product', 'bc-bridge' ); ?></th>
                            <th class="bc-bridge-cart-col--price"><?php esc_html_e( 'Price', 'bc-bridge' ); ?></th>
                            <th class="bc-bridge-cart-col--quantity"><?php esc_html_e( 'Quantity', 'bc-bridge' ); ?></th>
                            <th class="bc-bridge-cart-col--total"><?php esc_html_e( 'Total', 'bc-bridge' ); ?></th>
                            <th class="bc-bridge-cart-col--remove"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $items = array_merge(
                            $cart['line_items']['physical_items'] ?? [],
                            $cart['line_items']['digital_items'] ?? []
                        );
                        foreach ( $items as $item ) :
                            ?>
                            <tr class="bc-bridge-cart-item" data-item-id="<?php echo esc_attr( $item['id'] ); ?>">
                                <td class="bc-bridge-cart-col--product">
                                    <div class="bc-bridge-cart-item-product">
                                        <?php if ( ! empty( $item['image_url'] ) ) : ?>
                                            <img
                                                src="<?php echo esc_url( $item['image_url'] ); ?>"
                                                alt="<?php echo esc_attr( $item['name'] ); ?>"
                                                class="bc-bridge-cart-item-image"
                                            >
                                        <?php endif; ?>
                                        <div class="bc-bridge-cart-item-info">
                                            <a href="<?php echo esc_url( $item['url'] ?? '#' ); ?>" class="bc-bridge-cart-item-name">
                                                <?php echo esc_html( $item['name'] ); ?>
                                            </a>
                                            <?php if ( ! empty( $item['options'] ) ) : ?>
                                                <div class="bc-bridge-cart-item-options">
                                                    <?php foreach ( $item['options'] as $option ) : ?>
                                                        <span><?php echo esc_html( $option['name'] . ': ' . $option['value'] ); ?></span>
                                                    <?php endforeach; ?>
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </td>
                                <td class="bc-bridge-cart-col--price">
                                    <?php echo esc_html( BC_Bridge_Templates::format_price( $item['sale_price'] ?? $item['list_price'] ) ); ?>
                                </td>
                                <td class="bc-bridge-cart-col--quantity">
                                    <div class="bc-bridge-quantity-control">
                                        <button
                                            type="button"
                                            class="bc-bridge-quantity-btn bc-bridge-quantity-decrease"
                                            data-item-id="<?php echo esc_attr( $item['id'] ); ?>"
                                        >-</button>
                                        <input
                                            type="number"
                                            class="bc-bridge-quantity-input"
                                            value="<?php echo esc_attr( $item['quantity'] ); ?>"
                                            min="1"
                                            data-item-id="<?php echo esc_attr( $item['id'] ); ?>"
                                        >
                                        <button
                                            type="button"
                                            class="bc-bridge-quantity-btn bc-bridge-quantity-increase"
                                            data-item-id="<?php echo esc_attr( $item['id'] ); ?>"
                                        >+</button>
                                    </div>
                                </td>
                                <td class="bc-bridge-cart-col--total">
                                    <?php echo esc_html( BC_Bridge_Templates::format_price( $item['extended_sale_price'] ?? $item['extended_list_price'] ) ); ?>
                                </td>
                                <td class="bc-bridge-cart-col--remove">
                                    <button
                                        type="button"
                                        class="bc-bridge-cart-remove"
                                        data-item-id="<?php echo esc_attr( $item['id'] ); ?>"
                                        aria-label="<?php esc_attr_e( 'Remove item', 'bc-bridge' ); ?>"
                                    >
                                        <span class="dashicons dashicons-trash"></span>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <div class="bc-bridge-cart-summary">
                <h3><?php esc_html_e( 'Cart Summary', 'bc-bridge' ); ?></h3>

                <div class="bc-bridge-cart-totals">
                    <div class="bc-bridge-cart-total-row">
                        <span><?php esc_html_e( 'Subtotal', 'bc-bridge' ); ?></span>
                        <span class="bc-bridge-cart-subtotal">
                            <?php echo esc_html( BC_Bridge_Templates::format_price( $cart['base_amount'] ?? 0 ) ); ?>
                        </span>
                    </div>

                    <?php if ( ! empty( $cart['discount_amount'] ) ) : ?>
                        <div class="bc-bridge-cart-total-row bc-bridge-cart-discount">
                            <span><?php esc_html_e( 'Discount', 'bc-bridge' ); ?></span>
                            <span>-<?php echo esc_html( BC_Bridge_Templates::format_price( $cart['discount_amount'] ) ); ?></span>
                        </div>
                    <?php endif; ?>

                    <div class="bc-bridge-cart-total-row bc-bridge-cart-total">
                        <span><?php esc_html_e( 'Total', 'bc-bridge' ); ?></span>
                        <span class="bc-bridge-cart-amount">
                            <?php echo esc_html( BC_Bridge_Templates::format_price( $cart['cart_amount'] ?? 0 ) ); ?>
                        </span>
                    </div>
                </div>

                <p class="bc-bridge-cart-note">
                    <?php esc_html_e( 'Shipping and taxes calculated at checkout.', 'bc-bridge' ); ?>
                </p>

                <div class="bc-bridge-cart-actions">
                    <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'checkout' ) ); ?>" class="bc-bridge-button bc-bridge-button--primary bc-bridge-button--full">
                        <?php esc_html_e( 'Proceed to Checkout', 'bc-bridge' ); ?>
                    </a>
                    <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'shop' ) ); ?>" class="bc-bridge-button bc-bridge-button--secondary bc-bridge-button--full">
                        <?php esc_html_e( 'Continue Shopping', 'bc-bridge' ); ?>
                    </a>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php
get_footer();
