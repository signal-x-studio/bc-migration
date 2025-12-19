/**
 * BC Bridge Admin JavaScript
 *
 * @package BC_Bridge
 */

(function ($) {
    'use strict';

    // Ensure bcBridgeAdmin is available.
    if (typeof bcBridgeAdmin === 'undefined') {
        console.error('BC Bridge Admin: Localized data not found.');
        return;
    }

    const BCBridgeAdmin = {
        /**
         * Initialize.
         */
        init: function () {
            this.bindEvents();
        },

        /**
         * Bind events.
         */
        bindEvents: function () {
            // Test connection button.
            $('#bc-bridge-test-connection').on('click', this.handleTestConnection);

            // Clear cache buttons.
            $('.bc-bridge-clear-cache').on('click', this.handleClearCache);

            // Flush rules button.
            $('.bc-bridge-flush-rules').on('click', this.handleFlushRules);

            // Copy debug info button.
            $('.bc-bridge-copy-debug').on('click', this.handleCopyDebug);
        },

        /**
         * Handle test connection click.
         *
         * @param {Event} e Click event.
         */
        handleTestConnection: function (e) {
            e.preventDefault();

            const $button = $(this);
            const $result = $('.bc-bridge-test-result');

            $button.prop('disabled', true);
            $result.removeClass('success error').text(bcBridgeAdmin.i18n.testing || 'Testing connection...');

            $.ajax({
                url: bcBridgeAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'bc_bridge_test_connection',
                    nonce: bcBridgeAdmin.nonce,
                },
                success: function (response) {
                    $button.prop('disabled', false);

                    if (response.success) {
                        $result
                            .addClass('success')
                            .text(bcBridgeAdmin.i18n.connected + ' (' + response.data.store_name + ')');
                    } else {
                        $result
                            .addClass('error')
                            .text(bcBridgeAdmin.i18n.failed + ': ' + response.data.message);
                    }
                },
                error: function () {
                    $button.prop('disabled', false);
                    $result
                        .addClass('error')
                        .text(bcBridgeAdmin.i18n.failed || 'Connection failed');
                },
            });
        },

        /**
         * Handle clear cache click.
         *
         * @param {Event} e Click event.
         */
        handleClearCache: function (e) {
            e.preventDefault();

            const $button = $(this);
            const group = $button.data('group') || 'all';
            const originalText = $button.text();

            $button.prop('disabled', true).text(bcBridgeAdmin.i18n.clearing || 'Clearing...');

            $.ajax({
                url: bcBridgeAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'bc_bridge_clear_cache',
                    nonce: bcBridgeAdmin.nonce,
                    group: group,
                },
                success: function (response) {
                    $button.prop('disabled', false);

                    if (response.success) {
                        $button.text(bcBridgeAdmin.i18n.cleared || 'Cleared!');
                        setTimeout(function () {
                            $button.text(originalText);
                        }, 2000);
                    } else {
                        $button.text(originalText);
                        alert(response.data.message || 'Failed to clear cache.');
                    }
                },
                error: function () {
                    $button.prop('disabled', false).text(originalText);
                    alert('Failed to clear cache.');
                },
            });
        },

        /**
         * Handle flush rules click.
         *
         * @param {Event} e Click event.
         */
        handleFlushRules: function (e) {
            e.preventDefault();

            const $button = $(this);
            const originalText = $button.text();

            $button.prop('disabled', true).text('Flushing...');

            $.ajax({
                url: bcBridgeAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'bc_bridge_flush_rules',
                    nonce: bcBridgeAdmin.nonce,
                },
                success: function (response) {
                    $button.prop('disabled', false);

                    if (response.success) {
                        $button.text('Flushed!');
                        setTimeout(function () {
                            $button.text(originalText);
                        }, 2000);
                    } else {
                        $button.text(originalText);
                        alert(response.data.message || 'Failed to flush rules.');
                    }
                },
                error: function () {
                    $button.prop('disabled', false).text(originalText);
                    alert('Failed to flush rules.');
                },
            });
        },

        /**
         * Handle copy debug info click.
         *
         * @param {Event} e Click event.
         */
        handleCopyDebug: function (e) {
            e.preventDefault();

            const $textarea = $(this).siblings('textarea');
            const text = $textarea.val();

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    BCBridgeAdmin.showNotice('Debug info copied to clipboard.', 'success');
                }).catch(function () {
                    BCBridgeAdmin.fallbackCopy($textarea);
                });
            } else {
                BCBridgeAdmin.fallbackCopy($textarea);
            }
        },

        /**
         * Fallback copy method.
         *
         * @param {jQuery} $textarea Textarea element.
         */
        fallbackCopy: function ($textarea) {
            $textarea.select();
            document.execCommand('copy');
            BCBridgeAdmin.showNotice('Debug info copied to clipboard.', 'success');
        },

        /**
         * Show admin notice.
         *
         * @param {string} message Notice message.
         * @param {string} type    Notice type (success, error, warning, info).
         */
        showNotice: function (message, type) {
            const $notice = $(`
                <div class="notice notice-${type} is-dismissible">
                    <p>${message}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `);

            $('.wrap.bc-bridge-admin h1').after($notice);

            // Auto-dismiss after 3 seconds.
            setTimeout(function () {
                $notice.fadeOut(function () {
                    $(this).remove();
                });
            }, 3000);

            // Manual dismiss.
            $notice.find('.notice-dismiss').on('click', function () {
                $notice.fadeOut(function () {
                    $(this).remove();
                });
            });
        },
    };

    // Initialize on document ready.
    $(document).ready(function () {
        BCBridgeAdmin.init();
    });
})(jQuery);
