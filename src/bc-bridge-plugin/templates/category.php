<?php
/**
 * Category archive template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $bc_bridge_data;

$category   = $bc_bridge_data['category'] ?? [];
$products   = $bc_bridge_data['products'] ?? [];
$pagination = $bc_bridge_data['pagination'] ?? [];

get_header();
?>

<div class="bc-bridge-category">
    <header class="bc-bridge-category-header">
        <h1 class="bc-bridge-category-title"><?php echo esc_html( $category['name'] ?? __( 'Products', 'bc-bridge' ) ); ?></h1>

        <?php if ( ! empty( $category['description'] ) ) : ?>
            <div class="bc-bridge-category-description">
                <?php echo wp_kses_post( $category['description'] ); ?>
            </div>
        <?php endif; ?>

        <?php if ( ! empty( $pagination['total'] ) ) : ?>
            <p class="bc-bridge-category-count">
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
            <p><?php esc_html_e( 'No products found in this category.', 'bc-bridge' ); ?></p>
            <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'shop' ) ); ?>" class="bc-bridge-button">
                <?php esc_html_e( 'View All Products', 'bc-bridge' ); ?>
            </a>
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
            BC_Bridge_Routes::get_url( 'category', [ 'slug' => sanitize_title( $category['name'] ?? '' ) ] )
        );
        ?>
    <?php endif; ?>
</div>

<?php
get_footer();
