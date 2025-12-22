'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Loader2, AlertCircle, CheckCircle, Code } from 'lucide-react';
import { useConnection } from '../../lib/contexts/ConnectionContext';
import { useBCConnection } from '../../lib/contexts/BCConnectionContext';

type DemoStatus = 'loading' | 'connecting' | 'success' | 'error';

interface DemoCredentials {
  success: boolean;
  error?: string;
  wc?: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  bc?: {
    storeHash: string;
    accessToken: string;
  } | null;
}

export default function DemoPage() {
  const router = useRouter();
  const { connect: connectWC, isConnected: wcConnected } = useConnection();
  const { connect: connectBC } = useBCConnection();

  const [status, setStatus] = useState<DemoStatus>('loading');
  const [message, setMessage] = useState('Loading demo credentials...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already connected, redirect to home
    if (wcConnected) {
      router.push('/');
      return;
    }

    async function initDemo() {
      try {
        // Fetch demo credentials from API
        setStatus('loading');
        setMessage('Fetching demo credentials...');

        const response = await fetch('/api/demo');
        const data: DemoCredentials = await response.json();

        if (!data.success || !data.wc) {
          setStatus('error');
          setError(data.error || 'Failed to load demo credentials');
          return;
        }

        // Connect to WooCommerce
        setStatus('connecting');
        setMessage('Connecting to demo WooCommerce store...');

        const wcSuccess = await connectWC({
          url: data.wc.url,
          consumerKey: data.wc.consumerKey,
          consumerSecret: data.wc.consumerSecret,
        }, true);

        if (!wcSuccess) {
          setStatus('error');
          setError('Failed to connect to WooCommerce store');
          return;
        }

        // Connect to BigCommerce if credentials are available
        if (data.bc) {
          setMessage('Connecting to BigCommerce...');
          await connectBC({
            storeHash: data.bc.storeHash,
            accessToken: data.bc.accessToken,
          });
        }

        setStatus('success');
        setMessage('Connected successfully! Redirecting...');

        // Redirect to home page after short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);

      } catch (err) {
        console.error('Demo init error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }

    initDemo();
  }, [connectWC, connectBC, router, wcConnected]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Demo Mode
          </h1>
          <p className="text-slate-400 mb-8">
            Internal stakeholder preview
          </p>

          {/* Status Display */}
          <div className="flex flex-col items-center gap-4">
            {status === 'loading' || status === 'connecting' ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-slate-300">{message}</p>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-400" />
                <p className="text-green-400">{message}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-red-400" />
                <div className="text-red-400">
                  <p className="font-medium mb-2">Connection Failed</p>
                  <p className="text-sm text-slate-400">{error}</p>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Go to Manual Setup
                </button>
              </>
            )}
          </div>

          {/* Demo Notice */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              This demo uses pre-configured credentials for internal previews.
              <br />
              For production use, enter your own API credentials.
            </p>
          </div>

          {/* Developer Links */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <Link
              href="/demo/architecture"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm"
            >
              <Code className="w-4 h-4" />
              View Architecture Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
