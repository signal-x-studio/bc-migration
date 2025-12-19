'use client';

import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, ExternalLink,
  Palette, Download, Settings, ShoppingCart, Users, RefreshCw, Zap,
  Layout, Code, Image, Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function MakeswiftGuidePage() {
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
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Palette className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">WordPress + Makeswift</h1>
              <p className="text-sm text-slate-400">
                Modern visual storefront with WordPress as your content CMS
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Overview */}
        <div className="mb-8">
          <p className="text-lg text-slate-300 mb-4">
            Makeswift is a visual page builder that connects directly to BigCommerce APIs.
            Keep WordPress for content management while building a modern, high-performance
            storefront in Makeswift.
          </p>

          <Alert variant="info" className="mb-4">
            <Sparkles className="w-4 h-4" />
            <div>
              <strong>Best for mid-market stores:</strong> Makeswift handles unlimited products
              without sync issues, making it ideal for stores with 500+ products that want to
              keep WordPress for content.
            </div>
          </Alert>
        </div>

        {/* What This Path Gives You */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>What You Keep vs. What Moves vs. What You Rebuild</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Keep
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• WordPress as content CMS</li>
                  <li>• Blog posts and pages</li>
                  <li>• WordPress admin</li>
                  <li>• Content plugins (Yoast, ACF)</li>
                  <li>• SEO data and rankings</li>
                  <li>• Media organization</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Move to BC
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Product catalog</li>
                  <li>• Customer accounts</li>
                  <li>• Orders and fulfillment</li>
                  <li>• Checkout and payments</li>
                  <li>• Inventory</li>
                  <li>• Shipping & tax</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Rebuild in Makeswift
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Storefront design</li>
                  <li>• Product page templates</li>
                  <li>• Category pages</li>
                  <li>• Navigation & header</li>
                  <li>• Homepage layout</li>
                  <li>• Footer</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Makeswift */}
        <Card className="mb-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-200 mb-4">Why Makeswift Over BC Bridge?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">Modern Storefront</p>
                  <p className="text-slate-500">
                    While BC Bridge keeps your existing theme, Makeswift gives you a modern visual storefront builder.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Layout className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">Visual Page Builder</p>
                  <p className="text-slate-500">
                    Drag-and-drop editing. No code required for design changes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">Modern Performance</p>
                  <p className="text-slate-500">
                    Static generation and edge caching. Faster than WordPress-rendered pages.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">React Under the Hood</p>
                  <p className="text-slate-500">
                    Custom components possible. Scale from visual editing to full dev control.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Diagram */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs text-slate-400 bg-slate-800 p-4 rounded overflow-x-auto">
              <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                         Your Domain                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐      ┌─────────────────────────────────┐  │
