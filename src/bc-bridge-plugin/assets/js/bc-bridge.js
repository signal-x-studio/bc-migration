/**
 * BC Bridge Frontend JavaScript
 *
 * @package BC_Bridge
 */

(function ($) {
    'use strict';

    // Ensure bcBridge is available.
    if (typeof bcBridge === 'undefined') {
        console.error('BC Bridge: Localized data not found.');
        return;
    }

    const BCBridge = {
        /**
         * Initialize.
         */
        init: function () {
            this.bindEvents();
            this.initProductGallery();
            this.initVariantSelector();
        },

        /**
         * Bind events.
         */
        bindEvents: function () {
            // Add to cart button click.
            $(document).on('click', '.bc-bridge-add-to-cart', this.handleAddToCart);

            // Add to cart form submit.
            $(document).on('submit', '.bc-bridge-product-form', this.handleAddToCartForm);

            // Cart quantity controls.
            $(document).on('click', '.bc-bridge-quantity-increase', this.handleQuantityIncrease);
            $(document).on('click', '.bc-bridge-quantity-decrease', this.handleQuantityDecrease);
            $(document).on('change', '.bc-bridge-quantity-input', this.handleQuantityChange);

            // Cart remove item.
            $(document).on('click', '.bc-bridge-cart-remove', this.handleRemoveFromCart);
        },

        /**
         * Initialize product gallery.
         */
        initProductGallery: function () {
            const $thumbnails = $('.bc-bridge-product-thumbnail');
            const $mainImage = $('.bc-bridge-product-main-image img');

            if (!$thumbnails.length || !$mainImage.length) {
                return;
            }

            $thumbnails.on('click', function () {
                const $this = $(this);
                const newImage = $this.data('image');

                if (newImage) {
                    $mainImage.attr('src', newImage);
                    $thumbnails.removeClass('active');
                    $this.addClass('active');
                }
            });

            // Mark first thumbnail as active.
            $thumbnails.first().addClass('active');
        },

        /**
         * Initialize variant selector.
         */
        initVariantSelector: function () {
            const $form = $('.bc-bridge-product-form');
            const $variantsData = $form.find('.bc-bridge-variants-data');

            if (!$variantsData.length) {
                return;
            }

            let variants;
            try {
                variants = JSON.parse($variantsData.text());
            } catch (e) {
                console.error('BC Bridge: Failed to parse variants data.');
                return;
            }

            const $selects = $form.find('.bc-bridge-product-option-select');
            const $variantInput = $form.find('input[name="variant_id"]');

            $selects.on('change', function () {
                const selectedOptions = {};

                $selects.each(function () {
                    const $select = $(this);
                    selectedOptions[$select.data('option-name')] = $select.val();
                });

                // Find matching variant.
                const matchingVariant = variants.find(function (variant) {
                    return variant.option_values.every(function (option) {
                        return selectedOptions[option.option_display_name] === option.label;
                    });
                });

                if (matchingVariant) {
                    $variantInput.val(matchingVariant.id);

                    // Update price display if needed.
                    BCBridge.updatePriceDisplay(matchingVariant);

                    // Update stock status.
                    BCBridge.updateStockStatus(matchingVariant);
                }
            });
        },

        /**
         * Update price display.
         *
         * @param {Object} variant Variant data.
         */
        updatePriceDisplay: function (variant) {
            const $priceContainer = $('.bc-bridge-product-price');
            if (!$priceContainer.length) {
                return;
            }

            const price = variant.price || variant.calculated_price;
            const salePrice = variant.sale_price;

            let html;
            if (salePrice && salePrice < price) {
                html = `
                    <span class="bc-bridge-product-price--sale">${BCBridge.formatPrice(salePrice)}</span>
                    <span class="bc-bridge-product-price--original">${BCBridge.formatPrice(price)}</span>
                `;
            } else {
                html = `<span class="bc-bridge-product-price--regular">${BCBridge.formatPrice(price)}</span>`;
            }

            $priceContainer.html(html);
        },

        /**
         * Update stock status.
         *
         * @param {Object} variant Variant data.
         */
        updateStockStatus: function (variant) {
            const $button = $('.bc-bridge-add-to-cart-form');
            if (!$button.length) {
                return;
            }

            const inStock = variant.inventory_level > 0 || variant.inventory_tracking === 'none';

            if (inStock) {
                $button
                    .prop('disabled', false)
                    .removeClass('bc-bridge-button--disabled')
                    .addClass('bc-bridge-button--primary')
                    .text(bcBridge.i18n.addToCart || 'Add to Cart');
            } else {
                $button
                    .prop('disabled', true)
                    .removeClass('bc-bridge-button--primary')
                    .addClass('bc-bridge-button--disabled')
                    .text(bcBridge.i18n.outOfStock || 'Out of Stock');
            }
        },

        /**
         * Format price.
         *
         * @param {number} price Price value.
         * @return {string} Formatted price.
         */
        formatPrice: function (price) {
            return '$' + parseFloat(price).toFixed(2);
        },

        /**
         * Handle add to cart click.
         *
         * @param {Event} e Click event.
         */
        handleAddToCart: function (e) {
            e.preventDefault();

            const $button = $(this);
            const productId = $button.data('product-id');

            if (!productId) {
                return;
            }

            BCBridge.addToCart(productId, 1, 0, $button);
        },

        /**
         * Handle add to cart form submit.
         *
         * @param {Event} e Submit event.
         */
        handleAddToCartForm: function (e) {
            e.preventDefault();

            const $form = $(this);
            const productId = $form.data('product-id');
            const quantity = parseInt($form.find('input[name="quantity"]').val(), 10) || 1;
            const variantId = parseInt($form.find('input[name="variant_id"]').val(), 10) || 0;
            const $button = $form.find('.bc-bridge-add-to-cart-form');

            if (!productId) {
                return;
            }

            BCBridge.addToCart(productId, quantity, variantId, $button);
        },

        /**
         * Add item to cart.
         *
         * @param {number} productId Product ID.
         * @param {number} quantity Quantity.
         * @param {number} variantId Variant ID.
         * @param {jQuery} $button Button element.
         */
        addToCart: function (productId, quantity, variantId, $button) {
            const originalText = $button.text();

            $button
                .prop('disabled', true)
                .text(bcBridge.i18n.addingToCart || 'Adding...');

            $.ajax({
                url: bcBridge.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'bc_bridge_add_to_cart',
                    nonce: bcBridge.nonce,
                    product_id: productId,
                    quantity: quantity,
                    variant_id: variantId,
                },
                success: function (response) {
                    if (response.success) {
                        $button.text(bcBridge.i18n.addedToCart || 'Added!');

                        // Update cart count in header if element exists.
                        BCBridge.updateCartCount(response.data.item_count);

                        // Show view cart option.
                        setTimeout(function () {
                            $button
                                .prop('disabled', false)
                                .text(bcBridge.i18n.viewCart || 'View Cart')
                                .off('click')
                                .on('click', function () {
                                    window.location.href = bcBridge.cartUrl;
                                });
                        }, 1500);
                    } else {
                        $button
                            .prop('disabled', false)
                            .text(originalText);
                        alert(response.data.message || bcBridge.i18n.error);
                    }
                },
                error: function () {
                    $button
                        .prop('disabled', false)
                        .text(originalText);
                    alert(bcBridge.i18n.error || 'Error. Please try again.');
                },
            });
        },

        /**
         * Handle quantity increase.
         *
         * @param {Event} e Click event.
         */
        handleQuantityIncrease: function (e) {
            e.preventDefault();

            const $row = $(this).closest('.bc-bridge-cart-item');
            const $input = $row.find('.bc-bridge-quantity-input');
            const currentValue = parseInt($input.val(), 10) || 1;
            const newValue = currentValue + 1;

            $input.val(newValue);
            BCBridge.updateCartItem($row.data('item-id'), newValue);
        },

        /**
         * Handle quantity decrease.
         *
         * @param {Event} e Click event.
         */
        handleQuantityDecrease: function (e) {
            e.preventDefault();

            const $row = $(this).closest('.bc-bridge-cart-item');
            const $input = $row.find('.bc-bridge-quantity-input');
            const currentValue = parseInt($input.val(), 10) || 1;
            const newValue = Math.max(1, currentValue - 1);

            $input.val(newValue);
            BCBridge.updateCartItem($row.data('item-id'), newValue);
        },

        /**
         * Handle quantity change.
         *
         * @param {Event} e Change event.
         */
        handleQuantityChange: function (e) {
            const $input = $(this);
            const $row = $input.closest('.bc-bridge-cart-item');
            const newValue = Math.max(1, parseInt($input.val(), 10) || 1);

            $input.val(newValue);
            BCBridge.updateCartItem($row.data('item-id'), newValue);
        },

        /**
         * Update cart item quantity.
         *
         * @param {string} itemId Item ID.
         * @param {number} quantity New quantity.
         */
        updateCartItem: function (itemId, quantity) {
            const $cart = $('.bc-bridge-cart');
            $cart.addClass('bc-bridge-loading');

            $.ajax({
                url: bcBridge.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'bc_bridge_update_cart',
                    nonce: bcBridge.nonce,
                    item_id: itemId,
                    quantity: quantity,
                },
                success: function (response) {
                    $cart.removeClass('bc-bridge-loading');

                    if (response.success) {
                        // Refresh cart page to show updated totals.
                        window.location.reload();
                    } else {
                        alert(response.data.message || bcBridge.i18n.error);
                    }
                },
                error: function () {
                    $cart.removeClass('bc-bridge-loading');
                    alert(bcBridge.i18n.error || 'Error. Please try again.');
                },
            });
        },

        /**
         * Handle remove from cart.
         *
         * @param {Event} e Click event.
         */
        handleRemoveFromCart: function (e) {
            e.preventDefault();

            const $row = $(this).closest('.bc-bridge-cart-item');
            const itemId = $row.data('item-id');

            if (!confirm('Remove this item from cart?')) {
                return;
            }

            const $cart = $('.bc-bridge-cart');
            $cart.addClass('bc-bridge-loading');

            $.ajax({
                url: bcBridge.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'bc_bridge_remove_from_cart',
                    nonce: bcBridge.nonce,
                    item_id: itemId,
                },
                success: function (response) {
                    $cart.removeClass('bc-bridge-loading');

                    if (response.success) {
                        // Refresh cart page.
                        window.location.reload();
                    } else {
                        alert(response.data.message || bcBridge.i18n.error);
                    }
                },
                error: function () {
                    $cart.removeClass('bc-bridge-loading');
                    alert(bcBridge.i18n.error || 'Error. Please try again.');
                },
            });
        },

        /**
         * Update cart count in header.
         *
         * @param {number} count Item count.
         */
        updateCartCount: function (count) {
            const $cartCount = $('.bc-bridge-cart-count');
            if ($cartCount.length) {
                $cartCount.text(count);
            }
        },
    };

    // Initialize on document ready.
    $(document).ready(function () {
        BCBridge.init();
    });
})(jQuery);
