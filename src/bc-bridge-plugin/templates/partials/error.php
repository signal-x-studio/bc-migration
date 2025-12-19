<?php
/**
 * Error message partial template.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$error = $error ?? null;

if ( ! $error || ! is_wp_error( $error ) ) {
    return;
}
?>

<div class="bc-bridge-error">
    <p class="bc-bridge-error-message">
        <?php echo esc_html( $error->get_error_message() ); ?>
    </p>
</div>
