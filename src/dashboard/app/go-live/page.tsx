'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Rocket,
  CreditCard,
  Truck,
  Receipt,
  ShoppingCart,
  Link2,
  Mail,
  Shield,
  Globe,
  Power,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import {
  loadBCCredentials,
  loadGoLiveChecklistState,
  saveGoLiveChecklistState,
  initializeGoLiveChecklist,
  updateChecklistItem,
} from '@/lib/storage';
import type { GoLiveChecklistState, ChecklistItem, BCCredentials } from '@/lib/types';

const ITEM_ICONS: Record<string, typeof CreditCard> = {
  payment: CreditCard,
  shipping: Truck,
  tax: Receipt,
  'test-order': ShoppingCart,
  redirects: Link2,
  'password-reset': Mail,
  ssl: Shield,
  domain: Globe,
  'wc-deactivate': Power,
  'search-console': Search,
};

export default function GoLivePage() {
  const { credentials: wcCredentials } = useConnection();
  const [bcCredentials, setBcCredentials] = useState<BCCredentials | null>(null);
  const [checklist, setChecklist] = useState<GoLiveChecklistState | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedBC = loadBCCredentials();
    if (savedBC) {
      setBcCredentials(savedBC);
    }
  }, []);

  // Load or initialize checklist when both stores are connected
  useEffect(() => {
    if (wcCredentials?.url && bcCredentials?.storeHash) {
      let state = loadGoLiveChecklistState(wcCredentials.url, bcCredentials.storeHash);
      if (!state) {
        state = initializeGoLiveChecklist(wcCredentials.url, bcCredentials.storeHash);
        saveGoLiveChecklistState(state);
      }
      setChecklist(state);
    }
  }, [wcCredentials?.url, bcCredentials?.storeHash]);

  const handleToggle = (itemId: string, currentStatus: ChecklistItem['status']) => {
    if (!wcCredentials?.url || !bcCredentials?.storeHash) return;

    const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    updateChecklistItem(wcCredentials.url, bcCredentials.storeHash, itemId, newStatus);

    // Reload state
    const updated = loadGoLiveChecklistState(wcCredentials.url, bcCredentials.storeHash);
    setChecklist(updated);
  };

  const handleAutoVerify = async (itemId: string) => {
    if (!bcCredentials) return;

    setVerifying(itemId);

    try {
      const endpoint = `/api/verify/${itemId.replace('-', '/')}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bcCredentials }),
      });

      const result = await response.json();

      if (wcCredentials?.url && bcCredentials.storeHash) {
        const newStatus = result.verified ? 'verified' : 'failed';
        updateChecklistItem(
          wcCredentials.url,
          bcCredentials.storeHash,
          itemId,
          newStatus,
          result.notes
        );

        const updated = loadGoLiveChecklistState(wcCredentials.url, bcCredentials.storeHash);
        setChecklist(updated);
      }
    } catch (error) {
      console.error(`Failed to verify ${itemId}:`, error);
    } finally {
      setVerifying(null);
    }
  };

  const isReady = wcCredentials && bcCredentials;

  const requiredItems = checklist?.items.filter(i => i.category === 'required') || [];
  const recommendedItems = checklist?.items.filter(i => i.category === 'recommended') || [];

  const ChecklistItemRow = ({ item }: { item: ChecklistItem }) => {
    const Icon = ITEM_ICONS[item.id] || Circle;
    const isVerifying = verifying === item.id;

    return (
      <div
        className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
          item.status === 'verified'
            ? 'bg-green-500/10 border border-green-500/20'
            : item.status === 'failed'
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-slate-800/50 border border-slate-700/50'
        }`}
      >
        <button
          onClick={() => handleToggle(item.id, item.status)}
          className="flex-shrink-0 mt-0.5"
        >
          {item.status === 'verified' ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : item.status === 'failed' ? (
            <AlertTriangle className="w-6 h-6 text-red-400" />
          ) : (
            <Circle className="w-6 h-6 text-slate-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-slate-400" />
            <span
              className={`font-medium ${
                item.status === 'verified' ? 'text-green-400' : 'text-white'
              }`}
            >
              {item.title}
            </span>
          </div>
          <p className="text-sm text-slate-400">{item.description}</p>
          {item.notes && (
            <p className="text-sm text-yellow-400 mt-1">{item.notes}</p>
          )}
          {item.verifiedAt && (
            <p className="text-xs text-slate-500 mt-1">
              Verified {new Date(item.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {item.autoVerifiable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAutoVerify(item.id)}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
          {item.helpUrl && (
            <a
              href={item.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white p-2"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Rocket className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Go-Live Checklist</h1>
                <p className="text-sm text-slate-400">
                  Complete these items before launching your store
                </p>
              </div>
            </div>
            {checklist && (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {checklist.overallProgress}%
                </div>
                <div className="text-sm text-slate-400">Complete</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Connection Warning */}
        {!isReady && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4" />
            <div>
              <strong>Connections Required</strong>
              <p className="text-sm mt-1">
                {!wcCredentials && 'WooCommerce not connected. '}
                {!bcCredentials && 'BigCommerce not connected. '}
                <Link href="/migrate" className="text-blue-400 hover:underline">
                  Connect stores first
                </Link>
              </p>
            </div>
          </Alert>
        )}

        {/* Progress Bar */}
        {checklist && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Overall Progress</span>
                <span className="text-sm font-medium text-white">
                  {requiredItems.filter(i => i.status === 'verified').length} of{' '}
                  {requiredItems.length} required items
                </span>
              </div>
              <Progress value={checklist.overallProgress} />
              {checklist.readyForLaunch && (
                <Alert variant="success" className="mt-4">
                  <CheckCircle2 className="w-4 h-4" />
                  <div>
                    <strong>Ready to Launch!</strong> All required items are verified.
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Required Items */}
        {checklist && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Required Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requiredItems.map(item => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recommended Items */}
        {checklist && recommendedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                Recommended Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedItems.map(item => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        {isReady && (
          <Card variant="bordered">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/validate">
                  <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors text-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="font-medium text-white">Validate Migration</div>
                    <div className="text-xs text-slate-400">Compare counts</div>
                  </div>
                </Link>
                <Link href="/redirects">
                  <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors text-center">
                    <Link2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="font-medium text-white">Setup Redirects</div>
                    <div className="text-xs text-slate-400">Generate rules</div>
                  </div>
                </Link>
                <Link href="/customers/password-reset">
                  <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors text-center">
                    <Mail className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="font-medium text-white">Password Resets</div>
                    <div className="text-xs text-slate-400">Email customers</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
