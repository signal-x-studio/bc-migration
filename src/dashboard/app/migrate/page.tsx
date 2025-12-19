'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Server, CheckCircle, AlertTriangle, Loader2,
  Zap, BookOpen, ExternalLink
} from 'lucide-react';
import { MigrationWizard } from './components/MigrationWizard';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import {
  saveBCCredentials,
  loadBCCredentials,
  clearBCCredentials,
} from '@/lib/storage';
import type { BCCredentials, BCStoreInfo } from '@/lib/types';

export default function MigratePage() {
  const { isConnected, credentials: wcCredentials, storeInfo: wcStoreInfo } = useConnection();

  // BC Connection State
  const [bcCredentials, setBcCredentials] = useState<BCCredentials | null>(null);
  const [bcStoreInfo, setBcStoreInfo] = useState<BCStoreInfo | null>(null);
  const [bcConnecting, setBcConnecting] = useState(false);
  const [bcError, setBcError] = useState<string | null>(null);

  // Form state
  const [storeHash, setStoreHash] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Load saved BC credentials on mount
  useEffect(() => {
    const saved = loadBCCredentials();
    if (saved) {
      setBcCredentials(saved);
      setStoreHash(saved.storeHash);
      setAccessToken(saved.accessToken);
      // Auto-reconnect
      testBCConnection(saved);
    }
  }, []);

  const testBCConnection = async (creds: BCCredentials) => {
    setBcConnecting(true);
    setBcError(null);

    try {
      const response = await fetch('/api/bc/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });

      const result = await response.json();

      if (result.success) {
        setBcCredentials(creds);
        setBcStoreInfo(result.storeInfo);
        saveBCCredentials(creds);
      } else {
        setBcError(result.error || 'Connection failed');
        setBcStoreInfo(null);
      }
    } catch (error) {
      setBcError('Failed to connect to BigCommerce');
      setBcStoreInfo(null);
    } finally {
      setBcConnecting(false);
    }
  };

  const handleBCConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeHash || !accessToken) return;
    await testBCConnection({ storeHash, accessToken });
  };

  const handleBCDisconnect = () => {
    clearBCCredentials();
    setBcCredentials(null);
    setBcStoreInfo(null);
    setStoreHash('');
    setAccessToken('');
  };

  // Not connected to WooCommerce
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="warning">
            Please connect to a WooCommerce store first.
          </Alert>
          <Link href="/" className="text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Both stores connected - show wizard
  const bothConnected = isConnected && bcStoreInfo;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200"
            >
              <BookOpen className="w-4 h-4" />
              Migration Guide
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">WooCommerce Migration</h1>
              <p className="text-sm text-slate-400">
                Migrate your store data to BigCommerce
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Connection Status Cards - Always visible */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* WooCommerce Connection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  WooCommerce Source
                </div>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="text-slate-300 font-medium">{wcStoreInfo?.name || wcCredentials?.url}</div>
                <div className="text-slate-500">{wcCredentials?.url}</div>
                <div className="text-slate-500">
                  {wcStoreInfo?.productCount ?? '?'} products • {wcStoreInfo?.customerCount ?? '?'} customers
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BigCommerce Connection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  BigCommerce Target
                </div>
                {bcStoreInfo ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">Not connected</div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bcStoreInfo ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-slate-300 font-medium">{bcStoreInfo.name || bcCredentials?.storeHash}</div>
                    <div className="text-slate-500 text-sm">
                      {bcStoreInfo.domain || `${bcCredentials?.storeHash}.mybigcommerce.com`}
                    </div>
                    <div className="text-slate-500 text-sm">Plan: {bcStoreInfo.plan || 'Unknown'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBCDisconnect}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBCConnect} className="space-y-4">
                  {bcError && (
                    <Alert variant="error">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{bcError}</span>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <Input
                      placeholder="Store Hash (e.g., abc123)"
                      value={storeHash}
                      onChange={(e) => setStoreHash(e.target.value)}
                      disabled={bcConnecting}
                    />
                    <Input
                      type="password"
                      placeholder="API Access Token"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      disabled={bcConnecting}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={bcConnecting || !storeHash || !accessToken}>
                      {bcConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                    <a
                      href="https://support.bigcommerce.com/s/article/Store-API-Accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                    >
                      Get API credentials
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Migration Wizard - Only show when both connected */}
        {bothConnected && wcCredentials ? (
          <MigrationWizard
            wcCredentials={{
              url: wcCredentials.url,
              consumerKey: wcCredentials.consumerKey,
              consumerSecret: wcCredentials.consumerSecret,
            }}
            bcCredentials={{
              storeHash: bcCredentials!.storeHash,
              accessToken: bcCredentials!.accessToken,
            }}
          />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                <Server className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Connect Both Stores</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Connect to both your WooCommerce source store and BigCommerce target store to begin the migration wizard.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
