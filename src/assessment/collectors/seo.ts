import { WCClient } from '../wc-client.js';

export interface SEOMetrics {
  permalinkStructure: string;
  isStandard: boolean;
  hasYoast: boolean;
  hasRankMath: boolean;
  urlSample: string[];
  redirectEstimate: number;
}

export class SEOCollector {
  constructor(private client: WCClient) {}

  async collect(): Promise<SEOMetrics> {
    try {
      // 1. Get Permalink Structure (requires careful error handling as this might be restricted)
      let permalinkStructure = 'unknown';
      try {
        // Try to infer from a sample product if settings access is restricted
        const products = await this.client.getProducts({ per_page: 1 });
        if (products.data.length > 0) {
          permalinkStructure = this.inferPermalink(products.data[0].permalink);
        }
      } catch (e) {
        console.warn('Could not infer permalink structure');
      }

      // 2. Check SEO Plugins
      const systemStatus = await this.client.getSystemStatus();
      const plugins = systemStatus.data.active_plugins || [];
      const hasYoast = plugins.some((p: any) => p.plugin.includes('wordpress-seo'));
      const hasRankMath = plugins.some((p: any) => p.plugin.includes('seo-by-rank-math'));

      // 3. Estimate Redirects
      // Heuristic: If custom permalinks + High product count = High redirect effort
      const scale = await this.client.getCounts('products');
      const isStandard = permalinkStructure.includes('/product/');
      
      return {
        permalinkStructure,
        isStandard,
        hasYoast,
        hasRankMath,
        urlSample: [], // populated in full run
        redirectEstimate: isStandard ? 0 : scale
      };
    } catch (error: any) {
      console.warn('SEO Collection failed:', error.message);
      return {
        permalinkStructure: 'unknown',
        isStandard: true,
        hasYoast: false,
        hasRankMath: false,
        urlSample: [],
        redirectEstimate: 0
      };
    }
  }

  private inferPermalink(url: string): string {
    if (url.includes('/product/')) return '/product/%productname%';
    return 'custom';
  }
}
