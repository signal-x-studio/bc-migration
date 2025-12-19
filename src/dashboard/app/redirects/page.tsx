'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Link2,
  Download,
  Copy,
  Check,
  Loader2,
  FileCode,
  Server,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { loadBCCredentials } from '@/lib/storage';
import type { BCCredentials } from '@/lib/types';

type RedirectFormat = 'plugin' | 'htaccess' | 'nginx' | 'json';

interface RedirectStats {
  totalRedirects: number;
  byType: {
    product: number;
    category: number;
  };
}

export default function RedirectsPage() {
  const { credentials: wcCredentials, storeInfo } = useConnection();
  const [bcCredentials, setBcCredentials] = useState<BCCredentials | null>(null);
  const [bcDomain, setBcDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<RedirectStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Load BC credentials on mount
  useEffect(() => {
    const saved = loadBCCredentials();
    if (saved) {
      setBcCredentials(saved);
      // Set default BC domain
      setBcDomain(`https://store-${saved.storeHash}.mybigcommerce.com`);
    }
  }, []);

  const fetchStats = async () => {
    if (!wcCredentials || !bcDomain) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/redirects/wp-plugin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wcCredentials,
          bcDomain: bcDomain.replace(/\/$/, ''),
          format: 'json',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch redirect stats');
      }

      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadRedirects = async (format: RedirectFormat) => {
    if (!wcCredentials || !bcDomain) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/redirects/wp-plugin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wcCredentials,
          bcDomain: bcDomain.replace(/\/$/, ''),
          format,
        }),
      });

      if (format === 'json') {
        const result = await response.json();
        setStats(result.data);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFilename(format);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilename = (format: RedirectFormat): string => {
    switch (format) {
      case 'plugin': return 'wc-bc-redirects.php';
      case 'htaccess': return '.htaccess-redirects';
      case 'nginx': return 'nginx-redirects.conf';
      default: return 'redirects.txt';
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isReady = wcCredentials && bcDomain;

  const FormatCard = ({
    format,
    icon: Icon,
    title,
    description,
  }: {
    format: RedirectFormat;
    icon: typeof FileCode;
    title: string;
    description: string;
  }) => (
    <Card className="hover:border-slate-600 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400 mb-4">{description}</p>
            <Button
              variant="secondary"
              onClick={() => downloadRedirects(format)}
              disabled={isLoading || !isReady}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download {format === 'plugin' ? 'Plugin' : 'File'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Link2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">301 Redirects</h1>
              <p className="text-sm text-slate-400">
                Generate redirect rules for your WooCommerce URLs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Connection Warning */}
        {!wcCredentials && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4" />
            <div>
              <strong>WooCommerce Connection Required</strong>
              <p className="text-sm mt-1">
                <Link href="/" className="text-blue-400 hover:underline">
                  Connect your WooCommerce store first
                </Link>
              </p>
            </div>
          </Alert>
        )}

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Redirect Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Source Store (WooCommerce)
              </label>
              <Input
                type="text"
                value={wcCredentials?.url || 'Not connected'}
                disabled
                className="bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Destination Domain (BigCommerce)
              </label>
              <Input
                type="text"
                placeholder="https://your-store.mybigcommerce.com"
                value={bcDomain}
                onChange={(e) => setBcDomain(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter your BigCommerce store URL (or custom domain if configured)
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={fetchStats}
                disabled={isLoading || !isReady}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Preview Redirects
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.totalRedirects}
                  </div>
                  <div className="text-sm text-slate-400">Total Redirects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">
                    {stats.byType.product}
                  </div>
                  <div className="text-sm text-slate-400">Product URLs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {stats.byType.category}
                  </div>
                  <div className="text-sm text-slate-400">Category URLs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert variant="error">
            <AlertTriangle className="w-4 h-4" />
            <div>{error}</div>
          </Alert>
        )}

        {/* Download Options */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormatCard
            format="plugin"
            icon={FileCode}
            title="WordPress Plugin"
            description="Upload to wp-content/plugins/ and activate. Includes admin panel to view redirects."
          />
          <FormatCard
            format="htaccess"
            icon={Server}
            title=".htaccess Rules"
            description="For Apache servers. Add to your .htaccess file before other rules."
          />
          <FormatCard
            format="nginx"
            icon={Globe}
            title="Nginx Config"
            description="Add to your nginx server block configuration."
          />
        </div>

        {/* Quick Copy Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Product URL Pattern
                </label>
                <button
                  onClick={() => copyToClipboard('/product/{slug}/ → /slug/', 'product')}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === 'product' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <code className="block p-3 bg-slate-800 rounded text-sm text-slate-300">
                /product/&#123;slug&#125;/ → {bcDomain || 'https://your-bc-store.com'}/&#123;slug&#125;/
              </code>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Category URL Pattern
                </label>
                <button
                  onClick={() => copyToClipboard('/product-category/{slug}/ → /slug/', 'category')}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === 'category' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <code className="block p-3 bg-slate-800 rounded text-sm text-slate-300">
                /product-category/&#123;slug&#125;/ → {bcDomain || 'https://your-bc-store.com'}/&#123;slug&#125;/
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-400">
            <div>
              <h4 className="font-medium text-white mb-2">WordPress Plugin (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download the plugin file (.php)</li>
                <li>Upload to <code className="bg-slate-700 px-1 rounded">/wp-content/plugins/</code></li>
                <li>Activate in WordPress admin → Plugins</li>
                <li>View redirects at Tools → WC-BC Redirects</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">.htaccess (Apache)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download the .htaccess file</li>
                <li>Add contents to your existing .htaccess file</li>
                <li>Place rules before WordPress rewrite rules</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Nginx</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download the nginx config file</li>
                <li>Add to your server block configuration</li>
                <li>Reload nginx: <code className="bg-slate-700 px-1 rounded">nginx -s reload</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
