'use client';

import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, ExternalLink,
  Code, Download, Settings, RefreshCw, Zap,
  Layout, Server, Layers, GitBranch, Terminal, Cpu
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function HeadlessGuidePage() {
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
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Code className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Headless / Catalyst</h1>
              <p className="text-sm text-slate-400">
                Maximum flexibility with custom frontend development
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Overview */}
        <div className="mb-8">
          <p className="text-lg text-slate-300 mb-4">
            Build a completely custom storefront using BigCommerce APIs. Use Catalyst (BigCommerce's
            Next.js reference implementation), or build from scratch with any modern framework.
          </p>

          <Alert variant="warning" className="mb-4">
            <Terminal className="w-4 h-4" />
            <div>
              <strong>Developer Required:</strong> This path requires JavaScript/React development
              expertise and ongoing maintenance. Best for teams with dedicated developers.
            </div>
          </Alert>
        </div>

        {/* What This Path Gives You */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>What You Keep vs. What Moves vs. What You Build</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Your Choice to Keep
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• WordPress as CMS (optional)</li>
                  <li>• Any headless CMS</li>
                  <li>• Existing APIs</li>
                  <li>• Your hosting choice</li>
                  <li>• Full architecture control</li>
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
                  <li>• Cart management</li>
                  <li>• Inventory</li>
                  <li>• Checkout (hosted)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Build Custom
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Entire storefront</li>
                  <li>• Product pages</li>
                  <li>• Category pages</li>
                  <li>• Search & filtering</li>
                  <li>• Cart UI</li>
                  <li>• Account pages</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Framework Options */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-200 mb-4">Framework Options</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium text-slate-200">Catalyst (Recommended)</span>
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  BigCommerce's official Next.js reference implementation. Production-ready
                  foundation with BC-specific components.
                </p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Next.js 14+ with App Router</li>
                  <li>• React Server Components</li>
                  <li>• Pre-built BC components</li>
                  <li>• Vercel/Edge deployment</li>
                </ul>
                <a
                  href="https://www.catalyst.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 mt-3"
                >
                  catalyst.dev
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-200">Custom Build</span>
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  Build from scratch with any framework. Maximum flexibility but more
                  development work.
                </p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Next.js, Nuxt, Remix</li>
                  <li>• Astro, SvelteKit</li>
                  <li>• Use BC GraphQL Storefront API</li>
                  <li>• Host anywhere</li>
                </ul>
                <a
                  href="https://developer.bigcommerce.com/docs/storefront/graphql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:underline inline-flex items-center gap-1 mt-3"
                >
                  GraphQL API Docs
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="mb-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs text-slate-400 bg-slate-800 p-4 rounded overflow-x-auto">
              <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                         Your Domain                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │            Custom Storefront (Catalyst/Next.js)          │   │
│   │                                                          │   │
│   │  • Product listing pages    • Account pages              │   │
│   │  • Product detail pages     • Cart/Mini-cart             │   │
│   │  • Category pages           • Search & filters           │   │
│   │  • Homepage                 • Navigation                 │   │
│   └─────────────────────────────┬───────────────────────────┘   │
│                                 │                                │
│                    GraphQL API  │  REST API                      │
│                                 │                                │
│   ┌─────────────────────────────▼───────────────────────────┐   │
│   │                    BigCommerce                           │   │
│   │                                                          │   │
│   │  • Product catalog    • Checkout (hosted)    • Webhooks  │   │
│   │  • Customer accounts  • Payments             • Inventory │   │
│   │  • Orders             • Tax calculation      • Shipping  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │             Content CMS (Optional)                       │   │
│   │                                                          │   │
│   │  WordPress / Contentful / Sanity / Prismic / etc.        │   │
│   │  Blog posts, marketing pages, CMS-driven content         │   │
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
            title="Set Up Development Environment"
            icon={Terminal}
            status="Local setup"
          >
            <p className="text-sm text-slate-400 mb-4">
              Clone Catalyst or set up your custom project.
            </p>
            <div className="bg-slate-800 p-4 rounded mb-4 font-mono text-xs">
              <p className="text-slate-500 mb-2"># Using Catalyst:</p>
              <p className="text-emerald-400">npx @bigcommerce/create-catalyst@latest my-store</p>
              <p className="text-slate-500 mt-4 mb-2"># Or custom Next.js:</p>
              <p className="text-emerald-400">npx create-next-app@latest my-store --typescript</p>
              <p className="text-emerald-400">npm install @bigcommerce/storefront-api</p>
            </div>
            <a
              href="https://www.catalyst.dev/docs/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Catalyst Getting Started Guide
              <ExternalLink className="w-3 h-3" />
            </a>
          </StepCard>

          {/* Step 3 */}
          <StepCard
            number={3}
            title="Configure API Credentials"
            icon={Settings}
            status="BC Admin + .env"
          >
            <p className="text-sm text-slate-400 mb-4">
              Create API credentials and configure your storefront.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. In BC Admin, go to <strong>Settings → API Accounts</strong></li>
              <li>2. Create a new Storefront API Token</li>
              <li>3. Enable required scopes: Products, Customers, Carts, Checkout</li>
              <li>4. Copy credentials to your .env file</li>
            </ol>
            <div className="bg-slate-800 p-4 rounded font-mono text-xs">
              <p className="text-slate-500"># .env.local</p>
              <p className="text-slate-400">BIGCOMMERCE_STORE_HASH=your_store_hash</p>
              <p className="text-slate-400">BIGCOMMERCE_ACCESS_TOKEN=your_token</p>
              <p className="text-slate-400">BIGCOMMERCE_CHANNEL_ID=1</p>
            </div>
          </StepCard>

          {/* Step 4 */}
          <StepCard
            number={4}
            title="Build Core Pages"
            icon={Layout}
            status="Development"
          >
            <p className="text-sm text-slate-400 mb-4">
              Implement the core commerce pages.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="font-medium text-slate-300 mb-2">Required Pages:</p>
                <ul className="text-slate-500 space-y-1">
                  <li>• Homepage</li>
                  <li>• Product listing (category)</li>
                  <li>• Product detail</li>
                  <li>• Cart page</li>
                  <li>• Search results</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-300 mb-2">Optional Pages:</p>
                <ul className="text-slate-500 space-y-1">
                  <li>• Account dashboard</li>
                  <li>• Order history</li>
                  <li>• Wishlist</li>
                  <li>• Compare products</li>
                  <li>• Blog (from CMS)</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-400">
              <strong>Catalyst Advantage:</strong> Many of these pages are pre-built. You
              customize instead of building from scratch.
            </div>
          </StepCard>

          {/* Step 5 */}
          <StepCard
            number={5}
            title="Integrate Checkout"
            icon={Server}
            status="BC Hosted"
          >
            <p className="text-sm text-slate-400 mb-4">
              Checkout uses BigCommerce's hosted checkout (PCI compliant).
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Cart API creates/manages cart</li>
              <li>2. Get checkout URL from Cart API</li>
              <li>3. Redirect customer to BC hosted checkout</li>
              <li>4. Customer completes payment on BC</li>
              <li>5. Redirect back to your confirmation page</li>
            </ol>
            <div className="bg-slate-800 p-4 rounded font-mono text-xs mb-4">
              <p className="text-slate-500">// Get checkout redirect URL</p>
              <p className="text-slate-400">{`const { data } = await bcClient.createCheckout(cartId);`}</p>
              <p className="text-slate-400">{`window.location.href = data.checkout_url;`}</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400">
              <strong>Note:</strong> Embedded checkout (checkout on your domain) requires
              additional setup. Start with hosted checkout, optimize later.
            </div>
          </StepCard>

          {/* Step 6 */}
          <StepCard
            number={6}
            title="Set Up Hosting & Deploy"
            icon={Server}
            status="Vercel/Netlify/etc"
          >
            <p className="text-sm text-slate-400 mb-4">
              Deploy your storefront to a hosting platform.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">Vercel (Recommended)</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Best Next.js support</li>
                  <li>• Edge functions</li>
                  <li>• Automatic previews</li>
                </ul>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">Alternatives</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Netlify</li>
                  <li>• Cloudflare Pages</li>
                  <li>• AWS Amplify</li>
                </ul>
              </div>
            </div>
            <ol className="text-sm text-slate-400 space-y-2">
              <li>1. Connect Git repository to hosting platform</li>
              <li>2. Add environment variables</li>
              <li>3. Deploy and test on preview URL</li>
              <li>4. Configure production domain</li>
            </ol>
          </StepCard>

          {/* Step 7 */}
          <StepCard
            number={7}
            title="Install Redirects & Go Live"
            icon={RefreshCw}
            status="Final steps"
          >
            <p className="text-sm text-slate-400 mb-4">
              Set up redirects and launch your new storefront.
            </p>
            <ol className="text-sm text-slate-400 space-y-2 mb-4">
              <li>1. Download redirect rules from our Export page</li>
              <li>2. Add redirects to your hosting platform (next.config.js or hosting rules)</li>
              <li>3. Configure your production domain DNS</li>
              <li>4. Test complete checkout flow</li>
              <li>5. Send password reset emails to customers</li>
              <li>6. Monitor and iterate</li>
            </ol>
            <Link href="/export">
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4 mr-2" />
                Get Redirect Rules
              </Button>
            </Link>
          </StepCard>
        </div>

        {/* Timeline */}
        <Card className="mt-12 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>Estimated Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Week 1</p>
                <p className="font-medium text-slate-300">Assessment, Data Migration, Setup</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Weeks 2-4</p>
                <p className="font-medium text-slate-300">Core Page Development</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Weeks 5-6</p>
                <p className="font-medium text-slate-300">Polish, Content, Testing</p>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-slate-500 mb-1">Weeks 7-8</p>
                <p className="font-medium text-slate-300">Deployment & Go-Live</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Timeline varies significantly based on design complexity and team size.
              Catalyst can reduce this by 2-3 weeks vs. building from scratch.
            </p>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="mt-8 bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>Key APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">GraphQL Storefront API</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Products, categories, brands</li>
                  <li>• Customer accounts</li>
                  <li>• Cart operations</li>
                  <li>• Optimized for storefronts</li>
                </ul>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <p className="font-medium text-slate-300 mb-2">REST Management API</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Admin operations</li>
                  <li>• Order management</li>
                  <li>• Webhooks setup</li>
                  <li>• Inventory updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <h2 className="text-xl font-semibold text-slate-200 mt-12 mb-6">Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ResourceLink
            title="Catalyst"
            url="https://www.catalyst.dev/"
            description="Next.js reference storefront"
          />
          <ResourceLink
            title="GraphQL Storefront API"
            url="https://developer.bigcommerce.com/docs/storefront/graphql"
            description="Query products, cart, checkout"
          />
          <ResourceLink
            title="REST API Reference"
            url="https://developer.bigcommerce.com/docs/rest"
            description="Full API documentation"
          />
          <ResourceLink
            title="Headless Guide"
            url="https://developer.bigcommerce.com/docs/storefront/headless"
            description="Architecture and best practices"
          />
        </div>

        {/* CTA */}
        <div className="mt-12 flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg">
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
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 font-semibold">{number}</span>
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
