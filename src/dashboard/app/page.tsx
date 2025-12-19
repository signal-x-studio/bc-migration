'use client';

import { useState, useEffect } from 'react';
import {
  Zap, RefreshCw, CheckCircle, ArrowRight,
  FileText, Image, Search, Globe,
  Package, FolderTree, Users, ShoppingCart, CreditCard, Puzzle, Database,
  Rocket, Shield, TrendingUp, Download, Play, BookOpen, HelpCircle,
  Palette, Code, Layers, Star, ExternalLink, Link2, Sparkles, ClipboardCheck, Settings, Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectionForm, APISetupGuide } from '../components/ConnectionForm';
import { AssessmentCard } from '../components/AssessmentCard';
import { BatchProgress } from '../components/BatchProgress';
import { ReportExport } from '../components/ReportExport';
import { NextActions } from '../components/NextActions';
import { useConnection } from '../lib/contexts/ConnectionContext';
import { useAssessment } from '../lib/contexts/AssessmentContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { CircularProgress } from '../components/ui/Progress';
import type { AssessmentArea } from '../lib/types';
import { getPathRecommendations, MIGRATION_PATHS, type MigrationPathId } from '../lib/types';

const areaRoutes: Record<AssessmentArea, string> = {
  products: '/products',
  categories: '/categories',
  customers: '/customers',
  orders: '/orders',
  seo: '/seo',
  plugins: '/plugins',
  customData: '/custom-data',
};

