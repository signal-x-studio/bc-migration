import { WCClient, WCConfig } from './wc-client.js';
import { ScaleCollector } from './collectors/scale.js';
import { ComplexityCollector } from './collectors/complexity.js';
import { CustomLogicCollector } from './collectors/custom-logic.js';
import { PluginMapper } from './plugin-mapper.js';
import { SEOCollector } from './collectors/seo.js';

export interface AssessmentResult {
  storeUrl: string;
  wcVersion: string;
  metrics: {
    scale: any;
    complexity: any;
    logic: any;
    pluginMappings: any[];
    seo: any;
  };
  timestamp: string;
}

export class AssessmentOrchestrator {
  private client: WCClient;

  constructor(config: WCConfig) {
    this.client = new WCClient(config);
  }

  async run(): Promise<AssessmentResult> {
    console.log('Testing connection...');
    await this.client.testConnection();

    console.log('Collecting scale metrics...');
    const scaleCollector = new ScaleCollector(this.client);
    const scaleMetrics = await scaleCollector.collect();

    console.log('Analyzing complexity...');
    const complexityCollector = new ComplexityCollector(this.client);
    const complexityMetrics = await complexityCollector.collect();

    console.log('Scanning for custom logic...');
    const logicCollector = new CustomLogicCollector(this.client);
    const logicMetrics = await logicCollector.collect();

    // Fetch system status for WC version and active plugins
    const systemStatus = await this.client.getSystemStatus();
    const wcVersion = systemStatus.data.environment.wc_version;

    console.log('Mapping plugins...');
    const mapper = new PluginMapper();
    const pluginMappings = mapper.map(systemStatus.data.active_plugins || []);

    console.log('Analyzing SEO configuration...');
    const seoCollector = new SEOCollector(this.client);
    const seoMetrics = await seoCollector.collect();

    return {
      storeUrl: this.client['api'].url,
      wcVersion,
      metrics: {
        scale: scaleMetrics,
        complexity: complexityMetrics,
        logic: logicMetrics,
        pluginMappings,
        seo: seoMetrics
      },
      timestamp: new Date().toISOString()
    };
  }
}
