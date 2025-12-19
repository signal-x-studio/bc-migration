'use client';

import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, ExternalLink,
  Layers, Download, Settings, ShoppingCart, RefreshCw, Zap,
  Layout, Server, Shield, HeadphonesIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function StencilGuidePage() {
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
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Layers className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Full BigCommerce (Stencil)</h1>
              <p className="text-sm text-slate-400">
                Complete platform migration with BC's native theme framework
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Overview */}
        <div className="mb-8">
          <p className="text-lg text-slate-300 mb-4">
            Migrate entirely to BigCommerce with a Stencil theme. This is a complete platform
            migration where BigCommerce becomes your primary commerce and storefront platform.
            WordPress becomes optional (blog only) or can be decommissioned.
          </p>

          <Alert variant="info" className="mb-4">
            <Server className="w-4 h-4" />
            <div>
              <strong>All-in-One Solution:</strong> BigCommerce handles hosting, security, CDN,
              and PCI compliance. No WordPress infrastructure to maintain for commerce.
            </div>
          </Alert>
        </div>

        {/* What This Path Gives You */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>What Stays vs. What Moves vs. What You Rebuild</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Optional to Keep
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• WordPress as separate blog</li>
                  <li>• Existing content (can migrate)</li>
                  <li>• SEO data (via redirects)</li>
                </ul>
                <p className="text-xs text-slate-500 mt-3">
                  Many merchants run WP blog on subdomain (blog.store.com)
                </p>
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
                  <li>• Hosting & CDN</li>
                  <li>• SSL & security</li>
                  <li>• Content pages (optional)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Rebuild in Stencil
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Storefront theme</li>
                  <li>• Product page templates</li>
                  <li>• Category pages</li>
                  <li>• Navigation & header</li>
                  <li>• Custom functionality</li>
                  <li>• Email templates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Full BC */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-200 mb-4">Why Choose Full BigCommerce?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Server className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">Managed Infrastructure</p>
                  <p className="text-slate-500">
                    No WordPress servers to maintain. BC handles hosting, scaling, and uptime.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">PCI Compliance</p>
                  <p className="text-slate-500">
                    Level 1 PCI DSS compliance included. No security patches to manage.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <HeadphonesIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">Professional Support</p>
                  <p className="text-slate-500">
                    24/7 support included. No piecing together WP plugins and hoping they work together.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">Native Features</p>
                  <p className="text-slate-500">
                    Multi-channel, B2B, custom pricing rules, and more built-in.
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
            title="Choose and Install a Theme"
            icon={Layout}
            status="Theme Marketplace"
          >
            <p className="text-sm text-slate-400 mb-4">
              Select a Stencil theme from BigCommerce's Theme Marketplace.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. In BC Admin, go to <strong>Storefront → Theme Marketplace</strong></li>
              <li>2. Browse free and premium themes</li>
              <li>3. Preview themes with your products</li>
              <li>4. Purchase and install your chosen theme</li>
              <li>5. Use Theme Editor for basic customizations</li>
            </ol>
            <a
              href="https://www.bigcommerce.com/theme-marketplace/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Browse Theme Marketplace
              <ExternalLink className="w-3 h-3" />
            </a>
          </StepCard>

          {/* Step 3 */}
          <StepCard
            number={3}
            title="Configure Store Settings"
            icon={Settings}
            status="In BC Admin"
          >
            <p className="text-sm text-slate-400 mb-4">
              Set up your store's basic configuration.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. <strong>Settings → Store Profile</strong> - Business info, logo</li>
              <li>2. <strong>Settings → Currency</strong> - Display currency</li>
              <li>3. <strong>Settings → Shipping</strong> - Zones, carriers, rates</li>
              <li>4. <strong>Settings → Tax</strong> - Tax rules, nexus</li>
              <li>5. <strong>Settings → Payment Methods</strong> - Add Stripe, PayPal, etc.</li>
              <li>6. <strong>Settings → Checkout</strong> - Options, guest checkout</li>
            </ol>
          </StepCard>

          {/* Step 4 */}
          <StepCard
            number={4}
            title="Customize Your Theme"
            icon={Layout}
            status="Theme Editor / Stencil CLI"
          >
            <p className="text-sm text-slate-400 mb-4">
              Customize your theme to match your brand.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">No-Code (Theme Editor)</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Colors and fonts</li>
                  <li>• Logo and images</li>
                  <li>• Layout options</li>
                  <li>• Widget placement</li>
                </ul>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">With Code (Stencil CLI)</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Template modifications</li>
                  <li>• Custom components</li>
                  <li>• JavaScript additions</li>
                  <li>• Advanced styling</li>
                </ul>
              </div>
            </div>
            <a
              href="https://developer.bigcommerce.com/docs/storefront/stencil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Stencil Developer Documentation
              <ExternalLink className="w-3 h-3" />
            </a>
          </StepCard>

          {/* Step 5 */}
          <StepCard
            number={5}
            title="Create Content Pages"
            icon={Layout}
            status="Page Builder"
          >
            <p className="text-sm text-slate-400 mb-4">
              Build static pages using BigCommerce's Page Builder.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Go to <strong>Storefront → Web Pages</strong></li>
              <li>2. Create pages: About, Contact, FAQ, Terms, etc.</li>
              <li>3. Use Page Builder for visual editing</li>
              <li>4. Add to navigation menus</li>
              <li>5. Migrate content from WordPress pages</li>
            </ol>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400">
              <strong>Tip:</strong> Export content from WordPress using Export tool,
              then copy/paste or recreate in BC Page Builder.
            </div>
          </StepCard>

          {/* Step 6 */}
          <StepCard
            number={6}
            title="Set Up Email Templates"
            icon={RefreshCw}
            status="In BC Admin"
          >
            <p className="text-sm text-slate-400 mb-4">
              Customize transactional email templates.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Go to <strong>Marketing → Transactional Emails</strong></li>
              <li>2. Customize templates: Order confirmation, shipping, etc.</li>
              <li>3. Update branding (logo, colors)</li>
              <li>4. Review and customize welcome email</li>
              <li>5. Test emails by placing a test order</li>
            </ol>
          </StepCard>

          {/* Step 7 */}
          <StepCard
            number={7}
            title="Install 301 Redirects"
            icon={RefreshCw}
            status="Critical for SEO"
          >
            <p className="text-sm text-slate-400 mb-4">
              Preserve SEO by redirecting old WooCommerce URLs to new BC URLs.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Download redirect rules from our Export page</li>
              <li>2. In BC Admin, go to <strong>Storefront → 301 Redirects</strong></li>
              <li>3. Import CSV redirects or add manually</li>
              <li>4. Test old URLs redirect correctly</li>
            </ol>
            <Link href="/export">
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4 mr-2" />
                Get Redirect Rules
              </Button>
            </Link>
          </StepCard>

          {/* Step 8 */}
          <StepCard
            number={8}
            title="Connect Domain & Go Live"
            icon={Zap}
            status="Final steps"
          >
            <p className="text-sm text-slate-400 mb-4">
              Point your domain to BigCommerce and launch.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Go to <strong>Settings → Domain</strong> in BC Admin</li>
              <li>2. Add your domain and follow DNS instructions</li>
              <li>3. Update DNS records (usually A record or CNAME)</li>
              <li>4. Enable SSL (automatic with BC)</li>
              <li>5. Test complete checkout flow</li>
              <li>6. Send password reset emails to customers</li>
              <li>7. Deactivate WordPress WooCommerce (keep as backup)</li>
            </ol>
          </StepCard>
        </div>

        {/* WordPress Blog Option */}
        <Card className="mt-12 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>Keeping WordPress for Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Many merchants keep WordPress running as a blog while BigCommerce handles commerce:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">Subdomain Approach</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• blog.yourstore.com → WordPress</li>
                  <li>• www.yourstore.com → BigCommerce</li>
                  <li>• Link between via navigation</li>
                </ul>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">Subfolder (Advanced)</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• yourstore.com/blog → WordPress</li>
                  <li>• yourstore.com/* → BigCommerce</li>
                  <li>• Requires reverse proxy setup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Estimate */}
        <Card className="mt-8 bg-slate-900/80 border-slate-700">
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
                <p className="text-slate-500 mb-1">Days 3-5</p>
                <p className="font-medium text-slate-300">Theme Selection & Setup</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Days 6-10</p>
                <p className="font-medium text-slate-300">Configuration & Content</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Days 11-14</p>
                <p className="font-medium text-slate-300">Testing & Go-Live</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <h2 className="text-xl font-semibold text-slate-200 mt-12 mb-6">Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ResourceLink
            title="Stencil Documentation"
            url="https://developer.bigcommerce.com/docs/storefront/stencil"
            description="Theme development guides"
          />
          <ResourceLink
            title="Theme Marketplace"
            url="https://www.bigcommerce.com/theme-marketplace/"
            description="Browse themes"
          />
          <ResourceLink
            title="BigCommerce Help Center"
            url="https://support.bigcommerce.com/"
            description="Setup guides and FAQs"
          />
          <ResourceLink
            title="BC Academy"
            url="https://www.bigcommerce.com/academy/"
            description="Free training courses"
          />
        </div>

        {/* CTA */}
        <div className="mt-12 flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-lg">
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
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-indigo-400 font-semibold">{number}</span>
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
