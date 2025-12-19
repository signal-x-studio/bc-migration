<?php
/**
 * Single product page template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $bc_bridge_data;

$product = $bc_bridge_data['product'] ?? [];

if ( empty( $product ) ) {
    get_header();
    ?>
    <div class="bc-bridge-not-found">
        <h1><?php esc_html_e( 'Product Not Found', 'bc-bridge' ); ?></h1>
        <p><?php esc_html_e( 'The product you are looking for does not exist.', 'bc-bridge' ); ?></p>
        <a href="<?php echo esc_url( BC_Bridge_Routes::get_url( 'shop' ) ); ?>" class="bc-bridge-button">
            <?php esc_html_e( 'Return to Shop', 'bc-bridge' ); ?>
        </a>
    </div>
    <?php
    get_footer();
    return;
}

$images   = $product['images'] ?? [];
$variants = $product['variants'] ?? [];

get_header();
?>

<div class="bc-bridge-product">
    <div class="bc-bridge-product-gallery">
        <?php if ( ! empty( $images ) ) : ?>
            <div class="bc-bridge-product-main-image">
                <img
                    src="<?php echo esc_url( BC_Bridge_Templates::get_product_image( $product, 'full' ) ); ?>"
                    alt="<?php echo esc_attr( $product['name'] ); ?>"
                    class="bc-bridge-product-image"
                >
            </div>
            <?php if ( count( $images ) > 1 ) : ?>
                <div class="bc-bridge-product-thumbnails">
                    <?php foreach ( $images as $image ) : ?>
                        <button
                            type="button"
                            class="bc-bridge-product-thumbnail"
                            data-image="<?php echo esc_url( $image['url_standard'] ?? '' ); ?>"
                        >
                            <img
                                src="<?php echo esc_url( $image['url_thumbnail'] ?? '' ); ?>"
                                alt="<?php echo esc_attr( $product['name'] ); ?>"
                            >
                        </button>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        <?php else : ?>
            <div class="bc-bridge-product-no-image">
                <img
                    src="<?php echo esc_url( BC_BRIDGE_PLUGIN_URL . 'assets/images/placeholder.png' ); ?>"
                    alt="<?php echo esc_attr( $product['name'] ); ?>"
                >
            </div>
        <?php endif; ?>
    </div>

    <div class="bc-bridge-product-details">
        <h1 class="bc-bridge-product-title"><?php echo esc_html( $product['name'] ); ?></h1>

        <?php if ( ! empty( $product['sku'] ) ) : ?>
            <p class="bc-bridge-product-sku">
                <?php esc_html_e( 'SKU:', 'bc-bridge' ); ?>
                <span><?php echo esc_html( $product['sku'] ); ?></span>
            </p>
        <?php endif; ?>

        <div class="bc-bridge-product-price">
            <?php if ( ! empty( $product['sale_price'] ) && $product['sale_price'] < $product['price'] ) : ?>
                <span class="bc-bridge-product-price--sale">
                    <?php echo esc_html( BC_Bridge_Templates::format_price( $product['sale_price'] ) ); ?>
                </span>
                <span class="bc-bridge-product-price--original">
                    <?php echo esc_html( BC_Bridge_Templates::format_price( $product['price'] ) ); ?>
                </span>
            <?php else : ?>
                <span class="bc-bridge-product-price--regular">
                    <?php echo esc_html( BC_Bridge_Templates::format_price( $product['price'] ) ); ?>
                </span>
            <?php endif; ?>
        </div>

        <?php if ( ! empty( $product['description'] ) ) : ?>
            <div class="bc-bridge-product-description">
                <?php echo wp_kses_post( $product['description'] ); ?>
            </div>
        <?php endif; ?>

        <form class="bc-bridge-product-form" data-product-id="<?php echo esc_attr( $product['id'] ); ?>">
            <?php if ( count( $variants ) > 1 ) : ?>
                <div class="bc-bridge-product-variants">
                    <?php
                    // Group variants by option.
                    $options = [];
                    foreach ( $variants as $variant ) {
                        foreach ( $variant['option_values'] ?? [] as $option ) {
                            $option_name = $option['option_display_name'];
                            if ( ! isset( $options[ $option_name ] ) ) {
                                $options[ $option_name ] = [];
                            }
                            if ( ! in_array( $option['label'], $options[ $option_name ], true ) ) {
                                $options[ $option_name ][] = $option['label'];
                            }
                        }
                    }
                    ?>
                    <?php foreach ( $options as $option_name => $option_values ) : ?>
                        <div class="bc-bridge-product-option">
                            <label for="option-<?php echo esc_attr( sanitize_title( $option_name ) ); ?>">
                                <?php echo esc_html( $option_name ); ?>
                            </label>
                            <select
                                id="option-<?php echo esc_attr( sanitize_title( $option_name ) ); ?>"
                                name="options[<?php echo esc_attr( $option_name ); ?>]"
                                class="bc-bridge-product-option-select"
                                data-option-name="<?php echo esc_attr( $option_name ); ?>"
                            >
                                <?php foreach ( $option_values as $value ) : ?>
                                    <option value="<?php echo esc_attr( $value ); ?>">
                                        <?php echo esc_html( $value ); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    <?php endforeach; ?>

                    <input type="hidden" name="variant_id" value="<?php echo esc_attr( $variants[0]['id'] ?? '' ); ?>">
                    <script type="application/json" class="bc-bridge-variants-data">
                        <?php echo wp_json_encode( $variants ); ?>
                    </script>
                </div>
            <?php endif; ?>

            <div class="bc-bridge-product-quantity">
                <label for="quantity"><?php esc_html_e( 'Quantity', 'bc-bridge' ); ?></label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value="1"
                    min="1"
                    max="<?php echo esc_attr( $product['inventory_level'] > 0 ? $product['inventory_level'] : 999 ); ?>"
                >
            </div>

            <div class="bc-bridge-product-actions">
                <?php
                $in_stock = ( 'none' === $product['inventory_tracking'] ) || ( $product['inventory_level'] > 0 );
                if ( $in_stock ) :
                    ?>
                    <button type="submit" class="bc-bridge-button bc-bridge-button--primary bc-bridge-add-to-cart-form">
                        <?php esc_html_e( 'Add to Cart', 'bc-bridge' ); ?>
                    </button>
                <?php else : ?>
                    <button type="button" class="bc-bridge-button bc-bridge-button--disabled" disabled>
                        <?php esc_html_e( 'Out of Stock', 'bc-bridge' ); ?>
                    </button>
                <?php endif; ?>
            </div>
        </form>

        <?php if ( ! empty( $product['custom_fields'] ) ) : ?>
            <div class="bc-bridge-product-custom-fields">
                <h3><?php esc_html_e( 'Additional Information', 'bc-bridge' ); ?></h3>
                <table>
                    <?php foreach ( $product['custom_fields'] as $field ) : ?>
                        <tr>
                            <th><?php echo esc_html( $field['name'] ); ?></th>
                            <td><?php echo esc_html( $field['value'] ); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php
get_footer();
