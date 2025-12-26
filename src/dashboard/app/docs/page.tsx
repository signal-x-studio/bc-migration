import Link from 'next/link';
import { BookOpen, Code, Users, TrendingUp } from 'lucide-react';
import { getAllDocs } from '@/lib/docs/loader';

export default function DocsHomePage() {
  const docs = getAllDocs();
  
  const personaLinks = [
    {
      title: 'For Merchants',
      description: 'Get started migrating your WooCommerce store',
      href: '/docs/getting-started/for-merchants',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'For Developers',
      description: 'Technical setup and integration guides',
      href: '/docs/getting-started/for-developers',
      icon: Code,
      color: 'green',
    },
    {
      title: 'For Stakeholders',
      description: 'Business context and strategic overview',
      href: '/docs/getting-started/for-stakeholders',
      icon: TrendingUp,
      color: 'purple',
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-100 mb-4">
          BC Migration Documentation
        </h1>
        <p className="text-xl text-slate-400">
          Complete guide to migrating from WooCommerce to BigCommerce
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {personaLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600 hover:bg-slate-900/70 transition-all group"
            >
              <Icon className="w-8 h-8 text-slate-300 mb-4" />
              <h2 className="text-xl font-semibold text-slate-100 mb-2 group-hover:text-slate-50 transition-colors">
                {link.title}
              </h2>
              <p className="text-slate-400 text-sm">{link.description}</p>
            </Link>
          );
        })}
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/docs/guides/assessment/HOW_TO_ASSESS" className="text-slate-300 hover:text-slate-100 transition-colors">
                Run an Assessment
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/migration/getting-started" className="text-slate-300 hover:text-slate-100 transition-colors">
                Start Migration
              </Link>
            </li>
            <li>
              <Link href="/docs/reference/api/woocommerce-api" className="text-slate-300 hover:text-slate-100 transition-colors">
                API Reference
              </Link>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">Documentation Sections</h2>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/docs/getting-started" className="hover:text-slate-200 transition-colors">Getting Started</Link></li>
            <li><Link href="/docs/platform" className="hover:text-slate-200 transition-colors">Platform</Link></li>
            <li><Link href="/docs/guides" className="hover:text-slate-200 transition-colors">Guides</Link></li>
            <li><Link href="/docs/reference" className="hover:text-slate-200 transition-colors">Reference</Link></li>
            <li><Link href="/docs/resources" className="hover:text-slate-200 transition-colors">Resources</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

