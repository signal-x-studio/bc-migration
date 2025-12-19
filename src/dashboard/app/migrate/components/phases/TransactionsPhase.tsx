'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Ticket, CheckCircle, AlertTriangle } from 'lucide-react';
import { MigrationStep } from '../MigrationStep';
import { TransactionsPhaseData } from '../../types';
import { Alert } from '@/components/ui/Alert';

interface TransactionsPhaseProps {
  wcCredentials: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bcCredentials: {
    storeHash: string;
    accessToken: string;
  };
  productIdMapping: Record<number, number>;
  customerIdMapping: Record<number, number>;
  phaseData?: TransactionsPhaseData;
  onComplete: (data: TransactionsPhaseData) => void;
  onSkip: () => void;
}

export function TransactionsPhase({
  wcCredentials,
  bcCredentials,
  productIdMapping,
  customerIdMapping,
  phaseData,
  onComplete,
  onSkip,
}: TransactionsPhaseProps) {
  const [ordersComplete, setOrdersComplete] = useState(!!phaseData?.orders);
  const [couponsComplete, setCouponsComplete] = useState(!!phaseData?.coupons);
  const [orderStats, setOrderStats] = useState(phaseData?.orders || null);
  const [couponStats, setCouponStats] = useState(phaseData?.coupons || null);

  // Check if products have been migrated (required for orders)
  const hasProductMapping = Object.keys(productIdMapping).length > 0;
  const hasCustomerMapping = Object.keys(customerIdMapping).length > 0;
  const canMigrateOrders = hasProductMapping && hasCustomerMapping;

  // Check if phase is complete
  useEffect(() => {
    if (ordersComplete && couponsComplete) {
      onComplete({
        orders: orderStats || undefined,
        coupons: couponStats || undefined,
      });
    }
  }, [ordersComplete, couponsComplete, orderStats, couponStats, onComplete]);

  const handleOrdersComplete = (stats: { total: number; successful: number; skipped: number; failed: number; warnings?: string[] }) => {
    setOrdersComplete(true);
    setOrderStats({
      total: stats.total,
      migrated: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
      warnings: stats.warnings || [],
    });
  };

  const handleCouponsComplete = (stats: { total: number; successful: number; skipped: number; failed: number }) => {
    setCouponsComplete(true);
    setCouponStats({
      total: stats.total,
      migrated: stats.successful,
      skipped: stats.skipped,
      failed: stats.failed,
    });
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
          <ShoppingCart className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Phase 3: Transactions</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Transfer your order history and discount codes to BigCommerce.
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
          <span>Optional phase</span>
          <button
            onClick={onSkip}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Dependency warning */}
      {!canMigrateOrders && (
        <Alert variant="warning" className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Migration dependencies</p>
              <p className="text-sm text-gray-400 mt-1">
                Orders require both products and customers to be migrated first.
                {!hasProductMapping && ' Products have not been migrated yet.'}
                {!hasCustomerMapping && ' Customers have not been migrated yet.'}
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Migration steps grid */}
      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Orders Migration */}
        <MigrationStep
          title="Migrate Orders"
          description="Transfer order history with customer and product mapping"
          icon={ShoppingCart}
          iconColorClass="text-orange-400"
          stepNumber={1}
          endpoint="/api/migrate/orders"
          entityName="orders"
          wcCredentials={wcCredentials}
          bcCredentials={bcCredentials}
          dependencies={{
            productIdMapping,
            customerIdMapping,
          }}
          disabled={!canMigrateOrders}
          disabledReason={
            !canMigrateOrders
              ? 'Requires products and customers to be migrated first'
              : undefined
          }
          onComplete={(stats) => handleOrdersComplete(stats)}
        />

        {/* Coupons Migration */}
        <MigrationStep
          title="Migrate Coupons"
          description="Transfer discount codes, rules, and restrictions"
          icon={Ticket}
          iconColorClass="text-pink-400"
          stepNumber={2}
          endpoint="/api/migrate/coupons"
          entityName="coupons"
          wcCredentials={wcCredentials}
          bcCredentials={bcCredentials}
          onComplete={(stats) => handleCouponsComplete(stats)}
        />
      </div>

      {/* Completion status */}
      {(ordersComplete || couponsComplete) && (
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Migration Progress
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={`p-3 rounded ${ordersComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">Orders</span>
                  {ordersComplete && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
                {orderStats && (
                  <div className="text-xs text-gray-400">
                    {orderStats.migrated} migrated, {orderStats.failed} failed
                  </div>
                )}
              </div>
              <div className={`p-3 rounded ${couponsComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Ticket className="w-4 h-4 text-pink-400" />
                  <span className="text-gray-300">Coupons</span>
                  {couponsComplete && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
                {couponStats && (
                  <div className="text-xs text-gray-400">
                    {couponStats.migrated} migrated, {couponStats.failed} failed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
        Both orders and coupons should be migrated to complete this phase.
        You can skip this phase if you don&apos;t need to transfer transaction data.
      </p>
    </div>
  );
}
