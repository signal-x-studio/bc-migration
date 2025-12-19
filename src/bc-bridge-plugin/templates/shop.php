<?php
/**
 * Shop page template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $bc_bridge_data;

$products   = $bc_bridge_data['products'] ?? [];
$pagination = $bc_bridge_data['pagination'] ?? [];

get_header();
?>

<div class="bc-bridge-shop">
    <header class="bc-bridge-shop-header">
        <h1 class="bc-bridge-shop-title"><?php esc_html_e( 'Shop', 'bc-bridge' ); ?></h1>

        <?php if ( ! empty( $pagination['total'] ) ) : ?>
            <p class="bc-bridge-shop-count">
                <?php
                printf(
                    /* translators: %d is the number of products */
                    esc_html( _n( '%d product', '%d products', $pagination['total'], 'bc-bridge' ) ),
                    (int) $pagination['total']
                );
                ?>
            </p>
        <?php endif; ?>
    </header>

    <?php if ( empty( $products ) ) : ?>
        <div class="bc-bridge-no-products">
            <p><?php esc_html_e( 'No products found.', 'bc-bridge' ); ?></p>
        </div>
    <?php else : ?>
        <div class="bc-bridge-product-grid bc-bridge-product-grid--4">
            <?php foreach ( $products as $product ) : ?>
                <?php
                BC_Bridge_Templates::get_template( 'partials/product-card', [
                    'product' => $product,
                ] );
                ?>
            <?php endforeach; ?>
        </div>

        <?php
        echo BC_Bridge_Templates::render_pagination(
            $pagination,
            BC_Bridge_Routes::get_url( 'shop' )
        );
        ?>
    <?php endif; ?>
</div>

<?php
get_footer();
