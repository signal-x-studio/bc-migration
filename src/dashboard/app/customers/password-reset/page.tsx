'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Key,
  Mail,
  Download,
  Copy,
  Check,
  ExternalLink,
  Users,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { loadBCCredentials, loadCustomerMigrationState } from '@/lib/storage';
import type { BCCredentials, CustomerMigrationState } from '@/lib/types';

const EMAIL_TEMPLATE = `Subject: Reset Your Password - Important Update

Dear [Customer Name],

We've recently upgraded our e-commerce platform to provide you with a better shopping experience.

To continue accessing your account, please reset your password using the link below:

[Reset Password Link]

If you did not have an account with us or no longer wish to use our services, you can safely ignore this email.

Thank you for being a valued customer!

Best regards,
[Your Store Name]
`;

const HTML_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 40px; text-align: center; background: #0d1117;">
        <h1 style="margin: 0; color: white; font-size: 24px;">Password Reset Required</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          Dear [Customer Name],
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          We've recently upgraded our e-commerce platform to provide you with a better shopping experience.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
          To continue accessing your account, please click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="[Reset Password Link]" style="display: inline-block; padding: 14px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset My Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
          If you did not have an account with us or no longer wish to use our services, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
          [Your Store Name] | [Your Store Address]
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

export default function PasswordResetPage() {
  const [bcCredentials, setBcCredentials] = useState<BCCredentials | null>(null);
  const [migrationState, setMigrationState] = useState<CustomerMigrationState | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');

  // Load state on mount
  useEffect(() => {
    const savedBc = loadBCCredentials();
    if (savedBc) {
      setBcCredentials(savedBc);

      // Try to load migration state
      const migState = loadCustomerMigrationState('', savedBc.storeHash);
      if (migState) {
        setMigrationState(migState);
      }
    }
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCSV = () => {
    if (!migrationState?.migratedEmails?.length) return;

    const csvContent = [
      'email',
      ...migrationState.migratedEmails,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migrated-customer-emails.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getCustomizedTemplate = (template: string) => {
    return template.replace(/\[Your Store Name\]/g, storeName || '[Your Store Name]');
  };

  const bcAdminUrl = bcCredentials
    ? `https://store-${bcCredentials.storeHash}.mybigcommerce.com/manage/customers`
    : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Password Reset</h1>
              <p className="text-sm text-slate-400">
                Help customers reset their passwords after migration
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Info Banner */}
        <Alert variant="info">
          <Info className="w-4 h-4" />
          <div>
            <strong>Why Password Resets Are Required</strong>
            <p className="text-sm mt-1">
              WooCommerce and BigCommerce use different password hashing methods.
              For security, customers must set new passwords on your BigCommerce store.
              All migrated customers have <code className="bg-slate-700 px-1 rounded">force_password_reset: true</code>.
            </p>
          </div>
        </Alert>

        {/* Migration Stats */}
        {migrationState?.stats && (
          <Card variant="bordered">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-400">
                    {migrationState.stats.successful}
                  </div>
                  <div className="text-sm text-slate-400">Customers Migrated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">
                    {migrationState.migratedEmails?.length || 0}
                  </div>
                  <div className="text-sm text-slate-400">Email Addresses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {migrationState.stats.successful}
                  </div>
                  <div className="text-sm text-slate-400">Need Password Reset</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Migration Warning */}
        {!migrationState?.stats && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4" />
            <div>
              <strong>No Customer Migration Found</strong>
              <p className="text-sm mt-1">
                You haven&apos;t migrated any customers yet.{' '}
                <Link href="/migrate" className="text-blue-400 hover:underline">
                  Go to Migration page
                </Link>{' '}
                to migrate customers first.
              </p>
            </div>
          </Alert>
        )}

        {/* Option 1: BC Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Option 1: BigCommerce Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              BigCommerce shows a &quot;Reset Password Required&quot; flag for migrated customers.
              When customers attempt to log in, they&apos;ll be prompted to reset their password automatically.
            </p>
            {bcAdminUrl ? (
              <Button
                variant="primary"
                onClick={() => window.open(bcAdminUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open BC Customer Admin
              </Button>
            ) : (
              <p className="text-sm text-slate-500">
                Connect your BigCommerce store to access the admin panel.
              </p>
            )}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">How it works:</h4>
              <ol className="text-sm text-slate-400 list-decimal list-inside space-y-1">
                <li>Customer visits your BC store login page</li>
                <li>BC detects <code className="bg-slate-700 px-1 rounded">force_password_reset</code> flag</li>
                <li>Customer is prompted to set a new password</li>
                <li>After reset, they can shop normally</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: Email Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" />
              Option 2: Email Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Proactively notify customers about the platform upgrade and password reset requirement.
              Copy this template for your email marketing tool.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Store Name (for template)
              </label>
              <Input
                type="text"
                placeholder="Your Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            {/* Plain Text Template */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Plain Text Template
                </label>
                <button
                  onClick={() => copyToClipboard(getCustomizedTemplate(EMAIL_TEMPLATE), 'plain')}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                >
                  {copied === 'plain' ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {getCustomizedTemplate(EMAIL_TEMPLATE)}
              </pre>
            </div>

            {/* HTML Template */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  HTML Email Template
                </label>
                <button
                  onClick={() => copyToClipboard(getCustomizedTemplate(HTML_EMAIL_TEMPLATE), 'html')}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                >
                  {copied === 'html' ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy HTML
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">
                  Professional HTML template ready for email marketing tools.
                </p>
                <details>
                  <summary className="text-sm text-blue-400 cursor-pointer hover:underline">
                    View HTML Source
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto max-h-60">
                    {getCustomizedTemplate(HTML_EMAIL_TEMPLATE)}
                  </pre>
                </details>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 3: CSV Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-400" />
              Option 3: Export for Email Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Download a CSV of migrated customer emails to import into your email marketing platform
              (Mailchimp, Klaviyo, etc.).
            </p>

            {migrationState?.migratedEmails?.length ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={downloadCSV}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV ({migrationState.migratedEmails.length} emails)
                </Button>
                <span className="text-sm text-slate-500">
                  Compatible with Mailchimp, Klaviyo, SendGrid, etc.
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No migrated customer emails available. Complete customer migration first.
              </p>
            )}

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Recommended Email Services:</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <strong>Mailchimp</strong> - Import CSV, create campaign with template above
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <strong>Klaviyo</strong> - BigCommerce integration for automated flows
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <strong>SendGrid</strong> - Transactional email with dynamic templates
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-400">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>
                  <strong className="text-white">Send proactive emails</strong> - Don&apos;t wait for customers to discover login issues
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>
                  <strong className="text-white">Frame it as an upgrade</strong> - Position the migration as an improvement, not an inconvenience
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>
                  <strong className="text-white">Include direct reset link</strong> - BigCommerce forgot password URL: <code className="bg-slate-700 px-1 rounded">https://your-store.mybigcommerce.com/login.php?action=reset_password</code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>
                  <strong className="text-white">Test the flow</strong> - Create a test customer and verify the reset process works
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">!</span>
                <span>
                  <strong className="text-white">Customer service prep</strong> - Brief your support team on the migration and reset process
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="flex justify-between items-center pt-4">
          <Link href="/go-live">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Go-Live Checklist
            </Button>
          </Link>
          <Link href="/validate">
            <Button variant="primary">
              Validate Migration
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
