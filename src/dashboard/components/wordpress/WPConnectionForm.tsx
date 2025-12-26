'use client';

import { useState } from 'react';
import { useWPConnection } from '@/lib/contexts/WPConnectionContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle2, Loader2, Globe, Unplug } from 'lucide-react';

interface WPConnectionFormProps {
  onConnected?: () => void;
}

export function WPConnectionForm({ onConnected }: WPConnectionFormProps) {
  const {
    isConnected,
    isLoading,
    error,
    siteInfo,
    siteUrl,
    connect,
    disconnect,
    rememberMe,
    setRememberMe,
  } = useWPConnection();

  const [url, setUrl] = useState(siteUrl || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    const success = await connect(url.trim(), rememberMe);
    if (success && onConnected) {
      onConnected();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setUrl('');
  };

  if (isConnected && siteInfo) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-green-500/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-slate-100">{siteInfo.name || 'WordPress Site'}</h3>
              <p className="mt-0.5 text-sm text-slate-400">{siteInfo.url}</p>
              {siteInfo.description && (
                <p className="mt-1 text-xs text-slate-500">{siteInfo.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="text-slate-400 hover:text-slate-100"
          >
            <Unplug className="mr-1.5 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="wp-url" className="mb-1.5 block text-sm font-medium text-slate-300">
          WordPress Site URL
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="wp-url"
            type="text"
            placeholder="https://example.com or developer.wordpress.org"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter any WordPress site with REST API enabled (most WordPress sites have it by default)
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          Remember this site
        </label>

        <Button type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect'
          )}
        </Button>
      </div>
    </form>
  );
}