│   │   WordPress     │      │          Makeswift               │  │
│   │                 │      │                                  │  │
│   │  • Blog posts   │◄────►│  • Product pages                 │  │
│   │  • CMS pages    │ API  │  • Category pages                │  │
│   │  • Content data │      │  • Homepage                      │  │
│   │                 │      │  • Cart UI                       │  │
│   └─────────────────┘      └──────────────┬──────────────────┘  │
│                                           │                      │
│                                           │ API                  │
│                                           ▼                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    BigCommerce                           │   │
│   │                                                          │   │
│   │  • Product catalog    • Checkout     • Inventory         │   │
│   │  • Customer accounts  • Payments     • Shipping          │   │
│   │  • Orders             • Tax          • Webhooks          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
              `}</pre>
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
              Migrate your data to BigCommerce using our dashboard tools.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Run the full assessment on your WooCommerce store</li>
              <li>2. Resolve any blockers (variants &gt;600, categories &gt;5 levels deep)</li>
              <li>3. Connect to your BigCommerce store</li>
              <li>4. Sync categories using our category setup tool</li>
              <li>5. Migrate products by category</li>
              <li>6. Export and import customers</li>
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
            title="Set Up Makeswift Account"
            icon={Palette}
            status="makeswift.com"
          >
            <p className="text-sm text-slate-400 mb-4">
              Create a Makeswift account and start a new project.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Go to makeswift.com and sign up</li>
              <li>2. Create a new project</li>
              <li>3. Choose the BigCommerce integration template (if available)</li>
              <li>4. Connect your domain or use Makeswift's preview URL</li>
            </ol>
            <a
              href="https://www.makeswift.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-400 hover:underline inline-flex items-center gap-1"
            >
              Get started at makeswift.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </StepCard>

          {/* Step 3 */}
          <StepCard
            number={3}
            title="Connect BigCommerce"
            icon={Settings}
            status="In Makeswift"
          >
            <p className="text-sm text-slate-400 mb-4">
              Connect Makeswift to your BigCommerce store via API.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. In Makeswift, go to Settings → Integrations</li>
              <li>2. Add BigCommerce integration</li>
              <li>3. Enter your BC store hash and API token</li>
              <li>4. Grant required permissions (Products, Categories, Cart)</li>
              <li>5. Test the connection</li>
            </ol>
            <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded text-sm text-pink-400">
              <strong>Note:</strong> Makeswift will need a BC API account with at least
              read access to Products, Categories, and Carts.
            </div>
          </StepCard>

          {/* Step 4 */}
          <StepCard
            number={4}
            title="Build Your Storefront"
            icon={Layout}
            status="Visual builder"
          >
            <p className="text-sm text-slate-400 mb-4">
              Design your store pages using Makeswift's visual builder.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Create a Homepage with hero, featured products, CTAs</li>
              <li>2. Build a Product Listing Page template</li>
              <li>3. Design a Product Detail Page template</li>
              <li>4. Create Category landing pages</li>
              <li>5. Build header and footer (reusable components)</li>
              <li>6. Add Cart page or drawer component</li>
            </ol>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400">
              <strong>Tip:</strong> Start with a template or starter if available.
              Customize from there rather than building from scratch.
            </div>
          </StepCard>

          {/* Step 5 */}
          <StepCard
            number={5}
            title="Connect WordPress Content"
            icon={RefreshCw}
            status="Optional"
          >
            <p className="text-sm text-slate-400 mb-4">
              Pull blog posts and content pages from WordPress into Makeswift.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Enable WordPress REST API (usually enabled by default)</li>
              <li>2. In Makeswift, add WordPress as a data source</li>
              <li>3. Map WordPress posts/pages to Makeswift components</li>
              <li>4. Create a Blog listing page in Makeswift</li>
              <li>5. Create a Blog post detail template</li>
            </ol>
            <div className="p-3 bg-slate-700/50 border border-slate-600 rounded text-sm text-slate-400">
              <strong>Alternative:</strong> You can also keep blog pages on WordPress
              and only use Makeswift for commerce pages. Link between them via navigation.
            </div>
          </StepCard>

          {/* Step 6 */}
          <StepCard
            number={6}
            title="Configure Checkout"
            icon={ShoppingCart}
            status="In BC Admin"
          >
            <p className="text-sm text-slate-400 mb-4">
              Checkout happens on BigCommerce's hosted checkout.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. In BC Admin, go to <strong>Settings → Checkout</strong></li>
              <li>2. Configure payment methods (Stripe, PayPal, etc.)</li>
              <li>3. Set up shipping zones and rates</li>
              <li>4. Configure tax settings</li>
              <li>5. Customize checkout appearance if needed</li>
              <li>6. Test a complete checkout flow</li>
            </ol>
          </StepCard>

          {/* Step 7 */}
          <StepCard
            number={7}
            title="Deploy & Go Live"
            icon={Zap}
            status="Final steps"
          >
            <p className="text-sm text-slate-400 mb-4">
              Deploy your Makeswift site and switch traffic.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Set up your production domain in Makeswift</li>
              <li>2. Configure DNS to point to Makeswift</li>
              <li>3. Set up 301 redirects for old WooCommerce URLs</li>
              <li>4. Send password reset emails to customers</li>
              <li>5. Test thoroughly on production domain</li>
              <li>6. Monitor for 404s and add redirects as needed</li>
            </ol>
            <Link href="/export">
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4 mr-2" />
                Get Redirect Rules
              </Button>
            </Link>
          </StepCard>
        </div>

        {/* Timeline Estimate */}
        <Card className="mt-12 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>Estimated Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Days 1-2</p>
                <p className="font-medium text-slate-300">Assessment & Data Migration</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Days 3-7</p>
                <p className="font-medium text-slate-300">Makeswift Setup & Design</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Days 8-10</p>
                <p className="font-medium text-slate-300">Content Integration & Testing</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Days 11-14</p>
                <p className="font-medium text-slate-300">Go-Live & Monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <h2 className="text-xl font-semibold text-slate-200 mt-12 mb-6">Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ResourceLink
            title="Makeswift Documentation"
            url="https://www.makeswift.com/docs"
            description="Official guides and tutorials"
          />
          <ResourceLink
            title="Makeswift + BigCommerce"
            url="https://www.makeswift.com/integrations/bigcommerce"
            description="Integration guide and examples"
          />
          <ResourceLink
            title="BigCommerce APIs"
            url="https://developer.bigcommerce.com/docs"
            description="API reference for custom integrations"
          />
          <ResourceLink
            title="Makeswift Templates"
            url="https://www.makeswift.com/templates"
            description="Pre-built starting points"
          />
        </div>

        {/* CTA */}
        <div className="mt-12 flex items-center justify-between p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg">
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
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <span className="text-pink-400 font-semibold">{number}</span>
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

function ResourceLink({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
    >
      <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
        {title}
        <ExternalLink className="w-3 h-3" />
      </h4>
      <p className="text-sm text-slate-500">{description}</p>
    </a>
  );
}
