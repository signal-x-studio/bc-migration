'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Clock,
  Zap, Globe, Code, Palette, Star, ExternalLink, Info,
  Package, Users, ShoppingCart, FileText, Layers
} from 'lucide-react';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { useAssessment } from '@/lib/contexts/AssessmentContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  getPathRecommendations,
  type MigrationPath,
  type MigrationPathId,
  type EffortLevel,
} from '@/lib/types';

const pathIcons: Record<MigrationPathId, React.ComponentType<{ className?: string }>> = {
  'bc-bridge': Globe,
  makeswift: Palette,
  stencil: Layers,
  headless: Code,
};

const effortColors: Record<EffortLevel, string> = {
  low: 'text-green-400 bg-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  high: 'text-orange-400 bg-orange-500/20',
};

export default function PathsPage() {
  const { isConnected, storeInfo } = useConnection();
  const { products } = useAssessment();

  const productCount = products?.metrics.total ?? storeInfo?.productCount ?? 0;

  const recommendation = useMemo(() => {
    return getPathRecommendations(productCount);
  }, [productCount]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Choose Your Migration Path</h1>
              <p className="text-sm text-slate-400">
                Select the architecture that best fits your needs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Store Context */}
        {isConnected && (
          <div className="mb-8 p-4 bg-slate-900/80 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{productCount.toLocaleString()} products</span>
                </div>
                {storeInfo?.customerCount && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{storeInfo.customerCount.toLocaleString()} customers</span>
                  </div>
                )}
                {storeInfo?.orderCount && (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{storeInfo.orderCount.toLocaleString()} orders</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Recommendations based on your store
              </div>
            </div>
          </div>
        )}

        {/* Recommendation Banner */}
        <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-purple-400 mb-1">Our Recommendation</h3>
              <p className="text-sm text-slate-300">{recommendation.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Path Cards */}
        <div className="space-y-4">
          {recommendation.paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                  {recommendation.paths.map((path) => (
                    <th key={path.id} className="text-center py-3 px-4 text-slate-400 font-medium">
                      {path.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-3 px-4 text-slate-300">WordPress Theme</td>
                  <td className="py-3 px-4 text-center text-green-400">Keep</td>
                  <td className="py-3 px-4 text-center text-yellow-400">Rebuild</td>
                  <td className="py-3 px-4 text-center text-yellow-400">Rebuild</td>
                  <td className="py-3 px-4 text-center text-yellow-400">Rebuild</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">WordPress Admin</td>
                  <td className="py-3 px-4 text-center text-green-400">Keep</td>
                  <td className="py-3 px-4 text-center text-green-400">Keep</td>
                  <td className="py-3 px-4 text-center text-slate-500">Optional</td>
                  <td className="py-3 px-4 text-center text-slate-500">Optional</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">Content/Blog</td>
                  <td className="py-3 px-4 text-center text-green-400">Keep</td>
                  <td className="py-3 px-4 text-center text-green-400">Keep (API)</td>
                  <td className="py-3 px-4 text-center text-yellow-400">Migrate</td>
                  <td className="py-3 px-4 text-center text-green-400">Keep (API)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">Catalog Scale</td>
                  <td className="py-3 px-4 text-center text-yellow-400">&lt;500</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">Visual Editing</td>
                  <td className="py-3 px-4 text-center text-slate-500">Gutenberg</td>
                  <td className="py-3 px-4 text-center text-green-400">Makeswift</td>
                  <td className="py-3 px-4 text-center text-yellow-400">Page Builder</td>
                  <td className="py-3 px-4 text-center text-slate-500">Code</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">Dev Required</td>
                  <td className="py-3 px-4 text-center text-green-400">No</td>
                  <td className="py-3 px-4 text-center text-green-400">No</td>
                  <td className="py-3 px-4 text-center text-yellow-400">Some</td>
                  <td className="py-3 px-4 text-center text-red-400">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">Timeline</td>
                  <td className="py-3 px-4 text-center">1-3 days</td>
                  <td className="py-3 px-4 text-center">1-2 weeks</td>
                  <td className="py-3 px-4 text-center">1-2 weeks</td>
                  <td className="py-3 px-4 text-center">4-8 weeks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* What's Common */}
        <div className="mt-12 p-6 bg-slate-900/80 border border-slate-700 rounded-lg">
          <h3 className="font-semibold text-slate-200 mb-4">What's the Same Across All Paths</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 font-medium">Same Data Migration</p>
                <p className="text-slate-500">Our tools migrate products, categories, and customers to BigCommerce regardless of which frontend you choose.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 font-medium">Same BigCommerce Backend</p>
                <p className="text-slate-500">All paths use BigCommerce for catalog, checkout, and order management. Only the frontend differs.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 font-medium">Same Export Artifacts</p>
                <p className="text-slate-500">301 redirects, password reset templates, and BC-ready CSVs work for all paths.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 font-medium">Same Checkout Experience</p>
                <p className="text-slate-500">All paths use BigCommerce's hosted checkout for PCI compliance and payment processing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
          <div>
            <h3 className="font-semibold text-slate-200">Ready to migrate?</h3>
            <p className="text-sm text-slate-400">Run the assessment first, then choose your path.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="ghost">Run Assessment</Button>
            </Link>
            <Link href="/migrate">
              <Button>Start Migration</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function PathCard({ path }: { path: MigrationPath }) {
  const Icon = pathIcons[path.id];

  return (
    <Card className={`bg-slate-900/80 border-slate-700 ${path.recommended ? 'ring-2 ring-purple-500/50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${path.recommended ? 'bg-purple-500/20' : 'bg-slate-800'}`}>
            <Icon className={`w-6 h-6 ${path.recommended ? 'text-purple-400' : 'text-slate-400'}`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-200">{path.name}</h3>
              {path.recommended && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">
                  Recommended
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${effortColors[path.effort]}`}>
                {path.effort.charAt(0).toUpperCase() + path.effort.slice(1)} Effort
              </span>
            </div>

            <p className="text-sm text-slate-400 mb-4">{path.description}</p>

            {/* Warnings */}
            {path.warnings && path.warnings.length > 0 && (
              <div className="mb-4 space-y-2">
                {path.warnings.map((warning, i) => (
                  <Alert key={i} variant="warning" className="py-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{warning}</span>
                  </Alert>
                ))}
              </div>
            )}

            {/* Three columns: Keep / Move / Rebuild */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Keep
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  {path.keeps.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Move to BC
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  {path.moves.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              {path.rebuilds.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Rebuild
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    {path.rebuilds.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {path.timeEstimate}
                </span>
                <span>Best for: {path.bestFor[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                {path.learnMoreUrl && (
                  <a
                    href={path.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                  >
                    Learn more
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <Link href={`/paths/${path.id}`}>
                  <Button size="sm">
                    View Guide
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
