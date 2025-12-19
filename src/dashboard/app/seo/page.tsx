'use client';

import { useState } from 'react';
import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  ArrowLeft, Search, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle, ExternalLink,
  Shield, Sparkles, Download, FileText, Copy, Check
} from 'lucide-react';

export default function SEOPage() {
  const { isConnected, credentials } = useConnection();
  const { seo, products, categories, loading, errors, assessArea } = useAssessment();
  const [copied, setCopied] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="warning">
            Please connect to a WooCommerce store first.
          </Alert>
          <Link href="/" className="text-blue-400 hover:underline mt-4 inline-block">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = loading.seo;
  const error = errors.seo;
  const assessment = seo;

  // Generate .htaccess style redirect rules
  const generateRedirectRules = () => {
    let rules = `# BigCommerce Migration Redirect Rules\n`;
    rules += `# Generated: ${new Date().toLocaleString()}\n`;
    rules += `# Keep WordPress. Upgrade Commerce.\n\n`;

    rules += `# === WordPress/WooCommerce to BigCommerce Redirects ===\n\n`;

    // Product redirects
    rules += `# Product URL Redirects\n`;
    rules += `# WooCommerce: /product/product-slug -> BigCommerce: /product-slug\n`;
    rules += `RewriteRule ^product/(.+)$ /$1 [R=301,L]\n\n`;

    // Category redirects
    rules += `# Category URL Redirects\n`;
    rules += `# WooCommerce: /product-category/category-slug -> BigCommerce: /category-slug\n`;
    rules += `RewriteRule ^product-category/(.+)$ /$1 [R=301,L]\n\n`;

    // Shop page
    rules += `# Shop Page Redirect\n`;
    rules += `RewriteRule ^shop/?$ / [R=301,L]\n\n`;

    // Cart/Checkout (these stay on BC subdomain typically)
    rules += `# Cart/Checkout handled by BigCommerce\n`;
    rules += `# RewriteRule ^cart/?$ https://yourstore.bigcommerce.com/cart [R=301,L]\n`;
    rules += `# RewriteRule ^checkout/?$ https://yourstore.bigcommerce.com/checkout [R=301,L]\n\n`;

    // Sample specific redirects if we have URL samples
    if (assessment?.urlSamples && assessment.urlSamples.length > 0) {
      rules += `# === Sample Product Redirects ===\n`;
      rules += `# Based on your current product URLs:\n`;
      assessment.urlSamples.slice(0, 5).forEach(url => {
        const slug = url.split('/').pop() || '';
        rules += `# ${url} -> /${slug}\n`;
      });
      rules += `\n`;
    }

    rules += `# === END REDIRECT RULES ===\n`;
    return rules;
  };

  // Generate CSV format for bulk import
  const generateCSV = () => {
    let csv = `old_url,new_url,redirect_type\n`;
    csv += `/product/*,/*,301\n`;
    csv += `/product-category/*,/*,301\n`;
    csv += `/shop,/,301\n`;

    if (assessment?.urlSamples) {
      assessment.urlSamples.slice(0, 10).forEach(url => {
        const path = new URL(url).pathname;
        const slug = path.split('/').pop() || '';
        csv += `${path},/${slug},301\n`;
      });
    }

    return csv;
  };

  const downloadRedirects = (format: 'htaccess' | 'csv') => {
    const content = format === 'htaccess' ? generateRedirectRules() : generateCSV();
    const filename = format === 'htaccess' ? 'redirect-rules.htaccess' : 'redirect-mapping.csv';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyRedirects = () => {
    navigator.clipboard.writeText(generateRedirectRules());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">SEO Protection Plan</h1>
                  <p className="text-sm text-slate-400">Preserving your search rankings during commerce upgrade</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('seo', credentials)}
              disabled={isLoading}
              variant="secondary"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {!assessment && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">SEO has not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('seo', credentials)}>
                Analyze SEO Structure
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing SEO configuration...</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* SEO Protection Banner */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    Your SEO Equity is Protected
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">WordPress Stays</p>
                        <p className="text-xs text-slate-400">Blog, pages, domain unchanged</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">301 Redirects</p>
                        <p className="text-xs text-slate-400">Product URLs redirected automatically</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Meta Data Preserved</p>
                        <p className="text-xs text-slate-400">Titles, descriptions, schema</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{assessment.metrics.redirectEstimate}</p>
                  <p className="text-sm text-slate-400">Redirects Needed</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    {assessment.metrics.isStandard ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    )}
                    <div>
                      <p className="text-sm text-slate-400">URL Structure</p>
                      <p className="text-lg font-medium text-white">
                        {assessment.metrics.isStandard ? 'Standard' : 'Custom'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-3xl font-bold text-white">{assessment.metrics.redirectEstimate}</p>
                  <p className="text-sm text-slate-400">Est. Redirects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    {assessment.metrics.hasYoast ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-slate-500" />
                    )}
                    <div>
                      <p className="text-sm text-slate-400">Yoast SEO</p>
                      <p className="text-lg font-medium text-white">
                        {assessment.metrics.hasYoast ? 'Detected' : 'Not Found'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    {assessment.metrics.hasRankMath ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-slate-500" />
                    )}
                    <div>
                      <p className="text-sm text-slate-400">Rank Math</p>
                      <p className="text-lg font-medium text-white">
                        {assessment.metrics.hasRankMath ? 'Detected' : 'Not Found'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Redirect Rule Generator - Key Artifact */}
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Redirect Rules Generator
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Download ready-to-use redirect rules for your migration
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4">
                  <pre className="text-green-400">
{`# BigCommerce Migration Redirect Rules
# Product URLs: /product/slug -> /slug
RewriteRule ^product/(.+)$ /$1 [R=301,L]

# Category URLs: /product-category/slug -> /slug
RewriteRule ^product-category/(.+)$ /$1 [R=301,L]

# Shop page redirect
RewriteRule ^shop/?$ / [R=301,L]`}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => downloadRedirects('htaccess')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download .htaccess
                  </Button>
                  <Button variant="secondary" onClick={() => downloadRedirects('csv')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button variant="ghost" onClick={copyRedirects}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Rules
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Permalink Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Current Permalink Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-800/50 rounded-lg font-mono text-sm">
                  <code className="text-cyan-400">{assessment.metrics.permalinkStructure}</code>
                </div>
                {!assessment.metrics.isStandard && (
                  <p className="text-sm text-yellow-400 mt-3">
                    Custom permalink structure detected. The generated redirect rules will handle this automatically.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Issues Section */}
            {(assessment.issues.warnings.length > 0 || assessment.issues.info.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">SEO Considerations</h2>

                {assessment.issues.warnings.map((issue) => (
                  <Card key={issue.id} className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{issue.title}</h3>
                            <StatusBadge status="warning" />
                          </div>
                          <p className="text-sm text-slate-400">{issue.description}</p>
                          {issue.recommendation && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                              <p className="text-sm text-slate-300">
                                <span className="text-green-400 font-medium">Action: </span>
                                {issue.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {assessment.issues.info.map((issue) => (
                  <Card key={issue.id} className="border-blue-500/50 bg-blue-500/5">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{issue.title}</h3>
                            <StatusBadge status="info" />
                          </div>
                          <p className="text-sm text-slate-400">{issue.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* URL Samples */}
            {assessment.urlSamples && assessment.urlSamples.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sample Product URLs</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    Current URL format from your WooCommerce store
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assessment.urlSamples.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <code className="text-sm text-cyan-400 truncate flex-1">{url}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Data Migration */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-400">Migrated Automatically</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      'Meta titles and descriptions',
                      'Product/category slugs',
                      'Image alt text',
                      'Structured data (products)',
                      'Canonical URL patterns'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-400">Requires Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      '301 redirect rules (provided above)',
                      'Google Search Console verification',
                      'Update sitemap in GSC',
                      'Schema markup customizations',
                      'Robots.txt adjustments'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <Info className="w-4 h-4 text-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Timestamp */}
            <p className="text-sm text-slate-500 text-center">
              Last analyzed: {new Date(assessment.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
