'use client';

import Link from 'next/link';
import {
  BookOpen, Code, Users, TrendingUp, Zap, Globe, HelpCircle,
  ArrowRight, Terminal, Rocket
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DocsHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  BC Migration Documentation
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Everything you need to migrate from WooCommerce to BigCommerce
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Quick Start CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Ready to start migrating?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Get your first migration running in under 5 minutes with our quick start guide.
                </p>
                <Link
                  href="/docs/reference/quick-start"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Quick Start Guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Choose Your Path */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Choose Your Path
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Get started with the guide tailored to your role and needs
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/docs/getting-started/for-merchants"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  For Merchants
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Simple, step-by-step guide for store owners migrating their WooCommerce store
              </p>
            </Link>

            <Link
              href="/docs/getting-started/for-developers"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                  <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  For Developers
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Technical setup, API integration, and customization for developers
              </p>
            </Link>

            <Link
              href="/docs/getting-started/for-agencies"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  For Agencies
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Multi-client management and white-label deployment at scale
              </p>
            </Link>
          </div>
        </section>

        {/* Essential Guides */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Essential Guides
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Step-by-step guides for common migration scenarios and challenges
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/docs/reference/quick-start"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    5-Minute Quick Start
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get your first migration running fast with our streamlined setup guide
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </div>
            </Link>

            <Link
              href="/docs/guides/wordpress-wpengine"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    WordPress & WP Engine
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Keep WordPress for content while migrating commerce to BigCommerce
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </div>
            </Link>

            <Link
              href="/docs/troubleshooting/common-issues"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Common Issues & Solutions
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Troubleshooting guide for frequently encountered migration problems
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </div>
        </section>

        {/* Reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Reference
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Technical documentation and API references
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/docs/reference/cli/commands"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                  <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    CLI Commands
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Complete reference for bc-migrate command-line tool
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </div>
            </Link>

            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                  <Code className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Reference
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Coming soon: WooCommerce API, BigCommerce API, Dashboard API
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <HelpCircle className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Need help?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Can't find what you're looking for? Check the troubleshooting guide or reach out for support.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/docs/troubleshooting/common-issues"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Troubleshooting
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
