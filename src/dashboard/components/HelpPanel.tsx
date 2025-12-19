'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import {
  HelpCircle, ChevronDown, ChevronUp, Key, ExternalLink, Shield,
  Package, FolderTree, Users, ShoppingCart, Database, Settings, CheckCircle
} from 'lucide-react';

interface HelpSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function HelpSection({ title, icon: Icon, children, defaultOpen = false }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-slate-200">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
          {children}
        </div>
      )}
    </div>
  );
}

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[80vh] overflow-hidden">
      <Card className="bg-slate-900 border-slate-700 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            Help & Reference
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-3">
          {/* WC API Setup */}
          <HelpSection title="WooCommerce API Setup" icon={Key} defaultOpen>
            <div className="space-y-3 mt-3 text-sm">
              <p className="text-slate-400">
                To connect your WooCommerce store, you need REST API credentials:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>Go to your WordPress admin</li>
                <li>Navigate to <span className="text-cyan-400 font-mono text-xs">WooCommerce → Settings → Advanced → REST API</span></li>
                <li>Click <strong>"Add Key"</strong></li>
                <li>Set permissions to <strong>"Read"</strong></li>
                <li>Click <strong>"Generate API Key"</strong></li>
                <li>Copy the Consumer Key and Consumer Secret</li>
              </ol>
              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Your credentials are stored locally in your browser. They are never sent to our servers.
                </p>
              </div>
              <a
                href="https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:underline text-xs"
              >
                WooCommerce REST API Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </HelpSection>

          {/* BC Limits */}
          <HelpSection title="BigCommerce Limits Reference" icon={Settings}>
            <div className="space-y-4 mt-3 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-slate-200">Products</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-xs ml-6">
                  <li>Max variants per product: <span className="text-green-400">600</span></li>
                  <li>Max product name: <span className="text-slate-300">250 chars</span></li>
                  <li>Max SKU length: <span className="text-slate-300">250 chars</span></li>
                  <li>Max products: <span className="text-slate-300">Unlimited (plan dependent)</span></li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FolderTree className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-slate-200">Categories</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-xs ml-6">
                  <li>Max category depth: <span className="text-green-400">5 levels</span></li>
                  <li>Max categories: <span className="text-slate-300">16,000</span></li>
                  <li>Max name length: <span className="text-slate-300">255 chars</span></li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-slate-200">Customers</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-xs ml-6">
                  <li>Max customers: <span className="text-slate-300">Unlimited</span></li>
                  <li>Customer groups: <span className="text-green-400">Native feature</span></li>
                  <li>Price lists: <span className="text-green-400">Native feature</span></li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-slate-200">Orders</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-xs ml-6">
                  <li>Max orders: <span className="text-slate-300">Unlimited</span></li>
                  <li>Order statuses: <span className="text-slate-300">11 built-in + custom</span></li>
                  <li>Partial fulfillment: <span className="text-green-400">Native feature</span></li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium text-slate-200">Metafields</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-xs ml-6">
                  <li>Max per resource: <span className="text-slate-300">250</span></li>
                  <li>Max key length: <span className="text-slate-300">64 chars</span></li>
                  <li>Max value length: <span className="text-slate-300">65,535 chars</span></li>
                </ul>
              </div>
              <a
                href="https://developer.bigcommerce.com/docs/rest-catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:underline text-xs"
              >
                BigCommerce Catalog API Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </HelpSection>

          {/* Migration Checklist */}
          <HelpSection title="Pre-Migration Checklist" icon={CheckCircle}>
            <div className="space-y-2 mt-3 text-sm">
              <p className="text-slate-400 text-xs mb-3">
                Before starting your commerce upgrade:
              </p>
              <ul className="space-y-2">
                {[
                  'Run full assessment on all 7 areas',
                  'Review and resolve any blockers',
                  'Download redirect rules from SEO page',
                  'Prepare password reset email for customers',
                  'Export assessment report for records',
                  'Back up your WooCommerce database',
                  'Document any custom integrations',
                  'Review plugin mappings and alternatives'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                    <div className="w-4 h-4 border border-slate-600 rounded flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </HelpSection>

          {/* FAQ */}
          <HelpSection title="Frequently Asked Questions" icon={HelpCircle}>
            <div className="space-y-4 mt-3 text-sm">
              <div>
                <p className="text-slate-200 font-medium text-xs">What happens to my WordPress site?</p>
                <p className="text-slate-400 text-xs mt-1">
                  Your WordPress site stays exactly as it is! Only your WooCommerce commerce data moves to BigCommerce. Your blog, pages, theme, and SEO remain untouched.
                </p>
              </div>
              <div>
                <p className="text-slate-200 font-medium text-xs">Are customer passwords migrated?</p>
                <p className="text-slate-400 text-xs mt-1">
                  No. Passwords cannot be transferred between platforms for security reasons. Customers will need to reset their passwords after migration. We provide an email template for this.
                </p>
              </div>
              <div>
                <p className="text-slate-200 font-medium text-xs">What about my SEO rankings?</p>
                <p className="text-slate-400 text-xs mt-1">
                  We generate 301 redirect rules to preserve your SEO equity. Product URLs redirect seamlessly to BigCommerce while your WordPress content URLs remain unchanged.
                </p>
              </div>
              <div>
                <p className="text-slate-200 font-medium text-xs">Can I migrate orders?</p>
                <p className="text-slate-400 text-xs mt-1">
                  Yes, historical orders can be imported for reference. However, active orders should be fulfilled before migration to avoid confusion.
                </p>
              </div>
            </div>
          </HelpSection>

          {/* Contact */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium text-slate-200">Need more help?</p>
            <p className="text-xs text-slate-400 mt-1">
              Contact your BigCommerce partner or visit the BigCommerce help center.
            </p>
            <a
              href="https://support.bigcommerce.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:underline text-xs mt-2"
            >
              BigCommerce Help Center <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
