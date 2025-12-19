<?php
/**
 * Product card partial template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$product = $product ?? [];

if ( empty( $product ) ) {
    return;
}

$product_url = BC_Bridge_Templates::get_product_url( $product );
$image_url   = BC_Bridge_Templates::get_product_image( $product, 'standard' );
$in_stock    = ( 'none' === $product['inventory_tracking'] ) || ( $product['inventory_level'] > 0 );
?>

<article class="bc-bridge-product-card <?php echo ! $in_stock ? 'bc-bridge-product-card--out-of-stock' : ''; ?>">
    <a href="<?php echo esc_url( $product_url ); ?>" class="bc-bridge-product-card-link">
        <div class="bc-bridge-product-card-image">
            <img
                src="<?php echo esc_url( $image_url ); ?>"
                alt="<?php echo esc_attr( $product['name'] ); ?>"
                loading="lazy"
            >
            <?php if ( ! empty( $product['sale_price'] ) && $product['sale_price'] < $product['price'] ) : ?>
                <span class="bc-bridge-product-card-badge bc-bridge-product-card-badge--sale">
                    <?php esc_html_e( 'Sale', 'bc-bridge' ); ?>
                </span>
            <?php endif; ?>
            <?php if ( ! $in_stock ) : ?>
                <span class="bc-bridge-product-card-badge bc-bridge-product-card-badge--out-of-stock">
                    <?php esc_html_e( 'Out of Stock', 'bc-bridge' ); ?>
                </span>
            <?php endif; ?>
        </div>

        <div class="bc-bridge-product-card-content">
            <h3 class="bc-bridge-product-card-title"><?php echo esc_html( $product['name'] ); ?></h3>

            <div class="bc-bridge-product-card-price">
                <?php if ( ! empty( $product['sale_price'] ) && $product['sale_price'] < $product['price'] ) : ?>
                    <span class="bc-bridge-product-card-price--sale">
                        <?php echo esc_html( BC_Bridge_Templates::format_price( $product['sale_price'] ) ); ?>
                    </span>
                    <span class="bc-bridge-product-card-price--original">
                        <?php echo esc_html( BC_Bridge_Templates::format_price( $product['price'] ) ); ?>
                    </span>
                <?php else : ?>
                    <span class="bc-bridge-product-card-price--regular">
                        <?php echo esc_html( BC_Bridge_Templates::format_price( $product['price'] ) ); ?>
                    </span>
                <?php endif; ?>
            </div>
        </div>
    </a>

    <div class="bc-bridge-product-card-actions">
        <?php echo BC_Bridge_Templates::get_add_to_cart_button( $product ); ?>
    </div>
</article>
