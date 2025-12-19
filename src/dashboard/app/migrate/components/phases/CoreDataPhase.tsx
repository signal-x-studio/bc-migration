'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package, Users, CheckCircle, Loader2, ChevronRight, ChevronDown, FolderTree,
  RefreshCw, Play
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CoreDataPhaseData } from '../../types';
import type { MigrationCategoryInfo, MigrationProgress, CustomerMigrationProgress } from '@/lib/types';
import { decodeHtmlEntities } from '@/lib/utils';

interface CoreDataPhaseProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  categoryIdMapping: Record<number, number>;
  phaseData?: CoreDataPhaseData;
  onComplete: (data: CoreDataPhaseData) => void;
  onUpdateData: (data: Partial<CoreDataPhaseData>) => void;
}

export function CoreDataPhase({
  wcCredentials,
  bcCredentials,
  categoryIdMapping,
  phaseData,
  onComplete,
  onUpdateData,
}: CoreDataPhaseProps) {
  // Categories state
  const [categories, setCategories] = useState<MigrationCategoryInfo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<MigrationCategoryInfo | null>(null);

  // Product migration state
  const [productsMigrating, setProductsMigrating] = useState(false);
  const [productProgress, setProductProgress] = useState<MigrationProgress | null>(null);
  const [migratedProductIds, setMigratedProductIds] = useState<number[]>(
    phaseData?.products?.mapping ? Object.keys(phaseData.products.mapping).map(Number) : []
  );
  const [migratedCategories, setMigratedCategories] = useState<number[]>([]);

  // Customer migration state
  const [customersMigrating, setCustomersMigrating] = useState(false);
  const [customerProgress, setCustomerProgress] = useState<CustomerMigrationProgress | null>(null);
  const [customersComplete, setCustomersComplete] = useState(
    phaseData?.customers && phaseData.customers.migrated > 0
  );
  const [customerStats, setCustomerStats] = useState(phaseData?.customers || null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/migrate/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: wcCredentials.url,
          consumerKey: wcCredentials.consumerKey,
          consumerSecret: wcCredentials.consumerSecret,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleProductMigration = async () => {
    if (!selectedCategory) return;

    setProductsMigrating(true);
    setProductProgress({
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      totalProducts: selectedCategory.productCount,
      completedProducts: 0,
      status: 'migrating',
    });

    try {
      const response = await fetch('/api/migrate/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wcCredentials,
          bcCredentials,
          categoryId: selectedCategory.id,
          migratedProductIds,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));

              if (data.type === 'progress') {
                setProductProgress(prev => prev ? {
                  ...prev,
                  completedProducts: data.completedProducts,
                  currentProduct: data.currentProduct,
                } : null);
              } else if (data.type === 'complete') {
                setProductProgress(prev => prev ? {
                  ...prev,
                  status: 'completed',
                  completedProducts: data.totalMigrated,
                } : null);

                // Update migrated IDs
                const newMigratedIds = [...new Set([...migratedProductIds, ...data.migratedProductIds])];
                setMigratedProductIds(newMigratedIds);
                setMigratedCategories(prev => [...prev, selectedCategory.id]);

                // Update phase data
                const productMapping: Record<number, number> = {};
                data.migratedProductIds.forEach((id: number, idx: number) => {
                  productMapping[id] = data.bcProductIds?.[idx] || id;
                });

                onUpdateData({
                  products: {
                    total: (phaseData?.products?.total || 0) + data.totalMigrated,
                    migrated: (phaseData?.products?.migrated || 0) + data.totalMigrated,
                    skipped: (phaseData?.products?.skipped || 0) + (data.skipped || 0),
                    failed: (phaseData?.products?.failed || 0) + (data.failed || 0),
                    mapping: { ...phaseData?.products?.mapping, ...productMapping },
                  },
                });
              } else if (data.type === 'error') {
                setProductProgress(prev => prev ? {
                  ...prev,
                  status: 'failed',
                  error: data.error,
                } : null);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setProductProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Migration failed',
      } : null);
    } finally {
      setProductsMigrating(false);
    }
  };

  const handleCustomerMigration = async () => {
    setCustomersMigrating(true);
    setCustomerProgress({
      totalCustomers: 0,
      completedCustomers: 0,
      status: 'migrating',
    });

    try {
      const response = await fetch('/api/migrate/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wcCredentials: {
            url: wcCredentials.url,
            consumerKey: wcCredentials.consumerKey,
            consumerSecret: wcCredentials.consumerSecret,
          },
          bcCredentials,
          migratedEmails: [],
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));

              if (data.type === 'started') {
                setCustomerProgress({
                  totalCustomers: data.totalCustomers,
                  completedCustomers: 0,
                  status: 'migrating',
                });
              } else if (data.type === 'progress') {
                setCustomerProgress(prev => prev ? {
                  ...prev,
                  completedCustomers: data.completedCustomers,
                  currentCustomer: data.currentCustomer,
                } : null);
              } else if (data.type === 'complete') {
                setCustomerProgress({
                  totalCustomers: data.stats.total,
                  completedCustomers: data.stats.successful,
                  status: 'completed',
                });

                setCustomersComplete(true);
                setCustomerStats({
                  total: data.stats.total,
                  migrated: data.stats.successful,
                  skipped: data.stats.skipped,
                  failed: data.stats.failed,
                  mapping: data.customerIdMapping || {},
                });

                // Update phase data
                onUpdateData({
                  customers: {
                    total: data.stats.total,
                    migrated: data.stats.successful,
                    skipped: data.stats.skipped,
                    failed: data.stats.failed,
                    mapping: data.customerIdMapping || {},
                  },
                });
              } else if (data.type === 'error') {
                setCustomerProgress(prev => prev ? {
                  ...prev,
                  status: 'failed',
                  error: data.error,
                } : null);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setCustomerProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Migration failed',
      } : null);
    } finally {
      setCustomersMigrating(false);
    }
  };

  // Check if phase is complete
  useEffect(() => {
    const hasProducts = migratedProductIds.length > 0 || (phaseData?.products?.migrated || 0) > 0;
    const hasCustomers = customersComplete || (phaseData?.customers?.migrated || 0) > 0;

    if (hasProducts && hasCustomers && phaseData) {
      onComplete(phaseData);
    }
  }, [migratedProductIds, customersComplete, phaseData, onComplete]);

  const isCategoryMigrated = (categoryId: number) => migratedCategories.includes(categoryId);

  // Category tree component
  const renderCategoryTree = (categoryList: MigrationCategoryInfo[], depth = 0) => {
    return categoryList.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isMigrated = isCategoryMigrated(category.id);

      return (
        <div key={category.id}>
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
              ${selectedCategory?.id === category.id ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800 text-gray-300'}
              ${isMigrated ? 'opacity-60' : ''}
            `}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
                className="p-0.5 hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}

            <div
              className="flex-1 flex items-center justify-between"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-gray-500" />
                <span>{decodeHtmlEntities(category.name)}</span>
                {isMigrated && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
              <span className={`
                px-2 py-0.5 rounded text-xs font-medium
                ${category.productCount > 0 ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'}
              `}>
                {category.productCount}
              </span>
            </div>
          </div>

          {hasChildren && isExpanded && renderCategoryTree(category.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
          <Package className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Phase 2: Core Data</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Migrate your product catalog and customer accounts to BigCommerce.
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Products
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadCategories}
                disabled={loadingCategories}
              >
                <RefreshCw className={`w-4 h-4 ${loadingCategories ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats if we have migrated products */}
            {migratedProductIds.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>{migratedProductIds.length} products migrated</span>
                </div>
              </div>
            )}

            {/* Category tree */}
            <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
              {loadingCategories ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No categories found
                </div>
              ) : (
                <div className="p-2">
                  {renderCategoryTree(categories)}
                </div>
              )}
            </div>

            {/* Selected category info & migrate button */}
            {selectedCategory && (
              <div className="p-3 bg-gray-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{decodeHtmlEntities(selectedCategory.name)}</span>
                  <span className="text-sm text-gray-400">{selectedCategory.productCount} products</span>
                </div>

                {/* Progress bar */}
                {productProgress && productProgress.categoryId === selectedCategory.id && (
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{
                          width: `${productProgress.totalProducts > 0
                            ? (productProgress.completedProducts / productProgress.totalProducts) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{productProgress.completedProducts} / {productProgress.totalProducts}</span>
                      {productProgress.currentProduct && (
                        <span className="truncate max-w-[200px]">
                          Current: {productProgress.currentProduct.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleProductMigration}
                  disabled={productsMigrating || selectedCategory.productCount === 0}
                  className="w-full"
                >
                  {productsMigrating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Migrate {selectedCategory.productCount} Products
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Completed state */}
            {customersComplete && customerStats && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-green-400">Customers Migrated</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Successful</div>
                    <div className="text-xl font-bold text-green-400">{customerStats.migrated}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Skipped</div>
                    <div className="text-xl font-bold text-amber-400">{customerStats.skipped}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Failed</div>
                    <div className="text-xl font-bold text-red-400">{customerStats.failed}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress state */}
            {customerProgress && customerProgress.status === 'migrating' && (
              <div className="space-y-3">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${customerProgress.totalCustomers > 0
                        ? (customerProgress.completedCustomers / customerProgress.totalCustomers) * 100
                        : 0}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{customerProgress.completedCustomers} / {customerProgress.totalCustomers}</span>
                  {customerProgress.currentCustomer && (
                    <span className="truncate max-w-[200px]">
                      Current: {customerProgress.currentCustomer.email}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error state */}
            {customerProgress?.status === 'failed' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {customerProgress.error || 'Migration failed'}
              </div>
            )}

            {/* Info message */}
            {!customersComplete && !customersMigrating && (
              <p className="text-sm text-gray-400">
                Customer accounts will be migrated. Passwords cannot be transferred, so customers will need to reset their passwords.
              </p>
            )}

            {/* Action button */}
            <Button
              onClick={handleCustomerMigration}
              disabled={customersMigrating}
              className="w-full"
              variant={customersComplete ? 'secondary' : 'primary'}
            >
              {customersMigrating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Migrating customers...
                </>
              ) : customersComplete ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Again
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Migrate Customers
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help text */}
      <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
        Migrate all products category by category, then migrate customers.
        Both must be completed to proceed to the next phase.
      </p>
    </div>
  );
}