export default function Home() {
  const router = useRouter();
  const { isConnected, disconnect, storeInfo, credentials } = useConnection();
  const {
    products,
    categories,
    customers,
    orders,
    seo,
    plugins,
    customData,
    loading,
    errors,
    assessArea,
    assessAll,
    getOverallReadiness,
    hydrateFromCache,
  } = useAssessment();

  // Hydrate cached assessments on connect
  useEffect(() => {
    if (isConnected && credentials?.url) {
      hydrateFromCache(credentials.url);
    }
  }, [isConnected, credentials?.url, hydrateFromCache]);

  const [batchProgress, setBatchProgress] = useState<{
    isRunning: boolean;
    currentArea: AssessmentArea | null;
    completedAreas: AssessmentArea[];
  }>({
    isRunning: false,
    currentArea: null,
    completedAreas: [],
  });

  const handleAssess = async (area: AssessmentArea) => {
    if (!credentials) return;
    await assessArea(area, credentials);
  };

  const handleViewDetails = (area: AssessmentArea) => {
    router.push(areaRoutes[area]);
  };

  const handleAssessAll = async () => {
    if (!credentials) return;
    setBatchProgress({ isRunning: true, currentArea: null, completedAreas: [] });
    await assessAll(credentials, (area, status) => {
      if (status === 'start') {
        setBatchProgress(prev => ({ ...prev, currentArea: area }));
      } else {
        setBatchProgress(prev => ({
          ...prev,
          currentArea: null,
          completedAreas: [...prev.completedAreas, area],
        }));
      }
    });
    setBatchProgress(prev => ({ ...prev, isRunning: false, currentArea: null }));
  };

  const { score, blockers, warnings } = getOverallReadiness();
  const hasAnyAssessment = products || categories || customers || orders || seo || plugins || customData;
  const isAnyLoading = Object.values(loading).some(Boolean);

  // Calculate commerce swap readiness message
  const getReadinessMessage = () => {
    if (blockers === 0 && warnings === 0) return "Ready for seamless commerce swap";
    if (blockers === 0) return "Minor adjustments needed";
    if (blockers <= 2) return "A few items need restructuring";
    return "Some preparation required";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-100">Commerce Upgrade Assessment</h1>
              <p className="text-xs text-slate-500">Powered by BigCommerce</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Migration Guide</span>
            </Link>

            {isConnected && (
              <>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Connected to</p>
                  <p className="text-sm font-medium text-slate-200 font-mono">
                    {storeInfo?.name?.replace(/^https?:\/\//, '')}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        {!isConnected ? (
          <>
            {/* Hero Section - Strategic Value Prop */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
                Keep WordPress.
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Upgrade Commerce.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
                Your WordPress site stays exactly as it is. Your content, your blog, your SEO equity—all preserved.
                Only your commerce engine upgrades to BigCommerce.
              </p>

              {/* Before/After Visual */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 w-full md:w-64">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Today</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="w-4 h-4" /> WordPress
                    </div>
                    <div className="flex items-center gap-2 text-orange-400 ml-4">
                      <Package className="w-4 h-4" /> WooCommerce
                    </div>
                    <p className="text-xs text-slate-500 mt-2">All-in-one, limited scale</p>
                  </div>
                </div>

                <ArrowRight className="w-8 h-8 text-purple-400 rotate-90 md:rotate-0" />

                <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-6 w-full md:w-64">
                  <p className="text-xs text-purple-400 uppercase tracking-wider mb-3">After Upgrade</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" /> WordPress (unchanged)
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 ml-4">
                      <Rocket className="w-4 h-4" /> BigCommerce
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Enterprise commerce, unlimited scale</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What Stays Section */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                What Stays (Your WordPress Site)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PreservedItem icon={FileText} label="Blog & Content" />
                <PreservedItem icon={Image} label="Theme & Design" />
                <PreservedItem icon={Search} label="SEO Rankings" />
                <PreservedItem icon={Globe} label="Domain & URLs" />
              </div>
            </div>

            {/* What Upgrades Section */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                What Upgrades (Commerce to BigCommerce)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <UpgradeCard
                  icon={Package}
                  title="Products & Catalog"
                  before="Plugin limitations"
                  after="Enterprise-grade PIM"
                />
                <UpgradeCard
                  icon={CreditCard}
                  title="Checkout & Payments"
                  before="Extension sprawl"
                  after="Native Apple Pay, Shop Pay"
                />
                <UpgradeCard
                  icon={TrendingUp}
                  title="Scale & Performance"
                  before="Server limits"
                  after="99.99% uptime SLA"
                />
              </div>
            </div>

            {/* Connection Form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">
                See How Easy Your Commerce Swap Will Be
              </h3>
              <ConnectionForm />
            </div>
            <APISetupGuide />

            {/* Fresh Start Option */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 mb-2">Don&apos;t have WooCommerce?</p>
              <Link
                href="/fresh-start"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Start fresh with BigCommerce
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Connected State - Commerce Swap Readiness */}
            <div className="mb-10">
              {/* Header with Readiness Score */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Commerce Swap Readiness
                  </h2>
                  <p className="text-slate-400">
                    Your WordPress site stays. Here&apos;s what moves to BigCommerce.
                  </p>
                </div>

                {hasAnyAssessment && (
                  <Card className="bg-slate-900/80 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <CircularProgress
                          value={score}
                          size={80}
                          variant={blockers > 0 ? 'danger' : warnings > 0 ? 'warning' : 'success'}
                        />
                        <div>
                          <p className="text-2xl font-bold text-slate-100">{score}% Ready</p>
                          <p className="text-sm text-slate-400">{getReadinessMessage()}</p>
                          <div className="flex gap-3 mt-2">
                            {blockers > 0 && (
                              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                {blockers} need attention
                              </span>
                            )}
                            {warnings > 0 && (
                              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                {warnings} minor items
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* What Stays Reminder */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-400 font-medium">Your WordPress Site Stays Unchanged</p>
                    <p className="text-sm text-slate-400">Content, blog, theme, SEO, and URLs are preserved during the commerce upgrade.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Progress */}
            <BatchProgress
              currentArea={batchProgress.currentArea}
              completedAreas={batchProgress.completedAreas}
              isRunning={batchProgress.isRunning}
            />

            {/* What Moves to BigCommerce */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-400" />
                Commerce Data Moving to BigCommerce
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AssessmentCard
                  area="products"
                  assessment={products}
                  isLoading={loading.products}
                  error={errors.products}
                  count={storeInfo?.productCount}
                  onAssess={() => handleAssess('products')}
                  onViewDetails={() => handleViewDetails('products')}
                />
                <AssessmentCard
                  area="categories"
                  assessment={categories}
                  isLoading={loading.categories}
                  error={errors.categories}
                  onAssess={() => handleAssess('categories')}
                  onViewDetails={() => handleViewDetails('categories')}
                />
                <AssessmentCard
                  area="customers"
                  assessment={customers}
                  isLoading={loading.customers}
                  error={errors.customers}
                  count={storeInfo?.customerCount}
                  onAssess={() => handleAssess('customers')}
                  onViewDetails={() => handleViewDetails('customers')}
                />
                <AssessmentCard
                  area="orders"
                  assessment={orders}
                  isLoading={loading.orders}
                  error={errors.orders}
                  count={storeInfo?.orderCount}
                  onAssess={() => handleAssess('orders')}
                  onViewDetails={() => handleViewDetails('orders')}
                />
                <AssessmentCard
                  area="plugins"
                  assessment={plugins}
                  isLoading={loading.plugins}
                  error={errors.plugins}
                  onAssess={() => handleAssess('plugins')}
                  onViewDetails={() => handleViewDetails('plugins')}
                />
                <AssessmentCard
                  area="customData"
                  assessment={customData}
                  isLoading={loading.customData}
                  error={errors.customData}
                  onAssess={() => handleAssess('customData')}
                  onViewDetails={() => handleViewDetails('customData')}
                />
              </div>
            </div>

            {/* SEO Section - Special handling since it's about preservation */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                SEO Protection Plan
              </h3>
              <div className="grid md:grid-cols-1 gap-6">
                <AssessmentCard
                  area="seo"
                  assessment={seo}
                  isLoading={loading.seo}
                  error={errors.seo}
                  onAssess={() => handleAssess('seo')}
                  onViewDetails={() => handleViewDetails('seo')}
                />
              </div>
            </div>

            {/* Run Assessment Button */}
            <div className="text-center mb-8">
              <Button
                size="lg"
                onClick={handleAssessAll}
                disabled={isAnyLoading || batchProgress.isRunning}
                isLoading={batchProgress.isRunning}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {batchProgress.isRunning ? 'Analyzing...' : 'Analyze Commerce Swap Readiness'}
                {!batchProgress.isRunning && <Zap className="w-4 h-4 ml-2" />}
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Analyzes all commerce data for BigCommerce compatibility
              </p>
            </div>

            {/* Next Best Actions */}
            <NextActions />

            {/* Path Recommendation */}
            {hasAnyAssessment && (
              <PathRecommendationCard productCount={products?.metrics.total ?? storeInfo?.productCount ?? 0} />
            )}

            {/* Export Report */}
            <div className="mt-8">
              <ReportExport />
            </div>

            {/* Export for Migration CTA */}
            {hasAnyAssessment && (
              <div className="mt-8">
                <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Download className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">
                            Ready to Export?
                          </h3>
                          <p className="text-sm text-slate-400">
                            Generate BC-ready CSV files, redirect rules, and migration specs
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push('/export')}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export for Migration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Self-Service Migration CTA */}
            {hasAnyAssessment && score > 50 && (
              <div className="mt-4">
                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                          <Play className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">
                            Small Store? Migrate Now
                          </h3>
                          <p className="text-sm text-slate-400">
                            Self-service migration by category (max 50 products per batch)
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push('/migrate')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Category Migration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Tools */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Migration Tools</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link href="/setup" className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg hover:border-blue-500/30 transition-colors group">
                  <Settings className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">BC Setup</p>
                  <p className="text-xs text-slate-500">Connect BigCommerce</p>
                </Link>
                <Link href="/validate" className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg hover:border-green-500/30 transition-colors group">
                  <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
                  <p className="font-medium text-slate-200 group-hover:text-green-400 transition-colors">Validate</p>
                  <p className="text-xs text-slate-500">Compare WC vs BC</p>
                </Link>
                <Link href="/preview" className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg hover:border-cyan-500/30 transition-colors group">
                  <Eye className="w-5 h-5 text-cyan-400 mb-2" />
                  <p className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">Preview</p>
                  <p className="text-xs text-slate-500">Preview storefronts</p>
                </Link>
                <Link href="/go-live" className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg hover:border-purple-500/30 transition-colors group">
                  <ClipboardCheck className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="font-medium text-slate-200 group-hover:text-purple-400 transition-colors">Go-Live</p>
                  <p className="text-xs text-slate-500">Launch checklist</p>
                </Link>
                <Link href="/redirects" className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg hover:border-orange-500/30 transition-colors group">
                  <Link2 className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="font-medium text-slate-200 group-hover:text-orange-400 transition-colors">Redirects</p>
                  <p className="text-xs text-slate-500">301 redirect rules</p>
                </Link>
              </div>
            </div>

            {/* BigCommerce Benefits */}
            {hasAnyAssessment && (
              <div className="mt-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">
                  What You Get with BigCommerce
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-blue-400 font-medium mb-1">Enterprise Scale</p>
                    <p className="text-sm text-slate-400">99.99% uptime, unlimited API calls, global CDN</p>
                  </div>
                  <div>
                    <p className="text-blue-400 font-medium mb-1">Native Checkout</p>
                    <p className="text-sm text-slate-400">Apple Pay, Google Pay, Shop Pay built-in</p>
                  </div>
                  <div>
                    <p className="text-blue-400 font-medium mb-1">No Plugin Tax</p>
                    <p className="text-sm text-slate-400">B2B, subscriptions, multi-storefront native</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-auto bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          Keep WordPress. Upgrade Commerce. • BigCommerce + WordPress Integration
        </div>
      </footer>
    </div>
  );
}

function PreservedItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}

function UpgradeCard({
  icon: Icon,
  title,
  before,
  after
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  before: string;
  after: string;
}) {
  return (
    <div className="p-5 bg-slate-900/80 border border-slate-700 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <h4 className="font-medium text-slate-200">{title}</h4>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-orange-400">WooCommerce:</span>
          <span className="text-slate-400">{before}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">BigCommerce:</span>
          <span className="text-slate-300">{after}</span>
        </div>
      </div>
    </div>
  );
}

const pathIcons: Record<MigrationPathId, React.ComponentType<{ className?: string }>> = {
  'bc-bridge': Globe,
  makeswift: Palette,
  stencil: Layers,
  headless: Code,
};

function PathRecommendationCard({ productCount }: { productCount: number }) {
  const recommendation = getPathRecommendations(productCount);
  const recommendedPath = recommendation.paths.find(p => p.recommended);

  if (!recommendedPath) return null;

  const Icon = pathIcons[recommendedPath.id];

  return (
    <div className="mt-8">
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-slate-100">
                  Recommended Migration Path
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">
                  Based on your store
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{recommendation.reasoning}</p>

              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg mb-4">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Icon className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200">{recommendedPath.name}</p>
                  <p className="text-sm text-slate-400">{recommendedPath.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Estimated</p>
                  <p className="text-sm font-medium text-slate-300">{recommendedPath.timeEstimate}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/paths/${recommendedPath.id}`}>
                  <Button size="sm">
                    View {recommendedPath.name} Guide
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/paths">
                  <Button size="sm" variant="ghost">
                    Compare All 4 Paths
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
