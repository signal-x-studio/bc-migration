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
  ArrowLeft, Users, RefreshCw, AlertTriangle, Info, MapPin, CheckCircle, Sparkles,
  Mail, Download, Copy, Check, CreditCard, UserCircle
} from 'lucide-react';

export default function CustomersPage() {
  const { isConnected, credentials, storeInfo } = useConnection();
  const { customers, loading, errors, assessArea } = useAssessment();
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

  const isLoading = loading.customers;
  const error = errors.customers;
  const assessment = customers;

  const topCountries = assessment?.metrics.countries
    ? Object.entries(assessment.metrics.countries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  // Password reset email template
  const generateEmailTemplate = () => {
    const storeName = storeInfo?.name || 'Our Store';
    return `Subject: Action Required: Reset Your Password for ${storeName}

Hi [Customer Name],

We're excited to announce that we've upgraded our e-commerce platform to provide you with a better shopping experience!

As part of this upgrade, you'll need to reset your password to continue accessing your account.

👉 Reset Your Password: [RESET_LINK]

What's New:
• Faster, more secure checkout
• Apple Pay and Google Pay support
• Improved order tracking
• Better mobile experience

Your order history, saved addresses, and wishlist items have all been preserved.

If you have any questions, please don't hesitate to contact us.

Thank you for being a valued customer!

Best regards,
The ${storeName} Team

---
This is an automated message. Please do not reply directly to this email.`;
  };

  const copyEmailTemplate = () => {
    navigator.clipboard.writeText(generateEmailTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEmailTemplate = () => {
    const blob = new Blob([generateEmailTemplate()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'password-reset-email-template.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Customer Account Transfer</h1>
                  <p className="text-sm text-slate-400">Moving to BigCommerce&apos;s customer management</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => credentials && assessArea('customers', credentials)}
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
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Customers have not been analyzed yet.</p>
              <Button onClick={() => credentials && assessArea('customers', credentials)}>
                Analyze Customer Data
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing customer data...</p>
            </CardContent>
          </Card>
        )}

        {assessment && !isLoading && (
          <div className="space-y-6">
            {/* BigCommerce Upgrade Banner */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    What You Get with BigCommerce Customers
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Customer Groups</p>
                        <p className="text-xs text-slate-400">Segment-specific pricing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Price Lists</p>
                        <p className="text-xs text-slate-400">B2B and wholesale pricing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Saved Payment Methods</p>
                        <p className="text-xs text-slate-400">Store cards securely</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-400">{assessment.metrics.total}</p>
                  <p className="text-sm text-slate-400">Customers Moving</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-slate-400">Total Customers</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCircle className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-slate-400">With Orders</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.withOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-slate-400">With Addresses</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessment.metrics.withAddresses}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-3xl font-bold text-white">
                    {Object.keys(assessment.metrics.countries).length}
                  </p>
                  <p className="text-sm text-slate-400">Countries</p>
                </CardContent>
              </Card>
            </div>

            {/* Password Reset Email Template - KEY ARTIFACT */}
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  Password Reset Email Template
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Send this to customers before or after migration
                </p>
              </CardHeader>
              <CardContent>
                <Alert variant="info" className="mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        Customer passwords cannot be migrated between platforms. All {assessment.metrics.total} customers
                        will need to reset their passwords after migration.
                      </p>
                    </div>
                  </div>
                </Alert>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4 max-h-48 overflow-y-auto">
                  <pre className="text-slate-300 whitespace-pre-wrap">{generateEmailTemplate()}</pre>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={downloadEmailTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Button variant="ghost" onClick={copyEmailTemplate}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Issues Section */}
            {(assessment.issues.warnings.length > 0 || assessment.issues.info.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Considerations</h2>

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
                          {issue.affectedItems && (
                            <p className="text-sm text-yellow-400 mt-1">{issue.affectedItems} customer(s) affected</p>
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

            {/* Data Quality */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Customers with addresses</span>
                        <span className="text-slate-300">
                          {assessment.metrics.total > 0
                            ? ((assessment.metrics.withAddresses / assessment.metrics.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${assessment.metrics.total > 0
                              ? (assessment.metrics.withAddresses / assessment.metrics.total) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Customers with orders</span>
                        <span className="text-slate-300">
                          {assessment.metrics.total > 0
                            ? ((assessment.metrics.withOrders / assessment.metrics.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${assessment.metrics.total > 0
                              ? (assessment.metrics.withOrders / assessment.metrics.total) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topCountries.length > 0 ? (
                    <div className="space-y-3">
                      {topCountries.map(([country, count]) => {
                        const percentage = (count / assessment.metrics.total) * 100;
                        return (
                          <div key={country}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-300">{country || 'Unknown'}</span>
                              <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No geographic data available.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* BC Customer Features */}
            <Card>
              <CardHeader>
                <CardTitle>BigCommerce Customer Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <p className="font-medium text-slate-200">Customer Groups</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Create groups for wholesale, VIP, or other customer segments with automatic pricing rules.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <p className="font-medium text-slate-200">Stored Payment Methods</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Customers can save cards for faster checkout. PCI-compliant tokenization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
