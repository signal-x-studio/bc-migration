'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Puzzle,
  Rocket,
  Scale,
  CheckCircle2,
  XCircle,
  Star,
  Building2,
  Paintbrush,
  Code2,
  Globe,
  FileCode,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  TrendingUp,
  Shield,
} from 'lucide-react';

type OptionId = 1 | 2 | 3 | 4;

interface ArchitectureOption {
  id: OptionId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  recommended?: boolean;
  description: string;
  wpRole: string;
  makeswiftRole: string;
  effort: 'Low' | 'Medium' | 'High';
  performance: 'Good' | 'Better' | 'Best';
  pros: string[];
  cons: string[];
  bestFor: string;
  techStack: string[];
  diagramFile: string;
}

const OPTIONS: ArchitectureOption[] = [
  {
    id: 1,
    title: 'Full Headless with Makeswift',
    subtitle: 'WordPress becomes headless CMS only',
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'from-purple-500/20 to-purple-600/10',
    description:
      'Makeswift + Next.js becomes the primary storefront. WordPress is demoted to a headless CMS, serving blog content via REST API. All commerce and visual page building happens in Makeswift.',
    wpRole: 'Headless CMS for blog/content only',
    makeswiftRole: 'Primary storefront with visual builder',
    effort: 'High',
    performance: 'Best',
    pros: [
      'Modern React/Next.js stack with best practices',
      'Visual editing empowers marketing team',
      'Best-in-class performance (edge-rendered)',
      'BigCommerce Catalyst starter available',
      'Future-proof architecture',
    ],
    cons: [
      'WordPress becomes headless only (major change)',
      'Lose investment in WordPress theme',
      'Content team must learn new tools',
      'Two systems to manage (Makeswift + WP headless)',
      'Higher initial development cost',
    ],
    bestFor:
      'Merchants ready to fully modernize who are not attached to their WordPress theme',
    techStack: ['Next.js 14+', 'React 18+', 'Makeswift SDK', 'BC Storefront GraphQL', 'WP REST API'],
    diagramFile: 'makeswift-option-1-full-headless.d2',
  },
  {
    id: 2,
    title: 'WordPress Primary + Makeswift Landing Pages',
    subtitle: 'Gradual adoption with minimal disruption',
    icon: <Puzzle className="w-6 h-6" />,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'from-blue-500/20 to-blue-600/10',
    description:
      'WordPress remains the primary website with BC Bridge plugin for commerce. Makeswift runs on a subdomain for high-value landing pages and campaigns only. Lowest risk approach.',
    wpRole: 'Primary website with BC Bridge plugin',
    makeswiftRole: 'Subdomain for landing pages only',
    effort: 'Low',
    performance: 'Good',
    pros: [
      'WordPress stays as primary platform',
      'Familiar tools for content team',
      'Gradual Makeswift adoption possible',
      'Preserves WordPress theme investment',
      'Lowest migration risk',
    ],
    cons: [
      'Split experience across two domains',
      'SEO complexity with multiple domains',
      'Limited Makeswift-WordPress integration',
      'Potentially inconsistent user experience',
      'Not fully leveraging Makeswift capabilities',
    ],
    bestFor:
      'Merchants who want to test Makeswift without committing to a full architecture change',
    techStack: ['WordPress', 'BC Bridge Plugin', 'Makeswift (subdomain)', 'BC REST APIs'],
    diagramFile: 'makeswift-option-2-wp-primary.d2',
  },
  {
    id: 3,
    title: 'Makeswift Storefront + WordPress Blog',
    subtitle: 'Best of both worlds',
    icon: <Scale className="w-6 h-6" />,
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'from-green-500/20 to-green-600/10',
    recommended: true,
    description:
      'Makeswift handles all commerce pages (homepage, PLPs, PDPs, cart, checkout) with visual builder capabilities. WordPress serves blog content via Next.js rewrites, maintaining a single domain experience.',
    wpRole: 'Headless blog via Next.js rewrites (/blog/*)',
    makeswiftRole: 'Full commerce storefront + landing pages',
    effort: 'Medium',
    performance: 'Best',
    pros: [
      'Best of both: Makeswift for commerce, WP for content',
      'Single domain experience (SEO-friendly)',
      'WordPress team keeps familiar blogging tools',
      'Commerce team gets visual page builder',
      'Modern performance with flexibility',
    ],
    cons: [
      'Requires Next.js/React development expertise',
      'WordPress reduced to blog-only role',
      'Initial setup complexity',
      'Two deployments to coordinate',
    ],
    bestFor:
      'Mid-market merchants with active blogs and marketing teams who need visual control over commerce pages',
    techStack: ['Next.js 14+', 'Makeswift SDK', 'BC Storefront GraphQL', 'WP REST API', 'Vercel/WPE Headless'],
    diagramFile: 'makeswift-option-3-hybrid.d2',
  },
  {
    id: 4,
    title: 'Catalyst + Makeswift',
    subtitle: "BigCommerce's official headless starter",
    icon: <Zap className="w-6 h-6" />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'from-emerald-500/20 to-emerald-600/10',
    description:
      "Start with BigCommerce's official Catalyst starter which includes pre-built commerce components and native Makeswift integration. WordPress can be retired entirely or kept as an optional blog feed.",
    wpRole: 'Optional - can be retired or used for blog feed',
    makeswiftRole: 'Visual layer on top of Catalyst components',
    effort: 'Medium',
    performance: 'Best',
    pros: [
      'Fastest path to modern headless commerce',
      'Officially supported by BigCommerce',
      'Makeswift integration built-in',
      'Single vendor relationship',
      'Best practices and patterns included',
    ],
    cons: [
      'WordPress essentially deprecated',
      'Learning curve for existing content team',
      'Less flexible than fully custom build',
      'Tied to Catalyst patterns and updates',
    ],
    bestFor:
      'Merchants ready to modernize with a BigCommerce-supported path and minimal custom development',
    techStack: ['Catalyst (Next.js)', 'Makeswift SDK', 'BC Storefront GraphQL', 'Vercel/Netlify'],
    diagramFile: 'makeswift-option-4-catalyst.d2',
  },
];

