'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Store,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Rocket,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { saveMigrationMode, loadMigrationMode } from '@/lib/storage';
import type { MigrationMode } from '@/lib/types';

const FRESH_START_BENEFITS = [
  {
    icon: Store,
    title: 'Keep Your WordPress',
    description: 'Your WordPress site stays exactly as is - blog, content, SEO, everything.',
  },
  {
    icon: Sparkles,
    title: 'Add BigCommerce',
    description: 'Get enterprise-grade e-commerce without replacing your existing setup.',
  },
  {
    icon: Rocket,
    title: 'No Data Migration',
    description: 'Start fresh with BigCommerce - no complex data transformation needed.',
  },
];

const SETUP_STEPS = [
  {
    step: 1,
    title: 'Create BigCommerce Account',
    description: 'Sign up for a free BigCommerce trial to get started.',
    action: 'Start Free Trial',
    actionUrl: 'https://www.bigcommerce.com/essentials/free-trial/',
    internal: false,
  },
  {
    step: 2,
    title: 'Configure API Access',
    description: 'Create API credentials in your BigCommerce admin panel.',
    action: 'Setup Guide',
    actionUrl: '/setup',
    internal: true,
  },
  {
    step: 3,
    title: 'Install BC Bridge Plugin',
    description: 'Connect BigCommerce to WordPress with our BC Bridge plugin.',
    action: 'View Guide',
    actionUrl: '/paths/bc-bridge',
    internal: true,
  },
  {
    step: 4,
    title: 'Add Products',
    description: 'Create your product catalog directly in BigCommerce.',
    action: 'BC Admin',
    actionUrl: null, // Will be dynamic based on store
    internal: false,
  },
];

export default function FreshStartPage() {
  const [currentMode, setCurrentMode] = useState<MigrationMode>('assessment');

  useEffect(() => {
    const mode = loadMigrationMode();
    if (mode) {
      setCurrentMode(mode);
    }
  }, []);

  const handleSelectFreshStart = () => {
    saveMigrationMode('fresh-start');
    setCurrentMode('fresh-start');
  };

  const handleSelectAssessment = () => {
    saveMigrationMode('assessment');
    setCurrentMode('assessment');
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Fresh Start Mode</h1>
              <p className="text-sm text-slate-400">
                Add BigCommerce to WordPress without migrating from WooCommerce
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Mode Selector */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleSelectFreshStart}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              currentMode === 'fresh-start'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className={`w-6 h-6 ${currentMode === 'fresh-start' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <h3 className="text-lg font-semibold text-white">Fresh Start</h3>
              {currentMode === 'fresh-start' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
              )}
            </div>
            <p className="text-sm text-slate-400">
              I&apos;m adding BigCommerce to WordPress for the first time (no WooCommerce data to migrate)
            </p>
          </button>

          <button
            onClick={handleSelectAssessment}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              currentMode === 'assessment'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Store className={`w-6 h-6 ${currentMode === 'assessment' ? 'text-blue-400' : 'text-slate-400'}`} />
              <h3 className="text-lg font-semibold text-white">WC Migration</h3>
              {currentMode === 'assessment' && (
                <CheckCircle2 className="w-5 h-5 text-blue-400 ml-auto" />
              )}
            </div>
            <p className="text-sm text-slate-400">
              I have WooCommerce data (products, customers, orders) that needs to be migrated
            </p>
          </button>
        </div>

        {/* Fresh Start Content */}
        {currentMode === 'fresh-start' && (
          <>
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Fresh Start?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {FRESH_START_BENEFITS.map((benefit) => (
                    <div key={benefit.title} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="font-medium text-white mb-1">{benefit.title}</h4>
                      <p className="text-sm text-slate-400">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Setup Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {SETUP_STEPS.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="w-10 h-10 flex-shrink-0 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{step.title}</h4>
                      <p className="text-sm text-slate-400">{step.description}</p>
                    </div>
                    {step.actionUrl && (
                      step.internal ? (
                        <Link href={step.actionUrl}>
                          <Button variant="secondary" size="sm">
                            {step.action}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(step.actionUrl!, '_blank')}
                        >
                          {step.action}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* BC Bridge Info */}
            <Alert variant="info">
              <Info className="w-4 h-4" />
              <div>
                <strong>About BC Bridge</strong>
                <p className="text-sm mt-1">
                  BC Bridge is our WordPress plugin that connects directly to the BigCommerce API.
                  Products are fetched in real-time (no sync issues), and checkout happens on
                  BigCommerce&apos;s secure hosted checkout. Works with any catalog size.
                </p>
              </div>
            </Alert>

            {/* Path Options */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Choose Your Integration Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">
                  Depending on your store size and technical requirements, different integration approaches
                  may be more suitable:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">BC Bridge Plugin</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Our custom plugin with real-time API access.
                      No sync issues, works at any scale.
                    </p>
                    <Link href="/paths/bc-bridge">
                      <Button variant="secondary" size="sm">
                        Learn More <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Makeswift</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Visual builder with BC integration. Great for modern
                      storefronts that scale.
                    </p>
                    <Link href="/paths/makeswift">
                      <Button variant="secondary" size="sm">
                        Learn More <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <Link href="/paths">
                    <Button variant="primary">
                      View All Integration Paths
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Assessment Mode Content */}
        {currentMode === 'assessment' && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-white mb-2">
                WooCommerce Migration Selected
              </h3>
              <p className="text-slate-400 mb-6">
                Return to the dashboard to assess your WooCommerce store and begin the migration process.
              </p>
              <Link href="/">
                <Button variant="primary">
                  Go to Assessment Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <Link
                href="/paths/bc-bridge"
                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <h4 className="font-medium text-white mb-1 flex items-center gap-1">
                  BC Bridge Guide <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-slate-400">Complete installation and setup guide</p>
              </Link>
              <a
                href="https://www.bigcommerce.com/articles/ecommerce/wordpress-ecommerce/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <h4 className="font-medium text-white mb-1 flex items-center gap-1">
                  WP + BC Guide <ExternalLink className="w-3 h-3" />
                </h4>
                <p className="text-slate-400">BigCommerce&apos;s guide to WordPress e-commerce</p>
              </a>
              <a
                href="https://support.bigcommerce.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <h4 className="font-medium text-white mb-1 flex items-center gap-1">
                  BC Support Center <ExternalLink className="w-3 h-3" />
                </h4>
                <p className="text-slate-400">BigCommerce support and documentation</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
