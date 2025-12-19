<?php
/**
 * Product grid partial template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$products = $products ?? [];
$columns  = $columns ?? 4;

if ( empty( $products ) ) {
    ?>
    <div class="bc-bridge-no-products">
        <p><?php esc_html_e( 'No products found.', 'bc-bridge' ); ?></p>
    </div>
    <?php
    return;
}
?>

<div class="bc-bridge-product-grid bc-bridge-product-grid--<?php echo esc_attr( $columns ); ?>">
    <?php foreach ( $products as $product ) : ?>
        <?php
        BC_Bridge_Templates::get_template( 'partials/product-card', [
            'product' => $product,
        ] );
        ?>
    <?php endforeach; ?>
</div>
