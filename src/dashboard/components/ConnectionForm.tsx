'use client';

import { useState, FormEvent } from 'react';
import { Store, Key, Lock, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Alert } from './ui/Alert';
import { useConnection } from '../lib/contexts/ConnectionContext';

export function ConnectionForm() {
  const { connect, isLoading, error, storeInfo, isConnected } = useConnection();

  const [url, setUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!url || !consumerKey || !consumerSecret) return;

    await connect(
      {
        url: url.trim(),
        consumerKey: consumerKey.trim(),
        consumerSecret: consumerSecret.trim(),
      },
      remember
    );
  };

  if (isConnected && storeInfo) {
    return (
      <Card variant="bordered" className="max-w-xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">Connected Successfully</h3>
            <p className="text-slate-400 mb-6">Your WooCommerce store is ready for assessment</p>

            <div className="bg-slate-900/50 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Store</span>
                <span className="text-slate-200 font-mono text-sm">{storeInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WooCommerce</span>
                <span className="text-slate-200">v{storeInfo.wcVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Products</span>
                <span className="text-slate-200">{storeInfo.productCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Orders</span>
                <span className="text-slate-200">{storeInfo.orderCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customers</span>
                <span className="text-slate-200">{storeInfo.customerCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-400" />
          Connect Your WooCommerce Store
        </CardTitle>
        <CardDescription>
          Enter your WooCommerce REST API credentials to begin the migration assessment.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error" title="Connection Failed">
              {error}
            </Alert>
          )}

          <Input
            label="Store URL"
            type="url"
            placeholder="https://your-store.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isLoading}
            hint="Your WooCommerce store URL (e.g., https://mystore.com)"
          />

          <Input
            label="Consumer Key"
            type="text"
            placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={consumerKey}
            onChange={(e) => setConsumerKey(e.target.value)}
            required
            disabled={isLoading}
            hint="Starts with ck_"
          />

          <Input
            label="Consumer Secret"
            type="password"
            placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={consumerSecret}
            onChange={(e) => setConsumerSecret(e.target.value)}
            required
            disabled={isLoading}
            hint="Starts with cs_"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <span className="text-sm text-slate-400">Remember credentials in this browser</span>
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            {isLoading ? 'Connecting...' : 'Connect Store'}
          </Button>

          <div className="text-center">
            <a
              href="https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              How to generate API credentials
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

// Quick setup guide component
export function APISetupGuide() {
  return (
    <Card variant="default" className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-base">Quick Setup Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 text-sm text-slate-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <span>Log into your WordPress admin dashboard</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <span>Navigate to <code className="px-1.5 py-0.5 bg-slate-800 rounded">WooCommerce → Settings → Advanced → REST API</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <span>Click <strong className="text-slate-300">Add Key</strong> and set permissions to <strong className="text-slate-300">Read</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">4</span>
            <span>Copy the generated <strong className="text-slate-300">Consumer Key</strong> and <strong className="text-slate-300">Consumer Secret</strong></span>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
