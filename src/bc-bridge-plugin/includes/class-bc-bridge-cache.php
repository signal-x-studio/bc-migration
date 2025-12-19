<?php
/**
 * Cache management for BC Bridge.
 *
 * @package BC_Bridge
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * BC Bridge Cache class.
 *
 * Handles caching of API responses using WordPress transients.
 */
class BC_Bridge_Cache {

    /**
     * Cache prefix.
     */
    private const CACHE_PREFIX = 'bc_bridge_';

    /**
     * Default TTL in seconds.
     */
    private const DEFAULT_TTL = 300; // 5 minutes

    /**
     * Cache group TTLs.
     *
     * @var array
     */
    private static array $group_ttls = [
        'products'   => 300,   // 5 minutes
        'categories' => 900,   // 15 minutes
        'cart'       => 0,     // No cache
        'store'      => 3600,  // 1 hour
    ];

    /**
     * Get cached value.
     *
     * @param string $key   Cache key.
     * @param string $group Cache group.
     * @return mixed|false
     */
    public static function get( string $key, string $group = 'products' ): mixed {
        // Check if caching is disabled for this group.
        if ( isset( self::$group_ttls[ $group ] ) && 0 === self::$group_ttls[ $group ] ) {
            return false;
        }

        $cache_key = self::CACHE_PREFIX . $group . '_' . $key;

        // Try object cache first.
        $value = wp_cache_get( $cache_key, 'bc_bridge' );

        if ( false !== $value ) {
            return $value;
        }

        // Fall back to transients.
        return get_transient( $cache_key );
    }

    /**
     * Set cached value.
     *
     * @param string $key   Cache key.
     * @param mixed  $value Value to cache.
     * @param string $group Cache group.
     * @param int    $ttl   Time to live in seconds (0 = use group default).
     * @return bool
     */
    public static function set( string $key, mixed $value, string $group = 'products', int $ttl = 0 ): bool {
        // Determine TTL.
        if ( 0 === $ttl ) {
            $ttl = self::get_ttl( $group );
        }

        // Don't cache if TTL is 0.
        if ( 0 === $ttl ) {
            return false;
        }

        $cache_key = self::CACHE_PREFIX . $group . '_' . $key;

        // Set in object cache.
        wp_cache_set( $cache_key, $value, 'bc_bridge', $ttl );

        // Also set in transients for persistence.
        return set_transient( $cache_key, $value, $ttl );
    }

    /**
     * Delete cached value.
     *
     * @param string $key   Cache key.
     * @param string $group Cache group.
     * @return bool
     */
    public static function delete( string $key, string $group = 'products' ): bool {
        $cache_key = self::CACHE_PREFIX . $group . '_' . $key;

        wp_cache_delete( $cache_key, 'bc_bridge' );
        return delete_transient( $cache_key );
    }

    /**
     * Clear all cached values for a group.
     *
     * @param string $group Cache group.
     * @return void
     */
    public static function clear_group( string $group ): void {
        global $wpdb;

        // Clear transients for group.
        $prefix = self::CACHE_PREFIX . $group . '_';
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
                '_transient_' . $prefix . '%',
                '_transient_timeout_' . $prefix . '%'
            )
        );

        // Flush object cache group if using object cache.
        if ( function_exists( 'wp_cache_flush_group' ) ) {
            wp_cache_flush_group( 'bc_bridge' );
        }
    }

    /**
     * Clear all BC Bridge caches.
     *
     * @return void
     */
    public static function clear_all(): void {
        global $wpdb;

        // Clear all BC Bridge transients.
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
                '_transient_' . self::CACHE_PREFIX . '%',
                '_transient_timeout_' . self::CACHE_PREFIX . '%'
            )
        );

        // Flush object cache.
        if ( function_exists( 'wp_cache_flush_group' ) ) {
            wp_cache_flush_group( 'bc_bridge' );
        } else {
            wp_cache_flush();
        }
    }

    /**
     * Get TTL for cache group.
     *
     * @param string $group Cache group.
     * @return int TTL in seconds.
     */
    public static function get_ttl( string $group ): int {
        // Check if custom TTL is set in settings.
        $custom_ttl = BC_Bridge::get_settings( 'cache_ttl' );

        if ( $custom_ttl && 'products' === $group ) {
            return (int) $custom_ttl;
        }

        return self::$group_ttls[ $group ] ?? self::DEFAULT_TTL;
    }

    /**
     * Set TTL for cache group.
     *
     * @param string $group Cache group.
     * @param int    $ttl   TTL in seconds.
     * @return void
     */
    public static function set_ttl( string $group, int $ttl ): void {
        self::$group_ttls[ $group ] = $ttl;
    }

    /**
     * Get cache statistics.
     *
     * @return array
     */
    public static function get_stats(): array {
        global $wpdb;

        $prefix = self::CACHE_PREFIX;

        $count = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE %s",
                '_transient_' . $prefix . '%'
            )
        );

        return [
            'transient_count' => (int) $count,
            'groups'          => array_keys( self::$group_ttls ),
            'object_cache'    => wp_using_ext_object_cache(),
        ];
    }
}