export default function MakeswiftGuidePage() {
  const [expandedOption, setExpandedOption] = useState<OptionId | null>(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

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
              <h1 className="text-xl font-bold">Makeswift Architecture Guide</h1>
              <p className="text-sm text-slate-400">
                Key decisions for WooCommerce → BigCommerce migrations with Makeswift
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Introduction */}
        <section className="max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">
            Keeping WordPress While Leveraging Makeswift
          </h2>
          <p className="text-lg text-slate-300 mb-6">
            When migrating from WooCommerce to BigCommerce, merchants often want to preserve their
            WordPress investment while gaining access to modern commerce capabilities.{' '}
            <span className="text-purple-400 font-medium">Makeswift</span>, BigCommerce&apos;s visual
            page builder, offers powerful options for creating dynamic storefronts without
            sacrificing flexibility.
          </p>
          <p className="text-slate-400">
            This guide explores four architecture patterns, each with different trade-offs between
            WordPress preservation, Makeswift adoption, and technical complexity.
          </p>
        </section>

        {/* What is Makeswift */}
        <section className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-purple-500/20 rounded-xl">
              <Paintbrush className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">What is Makeswift?</h3>
              <p className="text-slate-300 mb-4">
                Makeswift is BigCommerce&apos;s visual page builder (acquired 2022), designed for
                headless commerce storefronts. It enables marketing teams to create and edit pages
                visually without developer involvement.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <Code2 className="w-5 h-5 text-purple-400 mb-2" />
                  <h4 className="font-medium mb-1">Built on Next.js</h4>
                  <p className="text-slate-400">
                    Modern React framework with server-side rendering and edge deployment
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <Paintbrush className="w-5 h-5 text-purple-400 mb-2" />
                  <h4 className="font-medium mb-1">Visual Editor</h4>
                  <p className="text-slate-400">
                    Drag-and-drop interface overlays your live site for real-time editing
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <Globe className="w-5 h-5 text-purple-400 mb-2" />
                  <h4 className="font-medium mb-1">BC Integration</h4>
                  <p className="text-slate-400">
                    Native connection to BigCommerce Storefront GraphQL API
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decision Factors */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Scale className="w-6 h-6 text-blue-400" />
            Key Decision Factors
          </h2>
          <p className="text-slate-400 mb-6">
            Select the factors most important to your merchant to help identify the best architecture:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <FactorButton
              label="Preserve WP Investment"
              icon={<Building2 className="w-5 h-5" />}
              selected={selectedFactors.includes('wp-investment')}
              onClick={() => toggleFactor('wp-investment')}
              recommendation="Option 2"
            />
            <FactorButton
              label="Best Performance"
              icon={<TrendingUp className="w-5 h-5" />}
              selected={selectedFactors.includes('performance')}
              onClick={() => toggleFactor('performance')}
              recommendation="Options 1, 3, 4"
            />
            <FactorButton
              label="Visual Page Builder"
              icon={<Paintbrush className="w-5 h-5" />}
              selected={selectedFactors.includes('visual-builder')}
              onClick={() => toggleFactor('visual-builder')}
              recommendation="Options 1, 3, 4"
            />
            <FactorButton
              label="Minimal Disruption"
              icon={<Shield className="w-5 h-5" />}
              selected={selectedFactors.includes('minimal-disruption')}
              onClick={() => toggleFactor('minimal-disruption')}
              recommendation="Option 2"
            />
            <FactorButton
              label="Active Blog/Content"
              icon={<FileCode className="w-5 h-5" />}
              selected={selectedFactors.includes('active-blog')}
              onClick={() => toggleFactor('active-blog')}
              recommendation="Option 3"
            />
            <FactorButton
              label="BC-Supported Path"
              icon={<CheckCircle2 className="w-5 h-5" />}
              selected={selectedFactors.includes('bc-supported')}
              onClick={() => toggleFactor('bc-supported')}
              recommendation="Option 4"
            />
            <FactorButton
              label="Marketing Autonomy"
              icon={<Users className="w-5 h-5" />}
              selected={selectedFactors.includes('marketing-autonomy')}
              onClick={() => toggleFactor('marketing-autonomy')}
              recommendation="Options 1, 3, 4"
            />
            <FactorButton
              label="Single Domain"
              icon={<Globe className="w-5 h-5" />}
              selected={selectedFactors.includes('single-domain')}
              onClick={() => toggleFactor('single-domain')}
              recommendation="Options 1, 3, 4"
            />
          </div>
        </section>

        {/* Architecture Options */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Layers className="w-6 h-6 text-purple-400" />
            Architecture Options
          </h2>

          <div className="space-y-4">
            {OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                expanded={expandedOption === option.id}
                onToggle={() =>
                  setExpandedOption(expandedOption === option.id ? null : option.id)
                }
              />
            ))}
          </div>
        </section>

        {/* Comparison Matrix */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Scale className="w-6 h-6 text-cyan-400" />
            Comparison Matrix
          </h2>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-300">Factor</th>
                  <th className="text-center px-4 py-3 font-medium text-purple-400">
                    Option 1
                    <br />
                    <span className="text-xs font-normal text-slate-500">Full Headless</span>
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-blue-400">
                    Option 2
                    <br />
                    <span className="text-xs font-normal text-slate-500">WP Primary</span>
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-green-400">
                    Option 3
                    <br />
                    <span className="text-xs font-normal text-slate-500">Hybrid</span>
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-emerald-400">
                    Option 4
                    <br />
                    <span className="text-xs font-normal text-slate-500">Catalyst</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <ComparisonRow
                  label="WordPress Role"
                  values={['Headless CMS', 'Primary', 'Blog Only', 'Optional']}
                />
                <ComparisonRow
                  label="Makeswift Usage"
                  values={['Full', 'Landing Pages', 'Commerce + Pages', 'Full']}
                />
                <ComparisonRow
                  label="Migration Effort"
                  values={['High', 'Low', 'Medium', 'Medium']}
                  highlight={[false, true, false, false]}
                />
                <ComparisonRow
                  label="Performance"
                  values={['Best', 'Good', 'Best', 'Best']}
                  highlight={[true, false, true, true]}
                />
                <ComparisonRow
                  label="Content Team Impact"
                  values={['High', 'Low', 'Medium', 'High']}
                />
                <ComparisonRow
                  label="Technical Complexity"
                  values={['High', 'Low', 'High', 'Medium']}
                />
                <ComparisonRow
                  label="BC/WPE Alignment"
                  values={['Good', 'OK', 'Good', 'Best']}
                  highlight={[false, false, false, true]}
                />
                <ComparisonRow
                  label="Single Domain"
                  values={['Yes', 'No', 'Yes', 'Yes']}
                  highlight={[true, false, true, true]}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommendations */}
        <section className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            Our Recommendations
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="font-bold text-lg text-green-400">Primary Recommendation</h3>
              </div>
              <h4 className="font-semibold mb-2">Option 3: Hybrid Architecture</h4>
              <p className="text-slate-400 text-sm mb-4">
                Best balance of modern commerce capabilities with preserved content investment.
                Ideal for merchants with active blogs who want visual page building for commerce.
              </p>
              <p className="text-xs text-slate-500">
                Choose this if: Significant blog content, marketing team needs visual control,
                want best performance
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-emerald-400">Alternative</h3>
              </div>
              <h4 className="font-semibold mb-2">Option 4: Catalyst + Makeswift</h4>
              <p className="text-slate-400 text-sm mb-4">
                Fastest path with BigCommerce official support. Best for merchants ready to fully
                commit to the BC ecosystem with minimal custom development.
              </p>
              <p className="text-xs text-slate-500">
                Choose this if: Ready to modernize fully, want BC-supported path, minimal blog
                content
              </p>
            </div>
          </div>
        </section>

        {/* D2 Diagrams */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FileCode className="w-6 h-6 text-indigo-400" />
            Architecture Diagrams (D2)
          </h2>

          <p className="text-slate-400 mb-6">
            Detailed D2 diagrams for each option, ready for Excalidraw export or CLI rendering.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`bg-gradient-to-br ${option.bgColor} border ${option.borderColor} rounded-xl p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className={`w-5 h-5 ${option.color}`} />
                    <h3 className="font-semibold">Option {option.id}</h3>
                    {option.recommended && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://github.com/nino-chavez/bc-migration/blob/main/src/dashboard/app/demo/architecture/diagrams/${option.diagramFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-slate-400 text-sm mb-3">{option.subtitle}</p>
                <code className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                  {option.diagramFile}
                </code>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm">
            <h4 className="font-medium text-slate-200 mb-2">Render All Diagrams</h4>
            <pre className="text-slate-400 font-mono text-xs">{`# Render all Makeswift option diagrams
for f in diagrams/makeswift-option-*.d2; do
  d2 "$f" "\${f%.d2}.svg" --theme 200
done`}</pre>
          </div>
        </section>

        {/* Next Steps */}
        <section className="border-t border-slate-800 pt-8">
          <h2 className="text-xl font-bold mb-4">Next Steps</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/demo/architecture"
              className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <Layers className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-medium">Technical Architecture</h3>
                <p className="text-sm text-slate-500">View system diagrams</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 ml-auto" />
            </Link>
            <a
              href="https://www.makeswift.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <Paintbrush className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-medium">Makeswift Docs</h3>
                <p className="text-sm text-slate-500">Official documentation</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 ml-auto" />
            </a>
            <a
              href="https://www.catalyst.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-medium">Catalyst Starter</h3>
                <p className="text-sm text-slate-500">BC headless template</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 ml-auto" />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>BC Migration Tool &mdash; Makeswift Architecture Decision Guide</p>
          <p className="mt-2">
            For technical implementation details, see{' '}
            <Link href="/demo/architecture" className="text-blue-400 hover:underline">
              Architecture Overview
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

// Component: Factor Button
function FactorButton({
  label,
  icon,
  selected,
  onClick,
  recommendation,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  recommendation: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all ${
        selected
          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <p className="text-xs text-slate-500">
        Favors: <span className={selected ? 'text-blue-400' : ''}>{recommendation}</span>
      </p>
    </button>
  );
}

// Component: Option Card
function OptionCard({
  option,
  expanded,
  onToggle,
}: {
  option: ArchitectureOption;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${option.bgColor} border ${option.borderColor} rounded-xl overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-center gap-4"
      >
        <div className={`p-3 bg-slate-900/50 rounded-xl ${option.color}`}>
          {option.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Option {option.id}: {option.title}</h3>
            {option.recommended && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400" />
                Recommended
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">{option.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-500">Effort:</span>{' '}
              <span className={option.effort === 'Low' ? 'text-green-400' : option.effort === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>
                {option.effort}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Performance:</span>{' '}
              <span className={option.performance === 'Best' ? 'text-green-400' : 'text-yellow-400'}>
                {option.performance}
              </span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-700/50 space-y-6">
          {/* Description */}
          <p className="text-slate-300">{option.description}</p>

          {/* Roles */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-1">WordPress Role</h4>
              <p className="text-slate-300 text-sm">{option.wpRole}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-400 mb-1">Makeswift Role</h4>
              <p className="text-slate-300 text-sm">{option.makeswiftRole}</p>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Advantages
              </h4>
              <ul className="space-y-2">
                {option.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Considerations
              </h4>
              <ul className="space-y-2">
                {option.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best For */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-200 mb-1">Best For</h4>
            <p className="text-slate-400 text-sm">{option.bestFor}</p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {option.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Comparison Row
function ComparisonRow({
  label,
  values,
  highlight = [false, false, false, false],
}: {
  label: string;
  values: string[];
  highlight?: boolean[];
}) {
  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 font-medium text-slate-300">{label}</td>
      {values.map((value, i) => (
        <td
          key={i}
          className={`px-4 py-3 text-center ${
            highlight[i] ? 'text-green-400 font-medium' : 'text-slate-400'
          }`}
        >
          {value}
        </td>
      ))}
    </tr>
  );
}
