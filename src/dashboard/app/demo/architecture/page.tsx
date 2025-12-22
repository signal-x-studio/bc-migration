'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Layers,
  Server,
  Database,
  Globe,
  Code,
  GitBranch,
  Package,
  Cpu,
  FileCode,
  Workflow,
  FolderTree,
  Zap,
  Shield,
  FileImage,
  ExternalLink,
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Architecture Overview</h1>
              <p className="text-sm text-slate-400">
                Technical documentation for development leads
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Tech Stack Overview */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Layers className="w-6 h-6 text-blue-400" />
            Tech Stack
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TechCard
              icon={<Globe className="w-5 h-5" />}
              title="Next.js 16"
              description="App Router with React Server Components"
              details={[
                'React 19.2 with Compiler',
                'Turbopack for development',
                'API Routes for backend',
              ]}
              color="blue"
            />
            <TechCard
              icon={<Code className="w-5 h-5" />}
              title="TypeScript 5"
              description="Strict mode with path aliases"
              details={[
                'Zod for runtime validation',
                'Type-safe API contracts',
                'Strict null checks',
              ]}
              color="cyan"
            />
            <TechCard
              icon={<Package className="w-5 h-5" />}
              title="Tailwind CSS 4"
              description="Utility-first styling"
              details={[
                'Dark mode default',
                'Custom color palette',
                'Component patterns',
              ]}
              color="purple"
            />
            <TechCard
              icon={<Server className="w-5 h-5" />}
              title="WooCommerce REST API"
              description="Source platform integration"
              details={[
                'Official SDK (@woocommerce/woocommerce-rest-api)',
                'OAuth 1.0a authentication',
                'Paginated data fetching',
              ]}
              color="orange"
            />
            <TechCard
              icon={<Database className="w-5 h-5" />}
              title="BigCommerce APIs"
              description="Target platform integration"
              details={[
                'Catalog Management API',
                'Customer V3 API',
                'Orders V2/V3 API',
                'Storefront GraphQL',
              ]}
              color="green"
            />
            <TechCard
              icon={<Zap className="w-5 h-5" />}
              title="Playwright"
              description="End-to-end testing"
              details={[
                'Visual regression tests',
                'Cross-browser testing',
                'CI/CD integration',
              ]}
              color="pink"
            />
          </div>
        </section>

        {/* D2 Diagrams Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FileImage className="w-6 h-6 text-indigo-400" />
            Architecture Diagrams (D2)
          </h2>

          <p className="text-slate-400 mb-6">
            These diagrams are defined in D2 format for easy editing and can be exported to Excalidraw or rendered with the D2 CLI.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <DiagramCard
              title="System Architecture"
              description="Layered architecture showing presentation, state, API, and external services"
              filename="system-architecture.d2"
              path="app/demo/architecture/diagrams/system-architecture.d2"
            />
            <DiagramCard
              title="Migration Flow"
              description="4-phase wizard flow with dependencies and state persistence"
              filename="migration-flow.d2"
              path="app/demo/architecture/diagrams/migration-flow.d2"
            />
            <DiagramCard
              title="Data Flow"
              description="WooCommerce to BigCommerce data transformation pipeline"
              filename="data-flow.d2"
              path="app/demo/architecture/diagrams/data-flow.d2"
            />
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm">
            <h4 className="font-medium text-slate-200 mb-2">Rendering D2 Diagrams</h4>
            <pre className="text-slate-400 font-mono text-xs">{`# Install D2 CLI
brew install d2

# Render to SVG
d2 diagrams/system-architecture.d2 system-architecture.svg

# Render to PNG
d2 diagrams/system-architecture.d2 system-architecture.png --theme 200

# Watch mode for development
d2 --watch diagrams/system-architecture.d2 output.svg`}</pre>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Workflow className="w-6 h-6 text-purple-400" />
            System Architecture
          </h2>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-slate-300">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BC MIGRATION DASHBOARD                             │
│                          (Next.js 16 App Router)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         PRESENTATION LAYER                              │ │
│  │                                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   /migrate   │  │   /preview   │  │  /validate   │  │  /go-live   │ │ │
│  │  │   Wizard     │  │   PDP/PLP    │  │   Reports    │  │  Checklist  │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                                         │ │
│  │  Components: WizardProgress, MigrationStep, ProductSelector, etc.     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                          STATE MANAGEMENT                               │ │
│  │                                                                         │ │
│  │  ┌──────────────────┐  ┌────────────────┐  ┌─────────────────────────┐ │ │
│  │  │ ConnectionContext│  │ BCConnection   │  │  AssessmentContext      │ │ │
│  │  │  (WC creds)      │  │  Context       │  │  (assessment data)      │ │ │
│  │  └──────────────────┘  └────────────────┘  └─────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  useMigrationWizard Hook (Reducer-based, localStorage persist)  │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                            API LAYER                                    │ │
│  │                       (Next.js Route Handlers)                          │ │
│  │                                                                         │ │
│  │  /api/assess/*     → WooCommerce data collection                       │ │
│  │  /api/migrate/*    → Data transformation & BC writes (SSE streams)     │ │
│  │  /api/validate/*   → Post-migration verification                       │ │
│  │  /api/export/*     → CSV/JSON export generation                        │ │
│  │  /api/verify/*     → Go-live prerequisite checks                       │ │
│  │  /api/preview/*    → Product preview data                              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   WOOCOMMERCE    │      │   BIGCOMMERCE    │      │   WORDPRESS      │
│   REST API       │      │   APIs           │      │   REST API       │
│                  │      │                  │      │                  │
│  • Products      │      │  • Catalog API   │      │  • Pages         │
│  • Categories    │      │  • Customers API │      │  • Posts (Blog)  │
│  • Customers     │      │  • Orders API    │      │  • Media         │
│  • Orders        │      │  • Storefront GQL│      │                  │
│  • Coupons       │      │  • Redirects API │      │                  │
│  • Reviews       │      │                  │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
`}</pre>
          </div>
        </section>

        {/* Directory Structure */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FolderTree className="w-6 h-6 text-green-400" />
            Project Structure
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-blue-400">
                Dashboard (Next.js App)
              </h3>
              <pre className="text-sm text-slate-300 font-mono">{`src/dashboard/
├── app/
│   ├── api/           # Route handlers
│   │   ├── assess/    # WC data collection
│   │   ├── migrate/   # Migration endpoints
│   │   ├── validate/  # Verification
│   │   ├── export/    # Data exports
│   │   └── verify/    # Go-live checks
│   ├── demo/          # Demo & docs pages
│   ├── migrate/       # Migration wizard
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── preview/       # Product previews
│   ├── validate/      # Validation UI
│   └── go-live/       # Launch checklist
├── components/        # Shared UI
│   └── ui/            # Design system
├── lib/
│   ├── contexts/      # React contexts
│   ├── wc-client.ts   # WooCommerce SDK
│   ├── wp-client.ts   # WordPress client
│   ├── bc-storefront.ts # BC GraphQL
│   └── storage.ts     # localStorage utils
└── tests/             # Playwright E2E`}</pre>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-orange-400">
                CLI Tool (Node.js)
              </h3>
              <pre className="text-sm text-slate-300 font-mono">{`src/
├── cli.ts             # Entry point
├── assessment/
│   ├── orchestrator.ts
│   ├── collectors/
│   │   ├── complexity.ts
│   │   ├── custom-logic.ts
│   │   └── seo.ts
│   └── report.ts
├── migration/
│   ├── category-migrator.ts
│   ├── product-migrator.ts
│   ├── customer-migrator.ts
│   ├── order-migrator.ts
│   ├── state-tracker.ts
│   └── transformers/
├── validation/
│   ├── data-validator.ts
│   └── report.ts
├── lib/
│   ├── rate-limiter.ts  # Bottleneck
│   ├── retry.ts         # Exp backoff
│   ├── logger.ts        # Pino
│   └── batch.ts
├── types/
│   ├── wc.ts
│   └── bc.ts
└── schemas/           # Zod schemas
    ├── wc.ts
    └── bc.ts`}</pre>
            </div>
          </div>
        </section>

        {/* Key Patterns */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FileCode className="w-6 h-6 text-cyan-400" />
            Key Development Patterns
          </h2>

          <div className="space-y-6">
            <PatternCard
              title="Migration Wizard State Machine"
              description="Reducer-based state management with localStorage persistence"
              code={`// useMigrationWizard hook
const PHASES = {
  1: { name: 'Foundation', dependencies: [] },
  2: { name: 'Core Data', dependencies: [1] },
  3: { name: 'Transactions', dependencies: [2] },
  4: { name: 'Content', dependencies: [1] }
};

// Reducer handles: GO_TO_PHASE, START_PHASE,
// COMPLETE_PHASE, SKIP_PHASE, UPDATE_PHASE_DATA

// State persisted per store-pair:
// localStorage key: wc-migration-wizard-state-{wcUrl}-{bcHash}`}
            />

            <PatternCard
              title="Server-Sent Events for Long Operations"
              description="Real-time progress streaming for migrations"
              code={`// API Route (e.g., /api/migrate/products)
export async function POST(request: Request) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Send progress updates
  const sendProgress = (data: ProgressEvent) => {
    writer.write(encoder.encode(\`data: \${JSON.stringify(data)}\\n\\n\`));
  };

  // Client-side
  const eventSource = new EventSource('/api/migrate/products');
  eventSource.onmessage = (e) => {
    const { migrated, total, current } = JSON.parse(e.data);
    setProgress(migrated / total);
  };
}`}
            />

            <PatternCard
              title="Context-based Connection Management"
              description="WooCommerce and BigCommerce credentials with validation"
              code={`// Providers wrap the app
<ConnectionProvider>      {/* WC credentials */}
  <BCConnectionProvider>  {/* BC credentials */}
    <AssessmentProvider>  {/* Cached assessment data */}
      {children}
    </AssessmentProvider>
  </BCConnectionProvider>
</ConnectionProvider>

// Credentials stored in localStorage:
// wc-migration-connection, bc-migration-connection`}
            />

            <PatternCard
              title="Rate Limiting & Retry Strategy"
              description="BigCommerce API compliance with Bottleneck"
              code={`// BC rate limit: 150 requests / 30 seconds
const limiter = new Bottleneck({
  reservoir: 150,
  reservoirRefreshAmount: 150,
  reservoirRefreshInterval: 30 * 1000,
  maxConcurrent: 10
});

// Exponential backoff with p-retry
const result = await pRetry(
  () => bcClient.createProduct(data),
  { retries: 3, minTimeout: 1000 }
);`}
            />

            <PatternCard
              title="Path-based Theme Previews"
              description="Dynamic theming for Catalyst, Stencil, and Makeswift"
              code={`// preview-themes.ts
export const THEME_CONFIGS = {
  catalyst: {
    name: 'Catalyst',
    fonts: { heading: 'DM Serif Display', body: 'DM Sans' },
    colors: { primary: '#3B82F6', accent: '#8B5CF6' }
  },
  stencil: { /* Cornerstone defaults */ },
  makeswift: { /* Visual builder styles */ }
};

// Theme applied via URL: /preview?theme=catalyst`}
            />
          </div>
        </section>

        {/* API Routes Reference */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Server className="w-6 h-6 text-orange-400" />
            API Routes Reference
          </h2>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-300">
                    Endpoint
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-300">
                    Method
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-300">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <ApiRow
                  endpoint="/api/connect"
                  method="POST"
                  purpose="Validate WooCommerce credentials"
                />
                <ApiRow
                  endpoint="/api/bc/connect"
                  method="POST"
                  purpose="Validate BigCommerce credentials"
                />
                <ApiRow
                  endpoint="/api/assess/{entity}"
                  method="POST"
                  purpose="Fetch & analyze WC data (products, categories, etc.)"
                />
                <ApiRow
                  endpoint="/api/migrate/categories"
                  method="POST"
                  purpose="Migrate categories with hierarchy (SSE)"
                />
                <ApiRow
                  endpoint="/api/migrate/category"
                  method="POST"
                  purpose="Migrate products for single category (SSE)"
                />
                <ApiRow
                  endpoint="/api/migrate/customers"
                  method="POST"
                  purpose="Bulk customer migration"
                />
                <ApiRow
                  endpoint="/api/migrate/orders"
                  method="POST"
                  purpose="Historical order migration (V2 API)"
                />
                <ApiRow
                  endpoint="/api/validate/detailed"
                  method="POST"
                  purpose="Post-migration verification report"
                />
                <ApiRow
                  endpoint="/api/export/{type}"
                  method="POST"
                  purpose="Generate CSV exports"
                />
                <ApiRow
                  endpoint="/api/verify/{check}"
                  method="POST"
                  purpose="Go-live prerequisite checks"
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Development Guide */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-pink-400" />
            Development Guide
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                Getting Started
              </h3>
              <div className="space-y-4 text-sm">
                <CodeBlock
                  label="Install dependencies"
                  code="npm install"
                />
                <CodeBlock
                  label="Configure environment"
                  code={`cp .env.example .env
# Edit with WC/BC credentials`}
                />
                <CodeBlock
                  label="Start dashboard"
                  code={`cd src/dashboard
npm run dev`}
                />
                <CodeBlock
                  label="Run E2E tests"
                  code="npx playwright test"
                />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Environment Variables
              </h3>
              <div className="space-y-3 text-sm font-mono">
                <EnvVar name="WC_URL" desc="WooCommerce store URL" />
                <EnvVar name="WC_CONSUMER_KEY" desc="WC REST API key" />
                <EnvVar name="WC_CONSUMER_SECRET" desc="WC REST API secret" />
                <EnvVar name="BC_STORE_HASH" desc="BigCommerce store hash" />
                <EnvVar name="BC_ACCESS_TOKEN" desc="BC API access token" />
              </div>
            </div>
          </div>
        </section>

        {/* Key Dependencies */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Package className="w-6 h-6 text-yellow-400" />
            Key Dependencies
          </h2>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <DependencyCard
              name="@woocommerce/woocommerce-rest-api"
              version="^1.0.2"
              purpose="Official WC API client"
            />
            <DependencyCard
              name="bottleneck"
              version="^2.19.5"
              purpose="Rate limiting"
            />
            <DependencyCard
              name="zod"
              version="^3.24.1"
              purpose="Schema validation"
            />
            <DependencyCard
              name="pino"
              version="^9.6.0"
              purpose="Structured logging"
            />
            <DependencyCard
              name="p-retry"
              version="^6.2.1"
              purpose="Retry with backoff"
            />
            <DependencyCard
              name="lucide-react"
              version="^0.561.0"
              purpose="Icon library"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>BC Migration Tool &mdash; Internal Development Documentation</p>
          <p className="mt-2">
            For detailed migration specs, see{' '}
            <code className="text-slate-400">docs/MIGRATION_ARCHITECTURE.md</code>
          </p>
        </footer>
      </main>
    </div>
  );
}

// Component: Tech Stack Card
function TechCard({
  icon,
  title,
  description,
  details,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: 'blue' | 'cyan' | 'purple' | 'orange' | 'green' | 'pink';
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm mb-3">{description}</p>
      <ul className="space-y-1 text-xs text-slate-500">
        {details.map((detail, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Component: Pattern Card
function PatternCard({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      <pre className="p-4 text-xs text-slate-300 overflow-x-auto font-mono bg-slate-950/50">
        {code}
      </pre>
    </div>
  );
}

// Component: API Row
function ApiRow({
  endpoint,
  method,
  purpose,
}: {
  endpoint: string;
  method: string;
  purpose: string;
}) {
  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 font-mono text-cyan-400">{endpoint}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
          {method}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-400">{purpose}</td>
    </tr>
  );
}

// Component: Code Block
function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div>
      <p className="text-slate-400 mb-1">{label}</p>
      <pre className="bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}

// Component: Environment Variable
function EnvVar({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex justify-between items-center">
      <code className="text-cyan-400">{name}</code>
      <span className="text-slate-500 text-xs">{desc}</span>
    </div>
  );
}

// Component: Dependency Card
function DependencyCard({
  name,
  version,
  purpose,
}: {
  name: string;
  version: string;
  purpose: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <div className="font-mono text-sm text-slate-200 truncate">{name}</div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-slate-500">{purpose}</span>
        <span className="text-xs text-slate-600">{version}</span>
      </div>
    </div>
  );
}

// Component: Diagram Card
function DiagramCard({
  title,
  description,
  filename,
  path,
}: {
  title: string;
  description: string;
  filename: string;
  path: string;
}) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileImage className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">{title}</h3>
        </div>
        <a
          href={`https://github.com/nino-chavez/bc-migration/blob/main/src/dashboard/${path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <p className="text-slate-400 text-sm mb-3">{description}</p>
      <code className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
        {filename}
      </code>
    </div>
  );
}
