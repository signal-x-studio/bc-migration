import { WCClient } from '../wc-client.js';

export interface CustomLogicMetrics {
  detectedHooks: string[];
  hasShortcodes: boolean;
  requiresManualReview: boolean;
  logicDensity: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * CustomLogicCollector analyzes the theme's functions.php (if accessible)
 * or uses heuristic checks via WC API to identify custom business logic.
 */
export class CustomLogicCollector {
  constructor(private client: WCClient) {}

  async collect(): Promise<CustomLogicMetrics> {
    // Note: Standard WC API doesn't expose functions.php directly.
    // In a real scenario, we might use a custom endpoint or SFTP.
    // For now, we look for clues in system status and product meta.
    
    try {
      const statusResponse = await this.client.getSystemStatus();
      const activePlugins = statusResponse.data.active_plugins || [];
      const themeName = statusResponse.data.theme?.name || 'unknown';
      
      const hooksFound: string[] = [];
      let manualReview = false;

      // Check for plugins known to introduce heavy custom logic
      const complexPlugins = [
        'advanced-custom-fields',
        'woocommerce-subscriptions',
        'woocommerce-memberships',
        'elementor',
        'wpml'
      ];

      activePlugins.forEach((plugin: any) => {
        if (complexPlugins.some(cp => plugin.plugin.toLowerCase().includes(cp))) {
          hooksFound.push(`Complex Plugin Detected: ${plugin.name}`);
          manualReview = true;
        }
      });

      // Logic Density Heuristic
      let density: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (activePlugins.length > 30) density = 'MEDIUM';
      if (activePlugins.length > 60 || manualReview) density = 'HIGH';

      return {
        detectedHooks: hooksFound,
        hasShortcodes: activePlugins.some((p: any) => p.name.toLowerCase().includes('shortcode')),
        requiresManualReview: manualReview,
        logicDensity: density
      };
    } catch (error: any) {
      console.warn('CustomLogic collection partially failed:', error.message);
      return {
        detectedHooks: [],
        hasShortcodes: false,
        requiresManualReview: true,
        logicDensity: 'MEDIUM'
      };
    }
  }
}
