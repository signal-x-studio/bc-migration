'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Key,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import {
  loadSetupWizardState,
  saveSetupWizardState,
  saveBCCredentials,
  clearSetupWizardState,
} from '@/lib/storage';
import type { SetupWizardStep, SetupWizardState, BCCredentials } from '@/lib/types';

const STEPS: { id: SetupWizardStep; title: string; description: string }[] = [
  { id: 'welcome', title: 'Welcome', description: 'Get started with BigCommerce' },
  { id: 'create-account', title: 'Create Account', description: 'Sign up for BigCommerce' },
  { id: 'store-hash', title: 'Store Hash', description: 'Find your store identifier' },
  { id: 'api-token', title: 'API Token', description: 'Create API credentials' },
  { id: 'verify', title: 'Verify', description: 'Test your connection' },
];

const REQUIRED_SCOPES = [
  'Products (modify)',
  'Customers (modify)',
  'Orders (modify)',
  'Content (modify)',
  'Store Inventory (modify)',
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupWizardStep>('welcome');
  const [hasExistingAccount, setHasExistingAccount] = useState<boolean | null>(null);
  const [storeHash, setStoreHash] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [copiedScope, setCopiedScope] = useState<string | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadSetupWizardState();
    if (saved) {
      setStep(saved.currentStep);
      setHasExistingAccount(saved.hasExistingAccount);
      if (saved.storeHash) setStoreHash(saved.storeHash);
      if (saved.accessToken) setAccessToken(saved.accessToken);
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    if (step !== 'welcome' || hasExistingAccount !== null) {
      const state: SetupWizardState = {
        currentStep: step,
        hasExistingAccount: hasExistingAccount ?? false,
        storeHash: storeHash || undefined,
        accessToken: accessToken || undefined,
        verificationStatus: verificationSuccess ? 'success' : verificationError ? 'failed' : 'pending',
        lastUpdated: new Date().toISOString(),
      };
      saveSetupWizardState(state);
    }
  }, [step, hasExistingAccount, storeHash, accessToken, verificationSuccess, verificationError]);

  const goToStep = (newStep: SetupWizardStep) => {
    setStep(newStep);
    setVerificationError(null);
  };

  const handleAccountChoice = (hasAccount: boolean) => {
    setHasExistingAccount(hasAccount);
    if (hasAccount) {
      goToStep('store-hash');
    } else {
      goToStep('create-account');
    }
  };

  const verifyConnection = async () => {
    if (!storeHash || !accessToken) {
      setVerificationError('Please enter both Store Hash and Access Token');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch('/api/bc/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeHash, accessToken }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Connection failed');
      }

      // Save credentials
      const credentials: BCCredentials = { storeHash, accessToken };
      saveBCCredentials(credentials);
      setVerificationSuccess(true);

      // Clear wizard state after success
      setTimeout(() => {
        clearSetupWizardState();
        router.push('/migrate');
      }, 2000);

    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScope(label);
    setTimeout(() => setCopiedScope(null), 2000);
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  // Step Progress Indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, index) => (
        <div key={s.id} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index < currentStepIndex
                ? 'bg-green-500 text-white'
                : index === currentStepIndex
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {index < currentStepIndex ? (
              <Check className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 ${
                index < currentStepIndex ? 'bg-green-500' : 'bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Store className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BigCommerce Setup</h1>
              <p className="text-sm text-slate-400">
                {STEPS[currentStepIndex]?.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <StepIndicator />

        {/* Welcome Step */}
        {step === 'welcome' && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-white mb-4 text-center">
                Do you have a BigCommerce account?
              </h2>
              <p className="text-slate-400 text-center mb-8">
                We&apos;ll guide you through connecting your BigCommerce store.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleAccountChoice(true)}
                  className="p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="text-lg font-medium text-white mb-2">
                    Yes, I have an account
                  </div>
                  <p className="text-sm text-slate-400">
                    I&apos;ll enter my store credentials
                  </p>
                </button>
                <button
                  onClick={() => handleAccountChoice(false)}
                  className="p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="text-lg font-medium text-white mb-2">
                    No, I need to create one
                  </div>
                  <p className="text-sm text-slate-400">
                    Guide me through signup
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Account Step */}
        {step === 'create-account' && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Create Your BigCommerce Account
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-medium">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Start a free trial</div>
                    <p className="text-sm text-slate-400 mb-3">
                      BigCommerce offers a 15-day free trial with full access.
                    </p>
                    <a
                      href="https://www.bigcommerce.com/start-your-trial/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Start Free Trial
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-medium">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Complete signup</div>
                    <p className="text-sm text-slate-400">
                      Enter your email, create a password, and name your store.
                      You can skip the onboarding wizard for now.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-medium">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Access your dashboard</div>
                    <p className="text-sm text-slate-400">
                      Once created, you&apos;ll be in the BigCommerce admin dashboard.
                      Come back here when ready.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => goToStep('welcome')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button variant="primary" onClick={() => goToStep('store-hash')}>
                  I&apos;ve Created My Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Hash Step */}
        {step === 'store-hash' && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Find Your Store Hash
              </h2>

              <Alert variant="info">
                <HelpCircle className="w-4 h-4" />
                <div>
                  Your store hash is a unique identifier that looks like: <code className="bg-slate-700 px-1 rounded">abc123xyz</code>
                </div>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="font-medium text-white mb-2">How to find it:</div>
                  <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Log in to your BigCommerce admin dashboard</li>
                    <li>Look at the URL in your browser</li>
                    <li>Copy the hash from: <code className="bg-slate-700 px-1 rounded">store-<span className="text-green-400">[your-hash]</span>.mybigcommerce.com</code></li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Store Hash
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., abc123xyz"
                    value={storeHash}
                    onChange={(e) => setStoreHash(e.target.value.trim())}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={() => goToStep(hasExistingAccount ? 'welcome' : 'create-account')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => goToStep('api-token')}
                  disabled={!storeHash}
                >
                  Next: Create API Token
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Token Step */}
        {step === 'api-token' && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Create API Credentials
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="font-medium text-white mb-3">Steps to create API token:</div>
                  <ol className="text-sm text-slate-400 space-y-3 list-decimal list-inside">
                    <li>
                      Go to{' '}
                      <a
                        href={`https://store-${storeHash}.mybigcommerce.com/manage/settings/api-accounts`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Settings → API Accounts
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>Click &quot;Create API Account&quot; → &quot;Create V2/V3 API Token&quot;</li>
                    <li>Name it &quot;WC Migration Tool&quot;</li>
                    <li>Set the required scopes (see below)</li>
                    <li>Click &quot;Save&quot; and copy the Access Token</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="font-medium text-white mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Required API Scopes (set to Modify)
                  </div>
                  <div className="space-y-2">
                    {REQUIRED_SCOPES.map((scope) => (
                      <div
                        key={scope}
                        className="flex items-center justify-between p-2 bg-slate-700/50 rounded"
                      >
                        <span className="text-sm text-slate-300">{scope}</span>
                        <button
                          onClick={() => copyToClipboard(scope, scope)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          {copiedScope === scope ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert variant="warning">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <strong>Important:</strong> Copy your Access Token immediately after creation.
                    BigCommerce only shows it once!
                  </div>
                </Alert>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Access Token
                  </label>
                  <Input
                    type="password"
                    placeholder="Paste your access token here"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value.trim())}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => goToStep('store-hash')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => goToStep('verify')}
                  disabled={!accessToken}
                >
                  Next: Verify Connection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h2 className="text-xl font-semibold text-white text-center">
                Verify Your Connection
              </h2>

              <div className="p-6 bg-slate-800/50 rounded-lg text-center">
                <div className="text-sm text-slate-400 mb-2">Store Hash</div>
                <div className="text-lg font-mono text-white mb-4">{storeHash}</div>
                <div className="text-sm text-slate-400 mb-2">Access Token</div>
                <div className="text-lg font-mono text-white">
                  {accessToken.substring(0, 8)}...{accessToken.substring(accessToken.length - 4)}
                </div>
              </div>

              {verificationError && (
                <Alert variant="error">
                  <AlertTriangle className="w-4 h-4" />
                  <div>{verificationError}</div>
                </Alert>
              )}

              {verificationSuccess && (
                <Alert variant="success">
                  <CheckCircle2 className="w-4 h-4" />
                  <div>
                    <strong>Connection successful!</strong> Redirecting to migration page...
                  </div>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={verifyConnection}
                  disabled={isVerifying || verificationSuccess}
                  className="px-8"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : verificationSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Connected!
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => goToStep('api-token')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
