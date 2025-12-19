'use client';

import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, ExternalLink,
  Globe, Download, Settings, ShoppingCart, RefreshCw, Zap, Code, Rocket
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BCBridgeGuidePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/paths"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Paths
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">WordPress + BC Bridge</h1>
              <p className="text-sm text-slate-400">
                Keep your WordPress theme, power commerce with BigCommerce
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Overview */}
        <div className="mb-8">
          <p className="text-lg text-slate-300 mb-4">
            BC Bridge is our custom WordPress plugin that connects your existing WordPress theme
            directly to the BigCommerce API. Unlike sync-based solutions, BC Bridge fetches
            product data in real-time—no stale data, no sync failures, and no product limits.
          </p>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Rocket className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-400">Built for Scale</h4>
                <p className="text-sm text-slate-400">
                  BC Bridge uses direct API calls with intelligent caching. No sync timeouts,
                  no product limits, and always up-to-date data from BigCommerce.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What This Path Gives You */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>What You Keep vs. What Moves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Stays in WordPress
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Your theme and design</li>
                  <li>• All WordPress plugins</li>
                  <li>• Blog posts and pages</li>
                  <li>• WordPress admin experience</li>
                  <li>• SEO settings (Yoast, etc.)</li>
                  <li>• Media library</li>
                  <li>• User accounts</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Moves to BigCommerce
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Product catalog (source of truth)</li>
                  <li>• Customer accounts</li>
                  <li>• Orders and fulfillment</li>
                  <li>• Checkout and payments</li>
                  <li>• Inventory management</li>
                  <li>• Shipping configuration</li>
                  <li>• Tax calculations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How BC Bridge Works */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-400" />
              How BC Bridge Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-purple-400">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">Direct API Integration</h4>
                  <p className="text-sm text-slate-400">
                    BC Bridge makes real-time calls to the BigCommerce API. Product pages
                    always show current prices, inventory, and availability.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-purple-400">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">Intelligent Caching</h4>
                  <p className="text-sm text-slate-400">
                    Product data is cached with smart invalidation. Get fast page loads
                    while ensuring data freshness through BC webhooks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-purple-400">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">Theme Integration</h4>
                  <p className="text-sm text-slate-400">
                    BC Bridge provides template tags and shortcodes that work with any
                    WordPress theme. Minimal code changes required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-purple-400">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">BC Hosted Checkout</h4>
                  <p className="text-sm text-slate-400">
                    Checkout happens on BigCommerce's secure hosted checkout. PCI compliance
                    handled, all payment methods available.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Migration Steps</h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <StepCard
            number={1}
            title="Complete Assessment & Data Migration"
            icon={Zap}
            status="Use our tools"
          >
            <p className="text-sm text-slate-400 mb-4">
              Before installing BC Bridge, use our dashboard to migrate your data to BigCommerce.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Run the full assessment on your WooCommerce store</li>
              <li>2. Resolve any blockers (variants &gt;600, categories &gt;5 levels deep)</li>
              <li>3. Connect to your BigCommerce store</li>
              <li>4. Sync categories using our category setup tool</li>
              <li>5. Migrate products by category</li>
              <li>6. Migrate customers via API</li>
            </ol>
            <div className="flex gap-3">
              <Link href="/">
                <Button size="sm" variant="ghost">Run Assessment</Button>
              </Link>
              <Link href="/migrate">
                <Button size="sm">Start Migration</Button>
              </Link>
            </div>
          </StepCard>

          {/* Step 2 */}
          <StepCard
            number={2}
            title="Install BC Bridge Plugin"
            icon={Download}
            status="In WordPress"
          >
            <p className="text-sm text-slate-400 mb-4">
              Install the BC Bridge plugin to connect WordPress to BigCommerce.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Download the BC Bridge plugin from our releases page</li>
              <li>2. In WordPress admin, go to <strong>Plugins → Add New → Upload Plugin</strong></li>
              <li>3. Upload the ZIP file and click <strong>Install Now</strong></li>
              <li>4. Click <strong>Activate</strong></li>
              <li>5. Navigate to <strong>BC Bridge → Settings</strong> to configure</li>
            </ol>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400">
              <strong>Note:</strong> BC Bridge requires PHP 7.4+ and WordPress 5.8+.
              Ensure your hosting meets these requirements.
            </div>
          </StepCard>

          {/* Step 3 */}
          <StepCard
            number={3}
            title="Connect to BigCommerce"
            icon={Settings}
            status="In WP Admin"
          >
            <p className="text-sm text-slate-400 mb-4">
              Enter your BigCommerce API credentials to establish the connection.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Go to <strong>BC Bridge → Settings</strong></li>
              <li>2. Enter your BigCommerce Store Hash</li>
              <li>3. Enter your API Access Token</li>
              <li>4. Click <strong>Verify Connection</strong></li>
              <li>5. Once verified, click <strong>Save Settings</strong></li>
            </ol>
            <Link href="/setup">
              <Button size="sm" variant="ghost">
                Need API credentials? Use our Setup Wizard
              </Button>
            </Link>
          </StepCard>

          {/* Step 4 */}
          <StepCard
            number={4}
            title="Configure Product Pages"
            icon={ShoppingCart}
            status="Theme setup"
          >
            <p className="text-sm text-slate-400 mb-4">
              BC Bridge provides flexible options for displaying products in your theme.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Go to <strong>BC Bridge → Display Settings</strong></li>
              <li>2. Choose your product archive page (or create a new one)</li>
              <li>3. Configure single product page template</li>
              <li>4. Set up category pages</li>
              <li>5. Add the cart widget to your header/sidebar</li>
            </ol>
            <div className="p-3 bg-slate-800 rounded text-sm">
              <p className="text-slate-300 mb-2">Available shortcodes:</p>
              <code className="text-xs text-green-400">[bc_products]</code>
              <code className="text-xs text-green-400 ml-2">[bc_product id="123"]</code>
              <code className="text-xs text-green-400 ml-2">[bc_cart]</code>
            </div>
          </StepCard>

          {/* Step 5 */}
          <StepCard
            number={5}
            title="Configure Checkout"
            icon={ShoppingCart}
            status="In BC Admin"
          >
            <p className="text-sm text-slate-400 mb-4">
              Checkout happens on BigCommerce's secure hosted checkout. Configure it in BC admin.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. In BC Admin, go to <strong>Settings → Checkout</strong></li>
              <li>2. Configure payment methods (credit cards, PayPal, etc.)</li>
              <li>3. Set up shipping zones and rates</li>
              <li>4. Configure tax settings</li>
              <li>5. Customize checkout appearance (optional)</li>
              <li>6. Test a complete checkout flow</li>
            </ol>
          </StepCard>

          {/* Step 6 */}
          <StepCard
            number={6}
            title="Install 301 Redirects"
            icon={RefreshCw}
            status="Critical for SEO"
          >
            <p className="text-sm text-slate-400 mb-4">
              Preserve your SEO by redirecting old WooCommerce URLs to new BC Bridge URLs.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Download our auto-generated redirect rules</li>
              <li>2. Install the WordPress plugin (one-click) or use .htaccess</li>
              <li>3. Test a few old product URLs</li>
              <li>4. Monitor Search Console for 404 errors</li>
            </ol>
            <Link href="/redirects">
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4 mr-2" />
                Generate Redirect Rules
              </Button>
            </Link>
          </StepCard>

          {/* Step 7 */}
          <StepCard
            number={7}
            title="Deactivate WooCommerce"
            icon={Settings}
            status="Final step"
          >
            <p className="text-sm text-slate-400 mb-4">
              Once everything is working, deactivate WooCommerce (keep the data as backup).
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Verify all products display correctly via BC Bridge</li>
              <li>2. Complete a test order through checkout</li>
              <li>3. Go to <strong>Plugins</strong> and deactivate WooCommerce</li>
              <li>4. <strong>Do NOT delete</strong> - keep as backup for 30+ days</li>
              <li>5. Run our validation tool to verify counts match</li>
            </ol>
            <Link href="/validate">
              <Button size="sm" variant="ghost">
                Run Validation Check
              </Button>
            </Link>
          </StepCard>
        </div>

        {/* BC Bridge vs Alternatives */}
        <h2 className="text-xl font-semibold text-slate-200 mt-12 mb-6">Why BC Bridge?</h2>
        <Card className="bg-slate-900/80 border-slate-700 mb-8">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 pr-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 text-blue-400 font-medium">BC Bridge</th>
                    <th className="text-center py-3 px-4 text-slate-500 font-medium">Sync-based plugins</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="py-3 pr-4">Product limit</td>
                    <td className="text-center py-3 px-4 text-green-400">Unlimited</td>
                    <td className="text-center py-3 px-4 text-yellow-400">~500 reliable</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 pr-4">Data freshness</td>
                    <td className="text-center py-3 px-4 text-green-400">Real-time</td>
                    <td className="text-center py-3 px-4 text-yellow-400">Sync dependent</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 pr-4">Sync failures</td>
                    <td className="text-center py-3 px-4 text-green-400">None</td>
                    <td className="text-center py-3 px-4 text-red-400">Common at scale</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 pr-4">Price/inventory updates</td>
                    <td className="text-center py-3 px-4 text-green-400">Instant</td>
                    <td className="text-center py-3 px-4 text-yellow-400">Delayed</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Database bloat</td>
                    <td className="text-center py-3 px-4 text-green-400">Minimal</td>
                    <td className="text-center py-3 px-4 text-yellow-400">High</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Common Issues & Solutions</h2>
        <div className="space-y-4">
          <IssueCard
            title="API rate limiting"
            solution="BC Bridge batches requests and uses caching to stay well under BC API limits. If you see rate limit errors, check your cache configuration."
          />
          <IssueCard
            title="Images not showing"
            solution="Ensure your BC product images are set to public. BC Bridge uses BC's CDN-hosted image URLs directly."
          />
          <IssueCard
            title="Cart not updating"
            solution="BC Bridge uses JavaScript for cart functionality. Disable any aggressive JS minification or deferral in your caching plugin."
          />
          <IssueCard
            title="SSL certificate errors"
            solution="Both WordPress and BigCommerce must use HTTPS. Ensure SSL is properly configured on your WordPress site."
          />
        </div>

        {/* Go-Live Checklist */}
        <div className="mt-12 p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <h3 className="font-semibold text-slate-200 mb-3">Ready to Go Live?</h3>
          <p className="text-sm text-slate-400 mb-4">
            Use our interactive go-live checklist to ensure everything is configured correctly
            before switching over from WooCommerce.
          </p>
          <Link href="/go-live">
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Open Go-Live Checklist
            </Button>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <div>
            <h3 className="font-semibold text-slate-200">Ready to start?</h3>
            <p className="text-sm text-slate-400">Begin with assessment and data migration.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/paths">
              <Button variant="ghost">Compare Paths</Button>
            </Link>
            <Link href="/">
              <Button>Start Assessment</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepCard({
  number,
  title,
  icon: Icon,
  status,
  children,
}: {
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-slate-900/80 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 font-semibold">{number}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Icon className="w-5 h-5 text-slate-400" />
                {title}
              </h3>
              <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">
                {status}
              </span>
            </div>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IssueCard({ title, solution }: { title: string; solution: string }) {
  return (
    <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg">
      <h4 className="font-medium text-slate-200 mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{solution}</p>
    </div>
  );
}
