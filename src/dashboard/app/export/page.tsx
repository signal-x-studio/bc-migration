'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Download, FileText, Users, FolderTree, ExternalLink,
  FileJson, Sparkles, CheckCircle, Loader2, AlertTriangle, Package,
  RefreshCw, Copy, Check
} from 'lucide-react';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

type ExportType = 'products' | 'customers' | 'redirects' | 'migration-spec';
type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

interface ExportState {
  status: ExportStatus;
  data?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

export default function ExportPage() {
  const { isConnected, credentials, storeInfo } = useConnection();
  const { products, categories, customers, seo } = useAssessment();

  const [exports, setExports] = useState<Record<ExportType, ExportState>>({
    products: { status: 'idle' },
    customers: { status: 'idle' },
    redirects: { status: 'idle' },
    'migration-spec': { status: 'idle' },
  });

  const [copied, setCopied] = useState<string | null>(null);

  const runExport = async (type: ExportType) => {
    if (!credentials) return;

    setExports(prev => ({
      ...prev,
      [type]: { status: 'loading' },
    }));

    try {
      const endpoint = type === 'migration-spec'
        ? '/api/export/migration-spec'
        : `/api/export/${type}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: credentials.url,
          consumerKey: credentials.consumerKey,
          consumerSecret: credentials.consumerSecret,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExports(prev => ({
          ...prev,
          [type]: {
            status: 'success',
            data: type === 'migration-spec'
              ? JSON.stringify(result.data, null, 2)
              : result.data.csv || JSON.stringify(result.data, null, 2),
            meta: result.data,
          },
        }));
      } else {
        setExports(prev => ({
          ...prev,
          [type]: { status: 'error', error: result.error },
        }));
      }
    } catch (error) {
      setExports(prev => ({
        ...prev,
        [type]: { status: 'error', error: 'Export failed' },
      }));
    }
  };

  const downloadExport = (type: ExportType, format: string) => {
    const exportData = exports[type];
    if (!exportData.data) return;

    let content = exportData.data;
    let filename = `${type}-export-${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'text/plain';

    if (type === 'redirects' && exportData.meta?.formats) {
      const formats = exportData.meta.formats as Record<string, string>;
      if (format === 'htaccess') {
        content = formats.htaccess;
        filename += '.htaccess';
      } else if (format === 'nginx') {
        content = formats.nginx;
        filename += '-nginx.conf';
      } else {
        content = formats.csv;
        filename += '.csv';
        mimeType = 'text/csv';
      }
    } else if (type === 'migration-spec') {
      filename += '.json';
      mimeType = 'application/json';
    } else {
      filename += '.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (type: ExportType) => {
    const exportData = exports[type];
    if (!exportData.data) return;

    navigator.clipboard.writeText(exportData.data);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="warning">
            Please connect to a WooCommerce store first to export data.
          </Alert>
          <Link href="/" className="text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasAssessment = products || categories || customers;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Download className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Export for Migration</h1>
              <p className="text-sm text-slate-400">
                Generate BigCommerce-ready files for import
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Value Prop Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                Migration-Ready Export Files
              </h2>
              <p className="text-slate-400 mb-4">
                Download CSV files formatted for BigCommerce import, or use the Migration Spec
                with third-party tools like LitExtension or Cart2Cart.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  BC-formatted CSVs
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  301 redirect rules
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Migration spec JSON
                </div>
              </div>
            </div>
          </div>
        </div>

        {!hasAssessment && (
          <Alert variant="info" className="mb-8">
            <strong>Tip:</strong> Run assessments first to identify any blockers before exporting.
            <Link href="/" className="text-blue-400 hover:underline ml-2">
              Go to Assessment →
            </Link>
          </Alert>
        )}

        {/* Export Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Products Export */}
          <ExportCard
            title="Products CSV"
            description="All products in BigCommerce import format. Includes variants, images, categories, and pricing."
            icon={Package}
            status={exports.products.status}
            meta={exports.products.meta}
            error={exports.products.error}
            stats={products ? {
              'Products': products.metrics.total,
              'Variants': products.metrics.totalVariants,
              'With Images': products.metrics.total - (products.issues.info.find(i => i.id === 'no-images')?.affectedItems || 0),
            } : undefined}
            onGenerate={() => runExport('products')}
            onDownload={() => downloadExport('products', 'csv')}
            onCopy={() => copyToClipboard('products')}
            copied={copied === 'products'}
          />

          {/* Customers Export */}
          <ExportCard
            title="Customers CSV"
            description="Customer accounts with addresses. Note: Passwords cannot be migrated - customers will need to reset."
            icon={Users}
            status={exports.customers.status}
            meta={exports.customers.meta}
            error={exports.customers.error}
            stats={customers ? {
              'Customers': customers.metrics.total,
              'With Addresses': customers.metrics.withAddresses,
            } : undefined}
            onGenerate={() => runExport('customers')}
            onDownload={() => downloadExport('customers', 'csv')}
            onCopy={() => copyToClipboard('customers')}
            copied={copied === 'customers'}
          />

          {/* Redirects Export */}
          <ExportCard
            title="301 Redirects"
            description="SEO-preserving redirect rules for all products and categories. Available in .htaccess, nginx, and CSV formats."
            icon={ExternalLink}
            status={exports.redirects.status}
            meta={exports.redirects.meta}
            error={exports.redirects.error}
            stats={seo ? {
              'Product URLs': products?.metrics.total || 0,
              'Category URLs': categories?.metrics.total || 0,
              'System URLs': 4,
            } : undefined}
            onGenerate={() => runExport('redirects')}
            onDownload={(format) => downloadExport('redirects', format || 'csv')}
            onCopy={() => copyToClipboard('redirects')}
            copied={copied === 'redirects'}
            downloadFormats={['csv', 'htaccess', 'nginx']}
          />

          {/* Migration Spec */}
          <ExportCard
            title="Migration Spec"
            description="Complete JSON specification with inventory counts, recommendations, and step-by-step migration guide."
            icon={FileJson}
            status={exports['migration-spec'].status}
            meta={exports['migration-spec'].meta}
            error={exports['migration-spec'].error}
            stats={storeInfo ? {
              'Products': storeInfo.productCount || 0,
              'Customers': storeInfo.customerCount || 0,
              'Orders': storeInfo.orderCount || 0,
            } : undefined}
            onGenerate={() => runExport('migration-spec')}
            onDownload={() => downloadExport('migration-spec', 'json')}
            onCopy={() => copyToClipboard('migration-spec')}
            copied={copied === 'migration-spec'}
          />
        </div>

        {/* Third-Party Tools Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            Recommended Migration Tools
          </h2>
          <p className="text-slate-400 mb-6">
            For larger stores or hands-off migration, use these third-party services with your exported data:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <ToolCard
              name="BigCommerce CSV Import"
              description="Native import tool in BC admin. Best for small catalogs (< 500 products)."
              priceRange="Free"
              limitations={['~500 products max per batch', 'Cannot create categories', 'No order import']}
              url="https://support.bigcommerce.com/s/article/Import-Export-Overview"
            />
            <ToolCard
              name="LitExtension"
              description="Automated migration with support. Handles products, customers, orders, and more."
              priceRange="$99-$299"
              features={['Automated migration', '24/7 support', 'Order history included']}
              url="https://litextension.com/bigcommerce-migration/woocommerce-to-bigcommerce-migration.html"
              recommended
            />
            <ToolCard
              name="Cart2Cart"
              description="Quick automated migration with free demo. Good for testing before committing."
              priceRange="$69+"
              features={['Free demo (10 items)', 'Fast migration', 'Multiple data types']}
              url="https://www.shopping-cart-migration.com/shopping-cart-migration-options/6710-woocommerce-to-bigcommerce-migration"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ExportCard({
  title,
  description,
  icon: Icon,
  status,
  meta,
  error,
  stats,
  onGenerate,
  onDownload,
  onCopy,
  copied,
  downloadFormats,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ExportStatus;
  meta?: Record<string, unknown>;
  error?: string;
  stats?: Record<string, number>;
  onGenerate: () => void;
  onDownload: (format?: string) => void;
  onCopy: () => void;
  copied: boolean;
  downloadFormats?: string[];
}) {
  return (
    <Card className="bg-slate-900/80 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-400 mb-4">{description}</p>

        {stats && (
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-slate-300">
                <span className="text-slate-500">{key}:</span>{' '}
                <span className="font-medium">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {status === 'success' && meta && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Export ready!
              {meta.rowCount !== undefined && (
                <span className="text-slate-400">
                  ({(meta.rowCount as number).toLocaleString()} rows)
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {status !== 'success' ? (
            <Button
              onClick={onGenerate}
              disabled={status === 'loading'}
              isLoading={status === 'loading'}
            >
              {status === 'loading' ? 'Generating...' : 'Generate Export'}
            </Button>
          ) : (
            <>
              {downloadFormats ? (
                downloadFormats.map(format => (
                  <Button
                    key={format}
                    variant="primary"
                    size="sm"
                    onClick={() => onDownload(format)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {format.toUpperCase()}
                  </Button>
                ))
              ) : (
                <Button variant="primary" onClick={() => onDownload()}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onGenerate}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ToolCard({
  name,
  description,
  priceRange,
  features,
  limitations,
  url,
  recommended,
}: {
  name: string;
  description: string;
  priceRange: string;
  features?: string[];
  limitations?: string[];
  url: string;
  recommended?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      recommended
        ? 'bg-blue-500/10 border-blue-500/30'
        : 'bg-slate-900/50 border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-slate-200">{name}</h3>
        {recommended && (
          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
            Recommended
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-3">{description}</p>
      <p className="text-sm text-slate-300 mb-3">
        <span className="text-slate-500">Price:</span> {priceRange}
      </p>

      {features && (
        <ul className="text-xs text-slate-400 mb-3 space-y-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {limitations && (
        <ul className="text-xs text-slate-500 mb-3 space-y-1">
          {limitations.map((l, i) => (
            <li key={i} className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              {l}
            </li>
          ))}
        </ul>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1"
      >
        Learn more
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
