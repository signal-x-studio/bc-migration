'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, Circle, ChevronDown, ChevronRight,
  ExternalLink, AlertTriangle, Info, Zap, Server, CreditCard,
  Truck, FileText, Globe, Users, Package, FolderTree, Lock,
  Settings, Shield, HelpCircle, BookOpen, Plug, ShoppingCart,
  Eye, RefreshCw, Code, Palette, Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

type SectionId = 'overview' | 'bc-bridge' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'faq';

export default function HelpPage() {
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['overview'])
  );

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Migration Guide</h1>
              <p className="text-sm text-slate-400">
                Everything you need to know about migrating to BigCommerce
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bc-bridge', label: 'BC Bridge Plugin' },
            { id: 'phase1', label: 'Phase 1: Assess' },
            { id: 'phase2', label: 'Phase 2: Setup BC' },
            { id: 'phase3', label: 'Phase 3: Migrate' },
            { id: 'phase4', label: 'Phase 4: Validate' },
            { id: 'phase5', label: 'Phase 5: Go Live' },
            { id: 'faq', label: 'FAQ' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => {
                setExpandedSections(new Set([id as SectionId]));
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        <Section
          id="overview"
          title="Migration Overview"
          icon={Zap}
          expanded={expandedSections.has('overview')}
          onToggle={() => toggleSection('overview')}
        >
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">Keep WordPress. Upgrade Commerce.</h4>
              <p className="text-sm text-slate-400">
                This tool helps you migrate your WooCommerce store to BigCommerce while preserving
                your WordPress content, blog, theme, and SEO equity. Only your commerce engine changes.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-200">Four Migration Paths</h4>
                <Link
                  href="/paths"
                  className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  Compare all paths
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/30">
                  <h5 className="font-medium text-blue-400 mb-2">WordPress + BC Bridge</h5>
                  <p className="text-sm text-slate-400 mb-2">
                    Keep your WordPress theme. BC Bridge plugin connects directly to BC API.
                  </p>
                  <p className="text-xs text-slate-500">Best for: Any size store, heavy theme investment</p>
                  <Link
                    href="/paths/bc-bridge"
                    className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View BC Bridge Guide
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-pink-500/5 rounded-lg border border-pink-500/30">
                  <h5 className="font-medium text-pink-400 mb-2">WordPress + Makeswift</h5>
                  <p className="text-sm text-slate-400 mb-2">
                    Modern visual storefront with WordPress as your content CMS. No sync issues.
                  </p>
                  <p className="text-xs text-slate-500">Best for: 500+ products, growth-focused stores</p>
                  <Link
                    href="/paths/makeswift"
                    className="text-xs text-pink-400 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View Makeswift Guide
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-2">Full BigCommerce (Stencil)</h5>
                  <p className="text-sm text-slate-400 mb-2">
                    Complete platform migration. WordPress becomes optional (blog only).
                  </p>
                  <p className="text-xs text-slate-500">Best for: Wanting BC's full feature set</p>
                  <Link
                    href="/paths/stencil"
                    className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View Stencil Guide
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-2">Headless / Catalyst</h5>
                  <p className="text-sm text-slate-400 mb-2">
                    Custom storefront using BC's APIs. Maximum flexibility with modern frameworks.
                  </p>
                  <p className="text-xs text-slate-500">Best for: Dev teams wanting full control</p>
                  <Link
                    href="/paths/headless"
                    className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View Headless Guide
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">What Stays vs. What Moves</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <h5 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Stays in WordPress
                  </h5>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Blog posts and pages</li>
                    <li>• Media library</li>
                    <li>• Theme and design</li>
                    <li>• SEO settings and rankings</li>
                    <li>• User accounts (non-customer)</li>
                    <li>• Plugins (non-commerce)</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Moves to BigCommerce
                  </h5>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Products and variants</li>
                    <li>• Categories</li>
                    <li>• Customer accounts</li>
                    <li>• Order history (optional)</li>
                    <li>• Pricing and inventory</li>
                    <li>• Cart and checkout</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Migration Timeline</h4>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
                  <span className="text-slate-400">Tiny Store (&lt;100 products)</span>
                  <span className="text-green-400 font-medium">1-2 hours</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
                  <span className="text-slate-400">Small Store (100-500)</span>
                  <span className="text-yellow-400 font-medium">2-4 hours</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
                  <span className="text-slate-400">Medium+ (500+)</span>
                  <span className="text-orange-400 font-medium">Use 3rd party tool</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* BC Bridge Plugin Guide */}
        <Section
          id="bc-bridge"
          title="BC Bridge Plugin Guide"
          icon={Plug}
          expanded={expandedSections.has('bc-bridge')}
          onToggle={() => toggleSection('bc-bridge')}
        >
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">Keep Your Theme. Use BigCommerce.</h4>
              <p className="text-sm text-slate-400">
                BC Bridge connects your existing WordPress theme directly to BigCommerce APIs.
                Display products, manage carts, and handle checkout without rebuilding your site.
                Unlike sync-based plugins, BC Bridge uses real-time API calls - no sync delays,
                no product limits, no database bloat.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">What BC Bridge Enables</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Product Display</p>
                    <p className="text-xs text-slate-500">
                      Show BC products on any page using shortcodes like <code className="bg-slate-700 px-1 rounded">[bc_products]</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <FolderTree className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Category Browsing</p>
                    <p className="text-xs text-slate-500">
                      Automatic category pages with filtering and pagination
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Shopping Cart</p>
                    <p className="text-xs text-slate-500">
                      Add to cart, update quantities, remove items - all via AJAX
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Secure Checkout</p>
                    <p className="text-xs text-slate-500">
                      Embedded or redirect checkout powered by BigCommerce (PCI compliant)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Real-Time Data</p>
                    <p className="text-xs text-slate-500">
                      Prices and inventory always current - no sync delays
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Palette className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Theme Compatible</p>
                    <p className="text-xs text-slate-500">
                      Works with any WordPress theme via shortcodes or overridable templates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Automatic Routes</h4>
              <p className="text-sm text-slate-400 mb-3">
                BC Bridge automatically creates these URLs on your WordPress site:
              </p>
              <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-2 text-slate-300">URL</th>
                      <th className="text-left px-4 py-2 text-slate-300">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr>
                      <td className="px-4 py-2 font-mono text-blue-400">/shop/</td>
                      <td className="px-4 py-2 text-slate-400">Product listing (all products)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-blue-400">/product/product-name/</td>
                      <td className="px-4 py-2 text-slate-400">Single product page</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-blue-400">/product-category/name/</td>
                      <td className="px-4 py-2 text-slate-400">Category archive</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-blue-400">/cart/</td>
                      <td className="px-4 py-2 text-slate-400">Shopping cart</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-blue-400">/checkout/</td>
                      <td className="px-4 py-2 text-slate-400">Checkout (embedded or redirect)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Shortcodes Reference</h4>
              <p className="text-sm text-slate-400 mb-3">
                Use these shortcodes to display BigCommerce content anywhere in WordPress:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <code className="text-blue-400 font-mono">[bc_products]</code>
                  <p className="text-sm text-slate-400 mt-2">Display a grid of products.</p>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <p><code className="bg-slate-700 px-1 rounded">limit="12"</code> - Number of products (default: 12)</p>
                    <p><code className="bg-slate-700 px-1 rounded">columns="4"</code> - Grid columns: 2, 3, or 4 (default: 4)</p>
                    <p><code className="bg-slate-700 px-1 rounded">category="clothing"</code> - Filter by category slug</p>
                    <p><code className="bg-slate-700 px-1 rounded">orderby="price"</code> - Sort by: date, price, title</p>
                    <p><code className="bg-slate-700 px-1 rounded">order="asc"</code> - Sort direction: asc, desc</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-400 italic">
                    Example: <code className="bg-slate-700 px-1 rounded">[bc_products category="shoes" limit="8" columns="4"]</code>
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <code className="text-blue-400 font-mono">[bc_product]</code>
                  <p className="text-sm text-slate-400 mt-2">Display a single product.</p>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <p><code className="bg-slate-700 px-1 rounded">id="123"</code> - BigCommerce product ID</p>
                    <p><code className="bg-slate-700 px-1 rounded">slug="product-name"</code> - Or use product URL slug</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-400 italic">
                    Example: <code className="bg-slate-700 px-1 rounded">[bc_product id="456"]</code>
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <code className="text-blue-400 font-mono">[bc_cart]</code>
                  <p className="text-sm text-slate-400 mt-2">Display the shopping cart on any page.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <code className="text-blue-400 font-mono">[bc_checkout]</code>
                  <p className="text-sm text-slate-400 mt-2">Display checkout. Uses embedded or redirect based on settings.</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Installation Steps</h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">1</span>
                  <div>
                    <p className="text-slate-300">Download the plugin</p>
                    <p className="text-xs text-slate-500 mt-1">Get bc-bridge.zip from releases or build from source</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">2</span>
                  <div>
                    <p className="text-slate-300">Install in WordPress</p>
                    <p className="text-xs text-slate-500 mt-1">Plugins → Add New → Upload Plugin → Choose bc-bridge.zip</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">3</span>
                  <div>
                    <p className="text-slate-300">Activate and configure</p>
                    <p className="text-xs text-slate-500 mt-1">Go to BC Bridge → Settings. Enter your Store Hash and Access Token.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">4</span>
                  <div>
                    <p className="text-slate-300">Test the connection</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Test Connection" to verify API credentials work</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">5</span>
                  <div>
                    <p className="text-slate-300">View your shop</p>
                    <p className="text-xs text-slate-500 mt-1">Visit yoursite.com/shop/ to see products</p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Required BigCommerce API Scopes</h4>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400 mb-3">When creating your BC API account, enable these permissions:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Products</span>
                    <span className="text-xs text-slate-500">read-only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Carts</span>
                    <span className="text-xs text-slate-500">modify</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Checkouts</span>
                    <span className="text-xs text-slate-500">modify</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Store Information</span>
                    <span className="text-xs text-slate-500">read-only</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Theme Customization</h4>
              <p className="text-sm text-slate-400 mb-3">
                Override templates by copying files from <code className="bg-slate-700 px-1 rounded">bc-bridge/templates/</code> to your theme's <code className="bg-slate-700 px-1 rounded">bc-bridge/</code> folder:
              </p>
              <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400">
                <p className="text-slate-500"># In your theme directory:</p>
                <p>your-theme/</p>
                <p>&nbsp;&nbsp;└── bc-bridge/</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── shop.php</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── product.php</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── cart.php</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── partials/</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── product-card.php</p>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                CSS variables can also be overridden - see <code className="bg-slate-700 px-1 rounded">--bc-primary</code>, <code className="bg-slate-700 px-1 rounded">--bc-text</code>, etc.
              </p>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-400 mb-1">BC Bridge vs Sync-Based Plugins</h4>
                  <div className="text-sm text-slate-400 mt-2">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-green-400 mb-1">BC Bridge (Direct API)</p>
                        <ul className="space-y-1">
                          <li>✓ Real-time prices/inventory</li>
                          <li>✓ No product limits</li>
                          <li>✓ No sync failures</li>
                          <li>✓ Minimal database usage</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-400 mb-1">Sync-Based Plugins</p>
                        <ul className="space-y-1">
                          <li>• Data can be stale</li>
                          <li>• ~500 product limit reliable</li>
                          <li>• Sync can timeout/fail</li>
                          <li>• Database bloat from copies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/paths/bc-bridge"
              className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              View Full BC Bridge Migration Guide
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </Section>

        {/* Phase 1: Assessment */}
        <Section
          id="phase1"
          title="Phase 1: Assess Your Store"
          icon={FileText}
          expanded={expandedSections.has('phase1')}
          onToggle={() => toggleSection('phase1')}
        >
          <div className="space-y-6">
            <p className="text-slate-400">
              Before migrating, we analyze your WooCommerce store to identify potential issues
              and ensure compatibility with BigCommerce.
            </p>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">7 Assessment Areas</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: Package, name: 'Products', desc: 'Types, variants, SKUs, pricing' },
                  { icon: FolderTree, name: 'Categories', desc: 'Hierarchy depth, structure' },
                  { icon: Users, name: 'Customers', desc: 'Accounts, addresses, emails' },
                  { icon: FileText, name: 'Orders', desc: 'History, statuses, refunds' },
                  { icon: Globe, name: 'SEO & URLs', desc: 'Permalinks, redirects needed' },
                  { icon: Settings, name: 'Plugins', desc: 'Functionality mapping' },
                  { icon: Server, name: 'Custom Data', desc: 'Meta fields, custom fields' },
                ].map(({ icon: Icon, name, desc }) => (
                  <div key={name} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Icon className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">{name}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">BigCommerce Limits to Know</h4>
              <div className="space-y-2">
                <LimitRow
                  label="Variants per product"
                  limit="600 max"
                  severity="blocker"
                />
                <LimitRow
                  label="Category depth"
                  limit="5 levels max"
                  severity="blocker"
                />
                <LimitRow
                  label="Product name length"
                  limit="250 characters"
                  severity="warning"
                />
                <LimitRow
                  label="SKU length"
                  limit="250 characters"
                  severity="warning"
                />
                <LimitRow
                  label="SKU uniqueness"
                  limit="Must be unique"
                  severity="blocker"
                />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Important: Resolve Blockers First</h4>
                  <p className="text-sm text-slate-400">
                    Products with 600+ variants need to be split. Categories deeper than 5 levels
                    need to be flattened. Fix these before proceeding to Phase 2.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Phase 2: BC Setup */}
        <Section
          id="phase2"
          title="Phase 2: Set Up BigCommerce"
          icon={Server}
          expanded={expandedSections.has('phase2')}
          onToggle={() => toggleSection('phase2')}
        >
          <div className="space-y-6">
            <p className="text-slate-400">
              Create your BigCommerce store and configure API access for migration.
            </p>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Step 1: Create BC Trial Account</h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">1</span>
                  <div>
                    <p className="text-slate-300">Go to BigCommerce free trial signup</p>
                    <a
                      href="https://www.bigcommerce.com/essentials/free-trial/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      bigcommerce.com/essentials/free-trial
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">2</span>
                  <div>
                    <p className="text-slate-300">Complete the signup process</p>
                    <p className="text-xs text-slate-500 mt-1">Email, password, store name, industry</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">3</span>
                  <div>
                    <p className="text-slate-300">Note your store hash</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Found in your admin URL: store-<span className="text-yellow-400">abc123xyz</span>.mybigcommerce.com
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Step 2: Create API Account</h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">1</span>
                  <div>
                    <p className="text-slate-300">In BC Admin, go to Settings → API Accounts</p>
                    <p className="text-xs text-slate-500 mt-1">Or use direct link: [your-store].mybigcommerce.com/manage/settings/api-accounts</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">2</span>
                  <div>
                    <p className="text-slate-300">Click "Create API Account" → "Create V2/V3 API Token"</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">3</span>
                  <div>
                    <p className="text-slate-300">Set required permissions:</p>
                    <div className="mt-2 p-3 bg-slate-800 rounded text-xs font-mono">
                      <p className="text-green-400">✓ Products: modify</p>
                      <p className="text-green-400">✓ Customers: modify</p>
                      <p className="text-green-400">✓ Orders: read-only (optional)</p>
                      <p className="text-green-400">✓ Content: modify</p>
                      <p className="text-green-400">✓ Store Information: read-only</p>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">4</span>
                  <div>
                    <p className="text-slate-300">Save and copy your credentials</p>
                    <p className="text-xs text-slate-500 mt-1">
                      You'll need the <span className="text-yellow-400">Access Token</span> - save it securely, it's only shown once!
                    </p>
                  </div>
                </li>
              </ol>

              <a
                href="https://support.bigcommerce.com/s/article/Store-API-Accounts"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Detailed API account setup guide
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">What We Can Automate</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 font-medium text-sm mb-2">Automated</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>✓ Category creation (hierarchy preserved)</li>
                    <li>✓ Product import with images</li>
                    <li>✓ Customer account creation</li>
                    <li>✓ 301 redirect rules generation</li>
                  </ul>
                </div>
                <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 font-medium text-sm mb-2">Manual Setup Required</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Payment gateway (Stripe, PayPal, etc.)</li>
                    <li>• Shipping zones and rates</li>
                    <li>• Tax configuration</li>
                    <li>• Domain/DNS changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Phase 3: Migration */}
        <Section
          id="phase3"
          title="Phase 3: Migrate Data"
          icon={Zap}
          expanded={expandedSections.has('phase3')}
          onToggle={() => toggleSection('phase3')}
        >
          <div className="space-y-6">
            <p className="text-slate-400">
              With both stores connected, you can now migrate your data. We support
              category-by-category migration for safety and control.
            </p>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Migration Order</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium">1</span>
                  <div>
                    <p className="font-medium text-slate-200">Categories</p>
                    <p className="text-xs text-slate-500">Must exist before products can be assigned</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Auto</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium">2</span>
                  <div>
                    <p className="font-medium text-slate-200">Products</p>
                    <p className="text-xs text-slate-500">Migrated by category, max 50 products per batch</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Auto</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium">3</span>
                  <div>
                    <p className="font-medium text-slate-200">Customers</p>
                    <p className="text-xs text-slate-500">Account data + addresses (passwords require reset)</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Auto</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-slate-600 text-slate-400 flex items-center justify-center font-medium">4</span>
                  <div>
                    <p className="font-medium text-slate-200">Orders (Optional)</p>
                    <p className="text-xs text-slate-500">Historical orders for reference</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Manual/3rd Party</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Category-Gated Migration</h4>
              <p className="text-sm text-slate-400 mb-3">
                For safety, we limit each migration batch to 50 products. Select a category,
                verify the count, and migrate. Repeat for each category.
              </p>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 mb-2">Why 50 products?</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Completes in ~2 minutes (manageable wait time)</li>
                  <li>• Browser connection won't timeout</li>
                  <li>• Easy to verify each batch before proceeding</li>
                  <li>• If something fails, only small batch is affected</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Customer Migration</h4>
              <p className="text-sm text-slate-400 mb-3">
                Customer accounts are migrated via API with email-based deduplication.
                All migrated customers have <code className="bg-slate-700 px-1 rounded">force_password_reset: true</code>.
              </p>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 mb-2">What happens during customer migration:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Customer data (name, email) is transferred</li>
                  <li>• Billing and shipping addresses are converted</li>
                  <li>• Existing BC customers (by email) are skipped</li>
                  <li>• Customers must reset password on first login</li>
                </ul>
              </div>
              <Link
                href="/customers/password-reset"
                className="mt-3 text-sm text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Password Reset Guide
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Large Store?</h4>
                  <p className="text-sm text-slate-400">
                    For stores with 500+ products, we recommend using a third-party migration service
                    like LitExtension ($99-299) or Cart2Cart ($69+). They handle large volumes and
                    include order history migration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Phase 4: Validation */}
        <Section
          id="phase4"
          title="Phase 4: Validate Migration"
          icon={CheckCircle}
          expanded={expandedSections.has('phase4')}
          onToggle={() => toggleSection('phase4')}
        >
          <div className="space-y-6">
            <p className="text-slate-400">
              After migrating data, verify that counts match between WooCommerce and BigCommerce.
            </p>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Validation Checks</h4>
              <div className="space-y-2">
                {[
                  { name: 'Products', desc: 'Compare product counts between stores' },
                  { name: 'Categories', desc: 'Verify all categories were created' },
                  { name: 'Customers', desc: 'Confirm customer accounts transferred' },
                ].map(({ name, desc }) => (
                  <div key={name} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-slate-200">{name}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-400 mb-1">Use the Validation Tool</h4>
                  <p className="text-sm text-slate-400 mb-2">
                    Our validation page compares counts automatically and provides recommendations
                    if there are mismatches.
                  </p>
                  <Link
                    href="/validate"
                    className="text-sm text-green-400 hover:underline inline-flex items-center gap-1"
                  >
                    Open Validation Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">What to Do If Counts Don't Match</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Fewer in BC:</strong> Some items may have failed migration. Check for blockers (600+ variants, duplicate SKUs).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>More in BC:</strong> You may have created test data in BC. Check for sample products.</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Phase 5: Go Live */}
        <Section
          id="phase5"
          title="Phase 5: Go Live Checklist"
          icon={CheckCircle}
          expanded={expandedSections.has('phase5')}
          onToggle={() => toggleSection('phase5')}
        >
          <div className="space-y-6">
            <p className="text-slate-400">
              Before switching to your new BigCommerce store, complete this checklist.
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-400 mb-1">Interactive Checklist Available</h4>
                  <p className="text-sm text-slate-400 mb-2">
                    Track your go-live progress with our interactive checklist. It auto-verifies
                    payment, shipping, tax, and SSL configuration.
                  </p>
                  <Link
                    href="/go-live"
                    className="text-sm text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    Open Go-Live Checklist
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Pre-Launch Checklist</h4>
              <div className="space-y-2">
                <ChecklistItem
                  icon={CreditCard}
                  title="Payment Gateway Configured"
                  description="Set up Stripe, PayPal, or other payment methods in BC Admin → Settings → Payments"
                  link="https://support.bigcommerce.com/s/article/Online-Payment-Methods"
                />
                <ChecklistItem
                  icon={Truck}
                  title="Shipping Zones Configured"
                  description="Set up shipping zones and rates in BC Admin → Settings → Shipping"
                  link="https://support.bigcommerce.com/s/article/Shipping-Setup"
                />
                <ChecklistItem
                  icon={FileText}
                  title="Tax Settings Configured"
                  description="Configure tax rules or connect to Avalara/TaxJar"
                  link="https://support.bigcommerce.com/s/article/Tax-Overview"
                />
                <ChecklistItem
                  icon={Shield}
                  title="Test Order Placed"
                  description="Place a test order through the full checkout flow"
                />
                <ChecklistItem
                  icon={Globe}
                  title="301 Redirects Installed"
                  description="Upload redirect rules to preserve SEO (download from Export page)"
                />
                <ChecklistItem
                  icon={Users}
                  title="Password Reset Emails Sent"
                  description="Notify customers they need to reset passwords (template available in Customers page)"
                />
                <ChecklistItem
                  icon={Lock}
                  title="SSL Certificate Active"
                  description="Verify HTTPS is working on your BC store"
                />
                <ChecklistItem
                  icon={Globe}
                  title="Domain Pointed"
                  description="Update DNS to point to BigCommerce (or configure BC Bridge plugin for hybrid)"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-200 mb-3">Post-Launch</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Monitor for 404 errors and add missing redirects
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Check Google Search Console for crawl errors
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Verify all payment methods work with real transactions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Deactivate WooCommerce plugin (keep data for reference)
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section
          id="faq"
          title="Frequently Asked Questions"
          icon={HelpCircle}
          expanded={expandedSections.has('faq')}
          onToggle={() => toggleSection('faq')}
        >
          <div className="space-y-4">
            <FAQ
              question="What happens to my existing orders?"
              answer="Your WooCommerce order history stays in WordPress. You can view historical orders there while new orders come into BigCommerce. For order migration, we recommend third-party tools like LitExtension."
            />
            <FAQ
              question="Will my customers need new accounts?"
              answer="Customer accounts are migrated, but passwords cannot be transferred (security). Customers will receive a password reset email and can then log in to their existing account."
            />
            <FAQ
              question="What about my SEO rankings?"
              answer="We generate 301 redirect rules from all your old WooCommerce URLs to the new BigCommerce URLs. Install these redirects to preserve your SEO equity."
            />
            <FAQ
              question="Can I migrate back to WooCommerce?"
              answer="Yes, BigCommerce supports data export. However, we recommend keeping your WooCommerce database intact (just deactivated) for the first few months as a backup."
            />
            <FAQ
              question="How long does migration take?"
              answer="Self-service migration: 1-2 hours for <100 products, 2-4 hours for 100-500 products. For larger stores, third-party tools typically complete in 24-48 hours."
            />
            <FAQ
              question="Is my data secure during migration?"
              answer="Credentials are stored in your browser's localStorage only. Data transfers happen directly between WooCommerce API → this tool → BigCommerce API. Nothing is stored on our servers."
            />
            <FAQ
              question="Why do customers need to reset passwords?"
              answer="WooCommerce and BigCommerce use different password hashing algorithms for security. It's technically impossible to transfer password hashes between platforms. Customers receive a password reset email or are prompted on first login."
            />
            <FAQ
              question="How do I install the redirect plugin?"
              answer="Download the WordPress plugin from the Redirects page. Upload the .php file to /wp-content/plugins/ via FTP or the WordPress admin. Activate it and all 301 redirects will be handled automatically."
            />
            <FAQ
              question="What if I don't have WooCommerce?"
              answer="Use Fresh Start Mode! If you're adding BigCommerce to an existing WordPress site without WooCommerce data, skip the assessment and go directly to BC setup. Visit the Fresh Start page to begin."
            />
            <FAQ
              question="Can I test before going live?"
              answer="Yes! BigCommerce trial stores are fully functional. Complete your migration, configure settings, and test the checkout flow before pointing your domain. Your WooCommerce store continues to work until you switch DNS."
            />
            <FAQ
              question="What does BC Bridge plugin do?"
              answer="BC Bridge connects your WordPress theme directly to BigCommerce APIs. It displays products, manages shopping carts, and handles checkout without rebuilding your site. Unlike sync-based plugins, it uses real-time API calls so prices and inventory are always current."
            />
            <FAQ
              question="How is BC Bridge different from other BC plugins?"
              answer="BC Bridge uses direct API calls instead of syncing data to WordPress. This means: no product limits (works with any catalog size), no sync failures or delays, real-time inventory/pricing, and minimal database usage. Sync-based plugins often fail reliably above ~500 products."
            />
            <FAQ
              question="Can I use BC Bridge with my existing theme?"
              answer="Yes! BC Bridge works with any WordPress theme. Use shortcodes like [bc_products] to display products anywhere, or use the automatic routes (/shop, /product/name, /cart). You can also override templates by copying them to your theme's bc-bridge/ folder."
            />
            <FAQ
              question="How does checkout work with BC Bridge?"
              answer="BC Bridge offers two checkout options: Embedded (keeps customers on your site using BigCommerce's secure iframe) or Redirect (sends customers to BigCommerce's hosted checkout). Both are PCI compliant - you never handle card data directly."
            />
          </div>
        </Section>

        {/* Need Help */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Need Help?</h3>
          <p className="text-sm text-slate-400 mb-4">
            For complex migrations or stores with 500+ products, consider professional assistance.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.bigcommerce.com/partners/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2"
            >
              Find a BC Partner
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://litextension.com/bigcommerce-migration/woocommerce-to-bigcommerce-migration.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
            >
              LitExtension Migration Service
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="mb-4 bg-slate-900/80 border-slate-700">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

function LimitRow({
  label,
  limit,
  severity,
}: {
  label: string;
  limit: string;
  severity: 'blocker' | 'warning';
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`text-xs px-2 py-1 rounded ${
        severity === 'blocker'
          ? 'bg-red-500/20 text-red-400'
          : 'bg-yellow-500/20 text-yellow-400'
      }`}>
        {limit}
      </span>
    </div>
  );
}

function ChecklistItem({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
      <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <p className="font-medium text-slate-200">{title}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
          >
            Learn more
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-medium text-slate-200">{question}</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-slate-400">{answer}</p>
        </div>
      )}
    </div>
  );
}
