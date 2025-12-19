import { WCClient } from '../wc-client.js';

export interface ComplexityMetrics {
  score: number; // 0-100
  hasCustomMeta: boolean;
  averageMetaFields: number;
  productTypeDistribution: Record<string, number>;
  readinessCategory: 'GREEN' | 'YELLOW' | 'RED';
}

export class ComplexityCollector {
  constructor(private client: WCClient) {}

  async collect(): Promise<ComplexityMetrics> {
    // Sample up to 100 products
    const response = await this.client.getProducts({
      per_page: 100,
      orderby: 'id',
      order: 'desc'
    });

    const products = response.data;
    const totalProducts = products.length;

    if (totalProducts === 0) {
      return {
        score: 0,
        hasCustomMeta: false,
        averageMetaFields: 0,
        productTypeDistribution: {},
        readinessCategory: 'GREEN'
      };
    }

    let totalMetaFields = 0;
    const typeDistribution: Record<string, number> = {};

    products.forEach((p: any) => {
      totalMetaFields += (p.meta_data || []).length;
      typeDistribution[p.type] = (typeDistribution[p.type] || 0) + 1;
    });

    const averageMetaFields = totalMetaFields / totalProducts;
    const hasComplexTypes = typeDistribution.variable > 0 || typeDistribution.grouped > 0 || typeDistribution.external > 0;

    // Basic scoring logic
    let score = 0;
    if (averageMetaFields > 10) score += 30;
    if (typeDistribution.variable) score += 20;
    if (totalProducts > 1000) score += 20;

    let readiness: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    if (score > 50) readiness = 'YELLOW';
    if (score > 80) readiness = 'RED';

    return {
      score,
      hasCustomMeta: averageMetaFields > 0,
      averageMetaFields,
      productTypeDistribution: typeDistribution,
      readinessCategory: readiness
    };
  }
}
